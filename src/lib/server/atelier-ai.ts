import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { asJson } from "./json";
import { houseAiReady, houseChat } from "./openai";
import { DEFAULT_LANDING_COPY, type LandingCopy } from "@/lib/landing";
import { DEFAULT_SITE_COPY, type SiteCopy } from "@/lib/site";
import { mergeBindingSteps, type BindingStep } from "@/lib/binding-steps";
import { bustLandingCache } from "./public";

function deny() {
  const err = new Error("Unauthorized");
  (err as Error & { status?: number }).status = 401;
  throw err;
}

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId}`;
  if (rows[0]?.role !== "admin") deny();
}

type Patch = {
  note?: string;
  site?: Partial<SiteCopy>;
  landing?: Partial<LandingCopy>;
  bindingSteps?: BindingStep[];
};

function pickSite(partial: Partial<SiteCopy> | undefined): Partial<SiteCopy> {
  const out: Partial<SiteCopy> = {};
  if (!partial) return out;
  for (const key of Object.keys(DEFAULT_SITE_COPY) as (keyof SiteCopy)[]) {
    const value = partial[key];
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function pickLanding(partial: Partial<LandingCopy> | undefined): Partial<LandingCopy> {
  const out: Partial<LandingCopy> = {};
  if (!partial) return out;
  for (const key of Object.keys(DEFAULT_LANDING_COPY) as (keyof LandingCopy)[]) {
    const value = partial[key];
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export const applyAtelierEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string }) => ({ message: input.message.trim().slice(0, 4000) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (!data.message) return { ok: false as const, text: "Tell the house what to change." };
    if (!houseAiReady()) {
      return {
        ok: false as const,
        text: "Add OPENAI_API_KEY in the Vercel project so ChatGPT can edit the public site from here.",
      };
    }
    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const branding = asJson<Record<string, unknown>>(rows[0]?.branding, {});
    const site = { ...DEFAULT_SITE_COPY, ...asJson<Partial<SiteCopy>>(branding.site, {}) };
    const landing = { ...DEFAULT_LANDING_COPY, ...asJson<Partial<LandingCopy>>(branding.landing, {}) };
    const steps = mergeBindingSteps(branding.bindingSteps, site);

    const raw = await houseChat({
      json: true,
      maxTokens: 1600,
      system: `You edit the public words of Her First Meal. Return ONLY JSON:
{"note":"short summary","site":{optional keys},"landing":{optional keys},"bindingSteps":[optional full replacement array of {id,title,body,image}]}
Rules:
- Only include keys you are changing.
- Keep the house voice: warm, specific, never clinical diagnosis.
- bindingSteps replaces the whole list when present. Keep existing steps you are not removing. You may add steps.
- Do not invent medical claims.
Current site JSON: ${JSON.stringify(site)}
Current landing JSON: ${JSON.stringify(landing)}
Current binding steps JSON: ${JSON.stringify(steps)}`,
      messages: [{ role: "user", content: data.message }],
    });
    if (!raw) return { ok: false as const, text: "ChatGPT did not answer. Try again in a moment." };

    let patch: Patch = {};
    try {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      patch = JSON.parse(start >= 0 ? raw.slice(start, end + 1) : raw) as Patch;
    } catch {
      return { ok: false as const, text: raw.slice(0, 800) };
    }

    const sitePatch = pickSite(patch.site);
    const landingPatch = pickLanding(patch.landing);
    if (Object.keys(sitePatch).length) branding.site = { ...asJson<Partial<SiteCopy>>(branding.site, {}), ...sitePatch };
    if (Object.keys(landingPatch).length) {
      branding.landing = { ...asJson<Partial<LandingCopy>>(branding.landing, {}), ...landingPatch };
    }
    if (Array.isArray(patch.bindingSteps)) {
      branding.bindingSteps = mergeBindingSteps(patch.bindingSteps, { ...site, ...sitePatch });
    }

    await sql`
      update business_settings
      set branding = ${JSON.stringify(branding)}::jsonb, updated_at = now()
      where id = 1
    `;
    bustLandingCache();
    const changed =
      Object.keys(sitePatch).length +
      Object.keys(landingPatch).length +
      (Array.isArray(patch.bindingSteps) ? patch.bindingSteps.length : 0);
    return {
      ok: true as const,
      text: patch.note?.trim() || (changed ? "The public site is updated." : "Nothing needed changing."),
      changed,
    };
  });

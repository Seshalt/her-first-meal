import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asJson } from "./json";
import { mapSettings } from "./public";
import { ensureProfile } from "./profile";
import { DEFAULT_LANDING_COPY, isLandingSlot, type LandingCopy } from "@/lib/landing";
import { DEFAULT_SITE_COPY, type SiteCopy } from "@/lib/site";
import { DEFAULT_COLORS, LAYOUT_DEFAULTS, type StudioColors, type StudioLayout } from "@/lib/theme-studio";

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

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ count: number }>`select count(*)::int as count from profiles where role = 'admin'`;
    if (Number(existing[0]?.count ?? 0) > 0) deny();
    await ensureProfile(context.userId, null, data.displayName);
    await sql`
      update profiles set role = 'admin', display_name = ${data.displayName}, onboarding_completed = true, updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await ensureProfile(context.userId);
    const sql = await getSql();
    if (profile.role === "admin") return { role: "admin" as const, setupNeeded: false };
    const existing = await sql<{ count: number }>`select count(*)::int as count from profiles where role = 'admin'`;
    if (Number(existing[0]?.count ?? 0) === 0) {
      await sql`
        update profiles
        set role = 'admin', onboarding_completed = true, updated_at = now()
        where user_id = ${context.userId}
      `;
      return { role: "admin" as const, setupNeeded: false };
    }
    return { role: profile.role, setupNeeded: false };
  });

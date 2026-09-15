import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asJson } from "@/lib/server/json";

export type VisualOverrideKind = "text" | "image" | "link";

export type VisualOverride = {
  selector: string;
  kind: VisualOverrideKind;
  value: string;
  alt?: string;
};

type VisualOverrideStore = Record<string, Record<string, VisualOverride>>;

function normalizePage(page: string) {
  const clean = page.trim().split("?")[0].split("#")[0] || "/";
  if (!clean.startsWith("/") || clean.length > 160) throw new Error("Invalid page.");
  if (clean.startsWith("/admin") || clean.startsWith("/app") || clean.startsWith("/api")) {
    throw new Error("That page cannot be visually edited.");
  }
  return clean;
}

function validateSelector(selector: string) {
  const clean = selector.trim();
  if (!clean || clean.length > 700) throw new Error("Invalid element selector.");
  if (/script|style|iframe|object|embed/i.test(clean)) throw new Error("That element cannot be edited.");
  return clean;
}

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId}`;
  if (rows[0]?.role !== "admin") {
    const err = new Error("Unauthorized");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
}

function readStore(value: unknown): VisualOverrideStore {
  const raw = asJson<Record<string, unknown>>(value, {});
  return asJson<VisualOverrideStore>(raw.visualOverrides, {});
}

export const getVisualOverrides = createServerFn({ method: "GET" })
  .validator((input: { page: string }) => input)
  .handler(async ({ data }) => {
    const page = normalizePage(data.page);
    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const store = readStore(rows[0]?.branding);
    return store[page] ?? {};
  });

export const adminSaveVisualOverride = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      page: string;
      selector: string;
      kind: VisualOverrideKind;
      value?: string;
      alt?: string;
      reset?: boolean;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const page = normalizePage(data.page);
    const selector = validateSelector(data.selector);
    if (!["text", "image", "link"].includes(data.kind)) throw new Error("Unsupported edit type.");

    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const branding = asJson<Record<string, unknown>>(rows[0]?.branding, {});
    const store = readStore(branding);
    const pageOverrides = { ...(store[page] ?? {}) };

    if (data.reset) {
      delete pageOverrides[selector];
    } else {
      const value = (data.value ?? "").trim();
      if (!value) throw new Error("Add a value before saving.");
      if (value.length > 20_000) throw new Error("That edit is too long.");
      if (data.kind === "image" && !value.startsWith("/") && !/^https:\/\//i.test(value)) {
        throw new Error("Images must use a site path or an https URL.");
      }
      if (
        data.kind === "link" &&
        !value.startsWith("/") &&
        !/^https:\/\//i.test(value) &&
        !/^mailto:/i.test(value) &&
        !/^tel:/i.test(value)
      ) {
        throw new Error("Links must use a site path, https URL, email, or phone link.");
      }
      pageOverrides[selector] = {
        selector,
        kind: data.kind,
        value,
        alt: data.kind === "image" ? (data.alt ?? "").trim().slice(0, 500) : undefined,
      };
    }

    store[page] = pageOverrides;
    branding.visualOverrides = store;

    await sql`
      update business_settings
      set branding = ${JSON.stringify(branding)}::jsonb, updated_at = now()
      where id = 1
    `;

    return { ok: true, overrides: pageOverrides };
  });

export const adminGetVisualOverrides = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { page: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const page = normalizePage(data.page);
    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const store = readStore(rows[0]?.branding);
    return store[page] ?? {};
  });

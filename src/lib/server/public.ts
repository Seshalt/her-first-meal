import { createServerFn } from "@tanstack/react-start";
import { dbSource, getSql } from "@/lib/db";
import { asJson } from "./json";
import type { BusinessSettings } from "./types";
import {
  DEFAULT_LANDING_COPY,
  isLandingSlot,
  mergeLanding,
  type LandingCopy,
  type LandingImageSlot,
} from "@/lib/landing";
import { DEFAULT_SITE_COPY, mergeSite, type SiteCopy } from "@/lib/site";
import { mergeStudio, type StudioTheme } from "@/lib/theme-studio";
import { mergeBindingSteps, type BindingStep } from "@/lib/binding-steps";
import { assertHuman, rateLimit, rateLimitClient } from "./abuse";
import { cookieNoticeSeen, markCookieNotice } from "./cookie-notice";

type SettingsRow = {
  business_name: string;
  tagline: string;
  monthly_price_cents: number;
  yearly_price_cents: number;
  currency: string;
  timezone: string;
  business_hours: unknown;
  appointment_duration_minutes: number;
  buffer_minutes: number;
  daily_appointment_limit: number;
  zoom_default_link: string | null;
  payment_processor: string;
  email_notifications_enabled: boolean;
  nouri_system_notes: string | null;
};

export function mapSettings(row: SettingsRow): BusinessSettings {
  return {
    businessName: row.business_name,
    tagline: row.tagline,
    monthlyPriceCents: Number(row.monthly_price_cents),
    yearlyPriceCents: Number(row.yearly_price_cents),
    currency: row.currency,
    timezone: row.timezone,
    businessHours: asJson(row.business_hours, {}),
    appointmentDurationMinutes: Number(row.appointment_duration_minutes),
    bufferMinutes: Number(row.buffer_minutes),
    dailyAppointmentLimit: Number(row.daily_appointment_limit),
    zoomDefaultLink: row.zoom_default_link,
    paymentProcessor: row.payment_processor,
    emailNotificationsEnabled: Boolean(row.email_notifications_enabled),
    nouriSystemNotes: row.nouri_system_notes,
  };
}

const FALLBACK_SETTINGS: BusinessSettings = {
  businessName: "Her First Meal",
  tagline: "The world celebrates the baby. We remember the mother.",
  monthlyPriceCents: 4900,
  yearlyPriceCents: 49000,
  currency: "USD",
  timezone: "America/New_York",
  businessHours: {},
  appointmentDurationMinutes: 45,
  bufferMinutes: 15,
  dailyAppointmentLimit: 6,
  zoomDefaultLink: null,
  paymentProcessor: "demo",
  emailNotificationsEnabled: true,
  nouriSystemNotes: null,
};

export const getPublicPricing = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    const rows = await sql<SettingsRow>`select * from business_settings where id = 1`;
    const settings = rows[0] ? mapSettings(rows[0]) : FALLBACK_SETTINGS;
    const products = await sql<{
      id: number;
      slug: string;
      name: string;
      description: string;
      price_cents: number;
      kind: string;
      image: string | null;
    }>`select id, slug, name, description, price_cents, kind, image from products where active = true order by id`;
    return { settings, products };
  } catch (err) {
    console.error("[public] getPublicPricing failed", err);
    return { settings: FALLBACK_SETTINGS, products: [] };
  }
});

export const recordPublicVisit = createServerFn({ method: "POST" })
  .validator((input: { path: string }) => input)
  .handler(async ({ data }) => {
    rateLimit("visit", 40, 60 * 1000);
    const path = data.path.slice(0, 180) || "/";
    if (path.startsWith("/admin") || path.startsWith("/api") || path === "/hearth") return { ok: true };
    try {
      const sql = await getSql();
      await sql`insert into page_visits (path) values (${path})`;
    } catch {
      /* table may not exist yet */
    }
    return { ok: true };
  });

export const hasCookieNotice = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return { remembered: await cookieNoticeSeen() };
  } catch {
    return { remembered: false };
  }
});

export const rememberCookieNotice = createServerFn({ method: "POST" }).handler(async () => {
  rateLimit("cookie-notice", 20, 60 * 1000);
  await markCookieNotice();
  return { ok: true };
});

export const hasAdministrator = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    const rows = await sql<{ count: number }>`select count(*)::int as count from profiles where role = 'admin'`;
    const setup = await sql<{ completed: boolean }>`select completed from setup_state where id = 1`;
    return {
      hasAdmin: Number(rows[0]?.count ?? 0) > 0,
      setupCompleted: Boolean(setup[0]?.completed),
      lastingStore: dbSource === "neon",
    };
  } catch {
    return { hasAdmin: false, setupCompleted: false, lastingStore: dbSource === "neon" };
  }
});

type PublicLanding = {
  content: ReturnType<typeof mergeLanding>;
  site: SiteCopy;
  studio: ReturnType<typeof mergeStudio>;
  businessName: string;
  tagline: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  bindingSteps: BindingStep[];
};

let landingCache: { at: number; data: PublicLanding } | null = null;

export function bustLandingCache() {
  landingCache = null;
}

const FALLBACK_LANDING: PublicLanding = {
  content: mergeLanding(null),
  site: mergeSite(null),
  studio: mergeStudio(null),
  businessName: "Her First Meal",
  tagline: DEFAULT_LANDING_COPY.headlineAccent,
  monthlyPriceCents: 4900,
  yearlyPriceCents: 49000,
  bindingSteps: mergeBindingSteps(null, DEFAULT_SITE_COPY),
};

export const getLanding = createServerFn({ method: "GET" }).handler(async () => {
  if (landingCache && Date.now() - landingCache.at < 12_000) return landingCache.data;
  try {
    const sql = await getSql();
    const rows = await sql<{
      branding: unknown;
      business_name: string;
      tagline: string;
      monthly_price_cents: number;
      yearly_price_cents: number;
    }>`select branding, business_name, tagline, monthly_price_cents, yearly_price_cents from business_settings where id = 1`;
    const row = rows[0];
    const branding = asJson<{
      landing?: Partial<LandingCopy>;
      site?: Partial<SiteCopy>;
      studio?: { colors?: StudioTheme["colors"]; layout?: StudioTheme["layout"] };
      bindingSteps?: unknown;
    }>(row?.branding, {});
    const assets = await sql<{ kind: string; url: string | null; image_data: string | null }>`
      select kind, url, image_data from cms_items where kind like ${"landing-%"}
    `;
    const images: Partial<Record<LandingImageSlot, string>> = {};
    for (const asset of assets) {
      const slot = asset.kind.replace(/^landing-/, "");
      if (!isLandingSlot(slot)) continue;
      const src = asset.url || asset.image_data;
      if (src) images[slot] = src;
    }
    const site = mergeSite(branding.site);
    const data: PublicLanding = {
      content: mergeLanding(branding.landing, images),
      site,
      studio: mergeStudio(branding.studio),
      businessName: row?.business_name ?? "Her First Meal",
      tagline: row?.tagline ?? DEFAULT_LANDING_COPY.headlineAccent,
      monthlyPriceCents: Number(row?.monthly_price_cents ?? 4900),
      yearlyPriceCents: Number(row?.yearly_price_cents ?? 49000),
      bindingSteps: mergeBindingSteps(branding.bindingSteps, site, images),
    };
    landingCache = { at: Date.now(), data };
    return data;
  } catch {
    return FALLBACK_LANDING;
  }
});

export const recoverOwner = createServerFn({ method: "POST" })
  .validator(
    (input: {
      email: string;
      password: string;
      honey?: string;
      startedAt?: number;
      human?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    assertHuman({ honey: data.honey, startedAt: data.startedAt, human: data.human });
    await rateLimitClient("recover-owner", 3, 15 * 60 * 1000);
    rateLimit("recover-owner", 10, 15 * 60 * 1000);
    const started = Date.now();
    const email = data.email.trim().toLowerCase();
    const password = data.password;
    const { dummyPasswordWork, padAuthDuration } = await import("@/lib/auth/constant-time");
    if (!email.includes("@") || password.length < 12) {
      await dummyPasswordWork();
      await padAuthDuration(started);
      throw new Error("Use a real email and a password of at least 12 characters.");
    }
    const sql = await getSql();
    const { auth } = await import("@/lib/auth/server");
    const { getRequestHeaders } = await import("@tanstack/react-start/server");
    const ctx = await auth.$context;

    const found = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true });
    let targetId = found?.user?.id as string | undefined;

    const anyAdmin = await sql<{ id: string; email: string }>`
      select u.id, u.email
      from "user" u
      join profiles p on p.user_id = u.id
      where p.role = 'admin'
      order by p.updated_at asc
      limit 1
    `;
    if (anyAdmin[0]) {
      // Owner recovery used to reset the existing admin password directly.
      // That bypasses MFA, so once an owner exists this bootstrap path is closed.
      await dummyPasswordWork();
      await padAuthDuration(started);
      throw new Error("The owner account already exists. Sign in or use the secure password reset link.");
    }
    if (!targetId) {
      const created = await ctx.internalAdapter.createUser({
        name: "Maat",
        email,
        emailVerified: true,
      });
      targetId = created.id;
    }

    if (!targetId) {
      await dummyPasswordWork();
      await padAuthDuration(started);
      throw new Error("Could not create the owner account.");
    }

    const hash = await ctx.password.hash(password);
    const matches = await ctx.password.verify({ hash, password });
    if (!matches) {
      await dummyPasswordWork();
      await padAuthDuration(started);
      throw new Error("Could not store that password. Try again.");
    }

    const accounts = await ctx.internalAdapter.findAccounts(targetId);
    const credential = accounts.find((a) => a.providerId === "credential");
    if (credential) {
      await ctx.internalAdapter.updateAccount(credential.id, { password: hash });
    } else {
      await ctx.internalAdapter.createAccount({
        userId: targetId,
        accountId: targetId,
        providerId: "credential",
        password: hash,
      });
    }

    await sql`update "user" set email = ${email}, "emailVerified" = true, "updatedAt" = now() where id = ${targetId}`;
    await sql`update profiles set role = 'member' where role = 'admin' and user_id <> ${targetId}`;

    const existing = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${targetId}`;
    try {
      if (existing[0]) {
        await sql`
          update profiles
          set role = 'admin', email = ${email}, display_name = coalesce(display_name, 'Maat'),
              email_factor_ok = true, onboarding_completed = true, updated_at = now()
          where user_id = ${targetId}
        `;
      } else {
        await sql`
          insert into profiles (user_id, role, email, display_name, email_factor_ok, onboarding_completed)
          values (${targetId}, 'admin', ${email}, 'Maat', true, true)
        `;
      }
    } catch {
      if (existing[0]) {
        await sql`
          update profiles
          set role = 'admin', email = ${email}, display_name = coalesce(display_name, 'Maat'),
              onboarding_completed = true, updated_at = now()
          where user_id = ${targetId}
        `;
      } else {
        await sql`
          insert into profiles (user_id, role, email, display_name, onboarding_completed)
          values (${targetId}, 'admin', ${email}, 'Maat', true)
        `;
      }
    }

    try {
      const incoming = getRequestHeaders();
      const headers = new Headers();
      incoming.forEach((value, key) => headers.set(key, value));
      const origin =
        headers.get("origin") ||
        (process.env.BETTER_AUTH_URL || "").replace(/\/$/, "") ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, "")}`
          : "https://her-first-meal-now.vercel.app");
      headers.set("origin", origin);
      headers.set("content-type", "application/json");
      await auth.api.signInEmail({
        body: { email, password, rememberMe: true },
        headers,
      });
    } catch {
      /* session token below is the path that actually gets them in */
    }

    const session = await ctx.internalAdapter.createSession(targetId, false);
    if (!session?.token) {
      await padAuthDuration(started);
      throw new Error("Password is saved, but the session did not open. Wait a moment and tap Enter.");
    }
    await padAuthDuration(started);
    return { ok: true, lastingStore: dbSource === "neon", token: session.token };
  });

export const enterOwner = createServerFn({ method: "POST" })
  .validator(
    (input: {
      email: string;
      password: string;
      honey?: string;
      startedAt?: number;
      human?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    assertHuman({ honey: data.honey, startedAt: data.startedAt, human: data.human });
    await rateLimitClient("enter-owner", 8, 15 * 60 * 1000);
    rateLimit("enter-owner", 20, 15 * 60 * 1000);
    // Disabled on purpose. Direct session creation here would bypass Better
    // Auth's two-factor challenge. The hearth now signs in through
    // /api/auth/sign-in/email so TOTP is always enforced for the owner.
    throw new Error("Use the secure admin sign-in form.");
  });


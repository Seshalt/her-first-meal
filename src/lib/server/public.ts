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
import { assertHuman, rateLimit } from "./abuse";

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
    rateLimit("recover-owner", 5, 15 * 60 * 1000);
    const started = Date.now();
    const email = data.email.trim().toLowerCase();
    const password = data.password;
    const { dummyPasswordWork, padAuthDuration } = await import("@/lib/auth/constant-time");
    if (!email.includes("@") || password.length < 10) {
      await dummyPasswordWork();
      await padAuthDuration(started);
      throw new Error("Use a real email and a password of at least 12 characters.");
    }
    const sql = await getSql();
    const { hashPassword, verifyPassword } = await import("better-auth/crypto");
    const hash = await hashPassword(password);

    const byEmail = await sql<{ id: string; email: string }>`
      select id, email from "user" where lower(email) = ${email} limit 1
    `;
    const anyAdmin = await sql<{ id: string; email: string }>`
      select u.id, u.email
      from "user" u
      join profiles p on p.user_id = u.id
      where p.role = 'admin'
      order by p.updated_at asc
      limit 1
    `;

    let target = byEmail[0] ?? anyAdmin[0];

    if (!target) {
      const id = crypto.randomUUID();
      await sql`
        insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        values (${id}, 'Maat', ${email}, true, now(), now())
      `;
      target = { id, email };
    }

    const accounts = await sql<{ id: string }>`
      select id from account where "userId" = ${target.id} and "providerId" = 'credential'
    `;
    if (accounts[0]) {
      await sql`update account set password = ${hash}, "updatedAt" = now() where id = ${accounts[0].id}`;
    } else {
      const accountId = crypto.randomUUID();
      await sql`
        insert into account (
          id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
        ) values (
          ${accountId}, ${target.id}, 'credential', ${target.id}, ${hash}, now(), now()
        )
      `;
    }

    await sql`update "user" set email = ${email}, "updatedAt" = now() where id = ${target.id}`;
    const stored = await sql<{ password: string | null }>`
      select password from account where "userId" = ${target.id} and "providerId" = 'credential' limit 1
    `;
    const matches = stored[0]?.password
      ? await verifyPassword({ hash: stored[0].password, password })
      : false;
    if (!matches) {
      await dummyPasswordWork();
      await padAuthDuration(started);
      throw new Error("The password did not save. Try Set password again.");
    }
    await sql`delete from session where "userId" = ${target.id}`;
    await sql`update profiles set role = 'member' where role = 'admin' and user_id <> ${target.id}`;

    const existing = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${target.id}`;
    try {
      if (existing[0]) {
        await sql`
          update profiles
          set role = 'admin', email = ${email}, display_name = coalesce(display_name, 'Maat'),
              email_factor_ok = true, onboarding_completed = true, updated_at = now()
          where user_id = ${target.id}
        `;
      } else {
        await sql`
          insert into profiles (user_id, role, email, display_name, email_factor_ok, onboarding_completed)
          values (${target.id}, 'admin', ${email}, 'Maat', true, true)
        `;
      }
    } catch {
      if (existing[0]) {
        await sql`
          update profiles
          set role = 'admin', email = ${email}, display_name = coalesce(display_name, 'Maat'),
              onboarding_completed = true, updated_at = now()
          where user_id = ${target.id}
        `;
      } else {
        await sql`
          insert into profiles (user_id, role, email, display_name, onboarding_completed)
          values (${target.id}, 'admin', ${email}, 'Maat', true)
        `;
      }
    }

    await padAuthDuration(started);
    return { ok: true, lastingStore: dbSource === "neon" };
  });


import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
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

export const hasAdministrator = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    const rows = await sql<{ count: number }>`select count(*)::int as count from profiles where role = 'admin'`;
    const setup = await sql<{ completed: boolean }>`select completed from setup_state where id = 1`;
    return { hasAdmin: Number(rows[0]?.count ?? 0) > 0, setupCompleted: Boolean(setup[0]?.completed) };
  } catch {
    return { hasAdmin: false, setupCompleted: false };
  }
});

export const getLanding = createServerFn({ method: "GET" }).handler(async () => {
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
    }>(row?.branding, {});
    const assets = await sql<{ kind: string; url: string | null; image_data: string | null }>`
      select kind, url, image_data from cms_items where kind like ${"landing-%"}
    `;
    const images: Partial<Record<LandingImageSlot, string>> = {};
    for (const asset of assets) {
      const slot = asset.kind.replace(/^landing-/, "");
      if (!isLandingSlot(slot)) continue;
      const src = asset.image_data || asset.url;
      if (src) images[slot] = src;
    }
    return {
      content: mergeLanding(branding.landing, images),
      site: mergeSite(branding.site),
      studio: mergeStudio(branding.studio),
      businessName: row?.business_name ?? "Her First Meal",
      tagline: row?.tagline ?? DEFAULT_LANDING_COPY.headlineAccent,
      monthlyPriceCents: Number(row?.monthly_price_cents ?? 4900),
      yearlyPriceCents: Number(row?.yearly_price_cents ?? 49000),
    };
  } catch {
    return {
      content: mergeLanding(null),
      site: mergeSite(null),
      studio: mergeStudio(null),
      businessName: "Her First Meal",
      tagline: DEFAULT_LANDING_COPY.headlineAccent,
      monthlyPriceCents: 4900,
      yearlyPriceCents: 49000,
    };
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
    rateLimit("recover-owner", 6, 15 * 60 * 1000);
    const email = data.email.trim().toLowerCase();
    const password = data.password;
    if (!email.includes("@") || password.length < 8) {
      throw new Error("Use a real email and a password at least 8 characters.");
    }
    const sql = await getSql();
    const admins = await sql<{ id: string; email: string; name: string; display_name: string | null }>`
      select u.id, u.email, u.name, p.display_name
      from "user" u
      join profiles p on p.user_id = u.id
      where p.role = 'admin'
    `;
    const byEmail = admins.find((row) => row.email.toLowerCase() === email);
    const onlyOwner = admins.length === 1 ? admins[0] : undefined;
    const target = byEmail ?? onlyOwner;
    if (!target) {
      throw new Error("No owner account matches that email. Create the owner account first.");
    }
    const { hashPassword } = await import("better-auth/crypto");
    const hash = await hashPassword(password);
    await sql`update "user" set email = ${email}, "updatedAt" = now() where id = ${target.id}`;
    const accounts = await sql<{ id: string }>`
      select id from account where "userId" = ${target.id} and "providerId" = 'credential'
    `;
    if (accounts[0]) {
      await sql`update account set password = ${hash}, "updatedAt" = now() where id = ${accounts[0].id}`;
    } else {
      const id = crypto.randomUUID();
      await sql`
        insert into account (
          id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
        ) values (
          ${id}, ${target.id}, 'credential', ${target.id}, ${hash}, now(), now()
        )
      `;
    }
    await sql`delete from session where "userId" = ${target.id}`;
    return { ok: true };
  });


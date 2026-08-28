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

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
    return { role: profile.role, setupNeeded: false };
  });

export const saveSetupWizard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      complete?: boolean;
      step?: number;
      businessName?: string;
      timezone?: string;
      hours?: Record<string, string[]>;
      monthlyPriceCents?: number;
      yearlyPriceCents?: number;
      zoomDefaultLink?: string;
      nouriNotes?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    if (data.businessName || data.monthlyPriceCents || data.hours || data.nouriNotes || data.zoomDefaultLink) {
      await sql`
        update business_settings set
          business_name = coalesce(${data.businessName ?? null}, business_name),
          timezone = coalesce(${data.timezone ?? null}, timezone),
          business_hours = coalesce(${data.hours ? JSON.stringify(data.hours) : null}::jsonb, business_hours),
          monthly_price_cents = coalesce(${data.monthlyPriceCents ?? null}, monthly_price_cents),
          yearly_price_cents = coalesce(${data.yearlyPriceCents ?? null}, yearly_price_cents),
          zoom_default_link = coalesce(${data.zoomDefaultLink ?? null}, zoom_default_link),
          nouri_system_notes = coalesce(${data.nouriNotes ?? null}, nouri_system_notes),
          updated_at = now()
        where id = 1
      `;
    }
    await sql`
      update setup_state set
        step = coalesce(${data.step ?? null}, step),
        completed = ${Boolean(data.complete)},
        payload = payload
      where id = 1
    `;
    return { ok: true };
  });

export const adminDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const users = await sql<{ count: number }>`select count(*)::int as count from profiles where role = 'member'`;
    const members = await sql<{ count: number }>`select count(*)::int as count from memberships where status = 'active'`;
    const appts = await sql<{ count: number }>`select count(*)::int as count from appointments where status = 'confirmed' and starts_at > now()`;
    const nouri = await sql<{ count: number }>`select count(*)::int as count from nouri_conversations`;
    const binding = await sql<{ count: number }>`select count(*)::int as count from binding_uploads`;
    const settingsRows = await sql<Parameters<typeof mapSettings>[0]>`select * from business_settings where id = 1`;
    const setup = await sql<{ completed: boolean; step: number }>`select completed, step from setup_state where id = 1`;
    return {
      members: Number(users[0]?.count ?? 0),
      activeMemberships: Number(members[0]?.count ?? 0),
      upcomingAppointments: Number(appts[0]?.count ?? 0),
      nouriThreads: Number(nouri[0]?.count ?? 0),
      bindingUploads: Number(binding[0]?.count ?? 0),
      settings: settingsRows[0] ? mapSettings(settingsRows[0]) : null,
      setupCompleted: Boolean(setup[0]?.completed),
      setupStep: Number(setup[0]?.step ?? 0),
    };
  });

export const adminListClients = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input?: { q?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const q = `%${(data.q ?? "").trim()}%`;
    return sql<{
      user_id: string;
      display_name: string | null;
      email: string | null;
      stage: string | null;
      onboarding_completed: boolean;
      created_at: string;
    }>`
      select user_id, display_name, email, stage, onboarding_completed, created_at
      from profiles
      where role = 'member'
        and (${data.q ? true : true})
        and (
          ${!data.q} or display_name ilike ${q} or email ilike ${q}
        )
      order by created_at desc
      limit 80
    `;
  });

export const adminGetClient = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { userId: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const profile = await sql<{
      user_id: string;
      display_name: string | null;
      email: string | null;
      stage: string | null;
      location: string | null;
    }>`select user_id, display_name, email, stage, location from profiles where user_id = ${data.userId}`;
    const diet = await sql<{
      diets: unknown;
      allergies: unknown;
      avoids: string | null;
    }>`select diets, allergies, avoids from dietary_profiles where user_id = ${data.userId}`;
    const appts = await sql<{
      id: number;
      type: string;
      starts_at: string;
      status: string;
    }>`select id, type, starts_at, status from appointments where user_id = ${data.userId} order by starts_at desc limit 12`;
    const uploads = await sql<{
      id: number;
      angle: string;
      notes: string | null;
      ai_feedback: string | null;
      created_at: string;
    }>`select id, angle, notes, ai_feedback, created_at from binding_uploads where user_id = ${data.userId} order by created_at desc limit 12`;
    const notes = await sql<{ id: number; note: string; created_at: string }>`
      select id, note, created_at from owner_notes where client_user_id = ${data.userId} order by created_at desc
    `;
    return {
      profile: profile[0] ?? null,
      diet: diet[0]
        ? {
            diets: asJson<string[]>(diet[0].diets, []),
            allergies: asJson<string[]>(diet[0].allergies, []),
            avoids: diet[0].avoids,
          }
        : null,
      appointments: appts,
      uploads,
      notes,
    };
  });


export const adminAddNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; note: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`insert into owner_notes (client_user_id, note) values (${data.userId}, ${data.note})`;
    return { ok: true };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      monthlyPriceCents?: number;
      yearlyPriceCents?: number;
      zoomDefaultLink?: string;
      nouriNotes?: string;
      businessName?: string;
      hours?: Record<string, string[]>;
      duration?: number;
      buffer?: number;
      dailyLimit?: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      update business_settings set
        monthly_price_cents = coalesce(${data.monthlyPriceCents ?? null}, monthly_price_cents),
        yearly_price_cents = coalesce(${data.yearlyPriceCents ?? null}, yearly_price_cents),
        zoom_default_link = coalesce(${data.zoomDefaultLink ?? null}, zoom_default_link),
        nouri_system_notes = coalesce(${data.nouriNotes ?? null}, nouri_system_notes),
        business_name = coalesce(${data.businessName ?? null}, business_name),
        business_hours = coalesce(${data.hours ? JSON.stringify(data.hours) : null}::jsonb, business_hours),
        appointment_duration_minutes = coalesce(${data.duration ?? null}, appointment_duration_minutes),
        buffer_minutes = coalesce(${data.buffer ?? null}, buffer_minutes),
        daily_appointment_limit = coalesce(${data.dailyLimit ?? null}, daily_appointment_limit),
        updated_at = now()
      where id = 1
    `;
    return { ok: true };
  });

export const adminSaveLandingCopy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Partial<LandingCopy>) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const branding = asJson<Record<string, unknown>>(rows[0]?.branding, {});
    const prev = asJson<Partial<LandingCopy>>(branding.landing, {});
    const next: Partial<LandingCopy> = { ...prev };
    for (const key of Object.keys(DEFAULT_LANDING_COPY) as (keyof LandingCopy)[]) {
      const value = data[key];
      if (typeof value === "string") next[key] = value;
    }
    branding.landing = next;
    await sql`
      update business_settings
      set branding = ${JSON.stringify(branding)}::jsonb, updated_at = now()
      where id = 1
    `;
    return { ok: true };
  });

export const adminSaveSiteCopy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Partial<SiteCopy>) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const branding = asJson<Record<string, unknown>>(rows[0]?.branding, {});
    const prev = asJson<Partial<SiteCopy>>(branding.site, {});
    const next: Partial<SiteCopy> = { ...prev };
    for (const key of Object.keys(DEFAULT_SITE_COPY) as (keyof SiteCopy)[]) {
      const value = data[key];
      if (typeof value === "string") next[key] = value;
    }
    branding.site = next;
    await sql`
      update business_settings
      set branding = ${JSON.stringify(branding)}::jsonb, updated_at = now()
      where id = 1
    `;
    return { ok: true };
  });

export const adminSaveStudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { colors?: Partial<StudioColors>; layout?: Partial<StudioLayout> }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
    const branding = asJson<Record<string, unknown>>(rows[0]?.branding, {});
    const prev = asJson<{ colors?: Partial<StudioColors>; layout?: Partial<StudioLayout> }>(branding.studio, {});
    const colors: Partial<StudioColors> = { ...prev.colors };
    if (data.colors) {
      for (const key of Object.keys(DEFAULT_COLORS) as (keyof StudioColors)[]) {
        const value = data.colors[key];
        if (typeof value === "string" && value.trim()) colors[key] = value.trim();
      }
    }
    const layout: Partial<StudioLayout> = { ...prev.layout };
    if (data.layout) {
      for (const key of Object.keys(LAYOUT_DEFAULTS) as (keyof StudioLayout)[]) {
        const value = data.layout[key];
        if (typeof value === "string") layout[key] = value as never;
      }
    }
    branding.studio = { colors, layout };
    await sql`
      update business_settings
      set branding = ${JSON.stringify(branding)}::jsonb, updated_at = now()
      where id = 1
    `;
    return { ok: true };
  });

export const adminSaveLandingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { slot: string; imageData?: string; url?: string; reset?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (!isLandingSlot(data.slot)) {
      throw new Error("Unknown image slot.");
    }
    const sql = await getSql();
    const kind = `landing-${data.slot}`;
    if (data.reset) {
      await sql`delete from cms_items where kind = ${kind}`;
      return { ok: true };
    }
    const imageData = data.imageData?.trim() || null;
    const url = data.url?.trim() || null;
    if (imageData && imageData.length > 900_000) {
      throw new Error("That photo is too large. Try a smaller JPEG or paste a link instead.");
    }
    if (!imageData && !url) {
      throw new Error("Add a photo file or a link.");
    }
    const existing = await sql<{ id: number }>`select id from cms_items where kind = ${kind} limit 1`;
    if (existing[0]) {
      await sql`
        update cms_items
        set image_data = ${imageData}, url = ${url}, title = ${data.slot}
        where kind = ${kind}
      `;
    } else {
      await sql`
        insert into cms_items (kind, title, url, image_data)
        values (${kind}, ${data.slot}, ${url}, ${imageData})
      `;
    }
    return { ok: true };
  });

export const adminAddDiscount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { code: string; percent: number; gift?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      insert into discounts (code, percent, gift) values (${data.code.trim().toUpperCase()}, ${data.percent}, ${Boolean(data.gift)})
      on conflict (code) do update set percent = excluded.percent, active = true, gift = excluded.gift
    `;
    return { ok: true };
  });

export const adminListDiscounts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return sql<{ id: number; code: string; percent: number; active: boolean; gift: boolean }>`
      select id, code, percent, active, gift from discounts order by id desc
    `;
  });

export const adminCmsAdd = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; title: string; body?: string; url?: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      insert into cms_items (kind, title, body, url)
      values (${data.kind}, ${data.title}, ${data.body ?? null}, ${data.url ?? null})
    `;
    return { ok: true };
  });

export const adminCmsList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return sql<{ id: number; kind: string; title: string; body: string | null; url: string | null; created_at: string }>`
      select id, kind, title, body, url, created_at from cms_items order by created_at desc
    `;
  });

export const adminCalendar = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const appts = await sql<{
      id: number;
      user_id: string;
      type: string;
      starts_at: string;
      ends_at: string;
      status: string;
      zoom_link: string | null;
      owner_notes: string | null;
    }>`select id, user_id, type, starts_at, ends_at, status, zoom_link, owner_notes from appointments order by starts_at desc limit 80`;
    const blocked = await sql<{ id: number; day: string; reason: string | null }>`select id, day, reason from blocked_dates order by day`;
    return { appointments: appts, blocked };
  });

export const adminBlockDate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { day: string; reason?: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`insert into blocked_dates (day, reason) values (${data.day}, ${data.reason ?? null}) on conflict (day) do update set reason = excluded.reason`;
    return { ok: true };
  });

export const adminUpdateAppointment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; zoomLink?: string; ownerNotes?: string; status?: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      update appointments set
        zoom_link = coalesce(${data.zoomLink ?? null}, zoom_link),
        owner_notes = coalesce(${data.ownerNotes ?? null}, owner_notes),
        status = coalesce(${data.status ?? null}, status)
      where id = ${data.id}
    `;
    return { ok: true };
  });

export const adminAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const byStage = await sql<{ stage: string | null; count: number }>`
      select stage, count(*)::int as count from profiles where role = 'member' group by stage
    `;
    const recipes = await sql<{ count: number }>`select count(*)::int as count from saved_recipes`;
    const workouts = await sql<{ count: number }>`select count(*)::int as count from workout_logs`;
    return { byStage, savedRecipes: Number(recipes[0]?.count ?? 0), workouts: Number(workouts[0]?.count ?? 0) };
  });

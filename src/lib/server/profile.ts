import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asJson } from "./json";
import type { Dietary, GroceryPrefs, Membership, Profile } from "./types";
import type { Stage } from "@/lib/content/catalog";
import { uid } from "@/lib/utils";

type ProfileRow = {
  user_id: string;
  role: string;
  display_name: string | null;
  email: string | null;
  location: string | null;
  timezone: string | null;
  language: string;
  stage: string | null;
  due_date: string | null;
  baby_birthday: string | null;
  previous_pregnancies: number;
  is_first_pregnancy: boolean | null;
  is_multiple: boolean;
  household_size: number;
  weekly_budget: string | null;
  zip_code: string | null;
  city: string | null;
  region: string | null;
  state_code: string | null;
  location_permission: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  theme_preference: string;
  notification_prefs: unknown;
  partner_invite_code: string | null;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    role: (row.role as Profile["role"]) || "member",
    displayName: row.display_name,
    email: row.email,
    location: row.location,
    timezone: row.timezone,
    language: row.language,
    stage: (row.stage as Stage) || null,
    dueDate: row.due_date,
    babyBirthday: row.baby_birthday,
    previousPregnancies: Number(row.previous_pregnancies ?? 0),
    isFirstPregnancy: row.is_first_pregnancy,
    isMultiple: Boolean(row.is_multiple),
    householdSize: Number(row.household_size ?? 2),
    weeklyBudget: row.weekly_budget,
    zipCode: row.zip_code,
    city: row.city,
    region: row.region ?? null,
    stateCode: row.state_code ?? null,
    locationPermission: row.location_permission,
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboardingStep: Number(row.onboarding_step ?? 0),
    themePreference: row.theme_preference,
    notificationPrefs: asJson(row.notification_prefs, {}),
    partnerInviteCode: row.partner_invite_code,
  };
}

export async function ensureProfile(userId: string, email?: string | null, name?: string | null) {
  const sql = await getSql();
  const existing = await sql<ProfileRow>`select * from profiles where user_id = ${userId}`;
  if (existing[0]) {
    if (email && !existing[0].email) {
      await sql`update profiles set email = ${email} where user_id = ${userId}`;
    }
    return mapProfile(existing[0]);
  }
  const invite = uid("invite").slice(0, 12).toUpperCase();
  await sql`
    insert into profiles (user_id, email, display_name, partner_invite_code)
    values (${userId}, ${email ?? null}, ${name ?? null}, ${invite})
  `;
  await sql`insert into dietary_profiles (user_id) values (${userId}) on conflict (user_id) do nothing`;
  await sql`insert into grocery_preferences (user_id) values (${userId}) on conflict (user_id) do nothing`;
  const created = await sql<ProfileRow>`select * from profiles where user_id = ${userId}`;
  return mapProfile(created[0]);
}

export const getMyHome = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);
    const dietRows = await sql<{
      diets: unknown;
      allergies: unknown;
      avoids: string | null;
      dislikes: string | null;
      loves: string | null;
      cuisines: unknown;
    }>`select * from dietary_profiles where user_id = ${context.userId}`;
    const storeRows = await sql<{ stores: unknown; custom_stores: string | null; appliances: unknown }>`
      select * from grocery_preferences where user_id = ${context.userId}
    `;
    const membershipRows = await sql<{
      id: number;
      plan: string;
      status: string;
      price_cents: number;
      started_at: string;
      expires_at: string | null;
    }>`
      select id, plan, status, price_cents, started_at, expires_at
      from memberships
      where (user_id = ${context.userId} or (email is not null and email = ${profile.email}))
        and status = 'active'
      order by started_at desc
      limit 1
    `;
    if (membershipRows[0] && !membershipRows[0].id) {
      /* noop */
    }
    if (membershipRows[0] && profile.email) {
      await sql`update memberships set user_id = ${context.userId} where email = ${profile.email} and user_id is null`;
    }
    const membership: Membership | null = membershipRows[0]
      ? {
          id: membershipRows[0].id,
          plan: membershipRows[0].plan,
          status: membershipRows[0].status,
          priceCents: membershipRows[0].price_cents,
          startedAt: membershipRows[0].started_at,
          expiresAt: membershipRows[0].expires_at,
        }
      : null;
    const diet: Dietary = dietRows[0]
      ? {
          diets: asJson(dietRows[0].diets, []),
          allergies: asJson(dietRows[0].allergies, []),
          avoids: dietRows[0].avoids,
          dislikes: dietRows[0].dislikes,
          loves: dietRows[0].loves,
          cuisines: asJson(dietRows[0].cuisines, []),
        }
      : { diets: [], allergies: [], avoids: null, dislikes: null, loves: null, cuisines: [] };
    const grocery: GroceryPrefs = storeRows[0]
      ? {
          stores: asJson(storeRows[0].stores, []),
          customStores: storeRows[0].custom_stores,
          appliances: asJson(storeRows[0].appliances, []),
        }
      : { stores: [], customStores: null, appliances: [] };
    const checkin = await sql<{
      hydration: number;
      mood: string | null;
      energy: string | null;
      notes: string | null;
      completed: unknown;
    }>`select hydration, mood, energy, notes, completed from check_ins where user_id = ${context.userId} and day = current_date`;
    const nextAppt = await sql<{
      id: number;
      type: string;
      starts_at: string;
      zoom_link: string | null;
    }>`
      select id, type, starts_at, zoom_link from appointments
      where user_id = ${context.userId} and status = 'confirmed' and starts_at > now()
      order by starts_at asc limit 1
    `;
    const unread = await sql<{ count: number }>`
      select count(*)::int as count from notifications where user_id = ${context.userId} and read = false
    `;
    return {
      profile,
      diet,
      grocery,
      membership,
      checkin: checkin[0]
        ? {
            hydration: Number(checkin[0].hydration),
            mood: checkin[0].mood,
            energy: checkin[0].energy,
            notes: checkin[0].notes,
            completed: asJson(checkin[0].completed, {} as Record<string, boolean>),
          }
        : { hydration: 0, mood: null, energy: null, notes: null, completed: {} as Record<string, boolean> },
      nextAppointment: nextAppt[0]
        ? {
            id: nextAppt[0].id,
            type: nextAppt[0].type,
            startsAt: nextAppt[0].starts_at,
            zoomLink: nextAppt[0].zoom_link,
          }
        : null,
      unreadNotifications: Number(unread[0]?.count ?? 0),
    };
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      displayName: string;
      location?: string;
      timezone?: string;
      language?: string;
      stage?: Stage | null;
      dueDate?: string | null;
      babyBirthday?: string | null;
      previousPregnancies?: number;
      isFirstPregnancy?: boolean;
      isMultiple?: boolean;
      diets?: string[];
      allergies?: string[];
      avoids?: string;
      dislikes?: string;
      loves?: string;
      cuisines?: string[];
      stores?: string[];
      customStores?: string;
      appliances?: string[];
      householdSize?: number;
      weeklyBudget?: string;
      zipCode?: string;
      city?: string;
      stateCode?: string;
      region?: string;
      complete?: boolean;
      step?: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    await sql`
      update profiles set
        display_name = coalesce(${data.displayName || null}, display_name),
        location = coalesce(${data.location ?? null}, location),
        timezone = coalesce(${data.timezone ?? null}, timezone),
        language = coalesce(${data.language ?? null}, language),
        stage = coalesce(${data.stage ?? null}, stage),
        due_date = ${data.dueDate ?? null},
        baby_birthday = ${data.babyBirthday ?? null},
        previous_pregnancies = coalesce(${data.previousPregnancies ?? null}, previous_pregnancies),
        is_first_pregnancy = coalesce(${data.isFirstPregnancy ?? null}, is_first_pregnancy),
        is_multiple = coalesce(${data.isMultiple ?? null}, is_multiple),
        household_size = coalesce(${data.householdSize ?? null}, household_size),
        weekly_budget = coalesce(${data.weeklyBudget ?? null}, weekly_budget),
        zip_code = coalesce(${data.zipCode ?? null}, zip_code),
        city = coalesce(${data.city ?? null}, city),
        state_code = coalesce(${data.stateCode ?? null}, state_code),
        region = coalesce(${data.region ?? null}, region),
        onboarding_step = coalesce(${data.step ?? null}, onboarding_step),
        onboarding_completed = ${data.complete === true},
        updated_at = now()
      where user_id = ${context.userId}
    `;
    await sql`
      insert into dietary_profiles (user_id, diets, allergies, avoids, dislikes, loves, cuisines)
      values (
        ${context.userId},
        ${JSON.stringify(data.diets ?? [])}::jsonb,
        ${JSON.stringify(data.allergies ?? [])}::jsonb,
        ${data.avoids ?? null},
        ${data.dislikes ?? null},
        ${data.loves ?? null},
        ${JSON.stringify(data.cuisines ?? [])}::jsonb
      )
      on conflict (user_id) do update set
        diets = excluded.diets,
        allergies = excluded.allergies,
        avoids = excluded.avoids,
        dislikes = excluded.dislikes,
        loves = excluded.loves,
        cuisines = excluded.cuisines
    `;
    await sql`
      insert into grocery_preferences (user_id, stores, custom_stores, appliances)
      values (
        ${context.userId},
        ${JSON.stringify(data.stores ?? [])}::jsonb,
        ${data.customStores ?? null},
        ${JSON.stringify(data.appliances ?? [])}::jsonb
      )
      on conflict (user_id) do update set
        stores = excluded.stores,
        custom_stores = excluded.custom_stores,
        appliances = excluded.appliances
    `;
    if (data.stage || data.diets || data.stateCode || data.complete) {
      await sql`delete from meal_plans where user_id = ${context.userId}`;
      await sql`delete from grocery_lists where user_id = ${context.userId}`;
    }
    return { ok: true };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      displayName?: string;
      location?: string;
      timezone?: string;
      language?: string;
      stage?: Stage | null;
      dueDate?: string | null;
      babyBirthday?: string | null;
      householdSize?: number;
      weeklyBudget?: string;
      zipCode?: string;
      city?: string;
      stateCode?: string;
      region?: string;
      themePreference?: string;
      notificationPrefs?: Record<string, boolean>;
      diets?: string[];
      allergies?: string[];
      avoids?: string;
      dislikes?: string;
      loves?: string;
      cuisines?: string[];
      stores?: string[];
      appliances?: string[];
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    await sql`
      update profiles set
        display_name = coalesce(${data.displayName ?? null}, display_name),
        location = coalesce(${data.location ?? null}, location),
        timezone = coalesce(${data.timezone ?? null}, timezone),
        language = coalesce(${data.language ?? null}, language),
        stage = coalesce(${data.stage ?? null}, stage),
        due_date = ${data.dueDate === undefined ? null : data.dueDate},
        baby_birthday = ${data.babyBirthday === undefined ? null : data.babyBirthday},
        household_size = coalesce(${data.householdSize ?? null}, household_size),
        weekly_budget = coalesce(${data.weeklyBudget ?? null}, weekly_budget),
        zip_code = coalesce(${data.zipCode ?? null}, zip_code),
        city = coalesce(${data.city ?? null}, city),
        state_code = coalesce(${data.stateCode ?? null}, state_code),
        region = coalesce(${data.region ?? null}, region),
        theme_preference = coalesce(${data.themePreference ?? null}, theme_preference),
        notification_prefs = coalesce(${data.notificationPrefs ? JSON.stringify(data.notificationPrefs) : null}::jsonb, notification_prefs),
        updated_at = now()
      where user_id = ${context.userId}
    `;
    if (data.diets || data.allergies || data.avoids !== undefined) {
      await sql`
        insert into dietary_profiles (user_id, diets, allergies, avoids, dislikes, loves, cuisines)
        values (
          ${context.userId},
          ${JSON.stringify(data.diets ?? [])}::jsonb,
          ${JSON.stringify(data.allergies ?? [])}::jsonb,
          ${data.avoids ?? null},
          ${data.dislikes ?? null},
          ${data.loves ?? null},
          ${JSON.stringify(data.cuisines ?? [])}::jsonb
        )
        on conflict (user_id) do update set
          diets = excluded.diets,
          allergies = excluded.allergies,
          avoids = excluded.avoids,
          dislikes = excluded.dislikes,
          loves = excluded.loves,
          cuisines = excluded.cuisines
      `;
    }
    if (data.stores || data.appliances) {
      await sql`
        insert into grocery_preferences (user_id, stores, appliances)
        values (
          ${context.userId},
          ${JSON.stringify(data.stores ?? [])}::jsonb,
          ${JSON.stringify(data.appliances ?? [])}::jsonb
        )
        on conflict (user_id) do update set
          stores = case when ${data.stores ? true : false} then excluded.stores else grocery_preferences.stores end,
          appliances = case when ${data.appliances ? true : false} then excluded.appliances else grocery_preferences.appliances end
      `;
    }
    if (data.stage || data.diets || data.stateCode) {
      await sql`delete from meal_plans where user_id = ${context.userId}`;
      await sql`delete from grocery_lists where user_id = ${context.userId}`;
    }
    return { ok: true };
  });

export const saveCheckIn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      hydration?: number;
      mood?: string;
      energy?: string;
      notes?: string;
      completed?: Record<string, boolean>;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into check_ins (user_id, day, hydration, mood, energy, notes, completed)
      values (
        ${context.userId},
        current_date,
        ${data.hydration ?? 0},
        ${data.mood ?? null},
        ${data.energy ?? null},
        ${data.notes ?? null},
        ${JSON.stringify(data.completed ?? {})}::jsonb
      )
      on conflict (user_id, day) do update set
        hydration = excluded.hydration,
        mood = coalesce(excluded.mood, check_ins.mood),
        energy = coalesce(excluded.energy, check_ins.energy),
        notes = coalesce(excluded.notes, check_ins.notes),
        completed = excluded.completed
    `;
    return { ok: true };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: number; kind: string; title: string; body: string; read: boolean; created_at: string }>`
      select id, kind, title, body, read, created_at from notifications
      where user_id = ${context.userId}
      order by created_at desc limit 40
    `;
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set read = true where user_id = ${context.userId}`;
    return { ok: true };
  });

export const savePlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      latitude?: number;
      longitude?: number;
      permission?: string;
      city?: string;
      zipCode?: string;
      location?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    const permission = data.permission ?? (data.latitude != null ? "granted" : "denied");
    let city = data.city?.trim() || "";
    let location = data.location?.trim() || "";
    let zipCode = data.zipCode?.trim() || "";
    const latitude = Number.isFinite(data.latitude) ? data.latitude : null;
    const longitude = Number.isFinite(data.longitude) ? data.longitude : null;
    if (latitude != null && longitude != null && !city) {
      const geo = await reverseGeocode(latitude, longitude);
      if (geo) {
        city = geo.city;
        location = geo.location;
        zipCode = geo.zipCode;
      } else {
        location = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
      }
    }
    await sql`
      update profiles set
        city = coalesce(${city || null}, city),
        location = coalesce(${location || null}, location),
        zip_code = coalesce(${zipCode || null}, zip_code),
        latitude = coalesce(${latitude}, latitude),
        longitude = coalesce(${longitude}, longitude),
        location_permission = ${permission},
        updated_at = now()
      where user_id = ${context.userId}
    `;
    const rows = await sql<{
      city: string | null;
      location: string | null;
      zip_code: string | null;
      location_permission: string;
    }>`
      select city, location, zip_code, location_permission from profiles where user_id = ${context.userId}
    `;
    return {
      city: rows[0]?.city ?? city,
      location: rows[0]?.location ?? location,
      zipCode: rows[0]?.zip_code ?? zipCode,
      locationPermission: rows[0]?.location_permission ?? permission,
    };
  });

async function reverseGeocode(lat: number, lng: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&format=json&addressdetails=1`,
      {
        signal: ctrl.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "HerFirstMeal/1.0 (hello@herfirstmeal.com)",
        },
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        hamlet?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
      };
    };
    const a = body.address ?? {};
    const city = a.city || a.town || a.village || a.hamlet || a.county || "";
    const location = [city, a.state, a.country].filter(Boolean).join(", ");
    return { city, location, zipCode: a.postcode || "" };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const uid = context.userId;
    await sql`delete from pantry_items where user_id = ${uid}`;
    await sql`delete from meal_plans where user_id = ${uid}`;
    await sql`delete from grocery_lists where user_id = ${uid}`;
    await sql`delete from binding_uploads where user_id = ${uid}`;
    await sql`delete from binding_journal where user_id = ${uid}`;
    await sql`delete from nouri_conversations where user_id = ${uid}`;
    await sql`delete from notifications where user_id = ${uid}`;
    await sql`delete from check_ins where user_id = ${uid}`;
    await sql`delete from appointments where user_id = ${uid}`;
    await sql`delete from dietary_profiles where user_id = ${uid}`;
    await sql`delete from grocery_preferences where user_id = ${uid}`;
    await sql`delete from saved_recipes where user_id = ${uid}`;
    await sql`delete from house_letters where user_id = ${uid}`;
    await sql`delete from profiles where user_id = ${uid}`;
    return { ok: true };
  });

export const saveJoinDiets = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { diets?: string[]; language?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    if (data.language) {
      await sql`update profiles set language = ${data.language}, updated_at = now() where user_id = ${context.userId}`;
    }
    if (data.diets) {
      await sql`
        insert into dietary_profiles (user_id, diets)
        values (${context.userId}, ${JSON.stringify(data.diets)}::jsonb)
        on conflict (user_id) do update set diets = excluded.diets
      `;
    }
    return { ok: true };
  });

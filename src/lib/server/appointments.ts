import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asJson } from "./json";
import { createStripeMeetingCheckout, publicOrigin, stripeConfigured, stripeSessionPaid } from "./stripe";

const TYPES = [
  { id: "consultation", label: "Wellness consultation", minutes: 45 },
  { id: "binding-review", label: "Live belly binding review", minutes: 45 },
  { id: "nutrition", label: "Meal planning session", minutes: 30 },
] as const;

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

export const listMyAppointments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      type: string;
      starts_at: string;
      ends_at: string;
      status: string;
      zoom_link: string | null;
      client_notes: string | null;
    }>`
      select id, type, starts_at, ends_at, status, zoom_link, client_notes
      from appointments where user_id = ${context.userId}
      order by starts_at desc
    `;
    return { appointments: rows, types: TYPES };
  });

export const listOpenSlots = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input?: { day?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const settings = await sql<{
      business_hours: unknown;
      appointment_duration_minutes: number;
      buffer_minutes: number;
      daily_appointment_limit: number;
    }>`select business_hours, appointment_duration_minutes, buffer_minutes, daily_appointment_limit from business_settings where id = 1`;
    const hours = asJson<Record<string, string[]>>(settings[0]?.business_hours, {});
    const duration = Number(settings[0]?.appointment_duration_minutes ?? 45);
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const start = data.day ? new Date(data.day + "T00:00:00") : new Date();
    const slots: { startsAt: string; endsAt: string }[] = [];
    const booked = await sql<{ starts_at: string }>`
      select starts_at from appointments where status in ('pending', 'confirmed') and starts_at > now()
    `;
    const bookedSet = new Set(booked.map((b) => new Date(b.starts_at).toISOString()));
    const blocked = await sql<{ day: string }>`select day from blocked_dates`;
    const blockedSet = new Set(blocked.map((b) => String(b.day).slice(0, 10)));
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dayKeys[d.getDay()];
      const range = hours[key] ?? [];
      if (range.length < 2) continue;
      const isoDay = d.toISOString().slice(0, 10);
      if (blockedSet.has(isoDay)) continue;
      const [from, to] = range;
      const [fh, fm] = from.split(":").map(Number);
      const [th, tm] = to.split(":").map(Number);
      let cursor = new Date(d);
      cursor.setHours(fh, fm, 0, 0);
      const end = new Date(d);
      end.setHours(th, tm, 0, 0);
      let count = 0;
      while (cursor.getTime() + duration * 60000 <= end.getTime()) {
        const startsAt = cursor.toISOString();
        if (cursor.getTime() > Date.now() && !bookedSet.has(startsAt)) {
          slots.push({ startsAt, endsAt: addMinutes(startsAt, duration) });
          count += 1;
        }
        cursor = new Date(cursor.getTime() + (duration + Number(settings[0]?.buffer_minutes ?? 15)) * 60000);
        if (count >= Number(settings[0]?.daily_appointment_limit ?? 6)) break;
      }
    }
    const meeting = await sql<{ price_cents: number }>`
      select price_cents from products where slug = 'consultation' and active = true limit 1
    `;
    const credits = await sql<{ count: number }>`
      select count(*)::int as count from purchases
      where user_id = ${context.userId}
        and status = 'paid'
        and appointment_id is null
        and product_id in (select id from products where slug = 'consultation' or kind = 'consultation')
    `;
    return {
      slots: slots.slice(0, 40),
      types: TYPES,
      meetingPriceCents: Number(meeting[0]?.price_cents ?? 12000),
      stripeReady: stripeConfigured(),
      credits: Number(credits[0]?.count ?? 0),
    };
  });

export const bookAppointment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { type: string; startsAt: string; notes?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const settings = await sql<{ appointment_duration_minutes: number; zoom_default_link: string | null }>`
      select appointment_duration_minutes, zoom_default_link from business_settings where id = 1
    `;
    const duration = Number(settings[0]?.appointment_duration_minutes ?? 45);
    const endsAt = addMinutes(data.startsAt, duration);
    const credit = await sql<{ id: number }>`
      select id from purchases
      where user_id = ${context.userId}
        and status = 'paid'
        and appointment_id is null
        and product_id in (select id from products where slug = 'consultation' or kind = 'consultation')
      order by created_at asc
      limit 1
    `;
    if (!credit[0]) {
      if (!stripeConfigured()) {
        return {
          ok: false as const,
          error: "Stripe is not connected yet. Add STRIPE_SECRET_KEY in Vercel, then pay to hold a time.",
        };
      }
      const meeting = await sql<{ id: number; price_cents: number }>`
        select id, price_cents from products where slug = 'consultation' and active = true limit 1
      `;
      if (!meeting[0]) return { ok: false as const, error: "No meeting is priced yet." };
      const profile = await sql<{ email: string | null; display_name: string | null }>`
        select email, display_name from profiles where user_id = ${context.userId}
      `;
      const email = profile[0]?.email?.trim();
      if (!email) return { ok: false as const, error: "Add an email on your profile before Stripe can bill this meeting." };
      const session = await createStripeMeetingCheckout({
        email,
        name: profile[0]?.display_name || "Member",
        priceCents: meeting[0].price_cents,
        origin: publicOrigin(),
        productId: meeting[0].id,
        userId: context.userId,
        startsAt: data.startsAt,
        type: data.type,
      });
      if ("error" in session) return { ok: false as const, error: session.error };
      return { ok: false as const, needsCheckout: true as const, url: session.url };
    }
    try {
      const inserted = await sql<{ id: number }>`
        insert into appointments (user_id, type, starts_at, ends_at, status, zoom_link, client_notes)
        values (
          ${context.userId},
          ${data.type},
          ${data.startsAt},
          ${endsAt},
          'confirmed',
          ${settings[0]?.zoom_default_link ?? null},
          ${data.notes ?? null}
        )
        returning id
      `;
      const appointmentId = inserted[0]?.id;
      if (appointmentId) {
        await sql`update purchases set appointment_id = ${appointmentId}, starts_at = ${data.startsAt} where id = ${credit[0].id}`;
      }
      await sql`
        insert into notifications (user_id, kind, title, body)
        values (
          ${context.userId},
          'booking',
          'Appointment confirmed',
          ${`Your ${data.type} is held. It is no longer available to anyone else.`}
        )
      `;
      return { ok: true as const, id: appointmentId, chargedCents: 0, usedCredit: true as const };
    } catch {
      return { ok: false as const, error: "That time was just taken. Please choose another." };
    }
  });

export const confirmMeetingCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string }) => ({ sessionId: input.sessionId.trim() }))
  .handler(async ({ context, data }) => {
    if (!data.sessionId) return { ok: false as const, error: "Missing Stripe session." };
    const paid = await stripeSessionPaid(data.sessionId);
    if (!paid.paid) return { ok: false as const, error: "Stripe has not marked this payment complete." };
    if (paid.kind && paid.kind !== "meeting") return { ok: false as const, error: "That checkout was not a meeting." };
    if (paid.userId && paid.userId !== context.userId) {
      return { ok: false as const, error: "This payment belongs to another member." };
    }
    const sql = await getSql();
    const existing = await sql<{ id: number; appointment_id: number | null }>`
      select id, appointment_id from purchases where stripe_session = ${data.sessionId}
    `;
    if (existing[0]) {
      return { ok: true as const, appointmentId: existing[0].appointment_id, already: true as const };
    }
    const meeting = await sql<{ id: number; price_cents: number }>`
      select id, price_cents from products
      where id = ${paid.productId ?? 0} or slug = 'consultation'
      order by case when id = ${paid.productId ?? 0} then 0 else 1 end
      limit 1
    `;
    if (!meeting[0]) return { ok: false as const, error: "No meeting product is priced." };
    const profile = await sql<{ email: string | null }>`select email from profiles where user_id = ${context.userId}`;
    const inserted = await sql<{ id: number }>`
      insert into purchases (user_id, email, product_id, amount_cents, status, stripe_session, starts_at)
      values (
        ${context.userId},
        ${profile[0]?.email ?? paid.email ?? "member"},
        ${meeting[0].id},
        ${meeting[0].price_cents},
        'paid',
        ${data.sessionId},
        ${paid.startsAt ?? null}
      )
      returning id
    `;
    let appointmentId: number | null = null;
    if (paid.startsAt) {
      const settings = await sql<{ appointment_duration_minutes: number; zoom_default_link: string | null }>`
        select appointment_duration_minutes, zoom_default_link from business_settings where id = 1
      `;
      const duration = Number(settings[0]?.appointment_duration_minutes ?? 45);
      const type = paid.type || "consultation";
      try {
        const booked = await sql<{ id: number }>`
          insert into appointments (user_id, type, starts_at, ends_at, status, zoom_link)
          values (
            ${context.userId},
            ${type},
            ${paid.startsAt},
            ${addMinutes(paid.startsAt, duration)},
            'confirmed',
            ${settings[0]?.zoom_default_link ?? null}
          )
          returning id
        `;
        appointmentId = booked[0]?.id ?? null;
        if (appointmentId) {
          await sql`update purchases set appointment_id = ${appointmentId} where id = ${inserted[0].id}`;
        }
        await sql`
          insert into notifications (user_id, kind, title, body)
          values (
            ${context.userId},
            'booking',
            'Appointment confirmed',
            ${`Your ${type} is held after Stripe. It is no longer available to anyone else.`}
          )
        `;
      } catch {
        /* payment stands as unused credit if the slot was taken */
      }
    }
    return { ok: true as const, appointmentId, already: false as const };
  });

export const cancelAppointment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update appointments set status = 'cancelled'
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });


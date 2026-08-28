import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asJson } from "./json";

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
  .handler(async ({ data }) => {
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
    return { slots: slots.slice(0, 40), types: TYPES, meetingPriceCents: Number(meeting[0]?.price_cents ?? 12000) };
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
      const meeting = await sql<{ id: number; price_cents: number }>`
        select id, price_cents from products where slug = 'consultation' and active = true limit 1
      `;
      if (meeting[0]) {
        const profile = await sql<{ email: string | null }>`select email from profiles where user_id = ${context.userId}`;
        await sql`
          insert into purchases (user_id, email, product_id, amount_cents, status)
          values (
            ${context.userId},
            ${profile[0]?.email ?? "member"},
            ${meeting[0].id},
            ${meeting[0].price_cents},
            'paid'
          )
        `;
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
      return { ok: true as const, id: inserted[0]?.id, chargedCents: meeting[0]?.price_cents ?? 0 };
    } catch {
      return { ok: false as const, error: "That time was just taken. Please choose another." };
    }
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


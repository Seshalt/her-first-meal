import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { createStripeMeetingCheckout, publicOrigin, stripeConfigured } from "./stripe";

export const listBindingUploads = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const uploads = await sql<{
      id: number;
      angle: string;
      image_data: string | null;
      notes: string | null;
      ai_feedback: string | null;
      created_at: string;
    }>`
      select id, angle, image_data, notes, ai_feedback, created_at
      from binding_uploads where user_id = ${context.userId}
      order by created_at desc limit 24
    `;
    const journal = await sql<{ id: number; entry: string; created_at: string }>`
      select id, entry, created_at from binding_journal where user_id = ${context.userId} order by created_at desc limit 20
    `;
    const cms = await sql<{ id: number; kind: string; title: string; body: string | null; url: string | null }>`
      select id, kind, title, body, url from cms_items where kind like 'binding%' order by created_at desc
    `;
    return { uploads, journal, cms };
  });

export const addBindingJournal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { entry: string }) => ({ entry: input.entry.trim().slice(0, 4000) }))
  .handler(async ({ context, data }) => {
    if (!data.entry) return { ok: false };
    const sql = await getSql();
    await sql`insert into binding_journal (user_id, entry) values (${context.userId}, ${data.entry})`;
    return { ok: true };
  });

export const logWorkout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { workoutId: string; minutes?: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into workout_logs (user_id, workout_id, minutes) values (${context.userId}, ${data.workoutId}, ${data.minutes ?? null})`;
    return { ok: true };
  });

export const listStore = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const products = await sql<{
      id: number;
      slug: string;
      name: string;
      description: string;
      price_cents: number;
      kind: string;
      image: string | null;
    }>`select id, slug, name, description, price_cents, kind, image from products where active = true order by id`;
    const history = await sql<{
      id: number;
      amount_cents: number;
      status: string;
      created_at: string;
      product_id: number | null;
    }>`select id, amount_cents, status, created_at, product_id from purchases where user_id = ${context.userId} order by created_at desc`;
    return { products, history, stripeReady: stripeConfigured() };
  });

export const startMeetingCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { productId: number; startsAt?: string; type?: string }) => input)
  .handler(async ({ context, data }) => {
    if (!stripeConfigured()) {
      return {
        ok: false as const,
        error: "Stripe is not connected yet. Add STRIPE_SECRET_KEY in Vercel, then pay for a meeting.",
      };
    }
    const sql = await getSql();
    const product = await sql<{ price_cents: number; name: string; email?: string }>`
      select price_cents, name from products where id = ${data.productId} and active = true
    `;
    if (!product[0]) return { ok: false as const, error: "That offering is no longer available." };
    const profile = await sql<{ email: string | null; display_name: string | null }>`
      select email, display_name from profiles where user_id = ${context.userId}
    `;
    const email = profile[0]?.email?.trim();
    if (!email) return { ok: false as const, error: "Add an email on your profile before Stripe can bill this meeting." };
    const session = await createStripeMeetingCheckout({
      email,
      name: profile[0]?.display_name || "Member",
      priceCents: product[0].price_cents,
      origin: publicOrigin(),
      productId: data.productId,
      userId: context.userId,
      startsAt: data.startsAt,
      type: data.type,
    });
    if ("error" in session) return { ok: false as const, error: session.error };
    return { ok: true as const, url: session.url };
  });

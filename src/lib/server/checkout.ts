import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { uid } from "@/lib/utils";
import { ensureProfile } from "./profile";
import { assertHuman, rateLimit } from "./abuse";

export const startMembershipCheckout = createServerFn({ method: "POST" })
  .validator((input: {
    plan: "monthly" | "yearly";
    email: string;
    name: string;
    code?: string;
    honey?: string;
    startedAt?: number;
    human?: boolean;
  }) => {
    const email = input.email.trim().toLowerCase();
    if (!email.includes("@")) throw new Error("A valid email is required.");
    if (!input.name.trim()) throw new Error("Please tell us your name.");
    return { ...input, email, name: input.name.trim() };
  })
  .handler(async ({ data }) => {
    assertHuman({ honey: data.honey, startedAt: data.startedAt, human: data.human });
    rateLimit(`checkout:${data.email}`, 5, 15 * 60 * 1000);
    const sql = await getSql();
    const settings = await sql<{ monthly_price_cents: number; yearly_price_cents: number }>`
      select monthly_price_cents, yearly_price_cents from business_settings where id = 1
    `;
    let price =
      data.plan === "yearly"
        ? Number(settings[0]?.yearly_price_cents ?? 49000)
        : Number(settings[0]?.monthly_price_cents ?? 4900);
    if (data.code) {
      const disc = await sql<{ percent: number }>`
        select percent from discounts where lower(code) = ${data.code.trim().toLowerCase()} and active = true
      `;
      if (disc[0]) price = Math.round(price * (1 - Number(disc[0].percent) / 100));
    }
    const token = uid("chk");
    const expiresAt = new Date();
    if (data.plan === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);
    await sql`
      insert into memberships (email, plan, status, price_cents, checkout_token, expires_at)
      values (${data.email}, ${data.plan}, 'active', ${price}, ${token}, ${expiresAt.toISOString()})
    `;
    await sql`
      insert into purchases (email, amount_cents, status)
      values (${data.email}, ${price}, 'paid')
    `;
    return { token, email: data.email, name: data.name, plan: data.plan, priceCents: price };
  });

export const claimMembership = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { token?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);
    if (data.token) {
      await sql`
        update memberships set user_id = ${context.userId}
        where checkout_token = ${data.token} and (user_id is null or user_id = ${context.userId})
      `;
    }
    if (profile.email) {
      await sql`
        update memberships set user_id = ${context.userId}
        where lower(email) = ${profile.email.toLowerCase()} and user_id is null
      `;
    }
    const membership = await sql<{ id: number; plan: string; status: string }>`
      select id, plan, status from memberships where user_id = ${context.userId} and status = 'active' limit 1
    `;
    await sql`
      insert into notifications (user_id, kind, title, body)
      values (
        ${context.userId},
        'welcome',
        'Welcome to Her First Meal',
        'Your membership is open. Begin with onboarding whenever you are ready.'
      )
    `;
    return { ok: true, hasMembership: Boolean(membership[0]) };
  });

export const getCheckoutByToken = createServerFn({ method: "GET" })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ email: string; plan: string; price_cents: number }>`
      select email, plan, price_cents from memberships where checkout_token = ${data.token} limit 1
    `;
    return rows[0]
      ? { email: rows[0].email, plan: rows[0].plan, priceCents: rows[0].price_cents }
      : null;
  });

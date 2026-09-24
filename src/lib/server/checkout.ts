import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { uid } from "@/lib/utils";
import { ensureProfile } from "./profile";
import { assertHuman, rateLimit } from "./abuse";
import { createStripeCheckout, stripeConfigured, stripePublishableKey, stripeSessionPaid } from "./stripe";

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

    // Never create a fake-success path when Stripe is unavailable.
    if (!stripeConfigured()) {
      throw new Error("Secure payment is temporarily unavailable. Stripe is not connected to this deployment yet.");
    }

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
      values (${data.email}, ${data.plan}, 'pending', ${price}, ${token}, ${expiresAt.toISOString()})
    `;

    const origin = (process.env.APP_URL || process.env.BETTER_AUTH_URL || "https://www.herfirstmeal.app").replace(/\/$/, "");
    const session = await createStripeCheckout({
      token,
      email: data.email,
      name: data.name,
      plan: data.plan,
      priceCents: price,
      origin,
    });
    if ("error" in session) {
      await sql`
        delete from memberships
        where checkout_token = ${token} and status = 'pending'
      `;
      throw new Error(session.error);
    }

    return {
      token,
      email: data.email,
      name: data.name,
      plan: data.plan,
      priceCents: price,
      stripeUrl: session.url ?? null,
      stripeClientSecret: session.clientSecret ?? null,
      stripePublishableKey: session.clientSecret ? (stripePublishableKey() ?? null) : null,
    };
  });

export const confirmStripeCheckout = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const paid = await stripeSessionPaid(data.sessionId);
    if (!paid.paid) throw new Error("Stripe has not marked this payment paid.");
    if (!paid.token || !paid.token.startsWith("chk")) {
      throw new Error("That Stripe checkout is not a Her First Meal membership payment.");
    }
    const sql = await getSql();

    if (paid.token) {
      await sql`
        update memberships
        set status = 'active'
        where checkout_token = ${paid.token} and status = 'pending'
      `;
    }
    const row = paid.token
      ? await sql<{ email: string; plan: string; price_cents: number; checkout_token: string }>`
          select email, plan, price_cents, checkout_token
          from memberships
          where checkout_token = ${paid.token} and status = 'active'
          limit 1
        `
      : [];

    if (paid.token && !row[0]) throw new Error("Payment was confirmed, but the membership could not be activated.");
    if (paid.email && row[0] && paid.email.toLowerCase() !== row[0].email.toLowerCase()) {
      throw new Error("Stripe payment email did not match the membership record.");
    }
    if (paid.plan && row[0] && paid.plan !== (row[0].plan === "yearly" ? "yearly" : "monthly")) {
      throw new Error("Stripe payment plan did not match the membership record.");
    }

    if (row[0]) {
      await sql`
        insert into purchases (email, amount_cents, status, stripe_session)
        select ${row[0].email}, ${Number(row[0].price_cents)}, 'paid', ${data.sessionId}
        where not exists (
          select 1 from purchases where stripe_session = ${data.sessionId}
        )
      `;
    }

    return {
      token: row[0]?.checkout_token ?? paid.token ?? "",
      email: row[0]?.email ?? paid.email ?? "",
      plan: (row[0]?.plan === "yearly" ? "yearly" : "monthly") as "monthly" | "yearly",
      priceCents: Number(row[0]?.price_cents ?? 0),
    };
  });

export const getMembershipAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);

    if (profile.email) {
      await sql`
        update memberships
        set user_id = ${context.userId}
        where lower(email) = ${profile.email.toLowerCase()}
          and status = 'active'
          and user_id is null
      `;
    }

    const rows = await sql<{ plan: string; status: string; expires_at: string | null }>`
      select plan, status, expires_at
      from memberships
      where user_id = ${context.userId}
        and status = 'active'
        and (expires_at is null or expires_at > now())
      order by started_at desc
      limit 1
    `;

    return {
      active: Boolean(rows[0]),
      plan: rows[0]?.plan ?? null,
      expiresAt: rows[0]?.expires_at ?? null,
    };
  });

export const claimMembership = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { token?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);

    if (data.token) {
      const rows = await sql<{ id: number; email: string | null; status: string; user_id: string | null }>`
        select id, email, status, user_id
        from memberships
        where checkout_token = ${data.token}
        limit 1
      `;
      const paidMembership = rows[0];
      if (!paidMembership || paidMembership.status !== 'active') {
        throw new Error("Payment is required before this membership can be opened.");
      }
      if (paidMembership.user_id && paidMembership.user_id !== context.userId) {
        throw new Error("This membership is already linked to another account.");
      }
      if (profile.email && paidMembership.email && paidMembership.email.toLowerCase() !== profile.email.toLowerCase()) {
        throw new Error("Use the same email address that was used at checkout.");
      }
      await sql`
        update memberships
        set user_id = ${context.userId}
        where id = ${paidMembership.id}
      `;
    }

    if (profile.email) {
      await sql`
        update memberships
        set user_id = ${context.userId}
        where lower(email) = ${profile.email.toLowerCase()}
          and status = 'active'
          and user_id is null
      `;
    }

    const membership = await sql<{ id: number; plan: string; status: string }>`
      select id, plan, status
      from memberships
      where user_id = ${context.userId}
        and status = 'active'
        and (expires_at is null or expires_at > now())
      order by started_at desc
      limit 1
    `;

    if (!membership[0]) {
      throw new Error("An active paid membership is required before entering the member app.");
    }

    await sql`
      insert into notifications (user_id, kind, title, body)
      select ${context.userId}, 'welcome', 'Welcome to Her First Meal',
        'Your membership is open. Begin with onboarding whenever you are ready.'
      where not exists (
        select 1 from notifications where user_id = ${context.userId} and kind = 'welcome'
      )
    `;

    return { ok: true, hasMembership: true };
  });

export const getCheckoutByToken = createServerFn({ method: "GET" })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ email: string; plan: string; price_cents: number; status: string }>`
      select email, plan, price_cents, status
      from memberships
      where checkout_token = ${data.token}
      limit 1
    `;
    return rows[0]
      ? { email: rows[0].email, plan: rows[0].plan, priceCents: rows[0].price_cents, status: rows[0].status }
      : null;
  });

import { createHash, randomInt } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSessionUser } from "@/lib/auth/verify.server";
import { timingSafeEqualText } from "@/lib/auth/constant-time";
import { getSql } from "@/lib/db";
import { rateLimit } from "./abuse";
import { maskEmail, mailConfigured, sendHouseMail } from "./mail";
import { ensureProfile } from "./profile";

function hashCode(userId: string, code: string): string {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

async function accountEmail(userId: string, bearerToken?: string): Promise<string> {
  const session = await getSessionUser(bearerToken);
  if (session?.email) return session.email.trim().toLowerCase();
  const sql = await getSql();
  const rows = await sql<{ email: string | null }>`
    select email from "user" where id = ${userId} limit 1
  `;
  return (rows[0]?.email ?? "").trim().toLowerCase();
}

export const getEmailFactorStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const email = await accountEmail(context.userId);
    if (!mailConfigured()) {
      return { needed: false, emailMasked: email ? maskEmail(email) : "your email" };
    }
    await ensureProfile(context.userId, email || null, null);
    const sql = await getSql();
    const rows = await sql<{ email_factor_ok: boolean }>`
      select email_factor_ok from profiles where user_id = ${context.userId}
    `;
    return {
      needed: rows[0] ? !rows[0].email_factor_ok : true,
      emailMasked: email ? maskEmail(email) : "your email",
    };
  });

export const requestEmailFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    rateLimit(`email-factor:${context.userId}`, 6, 15 * 60 * 1000);
    const email = await accountEmail(context.userId);
    if (!mailConfigured()) {
      return { needed: false, sent: false, emailMasked: maskEmail(email), configured: false };
    }
    await ensureProfile(context.userId, email || null, null);
    const sql = await getSql();
    const rows = await sql<{ email_factor_ok: boolean }>`
      select email_factor_ok from profiles where user_id = ${context.userId}
    `;
    if (rows[0]?.email_factor_ok) {
      return { needed: false, sent: false, emailMasked: maskEmail(email), configured: true };
    }
    if (!email.includes("@")) {
      throw new Error("This account needs an email before we can send a sign-in code.");
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const id = crypto.randomUUID();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await sql`delete from email_factors where user_id = ${context.userId}`;
    await sql`
      insert into email_factors (id, user_id, email, code_hash, expires_at)
      values (${id}, ${context.userId}, ${email}, ${hashCode(context.userId, code)}, ${expires})
    `;
    const mail = await sendHouseMail({
      to: email,
      subject: "Your Her First Meal sign-in code",
      text: `Your first-time sign-in code is ${code}. It expires in 10 minutes. If you did not try to enter the house, you can ignore this note.`,
      html: `<p>Your first-time sign-in code is <strong style="font-size:24px;letter-spacing:4px">${code}</strong>.</p><p>It expires in 10 minutes. If you did not try to enter the house, ignore this note.</p>`,
    });
    return {
      needed: true,
      sent: mail.sent,
      emailMasked: maskEmail(email),
      configured: mail.reason !== "not-configured",
    };
  });

export const verifyEmailFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { code: string }) => input)
  .handler(async ({ context, data }) => {
    rateLimit(`email-factor-try:${context.userId}`, 12, 15 * 60 * 1000);
    const code = data.code.replace(/\D/g, "");
    if (code.length !== 6) throw new Error("Enter the six-digit code from your email.");
    const sql = await getSql();
    const rows = await sql<{ id: string; code_hash: string; expires_at: string; attempts: number }>`
      select id, code_hash, expires_at::text, attempts
      from email_factors
      where user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("Ask for a new code.");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new Error("That code expired. Ask for a new one.");
    }
    if (row.attempts >= 5) throw new Error("Too many tries. Ask for a new code.");
    const ok = timingSafeEqualText(row.code_hash, hashCode(context.userId, code));
    await sql`update email_factors set attempts = attempts + 1 where id = ${row.id}`;
    if (!ok) throw new Error("That code does not match.");
    await sql`update profiles set email_factor_ok = true, updated_at = now() where user_id = ${context.userId}`;
    await sql`delete from email_factors where user_id = ${context.userId}`;
    return { ok: true };
  });

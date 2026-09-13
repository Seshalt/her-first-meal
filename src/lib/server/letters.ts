import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { sendHouseMail } from "./mail";
import { DEFAULT_SITE_COPY, type SiteCopy } from "@/lib/site";
import { asJson } from "./json";

function ownerInbox(sqlReady?: { contactEmail?: string }) {
  return (sqlReady?.contactEmail || DEFAULT_SITE_COPY.contactEmail).trim();
}

async function contactEmailFromSettings() {
  const sql = await getSql();
  const rows = await sql<{ branding: unknown }>`select branding from business_settings where id = 1`;
  const branding = asJson<Record<string, unknown>>(rows[0]?.branding, {});
  const site = asJson<Partial<SiteCopy>>(branding.site, {});
  return ownerInbox({ contactEmail: site.contactEmail });
}

export const sendPublicLetter = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; message: string; locale?: string; subject?: string }) => ({
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 180).toLowerCase(),
    message: input.message.trim().slice(0, 4000),
    locale: input.locale?.slice(0, 12),
    subject: input.subject?.trim().slice(0, 160) || "A letter to the house",
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@") || data.message.length < 8) {
      return { ok: false as const, error: "Please include an email and a longer note." };
    }
    const sql = await getSql();
    await sql`
      insert into house_letters (name, email, locale, subject, body)
      values (${data.name || "Guest"}, ${data.email}, ${data.locale ?? "en"}, ${data.subject}, ${data.message})
    `;
    const to = await contactEmailFromSettings();
    const mailed = await sendHouseMail({
      to,
      subject: `${data.subject} — ${data.name || data.email}`,
      text: [`From: ${data.name}`, `Email: ${data.email}`, `Language: ${data.locale ?? "en"}`, "", data.message].join("\n"),
    });
    return { ok: true as const, mailed: mailed.sent };
  });

export const sendMemberLetter = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string; subject?: string; locale?: string }) => ({
    message: input.message.trim().slice(0, 4000),
    subject: input.subject?.trim().slice(0, 160) || "A letter from inside the house",
    locale: input.locale?.slice(0, 12),
  }))
  .handler(async ({ context, data }) => {
    if (data.message.length < 8) return { ok: false as const, error: "Write a little more so Maat can meet you there." };
    const sql = await getSql();
    const profile = await sql<{
      display_name: string | null;
      email: string | null;
      stage: string | null;
      language: string;
    }>`select display_name, email, stage, language from profiles where user_id = ${context.userId}`;
    const name = profile[0]?.display_name || "Member";
    const email = profile[0]?.email || "member@herfirstmeal.com";
    await sql`
      insert into house_letters (user_id, name, email, locale, stage, subject, body)
      values (
        ${context.userId},
        ${name},
        ${email},
        ${data.locale ?? profile[0]?.language ?? "en"},
        ${profile[0]?.stage ?? null},
        ${data.subject},
        ${data.message}
      )
    `;
    const to = await contactEmailFromSettings();
    const mailed = await sendHouseMail({
      to,
      subject: `${data.subject} — ${name}`,
      text: [
        `From: ${name}`,
        `Email: ${email}`,
        `Stage: ${profile[0]?.stage ?? "unspecified"}`,
        `Language: ${data.locale ?? profile[0]?.language ?? "en"}`,
        "",
        data.message,
      ].join("\n"),
    });
    return { ok: true as const, mailed: mailed.sent };
  });

export const listHouseLetters = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const role = await sql<{ role: string }>`select role from profiles where user_id = ${context.userId}`;
    if (role[0]?.role !== "admin") throw new Error("Unauthorized");
    return sql<{
      id: number;
      name: string | null;
      email: string;
      stage: string | null;
      locale: string | null;
      subject: string | null;
      body: string;
      created_at: string;
      read_at: string | null;
    }>`
      select id, name, email, stage, locale, subject, body, created_at, read_at
      from house_letters
      order by created_at desc
      limit 80
    `;
  });

export const markLetterRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const role = await sql<{ role: string }>`select role from profiles where user_id = ${context.userId}`;
    if (role[0]?.role !== "admin") throw new Error("Unauthorized");
    await sql`update house_letters set read_at = now() where id = ${data.id} and read_at is null`;
    return { ok: true };
  });

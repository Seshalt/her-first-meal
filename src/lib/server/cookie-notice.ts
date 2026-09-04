import { createHash } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

function clientIp(): string {
  try {
    const request = getRequest();
    const headers = request?.headers;
    const forwarded = headers?.get("x-forwarded-for") ?? headers?.get("x-real-ip") ?? headers?.get("cf-connecting-ip") ?? "";
    const ip = forwarded.split(",")[0]?.trim() || "unknown";
    return ip.slice(0, 80);
  } catch {
    return "unknown";
  }
}

function hashIp(ip: string): string {
  const salt = (process.env.BETTER_AUTH_SECRET ?? "her-first-meal-cookie-notice").slice(0, 48);
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function cookieNoticeSeen(): Promise<boolean> {
  const ip = clientIp();
  if (ip === "unknown") return false;
  const sql = await getSql();
  try {
    const rows = await sql<{ ip_hash: string }>`
      select ip_hash from cookie_notices where ip_hash = ${hashIp(ip)} limit 1
    `;
    return Boolean(rows[0]);
  } catch {
    return false;
  }
}

export async function markCookieNotice(): Promise<void> {
  const ip = clientIp();
  if (ip === "unknown") return;
  const sql = await getSql();
  try {
    await sql`
      insert into cookie_notices (ip_hash) values (${hashIp(ip)})
      on conflict (ip_hash) do nothing
    `;
  } catch {
    /* table may not exist yet */
  }
}

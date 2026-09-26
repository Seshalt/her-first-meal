import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("admin access requires both admin role and MFA", async () => {
  const admin = await source("src/lib/server/admin.ts");
  assert.match(admin, /twoFactorEnabled/);
  assert.match(admin, /role !== "admin" \|\| !rows\[0\]\?\.mfa_enabled/);
});

test("Better Auth registers TOTP MFA on server and client", async () => {
  const [server, client] = await Promise.all([
    source("src/lib/auth/server.ts"),
    source("src/lib/auth/client.ts"),
  ]);
  assert.match(server, /twoFactor\(\{/);
  assert.match(server, /trustDeviceMaxAge:\s*0/);
  assert.match(client, /twoFactorClient\(\)/);
});

test("MFA migration persists factor state and lockout counters", async () => {
  const migration = await source("migrations/0013_admin_mfa.sql");
  assert.match(migration, /twoFactorEnabled/);
  assert.match(migration, /create table if not exists "twoFactor"/i);
  assert.match(migration, /failedVerificationCount/);
  assert.match(migration, /lockedUntil/);
});

test("Stripe confirmation only accepts paid sessions", async () => {
  const stripe = await source("src/lib/server/stripe.ts");
  assert.match(stripe, /json\.payment_status === "paid"/);
  assert.doesNotMatch(stripe, /json\.status === "complete"/);
});

test("transactional email requires both API key and verified sender", async () => {
  const mail = await source("src/lib/server/mail.ts");
  assert.match(mail, /RESEND_API_KEY/);
  assert.match(mail, /configuredFrom\(\)/);
  assert.match(mail, /MAIL_FROM/);
});

test("Her First Meal database override takes precedence", async () => {
  const db = await source("src/lib/db.ts");
  assert.match(db, /HFM_DATABASE_URL \|\| process\.env\.DATABASE_URL/);
});

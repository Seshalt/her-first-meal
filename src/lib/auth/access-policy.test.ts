import test from "node:test";
import assert from "node:assert/strict";
import { hasAdminAccess, hasMemberAccess } from "./access-policy.ts";
import { ownerBootstrapAuthorized, ownerBootstrapAvailable } from "./owner-bootstrap.ts";
import { browserLocale } from "../i18n/locales.ts";

test("a fresh production database cannot be claimed without a private setup key", () => {
  const key = "a".repeat(48);
  assert.equal(ownerBootstrapAvailable("neon", "production", undefined), false);
  assert.equal(ownerBootstrapAuthorized("neon", "production", undefined, undefined), false);
  assert.equal(ownerBootstrapAuthorized("neon", "development", undefined, undefined), false);
  assert.equal(ownerBootstrapAuthorized("pglite", "production", undefined, undefined), false);
  assert.equal(ownerBootstrapAuthorized("neon", "production", "short", "short"), false);
  assert.equal(ownerBootstrapAuthorized("neon", "production", key, "b".repeat(48)), false);
  assert.equal(ownerBootstrapAuthorized("neon", "production", key, key), true);
  assert.equal(ownerBootstrapAuthorized("pglite", "development", undefined, undefined), true);
});

test("admin and member privileges fail closed", () => {
  assert.equal(hasAdminAccess("admin", false), false);
  assert.equal(hasAdminAccess("member", true), false);
  assert.equal(hasAdminAccess("admin", true), true);
  assert.equal(hasMemberAccess({ paid: true, emailVerified: false }), false);
  assert.equal(hasMemberAccess({ paid: false, emailVerified: true }), false);
  assert.equal(hasMemberAccess({ paid: true, emailVerified: true }), true);
  assert.equal(hasMemberAccess({ role: "admin", mfaEnabled: false }), false);
  assert.equal(hasMemberAccess({ role: "admin", mfaEnabled: true }), true);
});

test("Cantonese is detected before generic Chinese", () => {
  for (const language of ["zh-HK", "zh-MO", "yue-Hant-HK"]) assert.equal(browserLocale(language), "yue");
  assert.equal(browserLocale("zh-CN"), "zh");
  assert.equal(browserLocale("tl-PH"), "fil");
  assert.equal(browserLocale("pt-BR"), "pt");
  assert.equal(browserLocale("ar-EG"), "ar");
  assert.equal(browserLocale("unrecognized"), "en");
});

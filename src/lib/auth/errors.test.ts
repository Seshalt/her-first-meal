import test from "node:test";
import assert from "node:assert/strict";
import { readableAuthError } from "./errors.ts";
test("account errors preserve the recovery action for reset links and factor codes", () => {
  assert.equal(readableAuthError({ code: "INVALID_TOKEN", message: "Invalid token" }, "Request a new reset link."), "Request a new reset link.");
  assert.equal(readableAuthError({ code: "INVALID_TOTP" }, "That code does not match."), "That code does not match.");
  assert.equal(readableAuthError({ code: "INVALID_EMAIL_OR_PASSWORD" }, "Try again."), "That email or password does not match.");
  assert.equal(readableAuthError({ code: "USER_ALREADY_EXISTS" }, "Try again."), "An account with that email already exists. Sign in or reset your password.");
  assert.equal(readableAuthError({}, "Try again."), "Try again.");
});

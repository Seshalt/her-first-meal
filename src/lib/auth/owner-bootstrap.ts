import { timingSafeEqual } from "node:crypto";

/** A fresh persistent database must never make ownership first-come, first-served. */
export function ownerBootstrapAvailable(source: string, environment: string | undefined, secret: string | undefined) {
  return (source === "pglite" && environment !== "production") || Boolean(secret && secret.length >= 32);
}

export function ownerBootstrapAuthorized(source: string, environment: string | undefined, secret: string | undefined, supplied: string | undefined) {
  if (source === "pglite" && environment !== "production") return true;
  if (!secret || secret.length < 32 || !supplied || supplied.length > 512) return false;
  const expected = Buffer.from(secret);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

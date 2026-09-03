import { timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";

/** Compare two strings without leaking which byte first differed. */
export function timingSafeEqualText(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  const size = Math.max(a.length, b.length, 1);
  const padA = Buffer.alloc(size);
  const padB = Buffer.alloc(size);
  a.copy(padA);
  b.copy(padB);
  const sameLen = a.length === b.length;
  const sameBytes = nodeTimingSafeEqual(padA, padB);
  return sameLen && sameBytes;
}

/** Burn the same hash work whether or not an account exists. */
export async function dummyPasswordWork(): Promise<void> {
  const { hashPassword } = await import("better-auth/crypto");
  await hashPassword("unused-timing-pad.not-a-real-password");
}

export async function padAuthDuration(startedAt: number, minMs = 360): Promise<void> {
  const wait = minMs - (Date.now() - startedAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

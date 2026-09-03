/** In-process anti-abuse for public POSTs. Survives HMR via globalThis. */

type Bucket = { count: number; resetAt: number };

const store = (globalThis as typeof globalThis & { __hfmAbuse__?: Map<string, Bucket> }).__hfmAbuse__ ??=
  new Map<string, Bucket>();

export function rateLimit(key: string, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > max) {
    throw new Error("Please wait a few minutes before trying again.");
  }
}

export function assertHuman(input: { honey?: string; startedAt?: number; human?: boolean }) {
  if (input.honey && input.honey.trim()) {
    throw new Error("Please try again.");
  }
  if (!input.human) {
    throw new Error("Please confirm you are a person.");
  }
  if (typeof input.startedAt === "number" && Number.isFinite(input.startedAt)) {
    const elapsed = Date.now() - input.startedAt;
    if (elapsed >= 0 && elapsed < 400) {
      throw new Error("Please try again in a moment.");
    }
  }
}

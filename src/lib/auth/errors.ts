/** Never show a blank auth toast — Better Auth sometimes returns an empty message. */

export function readableAuthError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const nested = readableAuthError(
      { message: error.message, code: (error as Error & { code?: string }).code },
      "",
    );
    if (nested) return nested;
  }
  if (!error || typeof error !== "object") return fallback;
  const e = error as { message?: unknown; code?: unknown; statusText?: unknown; error?: unknown };
  if (e.error && e.error !== error) {
    const nested = readableAuthError(e.error, "");
    if (nested) return nested;
  }
  const code = String(e.code ?? "").toUpperCase();
  const raw = [e.message, e.statusText]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .find(Boolean);
  if (
    code.includes("INVALID") ||
    code.includes("CREDENTIAL") ||
    /invalid|incorrect|wrong password|does not match/i.test(raw ?? "")
  ) {
    return "That email or password does not match.";
  }
  if (code.includes("ALREADY") || /already exists|user already/i.test(raw ?? "")) {
    return "An account with that email already exists. Sign in, or set a new owner password.";
  }
  if (raw && raw !== "undefined" && raw !== "null" && raw !== "Error") return raw;
  return fallback;
}

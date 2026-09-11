import { authClient } from "@/lib/auth/client";

const BEARER = "grok-auth.bearer-token";
const HOLD = "hfm-owner-session";

export function persistOwnerToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER, token);
    window.localStorage.setItem(HOLD, token);
  } catch {
    /* ignore */
  }
}

export function restoreOwnerToken() {
  if (typeof window === "undefined") return;
  try {
    const hold = window.localStorage.getItem(HOLD);
    if (hold) window.sessionStorage.setItem(BEARER, hold);
  } catch {
    /* ignore */
  }
}

export function clearOwnerToken() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(BEARER);
    window.localStorage.removeItem(HOLD);
  } catch {
    /* ignore */
  }
}

/** Wait until Better Auth actually has a session before leaving the door. */
export async function waitForSignedInUser(tries = 12) {
  restoreOwnerToken();
  for (let i = 0; i < tries; i += 1) {
    const { data } = await authClient.getSession();
    if (data?.user) return data.user;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return null;
}

if (typeof window !== "undefined") restoreOwnerToken();

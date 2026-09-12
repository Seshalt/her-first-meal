import { authClient } from "@/lib/auth/client";

const BEARER = "grok-auth.bearer-token";

/** Keep the session in this tab only — never localStorage (that is easy to steal). */
export function persistOwnerToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER, token);
  } catch {
    /* ignore */
  }
}

export function restoreOwnerToken() {
  /* sessionStorage already survives refresh in this tab */
}

export function clearOwnerToken() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(BEARER);
    window.localStorage.removeItem("hfm-owner-session");
  } catch {
    /* ignore */
  }
}

/** Wait until Better Auth actually has a session before leaving the door. */
export async function waitForSignedInUser(tries = 12) {
  for (let i = 0; i < tries; i += 1) {
    const { data } = await authClient.getSession();
    if (data?.user) return data.user;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return null;
}

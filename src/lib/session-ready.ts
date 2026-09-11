import { authClient } from "@/lib/auth/client";

/** Wait until Better Auth actually has a session cookie before leaving the door. */
export async function waitForSignedInUser(tries = 12) {
  for (let i = 0; i < tries; i += 1) {
    const { data } = await authClient.getSession();
    if (data?.user) return data.user;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return null;
}

import { createFileRoute } from "@tanstack/react-router";
import { dummyPasswordWork, padAuthDuration } from "@/lib/auth/constant-time";
import { auth } from "@/lib/auth/server";
import { rateLimit } from "@/lib/server/abuse";

function isCredentialPath(url: string): boolean {
  return /\/sign-in\/email|\/sign-up\/email|\/forget-password|\/reset-password/.test(url);
}

async function handleAuth(request: Request): Promise<Response> {
  const credential = request.method === "POST" && isCredentialPath(request.url);
  const started = Date.now();
  if (credential) {
    rateLimit("auth-credential", 24, 15 * 60 * 1000);
    await dummyPasswordWork();
  }
  try {
    const response = await auth.handler(request);
    if (credential) await padAuthDuration(started);
    return response;
  } catch (error) {
    if (credential) await padAuthDuration(started);
    throw error;
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});

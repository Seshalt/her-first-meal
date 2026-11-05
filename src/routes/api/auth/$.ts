import { createFileRoute } from "@tanstack/react-router";
import { dummyPasswordWork, padAuthDuration } from "@/lib/auth/constant-time";
import { auth } from "@/lib/auth/server";
import { GROK_PROVIDERS } from "@/lib/auth/providers";
import { rateLimit } from "@/lib/server/abuse";

function isCredentialPath(url: string): boolean {
  return /\/(?:sign-in\/email|sign-up\/email|forget-password|request-password-reset|reset-password)$/.test(new URL(url).pathname);
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

function handleAuthGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const provider = GROK_PROVIDERS.find(({ providerId }) => url.pathname === `/api/auth/oauth2/callback/${providerId}`);
  if (!provider) return auth.handler(request);
  // Legacy broker callbacks use the registered URL; Better Auth validates
  // the state, authorization code and PKCE on the current callback endpoint.
  url.pathname = `/api/auth/callback/${provider.providerId}`;
  return auth.handler(new Request(url, request));
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthGet(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});

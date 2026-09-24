import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth/server";
import { assertHuman, rateLimit } from "./abuse";
import { mailConfigured } from "./mail";

export const requestHousePasswordReset = createServerFn({ method: "POST" })
  .validator((input: {
    email: string;
    honey?: string;
    startedAt?: number;
    human?: boolean;
  }) => {
    const email = input.email.trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Enter a valid email.");
    return { ...input, email };
  })
  .handler(async ({ data }) => {
    assertHuman({
      honey: data.honey,
      startedAt: data.startedAt,
      human: data.human,
    });
    rateLimit(`password-reset:${data.email}`, 4, 30 * 60 * 1000);

    if (!mailConfigured()) {
      throw new Error("Password reset email is temporarily unavailable.");
    }

    await auth.api.requestPasswordReset({
      body: {
        email: data.email,
        redirectTo: "/reset-password",
      },
    });

    // Deliberately generic: do not reveal whether an account exists.
    return {
      ok: true as const,
      message: "If an account exists for that email, a reset link is on the way.",
    };
  });

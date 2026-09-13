import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

function deny() {
  const err = new Error("Unauthorized");
  (err as Error & { status?: number }).status = 401;
  throw err;
}

export const applyAtelierEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string }) => ({ message: input.message.trim().slice(0, 4000) }))
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ role: string }>`select role from profiles where user_id = ${context.userId}`;
    if (rows[0]?.role !== "admin") deny();
    return {
      ok: false as const,
      text: "The house no longer uses AI. Change headlines, steps, and contact lines in the Website fields.",
    };
  });

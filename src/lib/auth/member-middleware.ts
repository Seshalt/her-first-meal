import { createMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";
import { hasMemberAccess } from "./access-policy";

/** Enforce paid access on the server as well as the member navigation. */
export const memberMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ role: string; mfa_enabled: boolean; email_verified: boolean; paid: boolean }>`
      select p.role, coalesce(u."twoFactorEnabled", false) as mfa_enabled,
        p.email_factor_ok as email_verified,
        exists(select 1 from memberships m where m.user_id = p.user_id
          and m.status = 'active' and (m.expires_at is null or m.expires_at > now())) as paid
      from profiles p join "user" u on u.id = p.user_id
      where p.user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!hasMemberAccess({ role: row?.role, mfaEnabled: row?.mfa_enabled, emailVerified: row?.email_verified, paid: row?.paid })) {
      throw new Error("Verify your email and activate your membership to open this feature.");
    }
    return next({ context: { userId: context.userId } });
  });

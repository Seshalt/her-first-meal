import { getSql } from "@/lib/db";
import { hasAdminAccess } from "@/lib/auth/access-policy";

export async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string; mfa_enabled: boolean }>`
    select p.role, coalesce(u."twoFactorEnabled", false) as mfa_enabled
    from profiles p join "user" u on u.id = p.user_id
    where p.user_id = ${userId} limit 1
  `;
  if (!hasAdminAccess(rows[0]?.role, rows[0]?.mfa_enabled)) {
    const error = new Error("Unauthorized");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
}

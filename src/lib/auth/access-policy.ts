export function hasAdminAccess(role: string | undefined, mfaEnabled: boolean | undefined) {
  return role === "admin" && mfaEnabled === true;
}

export function hasMemberAccess(input: { role?: string; mfaEnabled?: boolean; emailVerified?: boolean; paid?: boolean }) {
  return hasAdminAccess(input.role, input.mfaEnabled) || (input.emailVerified === true && input.paid === true);
}

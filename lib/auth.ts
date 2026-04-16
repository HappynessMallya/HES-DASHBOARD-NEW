import type { Role, User } from "./types";

export const AUTH_COOKIE = "hes_token";

export function hasRole(user: User | null, role: Role): boolean {
  if (!user) return false;
  // Support both user.roles (array) and user.role (object from API)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  if (user.role) {
    return user.role.name === role;
  }
  return false;
}

export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.some((role) => hasRole(user, role));
}

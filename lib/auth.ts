import type { Role, User } from "./types";

export const AUTH_COOKIE = "hes_token";

export function hasRole(user: User | null, role: Role): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

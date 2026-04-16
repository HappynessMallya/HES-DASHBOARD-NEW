"use client";

import type { Role } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface RoleGateProps {
  role: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ role, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();

  if (!user) return fallback;

  const roles = Array.isArray(role) ? role : [role];
  const allowed = roles.some((r) => {
    // Support user.roles (array) or user.role (object from API)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.includes(r);
    }
    if (user.role) {
      return user.role.name === r;
    }
    return false;
  });

  return allowed ? children : fallback;
}

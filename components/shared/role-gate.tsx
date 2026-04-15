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
  const allowed = roles.some((r) => user.roles.includes(r));

  return allowed ? children : fallback;
}

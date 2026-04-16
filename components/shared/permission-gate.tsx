"use client";

import { useAuthStore } from "@/lib/stores/auth-store";

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const can = useAuthStore((s) => s.can);
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}

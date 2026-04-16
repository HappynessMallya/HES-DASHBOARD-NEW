"use client";

import { useAuth } from "@/lib/auth-context";

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, loading } = useAuth();

  // While auth is loading, don't render permission-gated content
  if (loading) return null;

  return can(permission) ? <>{children}</> : <>{fallback}</>;
}

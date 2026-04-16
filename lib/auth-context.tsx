"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Role, User } from "./types";
import { hasRole as checkRole } from "./auth";
import { useAuthStore } from "./stores/auth-store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setAuthStore = useAuthStore((s) => s.setUser);
  const logoutStore = useAuthStore((s) => s.logout);
  const canCheck = useAuthStore((s) => s.can);

  // Hydrate user from cookie on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setAuthStore(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setAuthStore]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }
    const data = await res.json();
    setUser(data.user);
    setAuthStore(data.user);
  }, [setAuthStore]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    logoutStore();
    window.location.href = "/login";
  }, [logoutStore]);

  const hasRole = useCallback(
    (role: Role) => checkRole(user, role),
    [user]
  );

  const can = useCallback(
    (permission: string) => canCheck(permission),
    [canCheck]
  );

  return (
    <AuthContext value={{ user, loading, login, logout, hasRole, can }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

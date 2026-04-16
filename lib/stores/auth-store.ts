"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: Set<string>;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  can: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: new Set<string>(),
      setAuth: (token, user) =>
        set({
          token,
          user,
          permissions: new Set(user.permissions ?? []),
        }),
      setUser: (user) =>
        set({
          user,
          permissions: new Set(user.permissions ?? []),
        }),
      logout: () =>
        set({ token: null, user: null, permissions: new Set<string>() }),
      can: (p) => get().permissions.has(p),
    }),
    {
      name: "hes-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: Array.from(state.permissions),
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown> | null;
        if (!p) return current;
        const perms = Array.isArray(p.permissions) ? p.permissions : [];
        return {
          ...current,
          token: (p.token as string) ?? null,
          user: (p.user as User) ?? null,
          permissions: new Set<string>(perms),
        };
      },
    }
  )
);

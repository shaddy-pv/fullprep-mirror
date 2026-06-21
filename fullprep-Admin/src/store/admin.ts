import { create } from "zustand";
import type { AdminUser } from "@/lib/types";

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  setUser: (u: AdminUser | null) => void;
  setLoading: (b: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (b) => set({ isLoading: b }),
  logout: () => set({ user: null, isLoading: false }),
}));

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (b: boolean) => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileOpen: (b) => set({ mobileOpen: b }),
}));

interface ThemeState {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  toggle: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: "dark",
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },
  toggle: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    }),
}));

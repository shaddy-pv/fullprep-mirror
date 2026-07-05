"use client";

import { useEffect } from "react";
import { useAppearanceStore } from "@/store/appearanceStore";
import { useAuthStore } from "@/store/authStore";

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { theme, accent, compactMode } = useAppearanceStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const root = document.documentElement;

    // Apply themes
    root.classList.remove("theme-dark", "theme-midnight", "theme-neon");
    if (isAuthenticated && theme) {
      root.classList.add(`theme-${theme}`);
    } else {
      root.classList.add("theme-dark"); // Default
    }

    // Apply accents
    root.classList.remove("accent-orange", "accent-purple", "accent-blue", "accent-green", "accent-pink");
    if (isAuthenticated && accent) {
      root.classList.add(`accent-${accent}`);
    } else {
      root.classList.add("accent-orange"); // Default
    }

    // Apply compact mode
    if (isAuthenticated && compactMode) {
      root.setAttribute("data-compact", "true");
    } else {
      root.removeAttribute("data-compact");
    }
  }, [theme, accent, compactMode, isAuthenticated]);

  return <>{children}</>;
}

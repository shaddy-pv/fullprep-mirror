"use client";

import { useEffect } from "react";
import { useAppearanceStore } from "@/store/appearanceStore";

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { theme, accent, compactMode } = useAppearanceStore();

  useEffect(() => {
    const root = document.documentElement;

    // Apply themes
    root.classList.remove("theme-dark", "theme-midnight", "theme-neon");
    if (theme) root.classList.add(`theme-${theme}`);

    // Apply accents
    root.classList.remove("accent-orange", "accent-purple", "accent-blue", "accent-green", "accent-pink");
    if (accent) root.classList.add(`accent-${accent}`);

    // Apply compact mode
    if (compactMode) {
      root.setAttribute("data-compact", "true");
    } else {
      root.removeAttribute("data-compact");
    }
  }, [theme, accent, compactMode]);

  return <>{children}</>;
}

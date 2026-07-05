import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppearanceState {
  theme: string;
  accent: string;
  compactMode: boolean;
  sidebarCollapsedDefault: boolean;
  uiAnimations: boolean;
  setTheme: (theme: string) => void;
  setAccent: (accent: string) => void;
  setCompactMode: (mode: boolean) => void;
  setSidebarCollapsedDefault: (collapsed: boolean) => void;
  setUiAnimations: (animations: boolean) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: "dark",
      accent: "orange",
      compactMode: false,
      sidebarCollapsedDefault: false,
      uiAnimations: true,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setCompactMode: (mode) => set({ compactMode: mode }),
      setSidebarCollapsedDefault: (collapsed) => set({ sidebarCollapsedDefault: collapsed }),
      setUiAnimations: (animations) => set({ uiAnimations: animations }),
    }),
    {
      name: "fullprep-appearance-storage",
    }
  )
);

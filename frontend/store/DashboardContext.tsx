"use client";

import React, { createContext, useContext } from "react";
import { useTheme } from "next-themes";
import { useSidebarStore } from "./sidebarStore";

interface DashboardContextType {
  theme: string;
  setTheme: (theme: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  notificationCount: number;
  clearNotifications: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  
  const isSidebarCollapsed = useSidebarStore((state) => state.isSidebarCollapsed);
  const isMobileSidebarOpen = useSidebarStore((state) => state.isMobileSidebarOpen);
  const notificationCount = useSidebarStore((state) => state.notificationCount);
  const setIsSidebarCollapsed = useSidebarStore((state) => state.setIsSidebarCollapsed);
  const setIsMobileSidebarOpen = useSidebarStore((state) => state.setIsMobileSidebarOpen);
  const clearNotifications = useSidebarStore((state) => state.clearNotifications);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed") === "true";
      if (saved) {
        setIsSidebarCollapsed(true);
      }
    }
  }, [setIsSidebarCollapsed]);

  return (
    <DashboardContext.Provider value={{
      theme: theme || "light",
      setTheme: (t: string) => setTheme(t),
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      notificationCount,
      clearNotifications,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

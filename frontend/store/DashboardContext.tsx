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
  const sidebar = useSidebarStore();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed") === "true";
      if (saved) {
        sidebar.setIsSidebarCollapsed(true);
      }
    }
  }, []);

  return (
    <DashboardContext.Provider value={{
      theme: theme || "light",
      setTheme: (t: string) => setTheme(t),
      isSidebarCollapsed: sidebar.isSidebarCollapsed,
      setIsSidebarCollapsed: sidebar.setIsSidebarCollapsed,
      isMobileSidebarOpen: sidebar.isMobileSidebarOpen,
      setIsMobileSidebarOpen: sidebar.setIsMobileSidebarOpen,
      notificationCount: sidebar.notificationCount,
      clearNotifications: sidebar.clearNotifications,
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

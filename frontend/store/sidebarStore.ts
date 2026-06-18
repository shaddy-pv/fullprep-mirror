import { create } from "zustand";

interface SidebarState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  notificationCount: number;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  clearNotifications: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  notificationCount: 0,
  setIsSidebarCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    }
    set({ isSidebarCollapsed: collapsed });
  },
  setIsMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  clearNotifications: () => set({ notificationCount: 0 }),
}));

import { useSidebarStore } from "@/store/sidebarStore";

export function useSidebar() {
  const sidebar = useSidebarStore();
  
  return {
    isSidebarCollapsed: sidebar.isSidebarCollapsed,
    isMobileSidebarOpen: sidebar.isMobileSidebarOpen,
    notificationCount: sidebar.notificationCount,
    toggleSidebar: () => sidebar.setIsSidebarCollapsed(!sidebar.isSidebarCollapsed),
    setIsSidebarCollapsed: sidebar.setIsSidebarCollapsed,
    setMobileSidebarOpen: sidebar.setIsMobileSidebarOpen,
    clearNotifications: sidebar.clearNotifications,
  };
}

import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  name: string;
  icon: LucideIcon;
  badge: string | null;
}

export interface StreakDay {
  label: string;
  status: "completed" | "partial" | "empty";
}

export interface ProblemItem {
  title: string;
  status: "completed" | "pending";
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  time: string;
}

export interface TopicStrengthItem {
  name: string;
  percentage: number;
}

export interface ChartDataPoint {
  day: string;
  value: number;
}

export interface DashboardState {
  theme: "light" | "dark";
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  notificationCount: number;
  userName: string;
  userEmail: string;
}

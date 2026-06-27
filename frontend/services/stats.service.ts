import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL !== "" && process.env.NEXT_PUBLIC_API_BASE_URL !== "/" ? process.env.NEXT_PUBLIC_API_BASE_URL : "http://localhost:5000/api";

export interface SidebarStatsResponse {
  weeklyGoal: {
    activity: { done: boolean; dateStr: string }[];
    totalSolvedThisWeek: number;
    target: number;
  };
  achievements: {
    id: string;
    title: string;
    desc: string;
    type: "success" | "warning" | "info" | "primary" | "secondary" | "danger";
  }[];
  recommendedNext: {
    title: string;
    problemsLeft: number;
    pathId: string;
  } | null;
}

export const StatsService = {
  getSidebarStats: async (): Promise<SidebarStatsResponse> => {
    try {
      const url = `${BASE_URL}/auth/sidebar-stats`;
      console.log("Fetching sidebar stats from:", url);
      const response = await api.get<{ success: boolean; data: any }>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching sidebar stats:", error);
      throw error;
    }
  },
};

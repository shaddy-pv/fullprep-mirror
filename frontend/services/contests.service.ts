import { api } from "@/lib/api";
import { CHART_MOCK_DATA, DIFFICULTY_PIE_DATA } from "@/mocks/contests.mock";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface ContestData {
  id: string;
  title: string;
  type: "daily" | "weekly";
  problem?: any;
  problems?: any[];
}

export const ContestsService = {
  async getRatingTrend() {
    return CHART_MOCK_DATA;
  },

  async getDifficultyDistribution() {
    return DIFFICULTY_PIE_DATA;
  },

  async getDailyContest() {
    try {
      const response = await api.get<{ success: boolean; data: ContestData }>(
        `${BASE_URL}/contests/daily`
      );
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch daily contest:", error);
      throw error;
    }
  },

  async getWeeklyContest() {
    try {
      const response = await api.get<{ success: boolean; data: ContestData }>(
        `${BASE_URL}/contests/weekly`
      );
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch weekly contest:", error);
      throw error;
    }
  },

  async submitContestResult(contestId: string, type: string, timeTakenMs: number, passed: boolean) {
    try {
      const response = await api.post<{ success: boolean; data: any }>(
        `${BASE_URL}/contests/submit`,
        { contestId, type, timeTakenMs, passed }
      );
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to submit contest result:", error);
      throw error;
    }
  }
};

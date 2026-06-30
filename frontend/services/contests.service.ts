import { api } from "@/lib/api";
import { CHART_MOCK_DATA, DIFFICULTY_PIE_DATA } from "@/mocks/contests.mock";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface ContestData {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  type?: "daily" | "weekly" | "custom" | "CUSTOM" | string;
  problem?: any;
  problems?: any[];
  startTime?: string;
  endTime?: string;
  duration?: number;
  isCompleted?: boolean;
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
      return null;
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
      return null;
    }
  },

  async getCustomContests() {
    try {
      const response = await api.get<{ success: boolean; data: ContestData[] }>(
        `${BASE_URL}/contests`
      );
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch custom contests:", error);
      return [];
    }
  },

  // Returns ALL active admin-created contests (including completed ones) for the calendar view
  async getAllContests() {
    try {
      const response = await api.get<{ success: boolean; data: ContestData[] }>(
        `${BASE_URL}/contests?all=true`
      );
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch all contests:", error);
      return [];
    }
  },

  async submitContestResult(contestId: string, type: string, timeTakenMs: number, passed: boolean, solvedCount: number = 1) {
    try {
      const response = await api.post<{ success: boolean; data: any }>(
        `${BASE_URL}/contests/submit`,
        { contestId, type, timeTakenMs, passed, solvedCount }
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

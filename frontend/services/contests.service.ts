import { CHART_MOCK_DATA, DIFFICULTY_PIE_DATA } from "@/mocks/contests.mock";

export const ContestsService = {
  async getRatingTrend() {
    return CHART_MOCK_DATA;
  },

  async getDifficultyDistribution() {
    return DIFFICULTY_PIE_DATA;
  },
};

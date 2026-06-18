import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

function mapDifficulty(diff: string): "Easy" | "Medium" | "Hard" {
  const d = String(diff).toUpperCase();
  if (d === "EASY") return "Easy";
  if (d === "MEDIUM") return "Medium";
  return "Hard";
}

function calculateAcceptance(stats: any): string {
  if (stats && stats.totalSolutions > 0) {
    const correct = stats.totalSolutions - (stats.totalIncorrectSolutions || 0);
    return ((correct / stats.totalSolutions) * 100).toFixed(2) + "%";
  }
  return "76.40%";
}

export const BookmarksService = {
  async getBookmarkedProblems() {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`${BASE_URL}/problems/bookmarks`);
      if (response && response.success && Array.isArray(response.data)) {
        return response.data.map((prob: any) => {
          const difficulty = mapDifficulty(prob.difficulty);
          const acceptance = calculateAcceptance(prob.stats);

          let color = "text-[#10b981]"; // Easy
          if (difficulty === "Medium") color = "text-[#ff6a00]";
          if (difficulty === "Hard") color = "text-[#f43f5e]";

          return {
            name: prob.name,
            diff: difficulty,
            color,
            rate: `${acceptance} Acceptance`,
            time: "Bookmarked",
            slug: prob.externalId,
            id: prob.externalId
          };
        });
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch bookmarked problems:", error);
      return [];
    }
  },

  async toggleBookmark(problemId: string) {
    try {
      const response = await api.post<{ success: boolean; isBookmarked: boolean; bookmarks: string[] }>(
        `${BASE_URL}/problems/${problemId}/bookmark`,
        {}
      );
      return response;
    } catch (error) {
      console.error(`Failed to toggle bookmark for problem "${problemId}":`, error);
      throw error;
    }
  }
};

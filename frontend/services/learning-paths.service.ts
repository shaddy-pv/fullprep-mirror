import { api } from "@/lib/api";
import { LearningPath } from "@/types/learning";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const LearningPathsService = {
  /** Fetch all learning paths, optionally filtered/sorted */
  async getPaths(params?: { category?: string; sort?: string; search?: string }) {
    let url = `${BASE_URL}/learning-paths`;
    if (params) {
      const query = new URLSearchParams();
      if (params.category) query.set("category", params.category);
      if (params.sort) query.set("sort", params.sort);
      if (params.search) query.set("search", params.search);
      url += `?${query.toString()}`;
    }
    return api.get<{ success: boolean; data: LearningPath[] }>(url);
  },

  /** Fetch a specific learning path with populated problems */
  async getPathById(id: string) {
    return api.get<{ success: boolean; data: LearningPath }>(`${BASE_URL}/learning-paths/${id}`);
  },

  /** Enroll the current user into a learning path */
  async enroll(id: string) {
    return api.post<{ success: boolean; message: string }>(`${BASE_URL}/learning-paths/${id}/enroll`, {});
  },
};

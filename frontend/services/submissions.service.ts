import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const SubmissionsService = {
  async submitCode(problemExternalId: string, problemName: string, code: string, language: string) {
    return api.post<{ success: boolean; message: string; data: { submissionId: string; status: string } }>(
      `${BASE_URL}/submissions`,
      { problemExternalId, problemName, code, language }
    );
  },

  async getSubmissions(page = 1, limit = 20, status?: string, problemExternalId?: string) {
    let url = `${BASE_URL}/submissions?page=${page}&limit=${limit}`;
    if (status && status !== "All Submissions") {
      url += `&status=${status}`;
    }
    if (problemExternalId) {
      url += `&problemExternalId=${problemExternalId}`;
    }
    return api.get<{ success: boolean; data: any[]; pagination: any }>(url);
  },

  async getSubmissionById(id: string) {
    return api.get<{ success: boolean; data: any }>(`${BASE_URL}/submissions/${id}`);
  },
};

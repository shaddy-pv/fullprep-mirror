import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface RunTestResult {
  index: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  stderr: string;
  isCompileError: boolean;
  executionTime: number;
}

export interface RunResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR";
  testResults: RunTestResult[];
  totalTests: number;
  passedTests: number;
  hasCompileError: boolean;
}

export const SubmissionsService = {
  /** Run button — checks against public test cases only (synchronous) */
  async runCode(problemExternalId: string, code: string, language: string) {
    return api.post<{ success: boolean; message: string; data: RunResult }>(
      `${BASE_URL}/submissions/run`,
      { problemExternalId, code, language }
    );
  },

  /** Submit button — judges against hidden test cases (async, poll for result) */
  async submitCode(problemExternalId: string, problemName: string, code: string, language: string) {
    return api.post<{ success: boolean; message: string; data: { submissionId: string; status: string } }>(
      `${BASE_URL}/submissions`,
      { problemExternalId, problemName, code, language }
    );
  },

  async getSubmissions(page = 1, limit = 20, status?: string, problemExternalId?: string, language?: string) {
    let url = `${BASE_URL}/submissions?page=${page}&limit=${limit}`;
    if (status && status !== "All Submissions") {
      url += `&status=${status}`;
    }
    if (problemExternalId && problemExternalId !== "All Problems") {
      url += `&problemExternalId=${problemExternalId}`;
    }
    if (language && language !== "All Languages") {
      url += `&language=${encodeURIComponent(language)}`;
    }
    return api.get<{ success: boolean; data: any[]; pagination: any }>(url);
  },

  async getSubmissionById(id: string) {
    return api.get<{ success: boolean; data: any }>(`${BASE_URL}/submissions/${id}`);
  },
};

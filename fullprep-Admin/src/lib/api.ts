import type { AdminUser, AdminProblem, AdminSubmission, AdminNotification } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const TOKEN_KEY = "fp_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    setToken(null);
    if (typeof window !== "undefined" && !path.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Invalid email or password");
  }
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      // Ignored
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async login(email: string, _password: string) {
    const r = await request<{ success: boolean; user: AdminUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: _password }),
    });
    if (r.user.role !== "admin" && r.user.role !== "mentor") {
      setToken(null);
      throw new Error("Access denied. Admin or Mentor privileges required.");
    }
    setToken(r.token);
    return r;
  },

  async me(): Promise<AdminUser | null> {
    try {
      const r = await request<{ success: boolean; user: AdminUser }>("/auth/me");
      return r.user;
    } catch {
      return null;
    }
  },

  logout() {
    setToken(null);
  },

  async listUsers() {
    const r = await request<{ data: AdminUser[] }>("/users?limit=10000");
    return r.data;
  },

  async updateUserRole(id: string, role: string) {
    const r = await request<{ data: AdminUser }>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    return r.data;
  },

  async createAdminUser(payload: any) {
    const r = await request<{ data: AdminUser }>("/users/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async getUser(id: string) {
    const r = await request<{ data: AdminUser }>(`/users/${id}`);
    return r.data;
  },

  async getUserStats(id: string) {
    const r = await request<{ data: any }>(`/users/${id}/stats`);
    return r.data;
  },

  async updateUserStatus(id: string, isActive: boolean) {
    const r = await request<{ data: AdminUser }>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    return r.data;
  },

  async deleteUser(id: string) {
    await request(`/users/${id}`, { method: "DELETE" });
  },

  async listProblems() {
    const r = await request<{ data: AdminProblem[] }>("/problems?limit=1000");
    return r.data;
  },

  async createProblem(payload: Partial<AdminProblem>) {
    const r = await request<{ data: AdminProblem }>("/problems", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async getProblem(id: string) {
    const r = await request<{ data: AdminProblem }>(`/problems/${id}`);
    return r.data;
  },

  async updateProblem(id: string, payload: Partial<AdminProblem>) {
    const r = await request<{ data: AdminProblem }>(`/problems/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async deleteProblem(id: string) {
    await request(`/problems/${id}`, { method: "DELETE" });
  },

  async rejudgeProblem(id: string) {
    const r = await request<{ message: string }>(`/problems/${id}/rejudge`, {
      method: "POST",
    });
    return r;
  },

  async listSubmissions(params?: {
    userId?: string;
    problemExternalId?: string;
    status?: string;
    limit?: number;
  }) {
    const p = new URLSearchParams({ limit: (params?.limit || 1000).toString() });
    if (params?.userId) p.append("userId", params.userId);
    if (params?.problemExternalId) p.append("problemExternalId", params.problemExternalId);
    if (params?.status) p.append("status", params.status);
    const r = await request<{ data: AdminSubmission[] }>(`/submissions?${p.toString()}`);
    return r.data;
  },

  async getSubmission(id: string) {
    const r = await request<{ data: AdminSubmission }>(`/submissions/${id}`);
    return r.data;
  },

  async deleteSubmission(id: string) {
    await request(`/submissions/${id}`, { method: "DELETE" });
  },

  async rejudgeSubmission(id: string) {
    const r = await request<{ data: AdminSubmission }>(`/submissions/${id}/rejudge`, {
      method: "POST",
    });
    return r.data;
  },

  async flagSubmission(id: string) {
    const r = await request<{ data: { isFlagged: boolean }; message: string }>(
      `/submissions/${id}/flag`,
      {
        method: "PATCH",
      },
    );
    return r;
  },

  async syncProblems(mode: "ALL" | "STALE" | "MISSING" = "ALL") {
    const r = await request<{ success: boolean; data: any }>("/problems/sync", {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
    return r;
  },

  async getSyncStatus() {
    const r = await request<{ data: any }>("/problems/sync/status");
    return r.data;
  },

  async getSyncHistory() {
    const r = await request<{ data: any[] }>("/problems/sync/history");
    return r.data;
  },

  async getSystemSettings() {
    const r = await request<{ data: any }>("/settings");
    return r.data;
  },

  async updateSystemSettings(data: any) {
    const r = await request<{ data: any }>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return r.data;
  },

  async updateProfile(data: { name?: string; bio?: string }) {
    const r = await request<{ data: any }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return r.data;
  },

  async listContests() {
    const r = await request<{ data: any[] }>("/contests/admin");
    return r.data;
  },

  async getDashboardAnalytics(timeRange: "24h" | "7d" | "30d" | "all" = "7d") {
    const r = await request<{ data: any }>(`/analytics/dashboard?timeRange=${timeRange}`);
    return r.data;
  },

  async getNotifications() {
    const r = await request<{ data: AdminNotification[] }>("/notifications");
    return r.data;
  },

  async markNotificationAsRead(id: string) {
    const r = await request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
    return r;
  },

  async markAllNotificationsAsRead() {
    const r = await request<{ success: boolean }>("/notifications/read-all", {
      method: "PATCH",
    });
    return r;
  },

  async getContest(id: string) {
    const r = await request<{ data: any }>(`/contests/${id}`);
    return r.data;
  },

  async createContest(payload: any) {
    const r = await request<{ data: any }>("/contests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async updateContest(id: string, payload: any) {
    const r = await request<{ data: any }>(`/contests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async deleteContest(id: string) {
    await request(`/contests/${id}`, { method: "DELETE" });
  },

  async listLearningPaths() {
    const r = await request<{ data: any[] }>("/learning-paths");
    return r.data;
  },

  async getLearningPath(id: string) {
    const r = await request<{ data: any }>(`/learning-paths/${id}`);
    return r.data;
  },

  async createLearningPath(payload: any) {
    const r = await request<{ data: any }>("/learning-paths", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async updateLearningPath(id: string, payload: any) {
    const r = await request<{ data: any }>(`/learning-paths/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return r.data;
  },

  async deleteLearningPath(id: string) {
    await request(`/learning-paths/${id}`, { method: "DELETE" });
  },

  async getJobs() {
    return await request<any[]>("/jobs");
  },

  async createJob(payload: any) {
    return await request<any>("/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const IS_MOCK = false;

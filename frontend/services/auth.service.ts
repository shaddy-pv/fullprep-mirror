import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { signOut as nextAuthSignOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL !== "" && process.env.NEXT_PUBLIC_API_BASE_URL !== "/" ? process.env.NEXT_PUBLIC_API_BASE_URL : "https://fullprep-frontend-mirror.onrender.com/api";
const SESSION_COOKIE = "fp_session";

function setSessionCookie(token: string) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  document.cookie = `${SESSION_COOKIE}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export const AuthService = {
  async getCurrentUser() {
    try {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("fp_token");
        // Robust check to avoid sending "null", "undefined", or empty/whitespace tokens
        if (!storedToken || storedToken === "null" || storedToken === "undefined" || storedToken.trim() === "") {
          localStorage.removeItem("fp_token");
          useAuthStore.getState().setUser(null);
          return null;
        }
      }

      const response = await api.get<{ success: boolean; user: any }>(`${BASE_URL}/auth/me`);
      if (response && response.success && response.user) {
        useAuthStore.getState().setUser(response.user);
        return response.user;
      }
      useAuthStore.getState().setUser(null);
      return null;
    } catch (error: any) {
      if (error?.status !== 401) {
        console.warn("Failed to fetch current user profile:", error);
      }
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("fp_token");
        clearSessionCookie();
      }
      useAuthStore.getState().setUser(null);
      
      // If we got a 401, the backend token is dead. Kill NextAuth session too!
      if (error?.status === 401) {
        nextAuthSignOut({ redirect: false }).catch(() => {});
      }
      
      return null;
    }
  },

  async getStats(timeFilter?: string) {
    try {
      const url = timeFilter ? `${BASE_URL}/auth/stats?timeFilter=${timeFilter}` : `${BASE_URL}/auth/stats`;
      const response = await api.get<{ success: boolean; data: any }>(url);
      if (response && response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.warn("Failed to fetch user stats:", error);
      return null;
    }
  },

  async getSolvedProblems(): Promise<string[]> {
    try {
      const response = await api.get<{ success: boolean; user: any }>(`${BASE_URL}/auth/me`);
      if (response && response.success && response.user) {
        return response.user.solvedProblems || [];
      }
      return [];
    } catch (error) {
      console.warn("Failed to fetch solved problems:", error);
      return [];
    }
  },

  async getSubmissions(page = 1, limit = 10) {
    try {
      const response = await api.get<{ success: boolean; data: any; pagination: any }>(
        `${BASE_URL}/submissions?page=${page}&limit=${limit}`
      );
      if (response && response.success) {
        return { data: response.data, pagination: response.pagination };
      }
      return { data: [], pagination: null };
    } catch (error) {
      console.warn("Failed to fetch submissions:", error);
      return { data: [], pagination: null };
    }
  },

  async login(email: string, password: string) {
    const response = await api.post<{ success: boolean; token: string; user: any; message?: string }>(
      `${BASE_URL}/auth/login`,
      { email, password }
    );

    if (response && response.success && response.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("fp_token", response.token);
        setSessionCookie(response.token);
      }
      useAuthStore.getState().login(response.user);
      return response;
    }
    throw new Error(response?.user || "Authentication failed.");
  },

  async signup(name: string, email: string, password: string) {
    const response = await api.post<{ success: boolean; token: string; user: any; message?: string }>(
      `${BASE_URL}/auth/register`,
      { name, email, password }
    );

    if (response && response.success && response.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("fp_token", response.token);
        setSessionCookie(response.token);
      }
      useAuthStore.getState().login(response.user);
      return response;
    }
    throw new Error(response?.user || "Registration failed.");
  },

  async logout(shouldRedirect = true) {
    try {
      await api.post<any>(`${BASE_URL}/auth/logout`, {});
    } catch (error) {
      console.error("Server-side logout request failed:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("fp_token");
        clearSessionCookie();
      }
      useAuthStore.getState().logout();
      await nextAuthSignOut({ redirect: false });
      
      if (shouldRedirect && typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  },

  async updateProfile(data: {
    name?: string;
    bio?: string;
    avatar?: string;
    socialLinks?: any;
    location?: string;
    backupEmail?: string;
    preferences?: any;
    notifs?: any;
    visibility?: any;
    twoFactor?: boolean;
  }) {
    const response = await api.patch<{ success: boolean; user: any }>(
      `${BASE_URL}/auth/update-profile`,
      data
    );
    if (response && response.success && response.user) {
      useAuthStore.getState().setUser(response.user);
      return response.user;
    }
    throw new Error("Failed to update profile.");
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch<{ success: boolean; message: string }>(
      `${BASE_URL}/auth/update-password`,
      { currentPassword, newPassword }
    );
    return response;
  },

  async forgotPassword(email: string) {
    return api.post<{ success: boolean; message: string }>(
      `${BASE_URL}/auth/forgot-password`,
      { email }
    );
  },

  async resetPassword(data: { email: string; token: string; password?: string }) {
    return api.post<{ success: boolean; message: string }>(
      `${BASE_URL}/auth/reset-password`,
      data
    );
  },

  async getLeaderboard(mainTab: string = 'Global', filterTab: string = 'Overall') {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`${BASE_URL}/auth/leaderboard?main=${encodeURIComponent(mainTab)}&filter=${encodeURIComponent(filterTab)}`);
      if (response && response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Failed to fetch leaderboard:", error);
      throw error;
    }
  },

  async getSessions() {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`${BASE_URL}/auth/sessions`);
      if (response && response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Failed to fetch sessions:", error);
      return [];
    }
  },

  async revokeSession(id: string) {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${BASE_URL}/auth/sessions/${id}`);
      if (response && response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to revoke session:", error);
      throw error;
    }
  },

  async getPublicProfile(idOrName: string) {
    try {
      const response = await api.get<{ success: boolean; data: any }>(
        `${BASE_URL}/auth/public/${idOrName}`
      );
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch public profile:", error);
      throw error;
    }
  },

  async exportData(): Promise<any> {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`${BASE_URL}/auth/export`);
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to export data:", error);
      return null;
    }
  }
};

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { signOut as nextAuthSignOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

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
      // 401 Unauthorized is expected if the token is expired or invalid.
      // We suppress the console warning for 401s to keep the browser console clean.
      if (error?.status !== 401) {
        console.warn("Failed to fetch current user profile:", error);
      }
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("fp_token");
      }
      useAuthStore.getState().setUser(null);
      return null;
    }
  },

  async getStats() {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`${BASE_URL}/auth/stats`);
      if (response && response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.warn("Failed to fetch user stats:", error);
      return null;
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
      }
      useAuthStore.getState().login(response.user);
      return response;
    }
    throw new Error(response?.user || "Registration failed.");
  },

  async logout() {
    try {
      await api.post<any>(`${BASE_URL}/auth/logout`, {});
    } catch (error) {
      console.error("Server-side logout request failed:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("fp_token");
      }
      useAuthStore.getState().logout();
      // Important: clear the NextAuth session so it doesn't auto-restore across tabs
      await nextAuthSignOut({ redirect: false });
    }
  },

  async updateProfile(data: { name?: string; bio?: string; avatar?: string; socialLinks?: any }) {
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

  async getLeaderboard() {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`${BASE_URL}/auth/leaderboard`);
      if (response && response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Failed to fetch leaderboard:", error);
      return [];
    }
  },
};

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { signOut as nextAuthSignOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const AuthService = {
  async getCurrentUser() {
    try {
      const response = await api.get<{ success: boolean; user: any }>(`${BASE_URL}/auth/me`);
      if (response && response.success && response.user) {
        useAuthStore.getState().setUser(response.user);
        return response.user;
      }
      useAuthStore.getState().setUser(null);
      return null;
    } catch (error) {
      console.warn("Failed to fetch current user profile:", error);
      useAuthStore.getState().setUser(null);
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
};

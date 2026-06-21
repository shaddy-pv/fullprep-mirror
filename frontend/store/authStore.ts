import { create } from "zustand";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  streak?: number;
  lastSolvedDate?: string;
  level?: number;
  xp?: number;
  isEmailVerified?: boolean;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    leetcode?: string;
  };
  bookmarks?: string[];
  location?: string;
  backupEmail?: string;
  createdAt?: string;
  preferences?: any;
  notifs?: any;
  visibility?: any;
  twoFactor?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ 
    user,
    isAuthenticated: true 
  }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set({
    user,
    isAuthenticated: !!user
  }),
}));

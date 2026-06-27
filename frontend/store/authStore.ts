import { create } from "zustand";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
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
  contestRating?: number;
  highestRank?: number;
  contestsParticipated?: number;
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

/**
 * Calculates the current active streak.
 * streak in DB is the stored high water mark — we return 0 if
 * the user hasn't solved anything today or yesterday (streak broken).
 */
export function getCurrentStreak(user: UserProfile | null): number {
  if (!user?.streak || !user?.lastSolvedDate) return 0;
  const now = new Date();
  const last = new Date(user.lastSolvedDate);
  const todayStr = now.toISOString().slice(0, 10);
  const lastStr = last.toISOString().slice(0, 10);
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  if (lastStr === todayStr || lastStr === yesterdayStr) return user.streak;
  return 0;
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

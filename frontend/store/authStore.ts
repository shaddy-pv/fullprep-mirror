import { create } from "zustand";

interface UserProfile {
  name: string;
  email: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { name: "Khushi", email: "khushi.dev" },
  isAuthenticated: true,
  login: (credentials) => set({ 
    user: { name: credentials.email.split("@")[0] || "User", email: credentials.email },
    isAuthenticated: true 
  }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

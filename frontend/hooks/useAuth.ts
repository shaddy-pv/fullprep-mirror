import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const auth = useAuthStore();
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
  };
}

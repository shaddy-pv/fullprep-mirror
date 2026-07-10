import { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { useAuth, useTheme } from "@/store/admin";
import { Shield } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const isLoading = useAuth((s) => s.isLoading);
  const setTheme = useTheme((s) => s.setTheme);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Default to dark mode on first paint of the admin shell.
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await api.me();
      if (cancelled) return;
      if (!u || (u.role !== "admin" && u.role !== "mentor")) {
        api.logout();
        setUser(null);
        navigate({ to: "/login" });
      } else {
        setUser(u);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, navigate]);

  useEffect(() => {
    if (user?.role === "mentor") {
      if (location.pathname === "/") {
        navigate({ to: "/problems" });
      }
    }
  }, [user, location.pathname, navigate]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-emerald text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <p className="text-xs">Verifying admin session…</p>
        </div>
      </div>
    );
  }

  if (user?.role === "mentor") {
    const allowedPrefixes = [
      "/problems",
      "/contests",
      "/submissions",
      "/learning-paths",
      "/jobs"
    ];
    
    const isAllowed = allowedPrefixes.some(prefix => location.pathname.startsWith(prefix));
    
    if (!isAllowed && location.pathname !== "/") {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-text-secondary">You are not authorized to access this section.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

"use client";

import React, { useEffect } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

interface SessionProviderProps {
  children: React.ReactNode;
}

/**
 * Inner component that runs INSIDE NextAuthSessionProvider.
 * Handles:
 *   1. Restoring a regular JWT session (email/password login) from localStorage.
 *   2. Syncing an OAuth session (Google / GitHub) into our Zustand auth store
 *      by reading the backend token that NextAuth stores in the session.
 *
 * KEY FIX: Uses authStore.sessionReady so DashboardLayout knows NOT to redirect
 * until after this check finishes. Previously, DashboardLayout would see
 * isAuthenticated=false and redirect to /login BEFORE this provider
 * had a chance to restore the session from localStorage — causing an infinite loop.
 */
function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);
  const sessionReady = useAuthStore((s) => s.sessionReady);

  // Suppress benign Recharts layout transition warnings in the console
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        if (
          args[0] &&
          typeof args[0] === "string" &&
          args[0].includes("The width(-1) and height(-1) of chart should be greater than 0")
        ) {
          return;
        }
        originalWarn(...args);
      };
    }
  }, []);

  useEffect(() => {
    // Don't run until NextAuth has resolved
    if (status === "loading") return;

    // KEY: Only run the session sync ONCE per page load.
    // After the first check, sessionReady=true permanently (for this page load).
    // This prevents the spinner from re-appearing and the loop from re-triggering.
    if (sessionReady) return;

    const syncSession = async () => {
      try {
        // ── Case 1: OAuth session (Google / GitHub) ──────────────────────
        // NextAuth stores the backend JWT in session.backendToken (set in auth.ts callback)
        if (session && (session as any).backendToken) {
          const backendToken = (session as any).backendToken;
          const backendUser = (session as any).backendUser;
          const isNewUser = (session as any).isNewUser;

          // Persist backend token to localStorage so fetcher.ts can use it
          if (typeof window !== "undefined") {
            localStorage.setItem("fp_token", backendToken);
            // Also set cookie so middleware can read it server-side
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = `fp_session=${backendToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            // Set flag for new OAuth users so CreatePasswordModal can trigger
            if (isNewUser) {
              localStorage.setItem("fp_new_oauth_user", "1");
            }
          }

          // Sync user to Zustand store
          if (backendUser) {
            setUser(backendUser);
            // Fetch fresh data in the background to ensure XP, Bio, etc. are up-to-date
            AuthService.getCurrentUser();
          }
          return;
        }

        // ── Case 2: Regular email/password session ────────────────────────
        // Token is already in localStorage — validate it against the backend
        const token = typeof window !== "undefined" ? localStorage.getItem("fp_token") : null;
        if (token) {
          // Re-set the session cookie in case it was cleared (e.g., browser restart)
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          document.cookie = `fp_session=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
          await AuthService.getCurrentUser();
        } else {
          // No token anywhere — clear cookie too and mark as logged out
          document.cookie = `fp_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
          setUser(null);
        }
      } catch {
        // Session is invalid or expired — clear state
        setUser(null);
      } finally {
        // Mark session as resolved — stays true for entire page lifecycle
        setSessionReady(true);
      }
    };

    syncSession();
  // Only re-run when status transitions from "loading" to resolved
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionReady]);

  // Listen for global 401 Unauthorized events from fetcher
  useEffect(() => {
    const handleUnauthorized = async () => {
      // Prevent infinite redirect loops
      if (typeof window !== "undefined") {
        const lastRedirect = sessionStorage.getItem("fp_last_unauthorized_redirect");
        const now = Date.now();
        if (lastRedirect && now - parseInt(lastRedirect) < 5000) {
          console.warn("Prevented infinite unauthorized redirect loop.");
          return;
        }
        sessionStorage.setItem("fp_last_unauthorized_redirect", now.toString());
      }

      // Clear all tokens and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("fp_token");
        document.cookie = `fp_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
        document.cookie = `next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      setUser(null);
      await AuthService.logout(false);

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("fp-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("fp-unauthorized", handleUnauthorized);
  }, [setUser]);

  // Show spinner ONLY while session is being resolved for the first time
  if (!sessionReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-page select-none">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
          <span className="text-[13px] font-semibold text-text-secondary">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Root session provider.
 * Wraps the app in NextAuth's SessionProvider so useSession() works everywhere.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionSync>{children}</SessionSync>
    </NextAuthSessionProvider>
  );
}

"use client";

import React, { useEffect, useState } from "react";
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
 */
function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(false);

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
    if (status === "loading") return; // Wait for NextAuth to resolve

    const syncSession = async () => {
      try {
        // ── Case 1: OAuth session (Google / GitHub) ──────────────────────
        // NextAuth stores the backend JWT in session.backendToken (set in auth.ts callback)
        if (session && (session as any).backendToken) {
          const backendToken = (session as any).backendToken;
          const backendUser = (session as any).backendUser;

          // Persist backend token to localStorage so fetcher.ts can use it
          if (typeof window !== "undefined") {
            localStorage.setItem("fp_token", backendToken);
          }

          // Sync user to Zustand store
          if (backendUser) {
            setUser(backendUser);
          }
          setReady(true);
          return;
        }

        // ── Case 2: Regular email/password session ────────────────────────
        // Token is already in localStorage — validate it against the backend
        await AuthService.getCurrentUser();
      } catch {
        // Session is invalid or expired — clear state
        setUser(null);
      } finally {
        setReady(true);
      }
    };

    syncSession();
  }, [session, status, setUser]);

  // Show spinner while resolving session
  if (!ready) {
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

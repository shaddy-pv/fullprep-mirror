"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";
import DashboardPage from "./(dashboard)/dashboard-page";
import LandingPage from "./(public)/landing-page";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RootPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionReady = useAuthStore((state) => state.sessionReady);

  // Wait for session check to complete before rendering anything
  // This prevents the flash of LandingPage while the session is being restored
  if (!sessionReady) {
    return null; // SessionProvider shows the spinner globally
  }

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  return <LandingPage />;
}

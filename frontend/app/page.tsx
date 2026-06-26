"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";
import DashboardPage from "./(dashboard)/dashboard-page";
import LandingPage from "./(public)/landing-page";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RootPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  return <LandingPage />;
}

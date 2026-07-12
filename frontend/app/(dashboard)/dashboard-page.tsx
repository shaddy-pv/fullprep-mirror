"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ContentContainer from "@/components/layout/ContentContainer";
import SectionWrapper from "@/components/layout/SectionWrapper";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Hero from "@/components/dashboard/Hero";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ProblemsTable from "@/components/dashboard/RecentProblemsTable";
import Analytics from "@/components/dashboard/Analytics";

export default function DashboardPage() {
  return (
    <ContentContainer>
      {/* Hero Section with boundary safety */}
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>

      {/* Stats Cards Row with boundary safety */}
      <ErrorBoundary>
        <StatsGrid />
      </ErrorBoundary>

      {/* Lower Body: Problems Table (Left) + Analytics Sidebar (Right) */}
      <SectionWrapper>
        {/* Left Column: Problems Table */}
        <div className="w-full lg:flex-1 min-w-0">
          <ErrorBoundary>
            <ProblemsTable />
          </ErrorBoundary>
        </div>

        {/* Right Column: Analytics Charts & Topic Strength */}
        <div className="shrink-0 w-full min-w-0 lg:w-auto">
          <ErrorBoundary>
            <Analytics />
          </ErrorBoundary>
        </div>
      </SectionWrapper>
    </ContentContainer>
  );
}

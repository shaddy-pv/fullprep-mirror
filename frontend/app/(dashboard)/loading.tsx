"use client";

import React from "react";
import ContentContainer from "@/components/layout/ContentContainer";

export default function DashboardLoading() {
  return (
    <ContentContainer>
      <div className="w-48 h-8 bg-card-bg border border-border-card rounded-xl animate-pulse" />
      <div className="w-80 h-4 bg-card-bg border border-border-card rounded-lg animate-pulse mt-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-6">
        <div className="h-[490px] bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
        <div className="h-[490px] bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
      </div>
    </ContentContainer>
  );
}

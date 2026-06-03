"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import { TOPICS_MOCK_DATA } from "@/constants/navigation";

// Dynamic import with SSR disabled for Recharts-dependent ChartCard to boost load performance
const ChartCard = dynamic(() => import("./ChartCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full bg-[#fcfcfa] dark:bg-white/[0.01] animate-pulse rounded-[24px] flex items-center justify-center text-xs text-gray-400 border border-border-card shadow-sm" />
  ),
});

export default function Analytics() {
  const router = useRouter();

  const handleTopicClick = (topicName: string) => {
    const slug = topicName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/problems?topic=${slug}`);
  };

  return (
    <div className="flex flex-col gap-5 w-full lg:w-[380px] shrink-0">
      {/* Progress Overview Card (Loaded dynamically on client) */}
      <ChartCard />

      {/* Topic Strength Card */}
      <DashboardCard className="h-[230px] p-5 flex flex-col justify-between">
        <SectionHeader title="Topic Strength" />

        <div className="flex flex-col gap-[12.5px] mt-2">
          {TOPICS_MOCK_DATA.map((topic, index) => (
            <div 
              key={index} 
              onClick={() => handleTopicClick(topic.name)}
              className="flex flex-col gap-1.5 cursor-pointer group/topic transition-all duration-300 hover:translate-x-1"
            >
              <div className="flex items-center justify-between text-[13px] font-medium tracking-[-0.01em]">
                <span className="text-text-primary group-hover/topic:text-brand-orange transition-colors duration-200">{topic.name}</span>
                <span className="text-text-primary font-semibold">{topic.percentage}%</span>
              </div>
              <ProgressBar percentage={topic.percentage} />
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

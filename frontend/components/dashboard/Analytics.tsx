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

interface TopicData {
  name: string;
  percentage: number;
}

export default function Analytics() {
  const router = useRouter();
  const [topicData, setTopicData] = React.useState<TopicData[]>([...TOPICS_MOCK_DATA]);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const { AuthService } = await import("@/services/auth.service");
        const stats = await AuthService.getStats();
        
        if (stats && stats.topicStrength && stats.topicStrength.length > 0) {
          const top4 = stats.topicStrength.slice(0, 4);
          const totalSolved = stats.problemsSolved || 1;
          
          const mapped = top4.map((t: any) => {
            // Capitalize and format tag strings like "dynamic programming" -> "Dynamic Programming"
            const formattedName = t.topic
              .split("-")
              .join(" ")
              .split(" ")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
              
            return {
              name: formattedName,
              percentage: Math.round((t.count / totalSolved) * 100)
            };
          });
          
          // Fill remaining slots with mock data if we have less than 4
          if (mapped.length < 4) {
             const remaining = TOPICS_MOCK_DATA.slice(mapped.length, 4);
             setTopicData([...mapped, ...remaining]);
          } else {
             setTopicData(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch topic stats:", err);
      }
    }
    fetchStats();
  }, []);

  const handleTopicClick = (topicName: string) => {
    const slug = topicName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/problems?topic=${slug}`);
  };

  return (
    <div className="flex flex-col gap-5 w-full lg:w-[380px] shrink-0">
      {/* Progress Overview Card (Loaded dynamically on client) */}
      <ChartCard />

      {/* Topic Strength Card */}
      <DashboardCard className="h-auto md:h-[230px] p-4 md:p-5 flex flex-col justify-between">
        <SectionHeader title="Topic Strength" />

        <div className="flex flex-col gap-[12.5px] mt-2">
          {topicData.map((topic, index) => (
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

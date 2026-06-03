"use client";

import React from "react";
import { CheckCircle2, TrendingUp, Flame, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "./StatCard";

export default function StatsGrid() {
  const router = useRouter();
  const stats = [
    {
      title: "Problems Solved",
      value: "342",
      subtext: "+12 this week",
      subtextColor: "text-[#10b981]",
      icon: CheckCircle2,
      iconColor: "text-brand-orange",
      bgColor: "bg-[#fff3eb] dark:bg-[#ff6a00]/10",
      path: "/submissions",
    },
    {
      title: "Acceptance Rate",
      value: "78.4%",
      subtext: "+2.5% this week",
      subtextColor: "text-[#10b981]",
      icon: TrendingUp,
      iconColor: "text-[#10b981]",
      bgColor: "bg-[#eafaf1] dark:bg-[#10b981]/10",
      path: "/stats",
    },
    {
      title: "Longest Streak",
      value: "12 Days",
      subtext: "Keep it up!",
      subtextColor: "text-brand-orange",
      icon: Flame,
      iconColor: "text-[#8b5cf6]",
      bgColor: "bg-[#f5f3ff] dark:bg-[#8b5cf6]/10",
      path: "/activity",
    },
    {
      title: "Global Rank",
      value: "24,531",
      subtext: "Top 12.3%",
      subtextColor: "text-[#3b82f6]",
      icon: Award,
      iconColor: "text-[#3b82f6]",
      bgColor: "bg-[#eff6ff] dark:bg-[#3b82f6]/10",
      path: "/leaderboard",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-5 w-full shrink-0">
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          title={stat.title}
          value={stat.value}
          subtext={stat.subtext}
          subtextColor={stat.subtextColor}
          icon={stat.icon}
          iconColor={stat.iconColor}
          bgColor={stat.bgColor}
          onClick={() => router.push(stat.path)}
        />
      ))}
    </div>
  );
}

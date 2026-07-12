"use client";

import React from "react";
import { CheckCircle2, TrendingUp, Flame, Award, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "./StatCard";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function StatsGrid() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [statsData, setStatsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats() {
      const data = await AuthService.getStats();
      if (data) {
        setStatsData(data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-5 w-full shrink-0 h-[100px] bg-bg-card rounded-xl border border-border-card flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  const solved = statsData?.problemsSolved || 0;
  const accRate = statsData?.acceptanceRate || 0;
  const streak = user?.streak || 0;
  const rank = statsData?.globalRank || "-";

  const stats = [
    {
      title: "Problems Solved",
      value: solved.toString(),
      subtext: "Total accepted",
      subtextColor: "text-[#10b981]",
      icon: CheckCircle2,
      iconColor: "text-brand-orange",
      bgColor: "bg-brand-orange/5 dark:bg-brand-orange/10",
      path: "/submissions",
    },
    {
      title: "Acceptance Rate",
      value: `${accRate}%`,
      subtext: "Overall accuracy",
      subtextColor: "text-[#10b981]",
      icon: TrendingUp,
      iconColor: "text-[#10b981]",
      bgColor: "bg-[#eafaf1] dark:bg-[#10b981]/10",
      path: "/stats",
    },
    {
      title: "Longest Streak",
      value: `${streak} Days`,
      subtext: streak > 0 ? "Keep it up!" : "Start solving!",
      subtextColor: "text-brand-orange",
      icon: Flame,
      iconColor: "text-brand-orange",
      bgColor: "bg-brand-orange/5 dark:bg-brand-orange/10",
      path: "/activity",
    },
    {
      title: "Global Rank",
      value: rank.toLocaleString(),
      subtext: "On the leaderboard",
      subtextColor: "text-[#3b82f6]",
      icon: Award,
      iconColor: "text-[#3b82f6]",
      bgColor: "bg-[#eff6ff] dark:bg-[#3b82f6]/10",
      path: "/leaderboard",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 w-full shrink-0">
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

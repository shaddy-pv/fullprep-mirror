"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Flame } from "lucide-react";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import { useAuthStore, getCurrentStreak } from "@/store/authStore";
import { ProblemsService } from "@/services/problems.service";
import { AuthService } from "@/services/auth.service";

export default function AnalyticsSidebar() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const currentStreak = getCurrentStreak(user);
  const [userStats, setUserStats] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [tagsList, setTagsList] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    // Fetch user-specific stats, database stats, and problem tags in parallel
    Promise.all([
      AuthService.getStats(),
      ProblemsService.getStats(),
      ProblemsService.getTags(),
    ]).then(([stats, db, tags]) => {
      setUserStats(stats);
      setDbStats(db);
      setTagsList(tags.slice(0, 6));
    });
  }, []);

  // ── Derived values from user stats ──────────────────────────────────────
  const problemsSolved = userStats?.problemsSolved || 0;

  // Solved this week = sum of all submissions in last 7 days
  const solvedThisWeek = (userStats?.dailyActivity || []).reduce(
    (acc: number, d: any) => acc + (d.accepted || 0),
    0
  );

  // Previous week calculation (we only have last 7 days so we compare first 3 vs last 4 days roughly)
  // We'll show a static helper text if we can't compute it
  const weekChange = solvedThisWeek > 0 ? `+${solvedThisWeek} this week` : "No solves yet this week";

  // Activity chart data from dailyActivity
  const activityChartData = (userStats?.dailyActivity || []).map((d: any) => ({
    day: d.label || "?",
    value: d.total || 0,
    accepted: d.accepted || 0,
  }));

  // Difficulty breakdown from DATABASE stats (total problems available)
  const easyCount   = dbStats?.byDifficulty?.EASY   || 0;
  const mediumCount = dbStats?.byDifficulty?.MEDIUM  || 0;
  const hardCount   = (dbStats?.byDifficulty?.HARD    || 0) +
                      (dbStats?.byDifficulty?.HARDER  || 0) +
                      (dbStats?.byDifficulty?.HARDEST || 0) +
                      (dbStats?.byDifficulty?.EXPERT  || 0) +
                      (dbStats?.byDifficulty?.["VERY HARD"] || 0);
  const totalDiffSolved = easyCount + mediumCount + hardCount;

  const pieData = [
    { name: "Easy",   value: easyCount,   color: "#10b981", percentage: totalDiffSolved ? `${Math.round(easyCount / totalDiffSolved * 100)}%` : "0%" },
    { name: "Medium", value: mediumCount, color: "var(--brand-accent, #ff6a00)", percentage: totalDiffSolved ? `${Math.round(mediumCount / totalDiffSolved * 100)}%` : "0%" },
    { name: "Hard",   value: hardCount,   color: "#ef4444", percentage: totalDiffSolved ? `${Math.round(hardCount / totalDiffSolved * 100)}%` : "0%" },
  ];

  // Streak dots — last 7 days, check if any submission was made that day
  const streakDots = (userStats?.dailyActivity || []).map((d: any) => ({
    label: (d.label || "?").charAt(0),
    status: d.accepted > 0 ? "completed" : d.total > 0 ? "partial" : "none",
  }));

  // Pad to 7 days if needed
  while (streakDots.length < 7) {
    streakDots.unshift({ label: "?", status: "none" });
  }

  const isDark = isMounted ? theme === "dark" : false;
  const gridColor  = isDark ? "rgba(255, 255, 255, 0.04)" : "#f1f0ec";
  const tickColor  = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg  = isDark ? "#1f2937" : "#111217";

  // Y-axis max for activity chart
  const maxActivity = Math.max(...activityChartData.map((d: any) => d.value), 4);
  const yMax = Math.ceil(maxActivity / 5) * 5 || 10;

  return (
    <div className="flex flex-col gap-4 w-full lg:w-[380px] shrink-0 select-none">
      {/* Solved Stats Dual Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Solved This Week */}
        <DashboardCard className="p-3.5 flex flex-col justify-between h-[96px] shadow-sm">
          <span className="text-[11px] font-semibold text-text-secondary tracking-[-0.01em]">
            Solved This Week
          </span>
          <div className="flex flex-col text-left mt-0.5">
            <span className="text-[24px] font-bold text-text-primary leading-none tracking-[-0.02em]">
              {userStats ? solvedThisWeek : "—"}
            </span>
            <span className="text-[11px] font-bold text-[#10b981] mt-1 tracking-[-0.01em]">
              {userStats ? weekChange : "Loading..."}
            </span>
          </div>
        </DashboardCard>

        {/* Total Solved */}
        <DashboardCard className="p-3.5 flex flex-col justify-between h-[96px] shadow-sm">
          <span className="text-[11px] font-semibold text-text-secondary tracking-[-0.01em]">
            Total Solved
          </span>
          <div className="flex flex-col text-left mt-0.5">
            <span className="text-[24px] font-bold text-text-primary leading-none tracking-[-0.02em]">
              {userStats ? problemsSolved : "—"}
            </span>
            <span className="text-[11px] font-bold text-[#3b82f6] mt-1 tracking-[-0.01em]">
              {userStats
                ? problemsSolved > 0
                  ? `Rank #${userStats.globalRank ?? "?"}`
                  : "Start solving!"
                : "Loading..."}
            </span>
          </div>
        </DashboardCard>
      </div>

      {/* Current Streak */}
      <div className="bg-gradient-to-b from-[#1c1d27] to-[#14151b] dark:from-[#11131c] dark:to-[#090a10] border border-white/[0.08] dark:border-white/[0.04] rounded-[24px] p-4.5 shadow-lg shadow-black/20 text-white flex flex-col justify-between h-[148px]">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] text-[#9ca3af] font-bold tracking-widest uppercase mb-0.5">
            <Flame className="w-3.5 h-3.5 text-brand-orange shrink-0 fill-brand-orange" />
            <span>Current Streak</span>
          </div>
          <div className="text-xl font-bold text-brand-orange flex items-baseline gap-1 tracking-[-0.02em]">
            {currentStreak} Days
          </div>
          <span className="text-[10px] text-brand-orange/80 font-bold tracking-[-0.01em]">
            {currentStreak > 0 ? "Keep it up!" : "Solve today to start a streak!"}
          </span>
        </div>

        {/* Streak dots from real daily activity */}
        <div className="flex justify-between items-center px-1">
          {streakDots.map((day: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              {day.status === "completed" ? (
                <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.6)]" />
              ) : day.status === "partial" ? (
                <div className="w-2 h-2 rounded-full relative overflow-hidden bg-[#2d2e38] border border-white/[0.1]">
                  <div className="absolute top-0 left-0 w-1/2 h-full bg-brand-orange" />
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#2d2e38] border border-white/[0.1]" />
              )}
              <span className="text-[9px] text-[#6b7280] font-bold">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Problems by Difficulty Donut Chart */}
      <DashboardCard className="p-4 flex flex-col justify-between h-[135px] shadow-sm">
        <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">Problems by Difficulty</span>

        <div className="flex items-center justify-between mt-1 gap-4">
          <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.filter(p => p.value > 0).length > 0 ? pieData : [{ name: "None", value: 1, color: "#374151", percentage: "0%" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(pieData.filter(p => p.value > 0).length > 0 ? pieData : [{ color: "#374151" }]).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-dashed border-[#f1f0ec] dark:border-white/[0.06] animate-spin" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-text-primary leading-none">{totalDiffSolved}</span>
              <span className="text-[7px] text-text-secondary font-bold mt-0.5 uppercase tracking-wider">total</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            {pieData.map((slice) => (
              <div
                key={slice.name}
                className="flex items-center justify-between text-[11px] font-semibold text-text-secondary tracking-[-0.01em]"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="text-text-primary font-bold">{slice.name}</span>
                </div>
                <span className="text-text-primary font-bold">
                  {slice.value} <span className="text-text-secondary/70 font-normal ml-0.5">({slice.percentage})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Activity Overview Line Chart — real data */}
      <DashboardCard className="h-[210px] p-4 flex flex-col justify-between shadow-sm">
        <SectionHeader title="Activity Overview">
          <button className="flex items-center gap-1 bg-card-bg border border-border-card px-2.5 py-1 rounded-lg text-[10px] font-bold text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer tracking-[-0.01em]">
            <span>This Week</span>
            <ChevronDown className="w-3 h-3 text-text-secondary" />
          </button>
        </SectionHeader>

        <div className="h-[130px] w-full mt-1 relative">
          {isMounted ? (
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart
                data={activityChartData.length > 0 ? activityChartData : [{ day: "Mon", value: 0 }, { day: "Tue", value: 0 }, { day: "Wed", value: 0 }, { day: "Thu", value: 0 }, { day: "Fri", value: 0 }, { day: "Sat", value: 0 }, { day: "Sun", value: 0 }]}
                margin={{ top: 5, right: 5, left: -28, bottom: -5 }}
              >
                <defs>
                  <linearGradient id="problemsChartColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--brand-accent, #ff6a00)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--brand-accent, #ff6a00)" stopOpacity={0.0}  />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                  dy={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                  allowDecimals={false}
                  domain={[0, yMax]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "10px",
                    fontFamily: "var(--font-inter)",
                    fontWeight: "bold",
                    padding: "4px 8px",
                  }}
                  cursor={{ stroke: "var(--brand-accent, #ff6a00)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  formatter={(value: any, name: any) => [value, name === "value" ? "Submissions" : name]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--brand-accent, #ff6a00)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#problemsChartColor)"
                  dot={{ r: 3, fill: "var(--brand-accent, #ff6a00)", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 1.5 }}
                  activeDot={{ r: 4.5, fill: "var(--brand-accent, #ff6a00)", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-[#fcfcfa] dark:bg-white/[0.01] animate-pulse rounded-lg flex items-center justify-center text-[10px] text-gray-400">
              Loading Chart...
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Top Topics Grid */}
      <DashboardCard className="p-4 flex flex-col justify-between h-[178px] shadow-sm">
        <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">Top Topics</span>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          {tagsList.length > 0 ? tagsList.map((tag) => (
            <div
              key={tag.name}
              className="flex items-center justify-between text-[11px] font-semibold tracking-[-0.01em]"
            >
              <Badge variant="default" className="text-[10px] py-0.5 border border-border-card bg-card-bg font-semibold">
                {tag.name}
              </Badge>
              <span className="text-text-primary font-bold">{tag.count}</span>
            </div>
          )) : Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 bg-card-bg border border-border-card rounded-md animate-pulse" />
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

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
import { 
  DIFFICULTY_PIE_DATA, 
  CHART_MOCK_DATA, 
  TOP_TAGS_MOCK_DATA, 
  STREAK_DAYS 
} from "@/constants/navigation";

export default function AnalyticsSidebar() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDark = isMounted ? theme === "dark" : false;

  // Colors mapping for Area and Pie grids
  const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "#f1f0ec";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#1f2937" : "#111217";

  return (
    <div className="flex flex-col gap-4 w-full lg:w-[380px] shrink-0 select-none">
      {/* Solved Stats Dual Grid (Side-by-Side Cards) */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Solved This Week */}
        <DashboardCard className="p-3.5 flex flex-col justify-between h-[96px] shadow-sm">
          <span className="text-[11px] font-semibold text-text-secondary tracking-[-0.01em]">
            Solved This Week
          </span>
          <div className="flex flex-col text-left mt-0.5">
            <span className="text-[24px] font-bold text-text-primary leading-none tracking-[-0.02em]">
              26
            </span>
            <span className="text-[11px] font-bold text-[#10b981] mt-1 tracking-[-0.01em]">
              +8 from last week
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
              342
            </span>
            <span className="text-[11px] font-bold text-[#3b82f6] mt-1 tracking-[-0.01em]">
              Top 12.3%
            </span>
          </div>
        </DashboardCard>
      </div>

      {/* Current Streak (Glassmorphic) */}
      <div className="bg-gradient-to-b from-[#1c1d27] to-[#14151b] dark:from-[#11131c] dark:to-[#090a10] border border-white/[0.08] dark:border-white/[0.04] rounded-[24px] p-4.5 shadow-lg shadow-black/20 text-white flex flex-col justify-between h-[148px]">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] text-[#9ca3af] font-bold tracking-widest uppercase mb-0.5">
            <Flame className="w-3.5 h-3.5 text-brand-orange shrink-0 fill-brand-orange" />
            <span>Current Streak</span>
          </div>
          <div className="text-xl font-bold text-brand-orange flex items-baseline gap-1 tracking-[-0.02em]">
            12 Days
          </div>
          <span className="text-[10px] text-brand-orange/80 font-bold tracking-[-0.01em]">
            Keep it up!
          </span>
        </div>

        {/* Streak Weekly Progress Dots */}
        <div className="flex justify-between items-center px-1">
          {STREAK_DAYS.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              {day.status === "completed" ? (
                <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(255,106,0,0.6)]" />
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
          {/* Left: Donut Chart container */}
          <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={DIFFICULTY_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DIFFICULTY_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-dashed border-[#f1f0ec] dark:border-white/[0.06] animate-spin" />
            )}
            {/* Center aggregate number absolute overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-text-primary leading-none">342</span>
              <span className="text-[7px] text-text-secondary font-bold mt-0.5 uppercase tracking-wider">solved</span>
            </div>
          </div>

          {/* Right: Color Legend rows */}
          <div className="flex-1 flex flex-col gap-1">
            {DIFFICULTY_PIE_DATA.map((slice) => (
              <div 
                key={slice.name}
                className="flex items-center justify-between text-[11px] font-semibold text-text-secondary tracking-[-0.01em]"
              >
                {/* Name dot */}
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-text-primary font-bold">{slice.name}</span>
                </div>
                {/* Size percents */}
                <span className="text-text-primary font-bold">
                  {slice.value} <span className="text-text-secondary/70 font-normal ml-0.5">({slice.percentage})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Activity Overview Line Chart */}
      <DashboardCard className="h-[210px] p-4 flex flex-col justify-between shadow-sm">
        <SectionHeader title="Activity Overview">
          <button className="flex items-center gap-1 bg-card-bg border border-border-card px-2.5 py-1 rounded-lg text-[10px] font-bold text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer tracking-[-0.01em]">
            <span>This Week</span>
            <ChevronDown className="w-3 h-3 text-text-secondary" />
          </button>
        </SectionHeader>

        {/* Recharts Area Curve */}
        <div className="h-[130px] w-full mt-1 relative">
          {isMounted ? (
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart
                data={CHART_MOCK_DATA}
                margin={{ top: 5, right: 5, left: -28, bottom: -5 }}
              >
                <defs>
                  <linearGradient id="problemsChartColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ff6a00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="0" 
                  vertical={false} 
                  stroke={gridColor} 
                />
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
                  domain={[0, 400]}
                  ticks={[0, 100, 200, 300, 400]}
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
                  cursor={{ stroke: "#ff6a00", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6a00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#problemsChartColor)"
                  dot={{ r: 3, fill: "#ff6a00", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 1.5 }}
                  activeDot={{ r: 4.5, fill: "#ff6a00", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2 }}
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

      {/* Top Topics Grid Lists */}
      <DashboardCard className="p-4 flex flex-col justify-between h-[178px] shadow-sm">
        <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">Top Topics</span>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          {TOP_TAGS_MOCK_DATA.map((tag) => (
            <div 
              key={tag.name}
              className="flex items-center justify-between text-[11px] font-semibold tracking-[-0.01em]"
            >
              {/* Tag button */}
              <Badge variant="default" className="text-[10px] py-0.5 border border-border-card bg-card-bg font-semibold">
                {tag.name}
              </Badge>
              {/* Solved Count */}
              <span className="text-text-primary font-bold">
                {tag.count}
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

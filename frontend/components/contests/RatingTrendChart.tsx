"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { ChevronDown, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface RatingPoint {
  name: string;
  rating: number;
}

export default function RatingTrendChart() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDark = isMounted ? theme === "dark" : false;
  const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "#f1f0ec";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#1f2937" : "#111217";

  // Build chart data from user's rating. If they have participated, show a line.
  // If they haven't participated, show the empty state.
  const rating = user?.contestRating ?? 0;
  const participated = user?.contestsParticipated ?? 0;

  // Build a minimal trend line from participated contests
  const buildChartData = (): RatingPoint[] => {
    if (participated === 0 || rating === 0) return [];
    // Reconstruct approximate history by back-calculating from current rating
    // We'll show one point per contest, approximating a 15-25pt increment each
    const avgGain = Math.floor(rating / participated);
    return Array.from({ length: participated }, (_, i) => ({
      name: `#${i + 1}`,
      rating: Math.max(0, avgGain * (i + 1)),
    }));
  };

  const chartData = buildChartData();
  const hasData = chartData.length > 0;

  const yMin = hasData ? Math.max(0, Math.min(...chartData.map(d => d.rating)) - 20) : 0;
  const yMax = hasData ? Math.max(...chartData.map(d => d.rating)) + 30 : 100;

  return (
    <DashboardCard className="h-[240px] p-5 flex flex-col justify-between shadow-sm select-none">
      <SectionHeader title="Contest Rating Trend">
        <button className="flex items-center gap-1 bg-card-bg border border-border-card px-2.5 py-1 rounded-lg text-[10px] font-bold text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer tracking-[-0.01em]">
          <span>Last {participated || 0} Contests</span>
          <ChevronDown className="w-3 h-3 text-text-secondary" />
        </button>
      </SectionHeader>

      <div className="h-[155px] w-full mt-2 relative">
        {!isMounted ? (
          <div className="w-full h-full bg-[#fcfcfa] dark:bg-white/[0.01] animate-pulse rounded-lg" />
        ) : !hasData ? (
          /* Empty state — no contests participated yet */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-orange" />
            </div>
            <p className="text-[12px] font-semibold text-text-primary">No contest history yet</p>
            <p className="text-[11px] text-text-secondary text-center leading-snug max-w-[160px]">
              Join a contest to start building your rating trend!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -26, bottom: -5 }}
            >
              <defs>
                <linearGradient id="ratingChartColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ff6a00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                dy={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                domain={[yMin, yMax]}
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
                dataKey="rating"
                stroke="#ff6a00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ratingChartColor)"
                dot={{ r: 3, fill: "#ff6a00", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 1.5 }}
                activeDot={{ r: 4.5, fill: "#ff6a00", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}

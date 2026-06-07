"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { ChevronDown } from "lucide-react";

const RATING_HISTORY_MOCK = [
  { name: "#400", rating: 1350 },
  { name: "#401", rating: 1480 },
  { name: "#402", rating: 1660 },
  { name: "#403", rating: 1750 },
  { name: "#404", rating: 1920 },
  { name: "#405", rating: 1930 },
];

export default function RatingTrendChart() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const isDark = isMounted ? theme === "dark" : false;

  const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "#f1f0ec";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#1f2937" : "#111217";

  return (
    <DashboardCard className="h-[240px] p-5 flex flex-col justify-between shadow-sm select-none">
      <SectionHeader title="Contest Rating Trend">
        <button className="flex items-center gap-1 bg-card-bg border border-border-card px-2.5 py-1 rounded-lg text-[10px] font-bold text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer tracking-[-0.01em]">
          <span>Last 6 Contests</span>
          <ChevronDown className="w-3 h-3 text-text-secondary" />
        </button>
      </SectionHeader>

      {/* Recharts Area Curve matching dashboard ChartCard metrics exactly */}
      <div className="h-[155px] w-full mt-2 relative">
        {isMounted ? (
          <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={RATING_HISTORY_MOCK}
              margin={{ top: 5, right: 5, left: -26, bottom: -5 }}
            >
              <defs>
                <linearGradient id="ratingChartColor" x1="0" y1="0" x2="0" y2="1">
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
                domain={[1200, 2000]}
                ticks={[1200, 1400, 1600, 1800, 2000]}
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
        ) : (
          <div className="w-full h-full bg-[#fcfcfa] dark:bg-white/[0.01] animate-pulse rounded-lg flex items-center justify-center text-[10px] text-gray-400">
            Loading Chart...
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

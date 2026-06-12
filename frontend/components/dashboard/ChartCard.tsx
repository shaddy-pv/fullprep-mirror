"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "../ui/DashboardCard";
import SectionHeader from "../ui/SectionHeader";
import { CHART_MOCK_DATA } from "@/constants/navigation";

export default function ChartCard() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chartData, setChartData] = useState<any[]>([...CHART_MOCK_DATA]);

  useEffect(() => {
    setIsMounted(true);
    async function loadData() {
      const stats = await AuthService.getStats();
      if (stats && stats.dailyActivity) {
        const mappedData = stats.dailyActivity.map((d: any) => ({
          day: d.label,
          value: d.accepted,
        }));
        setChartData(mappedData);
      }
    }
    loadData();
  }, []);

  const isDark = isMounted ? theme === "dark" : false;

  // Dynamic colors for Recharts SVG
  const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "#f1f0ec";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#1f2937" : "#111217";

  return (
    <DashboardCard 
      className="h-[240px] p-5 flex flex-col justify-between hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,106,0,0.12)] hover:border-brand-orange/30 transition-all duration-300 cursor-pointer"
      onClick={() => router.push("/stats")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SectionHeader title="Progress Overview">
        <button 
          className="flex items-center gap-1 bg-card-bg border border-border-card px-2.5 py-1 rounded-lg text-[11px] font-semibold text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer tracking-[-0.01em]"
          onClick={(e) => {
            e.stopPropagation(); // prevent card click routing
          }}
        >
          <span>This Week</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      </SectionHeader>

      {/* Chart area */}
      <div className="h-[155px] w-full mt-2 relative">
        {isMounted ? (
          <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -24, bottom: -5 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6a00" stopOpacity={isHovered ? 0.22 : 0.15} />
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
                tick={{ fill: tickColor, fontSize: 10, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 10, fontWeight: 500 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "11px",
                  fontFamily: "var(--font-inter)",
                  fontWeight: "bold",
                  padding: "6px 10px",
                }}
                cursor={{ stroke: "#ff6a00", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ff6a00"
                strokeWidth={isHovered ? 2.5 : 2}
                fillOpacity={1}
                fill="url(#colorValue)"
                dot={{ 
                  r: isHovered ? 4.5 : 3.5, 
                  fill: "#ff6a00", 
                  stroke: isDark ? "#111827" : "#ffffff", 
                  strokeWidth: isHovered ? 2 : 1.5 
                }}
                activeDot={{ r: 5, fill: "#ff6a00", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-[#fcfcfa] dark:bg-white/[0.01] animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-400">
            Loading Chart...
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

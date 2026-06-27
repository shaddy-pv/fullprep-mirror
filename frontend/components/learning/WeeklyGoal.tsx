"use client";

import React from "react";
import { Check } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

interface WeeklyGoalProps {
  activity?: { done: boolean; dateStr: string }[];
  totalSolvedThisWeek?: number;
  target?: number;
}

export default function WeeklyGoal({ activity = [], totalSolvedThisWeek = 0, target = 10 }: WeeklyGoalProps) {
  const progressPercent = Math.min(100, target > 0 ? (totalSolvedThisWeek / target) * 100 : 0);
  
  // Default to a 7-day array if none provided
  const days = activity.length === 7 ? activity : [
    { done: false, dateStr: "M" },
    { done: false, dateStr: "T" },
    { done: false, dateStr: "W" },
    { done: false, dateStr: "T" },
    { done: false, dateStr: "F" },
    { done: false, dateStr: "S" },
    { done: false, dateStr: "S" }
  ];

  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <DashboardCard className="p-5 flex flex-col gap-3.5 border border-border-card bg-card-bg shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-[15px] font-bold text-text-primary tracking-[-0.015em] leading-none">
          Weekly Goal
        </h3>
        <span className="text-[12px] font-bold text-text-secondary select-none">
          <span className="text-text-primary">{totalSolvedThisWeek}</span> / {target} problems
        </span>
      </div>

      {/* Goal Progress Bar */}
      <div className="w-full h-[6px] bg-[#f1f0ec] dark:bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>

      <p className="text-[11.5px] text-text-secondary font-medium tracking-tight text-left">
        {progressPercent >= 100 ? "Goal achieved! Amazing work!" : "You're doing great! Keep it up!"}
      </p>

      {/* Streak Circles Row */}
      <div className="flex justify-between items-center pt-1.5 px-0.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            {day.done ? (
              <div className="w-6.5 h-6.5 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-[0_0_6px_rgba(255,106,0,0.3)] transition-all">
                <Check className="w-3 h-3 stroke-[3.5]" />
              </div>
            ) : (
              <div className="w-6.5 h-6.5 rounded-full bg-gray-100 dark:bg-white/[0.04] border border-[#e7e5df] dark:border-white/[0.05]" />
            )}
            <span className="text-[10px] text-text-secondary font-bold select-none">{labels[idx]}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

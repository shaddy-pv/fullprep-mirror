"use client";

import React from "react";
import { Check } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

export default function WeeklyGoal() {
  return (
    <DashboardCard className="p-5 flex flex-col gap-3.5 border border-border-card bg-card-bg shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-[15px] font-bold text-text-primary tracking-[-0.015em] leading-none">
          Weekly Goal
        </h3>
        <span className="text-[12px] font-bold text-text-secondary select-none">
          <span className="text-text-primary">5</span> / 10 hours
        </span>
      </div>

      {/* Goal Progress Bar */}
      <div className="w-full h-[6px] bg-[#f1f0ec] dark:bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full bg-brand-orange rounded-full" style={{ width: "50%" }} />
      </div>

      <p className="text-[11.5px] text-text-secondary font-medium tracking-tight text-left">
        You&apos;re doing great! Keep it up!
      </p>

      {/* Streak Circles Row */}
      <div className="flex justify-between items-center pt-1.5 px-0.5">
        {[
          { label: "M", done: true },
          { label: "T", done: true },
          { label: "W", done: true },
          { label: "T", done: true },
          { label: "F", done: false },
          { label: "S", done: false },
          { label: "S", done: false },
        ].map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            {day.done ? (
              <div className="w-6.5 h-6.5 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-[0_0_6px_rgba(255,106,0,0.3)] transition-all">
                <Check className="w-3 h-3 stroke-[3.5]" />
              </div>
            ) : (
              <div className="w-6.5 h-6.5 rounded-full bg-gray-100 dark:bg-white/[0.04] border border-[#e7e5df] dark:border-white/[0.05]" />
            )}
            <span className="text-[10px] text-text-secondary font-bold select-none">{day.label}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

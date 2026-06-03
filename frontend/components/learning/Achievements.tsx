"use client";

import React from "react";
import { Trophy, Flame, Compass } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

export default function Achievements() {
  return (
    <DashboardCard className="p-5 flex flex-col gap-3.5 border border-border-card bg-card-bg shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-[15px] font-bold text-text-primary tracking-[-0.015em] leading-none">
          Achievements
        </h3>
        <button className="text-[11.5px] font-bold text-brand-orange hover:underline cursor-pointer select-none">
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Achievement 1 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12.5px] font-bold text-text-primary leading-none">Problem Solver</span>
            <span className="text-[10.5px] text-text-secondary font-semibold mt-0.5">Solved 100 problems</span>
          </div>
        </div>

        {/* Achievement 2 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20 flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12.5px] font-bold text-text-primary leading-none">Streak Master</span>
            <span className="text-[10.5px] text-text-secondary font-semibold mt-0.5">Maintain a 10 day streak</span>
          </div>
        </div>

        {/* Achievement 3 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12.5px] font-bold text-text-primary leading-none">Topic Explorer</span>
            <span className="text-[10.5px] text-text-secondary font-semibold mt-0.5">Explore 20 different topics</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

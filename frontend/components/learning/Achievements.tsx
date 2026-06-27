"use client";

import React from "react";
import { Trophy, Flame, Compass } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

interface Achievement {
  id: string;
  title: string;
  desc: string;
  type: string; // success, warning, info
}

export default function Achievements({ achievements = [] }: { achievements?: Achievement[] }) {
  // Map types to colors and icons
  const getStyle = (type: string) => {
    switch(type) {
      case "success": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "warning": return "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
      case "info": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "success": return <Trophy className="w-4 h-4" />;
      case "warning": return <Flame className="w-4 h-4" />;
      case "info": return <Compass className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

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
        {achievements.map((ach) => (
          <div key={ach.id} className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${getStyle(ach.type)}`}>
              {getIcon(ach.type)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12.5px] font-bold text-text-primary leading-none">{ach.title}</span>
              <span className="text-[10.5px] text-text-secondary font-semibold mt-0.5">{ach.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

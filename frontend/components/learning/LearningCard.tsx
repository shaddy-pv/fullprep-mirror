"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import DashboardCard from "../ui/DashboardCard";
import ProgressRing from "./ProgressRing";
import { LearningPath } from "@/types/learning";
import * as Icons from "lucide-react";

interface LearningCardProps {
  path: LearningPath;
}

export default function LearningCard({ path }: LearningCardProps) {
  // Map icon string to Lucide component
  const IconComponent = (typeof path.icon === "string" ? (Icons as any)[path.icon] : path.icon) || Icons.BookOpen;

  return (
    <DashboardCard 
      animate 
      className="group flex flex-col justify-between h-full hover:border-brand-orange/20 dark:hover:border-brand-orange/30 transition-all duration-300 relative"
    >
      <div>
        {/* Card Header Row */}
        <div className="flex justify-between items-start mb-4">
          {/* Accent colored icon container */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner"
            style={{ backgroundColor: path.color }}
          >
            <IconComponent className="w-5 h-5 stroke-[2]" />
          </div>
          
          {/* Progress Indicator SVG */}
          <ProgressRing percentage={path.progress} color={path.color} />
        </div>

        {/* Path Title & Description */}
        <h3 className="text-[16px] font-bold text-text-primary group-hover:text-brand-orange transition-colors duration-300 leading-tight mb-2 tracking-[-0.015em]">
          {path.title}
        </h3>
        <p className="text-[13px] text-text-secondary/90 leading-snug mb-5 tracking-[-0.01em] line-clamp-2 min-h-[38px]">
          {path.description}
        </p>
      </div>

      {/* Progress lines and statistical counts */}
      <div className="mt-auto">
        {/* Visual progress bar */}
        <div className="w-full h-[5px] bg-[#f1f0ec] dark:bg-white/[0.08] rounded-full overflow-hidden mb-4">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${path.progress}%`, backgroundColor: path.color }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-[#e7e5df]/40 dark:border-white/[0.03] pt-3.5 pb-4.5">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-text-primary leading-none tracking-[-0.02em]">
              {path.problemsCount}
            </span>
            <span className="text-[10px] text-text-secondary font-semibold uppercase mt-1 tracking-wider leading-none">
              Problems
            </span>
          </div>
          <div className="flex flex-col border-x border-[#e7e5df]/40 dark:border-white/[0.03] px-2.5">
            <span className="text-[14px] font-bold text-text-primary leading-none tracking-[-0.02em]">
              {path.topicsCount}
            </span>
            <span className="text-[10px] text-text-secondary font-semibold uppercase mt-1 tracking-wider leading-none">
              Topics
            </span>
          </div>
          <div className="flex flex-col pl-2.5">
            <span className="text-[14px] font-bold text-text-primary leading-none tracking-[-0.02em]">
              {path.estimatedTime}
            </span>
            <span className="text-[10px] text-text-secondary font-semibold uppercase mt-1 tracking-wider leading-none">
              Est. Time
            </span>
          </div>
        </div>

        {/* Outlined Continue button */}
        <Link href={`/learning-paths/${path.id}`} className="w-full">
          <button
            className="w-full h-10 border border-[#e7e5df] dark:border-white/[0.06] rounded-xl text-[12.5px] font-bold text-text-primary hover:text-brand-orange hover:border-brand-orange/40 hover:bg-brand-orange/[0.02] flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm focus:outline-none"
          >
            <span>{path.progress > 0 ? "Continue Learning" : "Start Learning"}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 duration-300" />
          </button>
        </Link>
      </div>
    </DashboardCard>
  );
}

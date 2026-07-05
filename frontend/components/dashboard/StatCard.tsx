"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  subtextColor: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtext,
  subtextColor,
  icon: Icon,
  iconColor,
  bgColor,
  onClick,
}: StatCardProps) {
  return (
    <DashboardCard 
      animate 
      className="p-5 flex items-center gap-4.5 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.12)] hover:border-brand-orange/30 transition-all duration-300"
      onClick={onClick}
    >
      {/* Circle Icon Wrapper */}
      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor} stroke-[2]`} />
      </div>

      {/* Stat Details */}
      <div className="flex flex-col text-left">
        <span className="text-[12px] font-medium text-text-secondary tracking-[-0.01em]">
          {title}
        </span>
        <span className="text-[24px] font-bold text-text-primary mt-0.5 leading-none tracking-[-0.02em]">
          {value}
        </span>
        <span className={`text-[11px] font-semibold mt-1.5 ${subtextColor} tracking-[-0.01em]`}>
          {subtext}
        </span>
      </div>
    </DashboardCard>
  );
}

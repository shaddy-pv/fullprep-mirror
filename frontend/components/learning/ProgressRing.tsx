"use client";

import React from "react";

interface ProgressRingProps {
  percentage: number;
  color: string;
}

export default function ProgressRing({ percentage, color }: ProgressRingProps) {
  const radius = 18;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center select-none shrink-0" aria-label={`Progress: ${percentage}%`}>
      <svg className="w-12 h-12 -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="stroke-[#e5e7eb] dark:stroke-white/[0.06] fill-transparent transition-colors duration-300"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-text-primary tracking-tighter">
        {percentage}%
      </span>
    </div>
  );
}

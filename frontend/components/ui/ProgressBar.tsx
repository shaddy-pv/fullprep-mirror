"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export default function ProgressBar({
  percentage,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full h-2.5 bg-[#f1f0ec] dark:bg-white/[0.08] rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-brand-orange rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

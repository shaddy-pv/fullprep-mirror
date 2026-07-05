"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "Easy" | "Medium" | "Hard";
  className?: string;
}

export default function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps) {
  const getStyles = (diff: "Easy" | "Medium" | "Hard") => {
    switch (diff) {
      case "Easy":
        return "bg-[#eafaf1] dark:bg-[#10b981]/10 text-[#10b981]";
      case "Medium":
        return "bg-brand-orange/5 dark:bg-brand-orange/10 text-brand-orange";
      case "Hard":
        return "bg-[#fff1f2] dark:bg-[#f43f5e]/10 text-[#f43f5e]";
      default:
        return "bg-[#f3f4f6] dark:bg-white/[0.04] text-text-secondary";
    }
  };

  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-[5px] inline-flex items-center justify-center tracking-[-0.01em] uppercase select-none leading-none shrink-0 h-[18px] min-w-[52px] transition-all duration-200 hover:brightness-125 dark:hover:brightness-125 cursor-pointer hover:scale-105 active:scale-95",
        getStyles(difficulty),
        className
      )}
    >
      {difficulty}
    </span>
  );
}

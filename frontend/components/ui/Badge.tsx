"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "easy" | "medium" | "hard" | "ai" | "default";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold px-2.5 py-1.2 rounded-lg inline-block text-center leading-none tracking-[-0.01em]",
        variant === "easy" && "bg-[#eafaf1] dark:bg-[#10b981]/10 text-[#10b981]",
        variant === "medium" && "bg-[#fff3eb] dark:bg-brand-orange/10 text-brand-orange",
        variant === "hard" && "bg-[#fff1f2] dark:bg-[#f43f5e]/10 text-[#f43f5e]",
        variant === "ai" && "bg-[#8b5cf6] text-white px-1.5 py-0.5 rounded font-bold tracking-wider uppercase scale-90",
        variant === "default" && "bg-[#f3f4f6] dark:bg-white/[0.04] text-text-secondary border border-border-card",
        className
      )}
    >
      {children}
    </span>
  );
}

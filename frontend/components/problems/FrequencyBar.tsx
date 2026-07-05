"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FrequencyBarProps {
  value: number; // Scale of 1 to 10
  className?: string;
}

export default function FrequencyBar({
  value,
  className,
}: FrequencyBarProps) {
  // Array representing the 10 frequency slots
  const slots = Array.from({ length: 10 });

  return (
    <div className={cn("flex items-center gap-[3px] select-none", className)}>
      {slots.map((_, index) => {
        const isFilled = index < value;

        return (
          <div
            key={index}
            className={cn(
              "w-[3px] h-[12px] rounded-[1px] transition-all duration-300",
              isFilled 
                ? "bg-brand-orange shadow-[0_0_2px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.4)]" 
                : "bg-gray-200 dark:bg-white/[0.08]"
            )}
          />
        );
      })}
    </div>
  );
}

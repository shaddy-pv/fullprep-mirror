"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
}

export default function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  // Strength rating from 0 to 4
  const getStrengthScore = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const score = getStrengthScore();

  const getStrengthLabel = () => {
    if (!password) return "";
    if (score <= 1) return "Weak";
    if (score <= 3) return "Medium";
    return "Strong";
  };

  const getBarColor = (index: number) => {
    if (index >= score) return "bg-[#e5e7eb] dark:bg-white/[0.08]";
    if (score <= 1) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    if (score <= 3) return "bg-[#ff6a00] shadow-[0_0_8px_rgba(255,106,0,0.4)]";
    return "bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]";
  };

  const getLabelColor = () => {
    if (score <= 1) return "text-red-500 font-bold";
    if (score <= 3) return "text-[#ff6a00] font-bold";
    return "text-[#10b981] font-bold";
  };

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-2 w-full text-left">
      {/* Strength Label */}
      <div className="text-[12px] font-semibold text-text-secondary tracking-[-0.01em]">
        Password strength: <span className={getLabelColor()}>{getStrengthLabel()}</span>
      </div>

      {/* Segmented Strength Bar */}
      <div className="grid grid-cols-4 gap-1.5 w-full">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              getBarColor(index)
            )}
          />
        ))}
      </div>
    </div>
  );
}

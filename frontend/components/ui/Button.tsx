"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "link";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-6 py-3 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-all duration-300 cursor-pointer tracking-[-0.01em] select-none",
        variant === "primary" && 
          "bg-brand-orange hover:bg-[#e05d00] text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:shadow-[0_6px_16px_rgba(255,106,0,0.35)]",
        variant === "secondary" && 
          "bg-card-bg hover:bg-gray-50 dark:hover:bg-white/[0.02] text-text-primary border border-border-card",
        variant === "ghost" && 
          "bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] text-text-secondary hover:text-text-primary px-3 py-2",
        variant === "link" && 
          "bg-transparent p-0 text-text-primary hover:text-brand-orange shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

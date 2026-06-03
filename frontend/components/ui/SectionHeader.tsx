"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({
  title,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      <span className="text-[14px] font-semibold text-text-primary tracking-[-0.01em]">
        {title}
      </span>
      {children}
    </div>
  );
}

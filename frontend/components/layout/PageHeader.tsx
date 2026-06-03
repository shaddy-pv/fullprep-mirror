"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  right?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  className,
  right,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between w-full gap-4", className)}>
      <div className="flex flex-col text-left">
        <h1 className="text-2xl font-bold text-text-primary tracking-[-0.02em]">{title}</h1>
        {description && (
          <p className="text-[13px] text-text-secondary mt-1 font-medium leading-relaxed tracking-[-0.01em]">
            {description}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-3 shrink-0">{right}</div>}
    </div>
  );
}

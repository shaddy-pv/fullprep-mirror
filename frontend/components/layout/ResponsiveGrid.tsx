"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number;
}

export default function ResponsiveGrid({
  children,
  className,
  cols = 4,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid w-full shrink-0 gap-5",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        cols === 3 && "grid-cols-1 md:grid-cols-3",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}

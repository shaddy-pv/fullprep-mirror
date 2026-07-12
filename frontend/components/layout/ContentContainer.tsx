"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ContentContainer({
  children,
  className,
}: ContentContainerProps) {
  return (
    <div className={cn("flex flex-col gap-6 max-w-[1300px] mx-auto w-full min-w-0", className)}>
      {children}
    </div>
  );
}

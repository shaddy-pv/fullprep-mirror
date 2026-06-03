"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({
  children,
  className,
}: SectionWrapperProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row gap-6 items-start w-full min-w-0", className)}>
      {children}
    </div>
  );
}

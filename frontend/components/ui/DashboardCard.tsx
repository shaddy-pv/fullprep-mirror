"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function DashboardCard({
  className,
  children,
  animate = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: DashboardCardProps) {
  if (animate) {
    return (
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className={cn(
          "bg-card-bg border border-border-card rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer",
          className
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card-bg border border-border-card rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-300",
        className
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

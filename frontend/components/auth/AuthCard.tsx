"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "w-full bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] p-8 md:p-10 shadow-lg shadow-black/[0.015] dark:shadow-black/[0.2] transition-colors duration-300 relative overflow-hidden",
        className
      )}
    >
      {/* Visual Accent Top Bar - Soft Orange Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-brand-orange via-[#ff8b3d] to-brand-orange opacity-90" />

      {/* Internal Grid Wrapper */}
      <div className="flex flex-col h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

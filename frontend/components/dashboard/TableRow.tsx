"use client";

import React from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import DifficultyBadge from "../ui/DifficultyBadge";

interface TableRowProps {
  title: string;
  status: "completed" | "pending";
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  time: string;
  externalId?: string;
}

export default function TableRow({
  title,
  status,
  difficulty,
  topic,
  time,
  externalId,
}: TableRowProps) {
  const router = useRouter();
  const slug = externalId || title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return (
    <div 
      onClick={() => router.push(`/problems/${slug}`)}
      className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-2 group hover:bg-brand-orange/[0.03] dark:hover:bg-brand-orange/[0.03] rounded-xl md:rounded-lg transition-all duration-300 cursor-pointer hover:shadow-[0_4px_20px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.08)] md:hover:shadow-[0_2px_10px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.04)] border border-border-card md:border-transparent relative"
    >
      {/* Top/Left: Icon & Title */}
      <div className="flex items-start md:items-center gap-3 min-w-0 w-full md:flex-1 md:w-auto pr-6 md:pr-2 mb-3 md:mb-0">
        <div className="mt-0.5 md:mt-0 shrink-0">
          {status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-[#10b981] fill-transparent stroke-[2]" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 dark:text-white/[0.12] stroke-[2]" />
          )}
        </div>
        <span className="text-[15px] md:text-[14px] font-semibold md:font-medium text-text-primary/95 group-hover:text-brand-orange transition-colors leading-snug md:leading-tight tracking-[-0.01em] line-clamp-2 md:truncate">
          {title}
        </span>
      </div>

      {/* Mobile Absolute Arrow (Top Right) */}
      <ChevronRight className="md:hidden absolute top-3.5 right-3 w-5 h-5 text-slate-400 group-hover:text-text-primary transition-colors" />

      {/* Bottom/Right: Details (Difficulty, Topic, Time) */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-3 md:gap-6 shrink-0 ml-8 md:ml-0">
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={difficulty} />
          <span className="inline-block text-[13px] font-medium md:font-normal text-text-secondary md:w-[100px] text-left tracking-[-0.01em] truncate max-w-[140px] md:max-w-none">
            {topic}
          </span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-0 mt-1 md:mt-0 w-full md:w-auto justify-between md:justify-end">
          <span className="inline-block text-[12px] md:text-[13px] font-normal text-text-secondary md:w-[100px] text-left md:text-right tracking-[-0.01em] truncate">
            {time}
          </span>
          <ChevronRight className="hidden md:block w-4 h-4 text-slate-400 dark:text-white/40 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2 md:ml-4" />
        </div>
      </div>
    </div>
  );
}

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
      className="flex items-center justify-between py-[10px] first:pt-1 last:pb-1 group hover:bg-[#ff6a00]/[0.03] dark:hover:bg-[#ff6a00]/[0.03] px-2 -mx-2 rounded-lg transition-all duration-300 cursor-pointer hover:shadow-[0_2px_10px_rgba(255,106,0,0.04)]"
    >
      {/* Left Column: Icon & Title */}
      <div className="flex items-center gap-3.5 w-[250px]">
        {status === "completed" ? (
          <CheckCircle2 className="w-5 h-5 text-[#10b981] fill-transparent shrink-0 stroke-[2]" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 dark:text-white/[0.12] shrink-0 stroke-[2]" />
        )}
        <span className="text-[14px] font-medium text-text-primary/95 group-hover:text-brand-orange transition-colors leading-tight tracking-[-0.01em]">
          {title}
        </span>
      </div>

      {/* Middle Columns: Difficulty & Topic & Time */}
      <div className="flex items-center justify-between w-[320px]">
        {/* Difficulty */}
        <div className="w-[80px] flex items-center">
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Topic */}
        <span className="text-[13px] font-normal text-text-secondary w-[110px] text-left tracking-[-0.01em]">
          {topic}
        </span>

        {/* Time */}
        <span className="text-[13px] font-normal text-text-secondary w-[110px] text-right tracking-[-0.01em]">
          {time}
        </span>
      </div>

      {/* Right Column: Arrow Icon */}
      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/40 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}

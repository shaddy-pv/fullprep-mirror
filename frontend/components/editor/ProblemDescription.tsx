"use client";

import React from "react";
import { ArrowLeft, CheckCircle2, Bookmark, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockProblem } from "@/constants/mockProblems";
import DifficultyBadge from "../ui/DifficultyBadge";
import DashboardCard from "../ui/DashboardCard";

interface ProblemDescriptionProps {
  problem: MockProblem;
  isBookmarked: boolean;
  setIsBookmarked: (val: boolean) => void;
  isStarred: boolean;
  setIsStarred: (val: boolean) => void;
  hasUpvoted: boolean;
  handleUpvote: () => void;
  hasDownvoted: boolean;
  handleDownvote: () => void;
  upvotes: number;
  downvotes: number;
  onBack: () => void;
}

export default function ProblemDescription({
  problem,
  isBookmarked,
  setIsBookmarked,
  isStarred,
  setIsStarred,
  hasUpvoted,
  handleUpvote,
  hasDownvoted,
  handleDownvote,
  upvotes,
  downvotes,
  onBack
}: ProblemDescriptionProps) {
  return (
    <DashboardCard className="p-5 flex flex-col justify-between h-full rounded-[24px] border border-border-card bg-card-bg shadow-sm select-text overflow-y-auto custom-scrollbar">
      <div>
        {/* Top Workspace Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-card shrink-0">
          <div className="flex items-center gap-3">
            {/* Back Arrow Button */}
            <button 
              onClick={onBack}
              className="w-8 h-8 rounded-lg border border-border-card bg-card-bg flex items-center justify-center text-text-primary hover:text-brand-orange hover:bg-brand-orange/5 hover:border-brand-orange/20 transition-all duration-200 cursor-pointer focus:outline-none"
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Title & Status */}
            <h1 className="text-[18px] font-bold text-text-primary tracking-[-0.02em] leading-tight select-none">
              {problem.title}
            </h1>
            
            {/* Difficulty Badge */}
            <DifficultyBadge difficulty={problem.difficulty} />

            {/* Status icon */}
            <CheckCircle2 className="w-[18px] h-[18px] text-[#10b981] fill-transparent shrink-0 stroke-[2.2] select-none" />
          </div>

          {/* Bookmark & Star Actions */}
          <div className="flex items-center gap-1.5 select-none">
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none",
                isBookmarked 
                  ? "border-brand-orange/30 bg-brand-orange/10 text-brand-orange" 
                  : "border-border-card text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              )}
              title="Bookmark problem"
            >
              <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-brand-orange")} />
            </button>
            <button 
              onClick={() => setIsStarred(!isStarred)}
              className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none",
                isStarred 
                  ? "border-brand-orange/30 bg-brand-orange/10 text-brand-orange" 
                  : "border-border-card text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              )}
              title="Star problem"
            >
              <Star className={cn("w-4 h-4", isStarred && "fill-brand-orange")} />
            </button>
          </div>
        </div>

        {/* Tags area */}
        <div className="flex flex-wrap gap-1.5 mt-4 select-none">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] bg-[#f3f4f6] dark:bg-white/[0.04] text-text-secondary border border-border-card tracking-[-0.01em]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Problem Description content */}
        <div 
          className="text-[13.5px] text-text-primary mt-6 leading-relaxed space-y-4 font-medium tracking-[-0.01em] markdown-description"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />

        {/* Examples rendered dynamically */}
        <div className="mt-6 space-y-4">
          {problem.examples.map((example, idx) => (
            <div key={idx} className="space-y-2">
              <span className="font-bold text-text-primary text-[13.5px]">Example {idx + 1}:</span>
              <div className="p-4 bg-[#fcfcfa] dark:bg-[#0f121d] border border-border-card rounded-xl font-mono text-[12.5px] leading-relaxed text-text-primary whitespace-pre-wrap select-text shadow-inner">
                <div><strong>Input:</strong> {example.input}</div>
                <div><strong>Output:</strong> {example.output}</div>
                {example.explanation && (
                  <div className="mt-1 text-text-secondary">
                    <strong>Explanation:</strong> {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Constraints rendered dynamically */}
        <div className="pt-6 space-y-2 select-none">
          <span className="font-bold text-text-primary text-[13.5px]">Constraints:</span>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary text-[13px] font-medium leading-normal">
            {problem.constraints.map((constraint, idx) => (
              <li key={idx}>
                <code className="font-mono bg-gray-100 dark:bg-white/[0.04] px-1 rounded text-text-primary">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom stats footer */}
      <div className="flex items-center justify-between pt-5 border-t border-border-card mt-8 text-[12px] text-text-secondary font-bold select-none shrink-0">
        {/* Upvote / Downvote */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-card bg-card-bg cursor-pointer hover:text-brand-orange hover:bg-brand-orange/5 transition-all duration-200 focus:outline-none",
              hasUpvoted && "text-brand-orange border-brand-orange/30 bg-brand-orange/5"
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{upvotes.toLocaleString()}</span>
          </button>

          <button 
            onClick={handleDownvote}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-card bg-card-bg cursor-pointer hover:text-brand-orange hover:bg-brand-orange/5 transition-all duration-200 focus:outline-none",
              hasDownvoted && "text-brand-orange border-brand-orange/30 bg-brand-orange/5"
            )}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{downvotes.toLocaleString()}</span>
          </button>
        </div>

        {/* Submissions count */}
        <div className="flex items-center gap-4">
          <span>
            Accepted: <span className="text-text-primary">{problem.acceptance}</span>
          </span>
          <span>
            Submissions: <span className="text-text-primary">{problem.submissions}</span>
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}

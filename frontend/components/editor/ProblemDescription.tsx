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


        {/* Problem Description content */}
        <div 
          className="text-[13.5px] text-text-primary mt-6 leading-relaxed font-medium tracking-[-0.01em] markdown-description"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />

        {/* Examples rendered dynamically */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-brand-orange text-[13px] font-bold tracking-[0.08em] uppercase border-b border-border-card pb-2 mt-8 mb-4 block w-full">
              Examples
            </h3>
            {problem.examples.map((example, idx) => (
              <div key={idx} className="bg-[#1e2330] dark:bg-white/[0.02] border border-border-card rounded-xl p-5 select-text space-y-4">
                <div>
                  <h4 className="font-bold text-white text-[12px] uppercase tracking-[0.08em] mb-2 text-brand-orange/80">Input</h4>
                  <pre className="text-gray-300 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">{example.input}</pre>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[12px] uppercase tracking-[0.08em] mb-2 text-brand-orange/80">Output</h4>
                  <pre className="text-gray-300 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">{example.output}</pre>
                </div>
                {example.explanation && (
                  <div className="pt-2 border-t border-white/5">
                    <h4 className="font-bold text-white text-[12px] uppercase tracking-[0.08em] mb-2 text-brand-orange/80">Explanation</h4>
                    <p className="text-gray-300 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">{example.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints rendered dynamically */}
        <div className="mt-12 bg-[#1e2330] dark:bg-white/[0.02] border border-border-card rounded-xl p-5 select-none">
          <h3 className="font-bold text-white text-[13px] uppercase tracking-[0.08em] mb-4">Constraints</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-300 text-[14px] font-mono leading-normal">
            {problem.constraints.map((constraint, idx) => (
              <li key={idx}>
                {constraint}
              </li>
            ))}
          </ul>
        </div>

        {/* Tags area */}
        <div className="pt-8 pb-4 select-none">
          <h3 className="font-bold text-white text-[13px] uppercase tracking-[0.08em] mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-[#1e2330] dark:bg-white/[0.04] text-gray-300 border border-border-card tracking-[-0.01em]"
              >
                #{tag}
              </span>
            ))}
          </div>
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
            <ThumbsUp className={cn("w-3.5 h-3.5", hasUpvoted && "fill-brand-orange")} />
            <span>{upvotes.toLocaleString()}</span>
          </button>

          <button 
            onClick={handleDownvote}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-card bg-card-bg cursor-pointer hover:text-brand-orange hover:bg-brand-orange/5 transition-all duration-200 focus:outline-none",
              hasDownvoted && "text-brand-orange border-brand-orange/30 bg-brand-orange/5"
            )}
          >
            <ThumbsDown className={cn("w-3.5 h-3.5", hasDownvoted && "fill-brand-orange")} />
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

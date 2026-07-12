"use client";

import React, { useState } from "react";
import Link from "next/link";

import { CheckCircle2, Circle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import FrequencyBar from "./FrequencyBar";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { ExtendedProblemItem } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface ProblemsTableProps {
  problems: ExtendedProblemItem[];
  totalProblemsCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  solvedIds?: string[];
}

export default function ProblemsTable({
  problems,
  totalProblemsCount,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  solvedIds = [],
}: ProblemsTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows((prev) => {
        const visibleIds = problems.map((p) => p.id);
        const merged = Array.from(new Set([...prev, ...visibleIds]));
        return merged;
      });
    } else {
      setSelectedRows((prev) => {
        const visibleIds = problems.map((p) => p.id);
        return prev.filter((id) => !visibleIds.includes(id));
      });
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const isIdeEnabled = () => {
    return true; // Enable IDE for all loaded problems
  };

  const getSlug = (problem: any) => {
    return problem.externalId || problem.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  const visibleIds = problems.map((p) => p.id);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.includes(id));

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(totalProblemsCount / itemsPerPage));
  const startRange = totalProblemsCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalProblemsCount);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPageButton = (pageNumber: number) => {
    const isActive = pageNumber === currentPage;
    return (
      <button
        key={pageNumber}
        onClick={() => setCurrentPage(pageNumber)}
        className={cn(
          "w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200",
          isActive
            ? "bg-brand-orange text-white shadow-md shadow-brand-orange/25"
            : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm"
        )}
      >
        {pageNumber}
      </button>
    );
  };

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(renderPageButton(i));
      }
    } else {
      // Always show page 1
      buttons.push(renderPageButton(1));

      if (currentPage > 3) {
        buttons.push(
          <span key="dots-start" className="text-[13px] font-bold text-text-secondary px-1 select-none">
            ...
          </span>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we are close to bounds
      let adjustedStart = start;
      let adjustedEnd = end;
      if (currentPage <= 2) {
        adjustedEnd = 3;
      } else if (currentPage >= totalPages - 1) {
        adjustedStart = totalPages - 2;
      }

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        if (i > 1 && i < totalPages) {
          buttons.push(renderPageButton(i));
        }
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="dots-end" className="text-[13px] font-bold text-text-secondary px-1 select-none">
            ...
          </span>
        );
      }

      // Always show last page
      buttons.push(renderPageButton(totalPages));
    }

    return buttons;
  };

  return (
    <DashboardCard className="p-5 flex flex-col justify-between shadow-sm select-none min-w-0 transition-colors duration-300 h-[831px]">
      {/* Table grid container */}
      <div className="overflow-x-auto overflow-y-auto -mx-4 px-4 flex-1 min-h-0 min-w-0 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px] align-middle">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-border-card text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              <th className="py-3 px-4 w-[48px] align-middle text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-border-card text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-brand-orange"
                />
              </th>
              <th className="py-3 px-4 w-[48px] align-middle">#</th>
              <th className="py-3 px-4 min-w-[220px] align-middle">Problem</th>
              <th className="py-3 px-4 w-[110px] align-middle">Difficulty</th>
              <th className="py-3 px-4 w-[110px] align-middle">Acceptance</th>
              <th className="py-3 px-4 min-w-[180px] align-middle">Tags</th>
              <th className="py-3 px-4 w-[130px] align-middle">Frequency</th>
              <th className="py-3 px-4 w-[115px] align-middle">Submissions</th>
              <th className="py-3 px-4 w-[80px] align-middle text-right">Action</th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-border-card">
            {problems.length > 0 ? (
              problems.map((problem) => {
                const isSelected = selectedRows.includes(problem.id);
                const enabled = isIdeEnabled();
                const slug = getSlug(problem);
                const ideUrl = `/problems/${slug}`;

                return (
                  <tr
                    key={(problem as any)._mongoId || `prob-${problem.id}`}
                    className={cn(
                      "group transition-colors duration-150 border-transparent border-l-2 relative",
                      enabled 
                        ? "cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.01] hover:border-l-brand-orange/60" 
                        : "cursor-default hover:bg-gray-50/20 dark:hover:bg-white/[0.005]",
                      isSelected && "bg-brand-orange/[0.015]"
                    )}
                  >
                    {/* Checkbox column */}
                    <td className="py-2.5 px-4 align-middle text-center relative z-20" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(problem.id)}
                          className="w-4 h-4 rounded border-border-card text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-brand-orange"
                        />
                      </div>
                    </td>

                    {/* Index */}
                    <td className="py-2.5 px-4 align-middle text-[13px] font-medium text-text-secondary">
                      {problem.id}
                    </td>

                    {/* Title Link column */}
                    <td className="py-2.5 px-4 align-middle">
                      {enabled && (
                        <Link 
                          href={ideUrl} 
                          className="absolute inset-0 z-10 cursor-pointer"
                          aria-label={`Open ${problem.title}`}
                        />
                      )}
                      <div className="flex items-center gap-2.5 h-full relative z-20 pointer-events-none">
                        {(() => {
                          const externalId = (problem as any).externalId;
                          const isSolved = externalId
                            ? solvedIds.includes(externalId)
                            : problem.status === "completed";
                          return isSolved ? (
                            <CheckCircle2 className="w-[17px] h-[17px] text-[#10b981] fill-[#10b981]/10 shrink-0 stroke-[2.2]" />
                          ) : (
                            <Circle className="w-[17px] h-[17px] text-[#d1d5db] dark:text-white/[0.12] shrink-0 stroke-[2.2]" />
                          );
                        })()}
                        {enabled ? (
                          <span 
                            className="text-[14px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors leading-tight tracking-[-0.01em] group-hover:underline decoration-brand-orange/40 underline-offset-4"
                          >
                            {problem.title}
                          </span>
                        ) : (
                          <span className="text-[14px] font-semibold text-text-primary/70 leading-tight tracking-[-0.01em]">
                            {problem.title}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-2.5 px-4 align-middle">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>

                    {/* Acceptance */}
                    <td className="py-2.5 px-4 align-middle text-[13px] font-semibold text-text-primary tracking-[-0.01em]">
                      {problem.acceptance}
                    </td>

                    {/* Tags column */}
                    <td className="py-2.5 px-4 align-middle relative z-20" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1.5 max-w-[180px] items-center">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-[5px] bg-[#f3f4f6] dark:bg-white/[0.04] text-text-secondary border border-border-card"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Frequency Bar */}
                    <td className="py-2.5 px-4 align-middle">
                      <div className="flex items-center">
                        <FrequencyBar value={problem.frequency} />
                      </div>
                    </td>

                    {/* Submissions */}
                    <td className="py-2.5 px-4 align-middle text-[13px] font-semibold text-text-secondary tracking-[-0.01em]">
                      {problem.submissions}
                    </td>

                    {/* Action Arrow column */}
                    <td className="py-2.5 px-4 align-middle text-right relative z-20" onClick={(e) => e.stopPropagation()}>
                      {enabled ? (
                        <Link
                          href={ideUrl}
                          className="w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-primary hover:text-white hover:bg-brand-orange hover:border-brand-orange flex items-center justify-center shadow-sm transition-all duration-200 cursor-pointer ml-auto focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                          title="Solve Challenge"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <div className="relative group/tooltip inline-block ml-auto select-none">
                          <button
                            disabled
                            className="w-8 h-8 rounded-lg border border-border-card/60 bg-gray-50/50 dark:bg-white/[0.01] text-text-secondary/40 cursor-not-allowed flex items-center justify-center shadow-none focus:outline-none"
                            aria-label="Challenge coming soon"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          
                          {/* Beautiful SaaS Coming Soon Tooltip */}
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block bg-[#111217] dark:bg-[#06090f] border border-border-card text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none transition-opacity duration-200">
                            Challenge Coming Soon
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[13px] text-text-secondary font-medium tracking-[-0.01em] align-middle">
                  No problems match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-card mt-4 shrink-0">
        {/* Left Side stats */}
        <span className="text-[13px] font-medium text-text-secondary tracking-[-0.01em] text-center sm:text-left">
          Showing <span className="font-semibold text-text-primary">{startRange}</span> to{" "}
          <span className="font-semibold text-text-primary">{endRange}</span> of{" "}
          <span className="font-semibold text-text-primary">{totalProblemsCount}</span> problems
        </span>

        {/* Centered Page Selector */}
        <div className="flex items-center gap-1.5 justify-center flex-wrap">
          {/* Prev Chevron */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={cn(
              "w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200",
              currentPage === 1
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dynamic Page Buttons */}
          {renderPageButtons()}

          {/* Next Chevron */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={cn(
              "w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200",
              currentPage === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right page limit indicator */}
        <div className="flex items-center gap-1 shrink-0 justify-center sm:justify-end w-full sm:w-auto">
          <div className="flex items-center justify-between gap-2 h-8 px-3 border border-border-card bg-card-bg rounded-lg text-[12px] font-semibold text-text-primary shadow-sm select-none">
            <span>10 / page</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

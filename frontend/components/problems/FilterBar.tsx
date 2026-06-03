"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, RotateCcw, X, Check } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (val: string) => void;
  selectedTopic: string;
  setSelectedTopic: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onReset: () => void;
}

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const TOPICS = [
  "All",
  "Algorithms",
  "Arrays",
  "Binary Search",
  "BFS",
  "DFS",
  "Design",
  "Dynamic Programming",
  "Graph",
  "Hash Table",
  "Heap",
  "Linked List",
  "Recursion",
  "Searching",
  "Sorting",
  "Stack",
  "String",
  "Tree",
  "Two Pointers",
];
const STATUSES = [
  { label: "All", value: "All" },
  { label: "Solved", value: "completed" },
  { label: "Unsolved", value: "pending" },
];
const SORTS = [
  { label: "Most Recent", value: "Most Recent" },
  { label: "Difficulty: Easy to Hard", value: "Difficulty: Easy to Hard" },
  { label: "Difficulty: Hard to Easy", value: "Difficulty: Hard to Easy" },
  { label: "Acceptance: High to Low", value: "Acceptance: High to Low" },
  { label: "Acceptance: Low to High", value: "Acceptance: Low to High" },
  { label: "Frequency: High to Low", value: "Frequency: High to Low" },
];

export default function FilterBar({
  searchVal,
  setSearchVal,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedTopic,
  setSelectedTopic,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  onReset,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<"difficulty" | "topic" | "status" | "sort" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleDropdownToggle = (type: "difficulty" | "topic" | "status" | "sort") => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const hasActiveFilters =
    selectedDifficulty !== "All" ||
    selectedTopic !== "All" ||
    selectedStatus !== "All" ||
    searchVal !== "";

  return (
    <div ref={containerRef} className="flex flex-col gap-4 w-full select-none z-30 shrink-0">
      {/* Top Filter Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Problems input */}
        <div className="relative w-[280px]">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-text-secondary" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search problems..."
            aria-label="Search coding problems"
            className="w-full h-[38px] pl-10 pr-8 bg-card-bg border border-border-card rounded-xl text-[13px] text-text-primary placeholder-text-secondary outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all duration-300 tracking-[-0.01em] shadow-sm"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:text-brand-orange"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Difficulty */}
        <div className="relative">
          <button
            onClick={() => handleDropdownToggle("difficulty")}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === "difficulty"}
            aria-label={`Difficulty filter: ${selectedDifficulty}`}
            className={cn(
              "flex items-center gap-1.5 h-[38px] px-4 bg-card-bg border border-border-card rounded-xl text-[13px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition duration-200 cursor-pointer tracking-[-0.01em] focus:outline-none focus:ring-2 focus:ring-brand-orange/20",
              selectedDifficulty !== "All" && "border-brand-orange/30 text-brand-orange bg-brand-orange/[0.01]"
            )}
          >
            <span>{selectedDifficulty === "All" ? "Difficulty" : `Difficulty: ${selectedDifficulty}`}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-text-secondary transition-transform duration-200", openDropdown === "difficulty" && "rotate-180")} />
          </button>

          {openDropdown === "difficulty" && (
            <div 
              role="listbox" 
              aria-label="Difficulty choices"
              className="absolute left-0 mt-1.5 w-44 bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {DIFFICULTIES.map((opt) => (
                <button
                  key={opt}
                  role="option"
                  aria-selected={selectedDifficulty === opt}
                  onClick={() => {
                    setSelectedDifficulty(opt);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-center justify-between transition-colors tracking-[-0.01em] focus:outline-none focus:bg-gray-50 dark:focus:bg-white/[0.02] cursor-pointer",
                    selectedDifficulty === opt ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium"
                  )}
                >
                  <span>{opt}</span>
                  {selectedDifficulty === opt && <Check className="w-3.5 h-3.5 text-brand-orange stroke-[2.5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Topics */}
        <div className="relative">
          <button
            onClick={() => handleDropdownToggle("topic")}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === "topic"}
            aria-label={`Topics filter: ${selectedTopic}`}
            className={cn(
              "flex items-center gap-1.5 h-[38px] px-4 bg-card-bg border border-border-card rounded-xl text-[13px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition duration-200 cursor-pointer tracking-[-0.01em] focus:outline-none focus:ring-2 focus:ring-brand-orange/20",
              selectedTopic !== "All" && "border-brand-orange/30 text-brand-orange bg-brand-orange/[0.01]"
            )}
          >
            <span>{selectedTopic === "All" ? "Topics" : `Topic: ${selectedTopic}`}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-text-secondary transition-transform duration-200", openDropdown === "topic" && "rotate-180")} />
          </button>

          {openDropdown === "topic" && (
            <div 
              role="listbox"
              aria-label="Topics choices"
              className="absolute left-0 mt-1.5 w-56 max-h-64 overflow-y-auto bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 custom-scrollbar"
            >
              {TOPICS.map((opt) => (
                <button
                  key={opt}
                  role="option"
                  aria-selected={selectedTopic === opt}
                  onClick={() => {
                    setSelectedTopic(opt);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-center justify-between transition-colors tracking-[-0.01em] focus:outline-none focus:bg-gray-50 dark:focus:bg-white/[0.02] cursor-pointer",
                    selectedTopic === opt ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium"
                  )}
                >
                  <span>{opt}</span>
                  {selectedTopic === opt && <Check className="w-3.5 h-3.5 text-brand-orange stroke-[2.5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Status */}
        <div className="relative">
          <button
            onClick={() => handleDropdownToggle("status")}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === "status"}
            aria-label={`Status filter: ${selectedStatus === "All" ? "All" : selectedStatus === "completed" ? "Solved" : "Unsolved"}`}
            className={cn(
              "flex items-center gap-1.5 h-[38px] px-4 bg-card-bg border border-border-card rounded-xl text-[13px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition duration-200 cursor-pointer tracking-[-0.01em] focus:outline-none focus:ring-2 focus:ring-brand-orange/20",
              selectedStatus !== "All" && "border-brand-orange/30 text-brand-orange bg-brand-orange/[0.01]"
            )}
          >
            <span>
              {selectedStatus === "All"
                ? "Status"
                : `Status: ${STATUSES.find((s) => s.value === selectedStatus)?.label}`}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-text-secondary transition-transform duration-200", openDropdown === "status" && "rotate-180")} />
          </button>

          {openDropdown === "status" && (
            <div 
              role="listbox"
              aria-label="Status choices"
              className="absolute left-0 mt-1.5 w-44 bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {STATUSES.map((opt) => (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={selectedStatus === opt.value}
                  onClick={() => {
                    setSelectedStatus(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-center justify-between transition-colors tracking-[-0.01em] focus:outline-none focus:bg-gray-50 dark:focus:bg-white/[0.02] cursor-pointer",
                    selectedStatus === opt.value ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium"
                  )}
                >
                  <span>{opt.label}</span>
                  {selectedStatus === opt.value && <Check className="w-3.5 h-3.5 text-brand-orange stroke-[2.5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Sort By */}
        <div className="relative">
          <button
            onClick={() => handleDropdownToggle("sort")}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === "sort"}
            aria-label={`Sorting selection: ${sortBy}`}
            className="flex items-center gap-1.5 h-[38px] px-4 bg-card-bg border border-border-card rounded-xl text-[13px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition duration-200 cursor-pointer tracking-[-0.01em] focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          >
            <span>
              Sort by: <span className="font-bold text-brand-orange">{sortBy}</span>
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-text-secondary transition-transform duration-200", openDropdown === "sort" && "rotate-180")} />
          </button>

          {openDropdown === "sort" && (
            <div 
              role="listbox"
              aria-label="Sorting options"
              className="absolute left-0 mt-1.5 w-56 bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {SORTS.map((opt) => (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={sortBy === opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-center justify-between transition-colors tracking-[-0.01em] focus:outline-none focus:bg-gray-50 dark:focus:bg-white/[0.02] cursor-pointer",
                    sortBy === opt.value ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium"
                  )}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-brand-orange stroke-[2.5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            aria-label="Reset all search and dropdown filters"
            className="flex items-center gap-1.5 h-[38px] px-4 bg-card-bg border border-border-card rounded-xl text-[13px] font-bold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition duration-200 cursor-pointer tracking-[-0.01em] ml-auto border-brand-orange/20 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-orange" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Bottom Filter Chips Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-[12px] font-bold text-brand-orange border border-transparent px-2.5 py-1.2 rounded-lg bg-[#fff3eb] dark:bg-brand-orange/10 select-none tracking-[-0.01em]">
            Active Filters
          </span>

          {searchVal && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1.2 font-semibold border border-border-card bg-card-bg">
              <span>Search: &quot;{searchVal}&quot;</span>
              <button 
                onClick={() => setSearchVal("")}
                aria-label="Remove search filter"
                className="focus:outline-none"
              >
                <X className="w-3.5 h-3.5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors focus:text-brand-orange" />
              </button>
            </Badge>
          )}

          {selectedDifficulty !== "All" && (
            <Badge
              variant={selectedDifficulty.toLowerCase() as "default" | "easy" | "medium" | "hard" | "danger"}
              className="flex items-center gap-1.5 py-1.2 font-semibold"
            >
              <span>{selectedDifficulty}</span>
              <button 
                onClick={() => setSelectedDifficulty("All")}
                aria-label="Remove difficulty filter"
                className="focus:outline-none"
              >
                <X className="w-3.5 h-3.5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors focus:text-brand-orange" />
              </button>
            </Badge>
          )}

          {selectedTopic !== "All" && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1.2 font-semibold border border-border-card bg-card-bg">
              <span>Topic: {selectedTopic}</span>
              <button 
                onClick={() => setSelectedTopic("All")}
                aria-label="Remove topic filter"
                className="focus:outline-none"
              >
                <X className="w-3.5 h-3.5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors focus:text-brand-orange" />
              </button>
            </Badge>
          )}

          {selectedStatus !== "All" && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1.2 font-semibold border border-border-card bg-card-bg">
              <span>Status: {STATUSES.find((s) => s.value === selectedStatus)?.label}</span>
              <button 
                onClick={() => setSelectedStatus("All")}
                aria-label="Remove status filter"
                className="focus:outline-none"
              >
                <X className="w-3.5 h-3.5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors focus:text-brand-orange" />
              </button>
            </Badge>
          )}

          <button
            onClick={onReset}
            aria-label="Clear all filter parameters"
            className="text-[12px] font-bold text-text-secondary hover:text-brand-orange px-2 py-1 transition-colors cursor-pointer select-none tracking-[-0.01em] focus:outline-none"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition, Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LearningPathsService } from "@/services/learning-paths.service";
import { StatsService, SidebarStatsResponse } from "@/services/stats.service";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { cn } from "@/lib/utils";
import {
  Code2,
  Cpu,
  Network,
  Monitor,
  Server,
  Layers,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Bookmark,
  GitMerge,
  Search,
  Compass,
  Clock
} from "lucide-react";

import LearningCard from "@/components/learning/LearningCard";
import WeeklyGoal from "@/components/learning/WeeklyGoal";
import Achievements from "@/components/learning/Achievements";
import { LearningPath } from "@/types/learning";

// ----------------------------------------------------
// Interfaces and Constants
// ----------------------------------------------------

const CATEGORIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Most Popular", value: "popular" },
  { label: "Recently Updated", value: "recent" },
] as const;

// ----------------------------------------------------

function LearningPathsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Page State driven by URL Query params
  const activeCategory = searchParams.get("category") || "All";
  const activeSort = searchParams.get("sort") || "recommended";
  const searchVal = searchParams.get("search") || "";

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [sidebarStats, setSidebarStats] = useState<SidebarStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch stats and paths on mount
  useEffect(() => {
    const fetchPathsAndStats = async () => {
      setLoading(true);
      try {
        const [res, statsRes] = await Promise.all([
          LearningPathsService.getPaths({
            category: activeCategory !== "All" ? activeCategory : undefined,
            sort: activeSort,
            search: searchVal || undefined
          }),
          StatsService.getSidebarStats().catch(err => {
             console.error("Stats error", err);
             return null;
          })
        ]);
        
        if (res.success) {
          setPaths(res.data);
        }
        if (statsRes) {
          setSidebarStats(statsRes);
        }
      } catch (err) {
        console.error("Error fetching learning paths:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPathsAndStats();
  }, [activeCategory, activeSort, searchVal]);

  const updateUrlParam = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "All" || value === "recommended" || !value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Filter & Sort computation (already handled by API, just slice for UI layout)
  const filteredPaths = paths;

  // Separate top 6 paths (to display in a 3-column layout) and bottom 2 paths (to display in a 2-column layout)
  const topPaths = filteredPaths.slice(0, 6);
  const bottomPaths = filteredPaths.slice(6);

  const activeSortLabel = SORT_OPTIONS.find((opt) => opt.value === activeSort)?.label || "Recommended";

  return (
    <ContentContainer>
      <ErrorBoundary>
        <PageHeader
          title="Learning Paths"
          description="Structured roadmaps to master coding and ace interviews."
        />
      </ErrorBoundary>

      {/* Main Responsive Grid Layout: Left Column (Paths content) + Right Column (Sidebar widget stack) */}
      <div className="relative mt-6">
        {loading ? (
          <div className="py-20 text-center"><span className="text-text-secondary">Loading learning paths...</span></div>
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start w-full">

          {/* Left Side: Main Learning Paths and Filters */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Controls Bar: Category Pills + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#e7e5df] dark:border-white/[0.04] w-full">
              {/* Category pills */}
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateUrlParam("category", cat)}
                    className={cn(
                      "h-9 px-4 rounded-xl text-[13px] font-semibold transition-all duration-300 cursor-pointer select-none",
                      activeCategory === cat
                        ? "bg-brand-orange text-white shadow-[0_4px_12px_rgba(255,106,0,0.2)]"
                        : "bg-card-bg hover:bg-gray-50 dark:hover:bg-white/[0.02] text-text-secondary hover:text-text-primary border border-border-card"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative self-start sm:self-auto">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-1.5 h-[38px] px-4 bg-card-bg border border-border-card rounded-xl text-[13px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition-all duration-300 cursor-pointer"
                >
                  <span>Sort by: <span className="font-bold text-brand-orange">{activeSortLabel}</span></span>
                  <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform duration-300", sortDropdownOpen && "rotate-180")} />
                </button>

                {sortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-48 bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            updateUrlParam("sort", opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-center justify-between transition-colors tracking-[-0.01em] cursor-pointer",
                            activeSort === opt.value ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium"
                          )}
                        >
                          <span>{opt.label}</span>
                          {activeSort === opt.value && <Check className="w-3.5 h-3.5 text-brand-orange stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Search indicators */}
            {searchVal && (
              <div className="flex items-center gap-2 text-[12px] font-bold text-brand-orange border border-transparent px-3 py-1.5 rounded-lg bg-[#fff3eb] dark:bg-brand-orange/10 w-fit select-none">
                <span>Filtered by search: &quot;{searchVal}&quot;</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("search");
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                  }}
                  className="hover:text-text-primary transition-colors cursor-pointer text-text-secondary/70 ml-1.5 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Learning Paths List */}
            {filteredPaths.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card-bg border border-border-card rounded-[24px] shadow-sm">
                <Search className="w-10 h-10 text-text-secondary/50 mb-3" />
                <h3 className="text-base font-bold text-text-primary mb-1">No roadmaps found</h3>
                <p className="text-[13px] text-text-secondary max-w-sm">
                  Try searching for something else or changing your level filters to find a roadmap.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Top Section Grid - 3 columns on desktop */}
                {topPaths.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topPaths.map((path) => (
                      <LearningCard key={path.id} path={path} />
                    ))}
                  </div>
                )}

                {/* Bottom Section Grid - 2 columns splitting the remaining row width */}
                {bottomPaths.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                    {bottomPaths.map((path) => (
                      <LearningCard key={path.id} path={path} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Side: Stacked Analytics Cards */}
          <div className="flex flex-col gap-4 w-full shrink-0">

            {/* Card 1: Your Progress */}
            <DashboardCard className="p-5 flex flex-col gap-4 border border-border-card bg-card-bg shadow-sm">
              <h3 className="text-[15px] font-bold text-text-primary tracking-[-0.015em] leading-none mb-1">
                Your Progress
              </h3>

              <div className="flex flex-col gap-3">
                {/* Item 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-border-card flex items-center justify-center text-text-secondary">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] text-text-secondary font-medium">Paths Enrolled</span>
                  </div>
                  <span className="text-[14px] font-bold text-text-primary">{paths.filter(p => p.isEnrolled).length}</span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-border-card flex items-center justify-center text-text-secondary">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] text-text-secondary font-medium">Total Progress</span>
                  </div>
                  <span className="text-[14px] font-bold text-[#10b981]">
                    {paths.filter(p => p.isEnrolled).length > 0 
                      ? Math.round(paths.filter(p => p.isEnrolled).reduce((acc, p) => acc + p.progress, 0) / paths.filter(p => p.isEnrolled).length)
                      : 0}%
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-border-card flex items-center justify-center text-text-secondary">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] text-text-secondary font-medium">Problems Solved</span>
                  </div>
                  <span className="text-[14px] font-bold text-text-primary">{paths[0]?.solvedCount || 0}</span>
                </div>

                {/* Item 4 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-border-card flex items-center justify-center text-text-secondary">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] text-text-secondary font-medium">Total Learning Time</span>
                  </div>
                  <span className="text-[14px] font-bold text-text-primary">128h</span>
                </div>
              </div>
            </DashboardCard>

            {/* Card 2: Weekly Goal */}
            <WeeklyGoal 
              activity={sidebarStats?.weeklyGoal?.activity}
              totalSolvedThisWeek={sidebarStats?.weeklyGoal?.totalSolvedThisWeek}
              target={sidebarStats?.weeklyGoal?.target}
            />

            {/* Card 3: Recommended Next */}
            {sidebarStats?.recommendedNext && (
              <DashboardCard className="p-5 flex flex-col gap-3.5 border border-border-card bg-card-bg shadow-sm">
                <h3 className="text-[15px] font-bold text-text-primary tracking-[-0.015em] leading-none mb-1">
                  Recommended Next
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                    <GitMerge className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[13.5px] font-bold text-text-primary leading-tight">{sidebarStats.recommendedNext.title}</span>
                    <span className="text-[11px] text-text-secondary font-semibold mt-0.5">{sidebarStats.recommendedNext.problemsLeft} Problems Left</span>
                  </div>
                </div>

                <Button variant="primary" className="w-full mt-1 h-[42px] font-bold"
                  onClick={() => router.push(`/learning-paths/${sidebarStats.recommendedNext?.pathId}`)}>
                  Continue Learning <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </DashboardCard>
            )}

            {/* Card 4: Achievements */}
            <Achievements achievements={sidebarStats?.achievements} />

          </div>
        </div>
        )}
      </div>
    </ContentContainer>
  );
}

// ----------------------------------------------------
// Page Skeleton / Fallback Wrapper
// ----------------------------------------------------

function LearningPathsLoadingFallback() {
  return (
    <ContentContainer>
      <PageHeader
        title="Learning Paths"
        description="Structured roadmaps to master coding and ace interviews."
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start w-full mt-6">
        <div className="flex flex-col gap-6 min-w-0">
          <div className="w-full h-12 bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-60 bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
          ))}
        </div>
      </div>
    </ContentContainer>
  );
}

export default function LearningPathsPage() {
  return (
    <Suspense fallback={<LearningPathsLoadingFallback />}>
      <LearningPathsContent />
    </Suspense>
  );
}

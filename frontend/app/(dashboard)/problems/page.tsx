"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import FilterBar from "@/components/problems/FilterBar";
import ProblemsTable from "@/components/problems/ProblemsTable";
import AnalyticsSidebar from "@/components/problems/AnalyticsSidebar";
import { PROBLEMS_LIST_MOCK, ExtendedProblemItem } from "@/constants/navigation";

// Difficulty mapping for sorting purposes
const DIFFICULTY_ORDER: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

function ProblemsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Deriving state from URL Query Parameters
  const searchParam = searchParams.get("search") || "";
  const difficultyParam = searchParams.get("difficulty") || "All";
  const topicParam = searchParams.get("topic") || "All";
  const statusParam = searchParams.get("status") || "All";
  const sortParam = searchParams.get("sort") || "Most Recent";
  const pageParam = Number(searchParams.get("page")) || 1;

  // Local state for immediate typing feedback in search input
  const [inputSearchVal, setInputSearchVal] = useState(searchParam);

  // Sync search input with URL param changes (e.g. browser back/forward navigation)
  useEffect(() => {
    setInputSearchVal(searchParam);
  }, [searchParam]);

  // Debounced search param updates (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputSearchVal !== searchParam) {
        updateQueryParams({ search: inputSearchVal || null, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputSearchVal, searchParam]);

  // Helper to push state changes to URL
  const updateQueryParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All" || (key === "page" && value === 1)) {
        params.delete(key);
      } else {
        // Topic tags match url-friendly queries
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url, { scroll: false });
  };

  const handleResetFilters = () => {
    setInputSearchVal("");
    router.push(pathname, { scroll: false });
  };

  // 2. Perform in-memory Filtering, Sorting and Pagination
  const filteredProblems = PROBLEMS_LIST_MOCK.filter((prob) => {
    // A. Match Search Query
    if (searchParam) {
      const matchTitle = prob.title.toLowerCase().includes(searchParam.toLowerCase());
      const matchTags = prob.tags.some((t) => t.toLowerCase().includes(searchParam.toLowerCase()));
      if (!matchTitle && !matchTags) return false;
    }

    // B. Match Difficulty
    if (difficultyParam !== "All" && prob.difficulty.toLowerCase() !== difficultyParam.toLowerCase()) {
      return false;
    }

    // C. Match Topic Tag
    if (topicParam !== "All") {
      const matchTopicField = prob.topic.toLowerCase() === topicParam.toLowerCase();
      const matchTagsList = prob.tags.some((t) => t.toLowerCase() === topicParam.toLowerCase());
      if (!matchTopicField && !matchTagsList) return false;
    }

    // D. Match Solved Status
    if (statusParam !== "All" && prob.status !== statusParam) {
      return false;
    }

    return true;
  });

  // Apply Sorting
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    switch (sortParam) {
      case "Difficulty: Easy to Hard":
        return (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0);
      case "Difficulty: Hard to Easy":
        return (DIFFICULTY_ORDER[b.difficulty] || 0) - (DIFFICULTY_ORDER[a.difficulty] || 0);
      case "Acceptance: High to Low":
        return parseFloat(b.acceptance) - parseFloat(a.acceptance);
      case "Acceptance: Low to High":
        return parseFloat(a.acceptance) - parseFloat(b.acceptance);
      case "Frequency: High to Low":
        return b.frequency - a.frequency;
      default:
        // Most Recent (original array order by ID)
        return a.id - b.id;
    }
  });

  // Apply Pagination
  const itemsPerPage = 10;
  const totalProblemsCount = sortedProblems.length;
  const maxPages = Math.max(1, Math.ceil(totalProblemsCount / itemsPerPage));
  
  // Safe bounds check for active page
  const currentPage = Math.min(pageParam, maxPages);

  const paginatedProblems = sortedProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ContentContainer>
      {/* Page Header */}
      <ErrorBoundary>
        <PageHeader
          title="Problems"
          description="Practice coding problems by topic, difficulty, or status."
        />
      </ErrorBoundary>

      {/* Filter Toolbar Section */}
      <ErrorBoundary>
        <FilterBar
          searchVal={inputSearchVal}
          setSearchVal={setInputSearchVal}
          selectedDifficulty={difficultyParam}
          setSelectedDifficulty={(diff) => updateQueryParams({ difficulty: diff, page: 1 })}
          selectedTopic={topicParam}
          setSelectedTopic={(topic) => updateQueryParams({ topic: topic, page: 1 })}
          selectedStatus={statusParam}
          setSelectedStatus={(status) => updateQueryParams({ status: status, page: 1 })}
          sortBy={sortParam}
          setSortBy={(sort) => updateQueryParams({ sort: sort, page: 1 })}
          onReset={handleResetFilters}
        />
      </ErrorBoundary>

      {/* Main problems workspace grid */}
      <SectionWrapper>
        {/* Left column Problems Table */}
        <div className="flex-1 min-w-0">
          <ErrorBoundary>
            <ProblemsTable
              problems={paginatedProblems}
              totalProblemsCount={totalProblemsCount}
              currentPage={currentPage}
              setCurrentPage={(page) => updateQueryParams({ page })}
              itemsPerPage={itemsPerPage}
            />
          </ErrorBoundary>
        </div>

        {/* Right column Analytics Sidebar */}
        <div className="shrink-0">
          <ErrorBoundary>
            <AnalyticsSidebar />
          </ErrorBoundary>
        </div>
      </SectionWrapper>
    </ContentContainer>
  );
}

// Fallback Loading Skeleton for Suspense
function ProblemsLoadingFallback() {
  return (
    <ContentContainer>
      <PageHeader
        title="Problems"
        description="Practice coding problems by topic, difficulty, or status."
      />
      <div className="w-full h-10 bg-card-bg border border-border-card rounded-xl animate-pulse my-4" />
      <SectionWrapper>
        <div className="flex-1 h-[500px] bg-card-bg border border-border-card rounded-[24px] animate-pulse" />
        <div className="w-[380px] h-[500px] bg-card-bg border border-border-card rounded-[24px] animate-pulse shrink-0" />
      </SectionWrapper>
    </ContentContainer>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<ProblemsLoadingFallback />}>
      <ProblemsContent />
    </Suspense>
  );
}

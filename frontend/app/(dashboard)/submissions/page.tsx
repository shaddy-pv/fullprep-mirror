"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  Zap, 
  Award, 
  Info, 
  ChevronDown, 
  ChevronRight, 
  Flame, 
  Search, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Globe, 
  Code,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import DashboardCard from "@/components/ui/DashboardCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";

// Custom inline brand icons for perfect baseline typography alignments
const PythonIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.892 2C8.36 2 8.653 3.528 8.653 3.528v1.656h3.293V5.71H7.319C5.45 5.71 4 7.025 4 8.895v2.87c0 1.868 1.258 3.256 3.127 3.256h1.054v-1.48s-.136-1.776 1.733-1.776h3.29c1.869 0 3.385-1.42 3.385-3.29V5.184c0-1.87-1.405-3.184-3.275-3.184H11.892zm.215 1.543a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25z" fill="#387EB8"/>
    <path d="M12.108 22c3.53 0 3.239-1.528 3.239-1.528v-1.656h-3.293v-0.526h4.627C18.55 18.29 20 16.975 20 15.105v-2.87c0-1.868-1.258-3.256-3.127-3.256h-1.054v1.48s.136 1.776-1.733 1.776h-3.29c-1.869 0-3.385 1.42-3.385 3.29v3.29c0 1.87 1.405 3.185 3.275 3.185h1.422zm-.215-1.543a.625.625 0 1 1 0-1.25.625.625 0 0 1 0 1.25z" fill="#FFE873"/>
  </svg>
);

const CPlusPlusIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#00599C"/>
    <path d="M9 16c-2.2 0-4-1.8-4-4s1.8-4 4-4c1.1 0 2 .5 2.8 1.2l-1.5 1.5C9.8 10.3 9.4 10 9 10c-1.1 0-2 .9-2 2s.9 2 2 2c.4 0 .8-.3 1.3-.7l1.5 1.5c-.8.7-1.7 1.2-2.8 1.2z" fill="white"/>
    <path d="M14.5 11h1v-1h1v1h1v1h-1v-1h-1v-1zm4.5 0h1v-1h1v1h1v1h-1v-1h-1v-1z" fill="white" strokeWidth="0.5"/>
  </svg>
);

const JavaIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 2C10.5 4.5 9 6.5 9 8.5c0 2 1.5 3 3 3s3.5-1.5 3.5-3c0-2-1.5-4.5-3-6.5z" fill="#E76F51"/>
    <path d="M10 5.5C8.8 7.3 8 8.8 8 10.3c0 1.5 1.1 2.3 2.3 2.3s2.7-1.1 2.7-2.3c0-1.5-1.1-3.4-3-4.8z" fill="#F4A261"/>
    <path d="M16 14.5h-8c-1.5 0-3 1.2-3 2.5s1.5 2.5 3 2.5h8c1.5 0 3-1.2 3-2.5s-1.5-2.5-3-2.5zm-8 4c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5h8c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H8z" fill="#264653"/>
  </svg>
);

const JavaScriptIcon = () => (
  <svg className="w-4 h-4 shrink-0 rounded-[3px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#F7DF1E"/>
    <path d="M11.64 18.25c-.2.12-.45.2-.74.24-.28.04-.6.06-.94.06-.5 0-.91-.07-1.25-.2a2.3 2.3 0 0 1-.88-.58c-.24-.26-.41-.58-.53-.98l1.72-1.03c.1.25.22.44.38.58.15.13.36.2.62.2.22 0 .39-.06.5-.17.1-.11.16-.27.16-.47V10h1.96v6.07c0 .82-.17 1.45-.51 1.88a2.53 2.53 0 0 1-1.33.3zm6.65.04c-.38.25-.85.38-1.42.38-.63 0-1.15-.17-1.57-.5-.4-.34-.67-.85-.8-1.53l1.75-.95c.08.31.22.56.41.74.2.17.44.26.74.26.25 0 .44-.06.58-.17a.47.47 0 0 0 .2-.4c0-.14-.05-.26-.16-.36-.1-.1-.3-.2-.59-.3l-1.07-.37c-.77-.27-1.34-.62-1.7-1.06-.35-.45-.53-1.01-.53-1.68 0-.66.23-1.22.7-1.66.46-.44 1.1-.66 1.9-.66.57 0 1.07.12 1.5.37.44.25.76.6.96 1.07l-1.6 1c-.1-.2-.23-.34-.38-.43-.15-.09-.34-.14-.56-.14-.23 0-.41.05-.53.15-.12.1-.18.22-.18.37 0 .13.06.24.18.33.12.1.35.19.7.3l1.02.35c.81.28 1.4.65 1.76 1.11.36.46.54 1.05.54 1.77 0 .76-.23 1.4-.7 1.9-.47.5-1.12.75-1.95.75z" fill="black"/>
  </svg>
);

interface SubmissionItem {
  id: number;
  problemName: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Compilation Error";
  language: "Python 3" | "C++" | "Java" | "JavaScript";
  runtime: string;
  memory: string;
  submittedAt: string;
}

export default function SubmissionsPage() {
  const showToast = useNotificationStore((state) => state.showToast);

  // States
  const [activeMainTab, setActiveMainTab] = useState("All Submissions");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdatedText, setLastUpdatedText] = useState("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const mainTabs = [
    "All Submissions", 
    "Accepted", 
    "Wrong Answer", 
    "Time Limit Exceeded", 
    "Runtime Error", 
    "Compilation Error"
  ];

  // Mock Table Data matching the provided reference screenshot exactly
  const mockSubmissions: SubmissionItem[] = [
    { id: 1, problemName: "Two Sum", difficulty: "Easy", status: "Accepted", language: "Python 3", runtime: "124 ms", memory: "12.4 MB", submittedAt: "2 mins ago" },
    { id: 2, problemName: "Add Two Numbers", difficulty: "Medium", status: "Accepted", language: "C++", runtime: "256 ms", memory: "18.7 MB", submittedAt: "18 mins ago" },
    { id: 3, problemName: "Longest Substring Without Repeating Characters", difficulty: "Medium", status: "Wrong Answer", language: "Python 3", runtime: "--", memory: "--", submittedAt: "32 mins ago" },
    { id: 4, problemName: "Median of Two Sorted Arrays", difficulty: "Hard", status: "Time Limit Exceeded", language: "Java", runtime: "--", memory: "--", submittedAt: "1 hour ago" },
    { id: 5, problemName: "Zigzag Conversion", difficulty: "Medium", status: "Accepted", language: "Python 3", runtime: "98 ms", memory: "11.2 MB", submittedAt: "2 hours ago" },
    { id: 6, problemName: "Reverse Integer", difficulty: "Easy", status: "Runtime Error", language: "C++", runtime: "--", memory: "--", submittedAt: "3 hours ago" },
    { id: 7, problemName: "Container With Most Water", difficulty: "Medium", status: "Accepted", language: "Java", runtime: "312 ms", memory: "24.1 MB", submittedAt: "5 hours ago" },
    { id: 8, problemName: "Regular Expression Matching", difficulty: "Hard", status: "Wrong Answer", language: "Python 3", runtime: "--", memory: "--", submittedAt: "1 day ago" },
    { id: 9, problemName: "Valid Parentheses", difficulty: "Easy", status: "Accepted", language: "JavaScript", runtime: "76 ms", memory: "8.9 MB", submittedAt: "1 day ago" },
    { id: 10, problemName: "Merge k Sorted Lists", difficulty: "Hard", status: "Accepted", language: "Java", runtime: "412 ms", memory: "30.2 MB", submittedAt: "2 days ago" },
    { id: 11, problemName: "Trapping Rain Water", difficulty: "Hard", status: "Wrong Answer", language: "Python 3", runtime: "--", memory: "--", submittedAt: "2 days ago" },
    { id: 12, problemName: "Binary Search", difficulty: "Easy", status: "Accepted", language: "C++", runtime: "12 ms", memory: "4.2 MB", submittedAt: "3 days ago" },
    { id: 13, problemName: "LRU Cache", difficulty: "Medium", status: "Accepted", language: "Java", runtime: "184 ms", memory: "19.5 MB", submittedAt: "3 days ago" },
    { id: 14, problemName: "Word Ladder", difficulty: "Hard", status: "Time Limit Exceeded", language: "Python 3", runtime: "--", memory: "--", submittedAt: "4 days ago" },
    { id: 15, problemName: "Group Anagrams", difficulty: "Medium", status: "Accepted", language: "JavaScript", runtime: "52 ms", memory: "9.8 MB", submittedAt: "5 days ago" },
  ];

  // Recharts Donut Pie stats dataset
  const donutData = [
    { name: "Accepted", value: 842, percentage: "67.6%", color: "#10b981" },
    { name: "Wrong Answer", value: 213, percentage: "17.1%", color: "#f43f5e" },
    { name: "Time Limit Exceeded", value: 98, percentage: "7.9%", color: "#ff6a00" },
    { name: "Runtime Error", value: 62, percentage: "5.0%", color: "#8b5cf6" },
    { name: "Compilation Error", value: 33, percentage: "2.6%", color: "#9ca3af" },
  ];

  // Recharts Area curve mock dataset
  const areaChartData = [
    { month: "Jan", value: 61 },
    { month: "Feb", value: 63 },
    { month: "Mar", value: 65 },
    { month: "Apr", value: 64 },
    { month: "May", value: 66 },
    { month: "Jun", value: 68 },
    { month: "Jul", value: 67.6 },
  ];

  // Recent Difficult Problems list
  const recentDifficult = [
    { id: 1, title: "Median of Two Sorted Arrays", difficulty: "Hard" as const, attempts: "3 attempts" },
    { id: 2, title: "Regular Expression Matching", difficulty: "Hard" as const, attempts: "2 attempts" },
    { id: 3, title: "Merge k Sorted Lists", difficulty: "Hard" as const, attempts: "2 attempts" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast("Refreshing submissions log...", "info");
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedText("Just now");
      showToast("Submissions updated successfully.", "success");
    }, 1000);
  };

  // Helper to format status pill
  const renderStatus = (status: SubmissionItem["status"]) => {
    let textColor = "";
    let dotBg = "";
    
    switch (status) {
      case "Accepted":
        textColor = "text-[#10b981]";
        dotBg = "bg-[#10b981]";
        break;
      case "Wrong Answer":
        textColor = "text-[#f43f5e]";
        dotBg = "bg-[#f43f5e]";
        break;
      case "Time Limit Exceeded":
        textColor = "text-[#ff6a00]";
        dotBg = "bg-[#ff6a00]";
        break;
      case "Runtime Error":
        textColor = "text-[#8b5cf6]";
        dotBg = "bg-[#8b5cf6]";
        break;
      case "Compilation Error":
        textColor = "text-[#9ca3af]";
        dotBg = "bg-[#9ca3af]";
        break;
    }

    return (
      <div className={cn("flex items-center justify-start select-none font-bold text-[13.5px]", textColor)}>
        <span className={cn("w-2 h-2 rounded-full mr-2 shrink-0 shadow-sm", dotBg)} />
        <span>{status}</span>
      </div>
    );
  };

  // Helper to format language inline layout
  const renderLanguage = (lang: SubmissionItem["language"]) => {
    return (
      <div className="flex items-center gap-2 text-text-primary font-semibold text-[13px] tracking-[-0.01em]">
        {lang === "Python 3" ? (
          <PythonIcon />
        ) : lang === "C++" ? (
          <CPlusPlusIcon />
        ) : lang === "Java" ? (
          <JavaIcon />
        ) : (
          <JavaScriptIcon />
        )}
        <span className="leading-none">{lang}</span>
      </div>
    );
  };

  // Filtering mockup items based on active main tab
  const filteredSubmissions = mockSubmissions.filter((sub) => {
    if (activeMainTab === "All Submissions") return true;
    return sub.status.toLowerCase() === activeMainTab.toLowerCase();
  });

  return (
    <ContentContainer>
      {/* Page Header (Consistently styled matching Leaderboard/contests/dashboard) */}
      <PageHeader
        title="Submissions"
        description="Track your code submissions and performance."
        className="mb-5 select-none"
      />

      {/* Main sliding tabs */}
      <div className="flex border-b border-border-card mb-6 gap-6 select-none overflow-x-auto pb-1 shrink-0">
        {mainTabs.map((tab) => {
          const isActive = activeMainTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveMainTab(tab);
                setCurrentPage(1);
              }}
              className={`pb-3 text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 whitespace-nowrap ${
                isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="submissionsTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-orange rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Horizontal Filter Bar matching exact Problems heights and styles */}
      <div className="flex items-center gap-3.5 mb-6 select-none overflow-x-auto pb-1 w-full shrink-0">
        
        {/* All Problems */}
        <button className="flex items-center justify-between border border-border-card rounded-xl px-4 py-2.5 bg-card-bg text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer min-w-[150px] shadow-sm">
          <span>All Problems</span>
          <ChevronDown className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
        </button>

        {/* All Languages */}
        <button className="flex items-center justify-between border border-border-card rounded-xl px-4 py-2.5 bg-card-bg text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer min-w-[150px] shadow-sm">
          <span>All Languages</span>
          <ChevronDown className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
        </button>

        {/* All Status */}
        <button className="flex items-center justify-between border border-border-card rounded-xl px-4 py-2.5 bg-card-bg text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer min-w-[150px] shadow-sm">
          <span>All Status</span>
          <ChevronDown className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
        </button>

        {/* Sort Trigger */}
        <div className="flex items-center gap-2.5 ml-auto shrink-0">
          <button className="flex items-center justify-between border border-border-card rounded-xl px-4 py-2.5 bg-card-bg text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer min-w-[150px] shadow-sm">
            <span>Newest First</span>
            <ChevronDown className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
          </button>
          
          {/* Advanced filter config toggle */}
          <button className="w-[38px] h-[38px] rounded-xl border border-border-card bg-card-bg flex items-center justify-center text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] shadow-sm transition-all duration-200 cursor-pointer">
            <SlidersHorizontal className="w-4 h-4 text-text-secondary shrink-0" />
          </button>
        </div>
      </div>

      {/* Section split Wrapper with strict Stretch behaviors matching Leaderboard height */}
      <SectionWrapper className="!items-stretch">
        
        {/* Left Column: Standings Logs table container stretched */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          
          <div className="w-full bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] overflow-hidden shadow-sm flex flex-col h-full justify-between">
            
            {/* Unified standings log table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left align-middle">
                <thead>
                  <tr className="border-b border-border-card text-[12px] font-bold text-text-secondary uppercase tracking-wider select-none bg-transparent">
                    <th className="py-3 px-4 w-[60px] align-middle text-center">#</th>
                    <th className="py-3 px-4 align-middle text-left min-w-[200px]">Problem</th>
                    <th className="py-3 px-4 w-[160px] align-middle text-left">Status</th>
                    <th className="py-3 px-4 w-[130px] align-middle text-left">Language</th>
                    <th className="py-3 px-4 w-[110px] align-middle text-left">Runtime</th>
                    <th className="py-3 px-4 w-[110px] align-middle text-left">Memory</th>
                    <th className="py-3 px-4 w-[130px] align-middle text-left">Submitted At</th>
                    <th className="py-3 px-4 w-[50px] align-middle text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card/50 text-[13.5px]">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                      <tr 
                        key={sub.id}
                        className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-150 align-middle"
                      >
                        {/* Index */}
                        <td className="py-[13px] px-4 align-middle text-center text-text-secondary font-medium select-none">
                          {sub.id}
                        </td>

                        {/* Problem */}
                        <td className="py-[13px] px-4 align-middle text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors leading-tight tracking-[-0.01em]">
                              {sub.problemName}
                            </span>
                            <DifficultyBadge difficulty={sub.difficulty} />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-[13px] px-4 align-middle text-left">
                          {renderStatus(sub.status)}
                        </td>

                        {/* Language */}
                        <td className="py-[13px] px-4 align-middle text-left">
                          {renderLanguage(sub.language)}
                        </td>

                        {/* Runtime */}
                        <td className="py-[13px] px-4 align-middle text-left text-text-primary font-bold text-[13px]">
                          {sub.runtime}
                        </td>

                        {/* Memory */}
                        <td className="py-[13px] px-4 align-middle text-left text-text-secondary font-semibold text-[13px]">
                          {sub.memory}
                        </td>

                        {/* Submitted time */}
                        <td className="py-[13px] px-4 align-middle text-left text-text-secondary font-medium select-none text-[13px]">
                          {sub.submittedAt}
                        </td>

                        {/* Right arrow */}
                        <td className="py-[13px] px-4 align-middle text-right text-text-secondary select-none">
                          <ChevronRight className="w-4 h-4 text-text-secondary/40 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all inline-block align-middle" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[13px] text-text-secondary font-medium tracking-[-0.01em] align-middle">
                        No submissions match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer row matched to Leaderboard */}
            <div className="py-3 px-4 border-t border-border-card flex items-center justify-center gap-1.5 select-none bg-[#fcfcfa] dark:bg-white/[0.01] shrink-0">
              <button 
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200",
                  currentPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setCurrentPage(1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200",
                  currentPage === 1 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                1
              </button>
              <button 
                onClick={() => setCurrentPage(2)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200",
                  currentPage === 2 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                2
              </button>
              <button 
                onClick={() => setCurrentPage(3)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200",
                  currentPage === 3 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                3
              </button>
              <span className="text-[13px] text-text-secondary font-bold px-1 select-none">...</span>
              <button 
                onClick={() => setCurrentPage(20)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200",
                  currentPage === 20 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                20
              </button>

              <button 
                onClick={() => setCurrentPage((prev) => Math.min(20, prev + 1))}
                disabled={currentPage === 20}
                className={cn(
                  "w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200",
                  currentPage === 20 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Sidebar Column with strict responsive w-[380px] limitations */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
          
          {/* Submission Stats Donut Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[200px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Submission Stats
              </span>
              <button className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 hover:text-text-primary transition cursor-pointer">
                <span>All Time</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              {/* Left Donut container */}
              <div className="w-[84px] h-[84px] shrink-0 relative flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={36}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-full border-4 border-dashed border-[#f1f0ec] dark:border-white/[0.06] animate-spin" />
                )}
                {/* Total runs overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                  <span className="text-[15px] font-extrabold text-text-primary leading-none">1,248</span>
                  <span className="text-[7px] text-text-secondary font-bold mt-0.5 uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Right list Legend elements */}
              <div className="flex-1 flex flex-col gap-1 text-[11px] text-text-secondary select-all">
                {donutData.map((slice) => (
                  <div key={slice.name} className="flex items-center justify-between tracking-[-0.01em]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-text-secondary font-medium text-[11px]">{slice.name}</span>
                    </div>
                    <span className="text-text-primary font-bold text-[11px]">
                      {slice.value} <span className="text-text-secondary/70 font-medium ml-0.5">({slice.percentage})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Acceptance Rate Area Curve Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[300px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Acceptance Rate
              </span>
              <button className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 hover:text-text-primary transition cursor-pointer">
                <span>All Time</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] font-bold text-[#10b981] leading-none tracking-[-0.02em]">67.6%</span>
              <span className="text-[11px] font-bold text-[#10b981] tracking-[-0.01em]">↑ 12.4% more than last month</span>
            </div>

            {/* Smooth Recharts Green Glow Area */}
            <div className="h-[120px] w-full mt-2 relative">
              {isMounted ? (
                <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart
                    data={areaChartData}
                    margin={{ top: 5, right: 5, left: -28, bottom: -5 }}
                  >
                    <defs>
                      <linearGradient id="submissionsChartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 600 }}
                      dy={4}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 600 }}
                      domain={[50, 80]}
                      ticks={[50, 60, 70, 80]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111217",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "10px",
                        fontFamily: "var(--font-inter)",
                        fontWeight: "bold",
                        padding: "4px 8px",
                      }}
                      cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "3 3" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#submissionsChartColor)"
                      dot={{ r: 2.5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 1 }}
                      activeDot={{ r: 4.5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 1.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-[#fcfcfa] dark:bg-white/[0.01] animate-pulse rounded-lg" />
              )}
            </div>

            <p className="text-[11.5px] text-text-secondary font-semibold tracking-[-0.01em] text-center mt-3 leading-relaxed">
              You are doing great! Keep it up.
            </p>
          </DashboardCard>

          {/* Recent Difficult Problems Attempts Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[300px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-baseline justify-between mb-3.5">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Recent Difficult Problems
              </span>
              <button className="text-[11px] font-semibold text-brand-orange hover:text-[#e05d00] transition cursor-pointer">
                View all
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mt-0.5">
              {recentDifficult.map((prob) => (
                <div key={prob.id} className="flex items-center justify-between border-b border-border-card/45 pb-2.5 last:border-0 last:pb-0 group cursor-pointer hover:bg-gray-50/[0.02] transition-colors rounded-lg">
                  <div className="flex items-center gap-3">
                    <DifficultyBadge difficulty={prob.difficulty} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12.5px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[170px] leading-tight">
                        {prob.title}
                      </span>
                      <span className="text-[11px] text-text-secondary font-medium leading-none mt-0.5">
                        {prob.attempts}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/40 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0 mr-1.5" />
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Real-time Info updates card bottom */}
          <DashboardCard className="p-4 flex items-start gap-3 select-none shrink-0 text-left">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[12px] font-bold text-text-primary leading-none">Submissions are updated in real-time.</span>
              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
                <span>Last updated: <span className="font-mono text-text-primary font-bold">{lastUpdatedText}</span></span>
                
                {/* Refresh Trigger button */}
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-brand-orange hover:text-[#e05d00] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("w-3 h-3 shrink-0 inline-block align-middle", isRefreshing && "animate-spin")} />
                </button>
              </div>
            </div>
          </DashboardCard>

        </div>
      </SectionWrapper>
    </ContentContainer>
  );
}

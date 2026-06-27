"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import DashboardCard from "@/components/ui/DashboardCard";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { SubmissionsService } from "@/services/submissions.service";
import { AuthService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import SubmissionModal from "@/components/submissions/SubmissionModal";

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

export default function SubmissionsPage() {

  const [activeMainTab, setActiveMainTab] = useState("All Submissions");
  const [activeLanguage, setActiveLanguage] = useState("All Languages");
  const [openDropdown, setOpenDropdown] = useState<"status" | "language" | "statsTime" | "statsTime2" | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statsTimeFilter, setStatsTimeFilter] = useState("all_time");
  const [isMounted, setIsMounted] = useState(false);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    async function loadData() {
      setLoading(true);
      try {
        let statusFilter: string | undefined = undefined;
        if (activeMainTab !== "All Submissions") {
          statusFilter = activeMainTab;
        }

        const response = await SubmissionsService.getSubmissions(currentPage, 10, statusFilter, undefined, activeLanguage);
        if (response && response.success) {
          setSubmissions(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        console.error("Failed to load submissions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isMounted, currentPage, activeMainTab, activeLanguage]);

  useEffect(() => {
    if (!isMounted) return;
    
    async function loadStats() {
      try {
        const stats = await AuthService.getStats(statsTimeFilter === "all_time" ? undefined : statsTimeFilter);
        if (stats) {
          setStatsData(stats);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    }
    loadStats();
  }, [isMounted, statsTimeFilter]);

  const mainTabs = [
    "All Submissions", 
    "Accepted", 
    "Wrong Answer", 
    "Time Limit Exceeded", 
    "Runtime Error", 
    "Compilation Error"
  ];

  // Real Submissions mapping
  const displaySubmissions = submissions.map((sub) => {
    const timeText = sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "Just now";
    
    // Map status string
    let displayStatus: any = "Accepted";
    const s = String(sub.status).toUpperCase();
    if (s === "ACCEPTED" || s === "SUCCESS") displayStatus = "Accepted";
    else if (s === "WRONG_ANSWER") displayStatus = "Wrong Answer";
    else if (s === "TIME_LIMIT" || s === "TIME_LIMIT_EXCEEDED") displayStatus = "Time Limit Exceeded";
    else if (s === "COMPILE_ERROR" || s === "COMPILATION_ERROR") displayStatus = "Compilation Error";
    else displayStatus = "Runtime Error";

    return {
      id: sub._id,
      problemName: sub.problemName || "Coding Problem",
      difficulty: sub.problem?.difficulty ? (sub.problem.difficulty.charAt(0) + sub.problem.difficulty.slice(1).toLowerCase()) : "Medium",
      status: displayStatus,
      language: sub.language,
      runtime: sub.executionTimeMs ? `${sub.executionTimeMs} ms` : "--",
      memory: sub.memoryUsedMb ? `${sub.memoryUsedMb} MB` : "--",
      submittedAt: timeText
    };
  });

  // Recharts Donut Pie stats dataset mapped from real backend stats if present
  const totalSubmissionsCount = statsData?.totalSubmissions ?? 12;
  const acceptedSubmissionsCount = statsData?.acceptedSubmissions ?? 8;
  const wrongAnswerSubmissionsCount = Math.max(0, totalSubmissionsCount - acceptedSubmissionsCount);

  const donutData = totalSubmissionsCount > 0 ? [
    { name: "Accepted", value: acceptedSubmissionsCount, percentage: `${((acceptedSubmissionsCount / totalSubmissionsCount) * 100).toFixed(1)}%`, color: "#10b981" },
    { name: "Wrong Answer", value: wrongAnswerSubmissionsCount, percentage: `${((wrongAnswerSubmissionsCount / totalSubmissionsCount) * 100).toFixed(1)}%`, color: "#f43f5e" },
  ] : [
    { name: "Accepted", value: 1, percentage: "100%", color: "#10b981" }
  ];

  // Recharts Area curve mock dataset or real weekly activity
  const areaChartData = statsData?.dailyActivity 
    ? statsData.dailyActivity.map((d: any) => ({ month: d.label, value: d.accepted })) 
    : [
        { month: "Mon", value: 0 },
        { month: "Tue", value: 0 },
        { month: "Wed", value: 0 },
        { month: "Thu", value: 0 },
        { month: "Fri", value: 0 },
        { month: "Sat", value: 0 },
        { month: "Sun", value: 0 },
      ];



  // Helper to format status pill
  const renderStatus = (status: string) => {
    let textColor = "text-[#9ca3af]";
    let dotBg = "bg-[#9ca3af]";
    let label = status;
    
    const normalized = String(status).toUpperCase().replace(/\s+/g, "_");
    if (normalized === "ACCEPTED" || normalized === "SUCCESS") {
      textColor = "text-[#10b981]";
      dotBg = "bg-[#10b981]";
      label = "Accepted";
    } else if (normalized === "WRONG_ANSWER") {
      textColor = "text-[#f43f5e]";
      dotBg = "bg-[#f43f5e]";
      label = "Wrong Answer";
    } else if (normalized === "TIME_LIMIT_EXCEEDED" || normalized === "TIME_LIMIT") {
      textColor = "text-[#ff6a00]";
      dotBg = "bg-[#ff6a00]";
      label = "Time Limit Exceeded";
    } else if (normalized === "RUNTIME_ERROR") {
      textColor = "text-[#8b5cf6]";
      dotBg = "bg-[#8b5cf6]";
      label = "Runtime Error";
    } else if (normalized === "COMPILATION_ERROR" || normalized === "COMPILE_ERROR") {
      textColor = "text-[#9ca3af]";
      dotBg = "bg-[#9ca3af]";
      label = "Compilation Error";
    }

    return (
      <div className={cn("flex items-center justify-start select-none font-bold text-[13.5px]", textColor)}>
        <span className={cn("w-2 h-2 rounded-full mr-2 shrink-0 shadow-sm", dotBg)} />
        <span>{label}</span>
      </div>
    );
  };

  // Helper to format language inline layout
  const renderLanguage = (lang: string) => {
    const l = String(lang).toUpperCase();
    const isPython = l.includes("PYTHON");
    const isCpp = l.includes("CPP") || l.includes("C++");
    const isJava = l.includes("JAVA") && !l.includes("JAVASCRIPT");
    const isJs = l.includes("JAVASCRIPT") || l.includes("JS");
    const displayLabel = isPython ? "Python 3" : isCpp ? "C++" : isJava ? "Java" : isJs ? "JavaScript" : lang;

    return (
      <div className="flex items-center gap-2 text-text-primary font-semibold text-[13px] tracking-[-0.01em]">
        {isPython ? (
          <PythonIcon />
        ) : isCpp ? (
          <CPlusPlusIcon />
        ) : isJava ? (
          <JavaIcon />
        ) : (
          <JavaScriptIcon />
        )}
        <span className="leading-none">{displayLabel}</span>
      </div>
    );
  };



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
        

        {/* All Languages */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === "language" ? null : "language")} 
            className="flex items-center justify-between border border-border-card rounded-xl px-4 py-2.5 bg-card-bg text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer min-w-[150px] shadow-sm"
          >
            <span>{activeLanguage}</span>
            <ChevronDown className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
          </button>
          {openDropdown === "language" && (
            <div className="absolute left-0 mt-1.5 w-full bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {["All Languages", "Python 3", "C++", "Java", "JavaScript"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setActiveLanguage(opt); setCurrentPage(1); setOpenDropdown(null); }}
                  className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors", activeLanguage === opt ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium")}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Status */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")} 
            className="flex items-center justify-between border border-border-card rounded-xl px-4 py-2.5 bg-card-bg text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer min-w-[150px] shadow-sm"
          >
            <span>{activeMainTab === "All Submissions" ? "All Status" : activeMainTab}</span>
            <ChevronDown className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
          </button>
          {openDropdown === "status" && (
            <div className="absolute left-0 mt-1.5 w-full bg-card-bg border border-border-card rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {["All Submissions", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setActiveMainTab(opt); setCurrentPage(1); setOpenDropdown(null); }}
                  className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors", activeMainTab === opt ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-text-primary font-medium")}
                >
                  {opt === "All Submissions" ? "All Status" : opt}
                </button>
              ))}
            </div>
          )}
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
                  {displaySubmissions.length > 0 ? (
                    displaySubmissions.map((sub) => (
                      <tr 
                        key={sub.id}
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-150 align-middle cursor-pointer"
                      >
                        {/* Index */}
                        <td className="py-[13px] px-4 align-middle text-center text-text-secondary font-medium select-none text-[12px] font-mono">
                          {sub.id.substring(sub.id.length - 6)}
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
                        {loading ? "Loading submissions..." : "No submissions match the selected filter."}
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

              {Array.from({ length: pagination.totalPages || 1 }, (_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200",
                      isActive 
                        ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                        : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}
                disabled={currentPage === (pagination.totalPages || 1)}
                className={cn(
                  "w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200",
                  currentPage === (pagination.totalPages || 1) ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column with strict responsive w-[380px] limitations */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5 lg:sticky lg:top-6 h-fit">
          
          {/* Submission Stats Donut Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[200px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Submission Stats
              </span>
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === "statsTime" ? null : "statsTime")}
                  className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 hover:text-text-primary transition cursor-pointer"
                >
                  <span>{statsTimeFilter === "last_7_days" ? "Last 7 Days" : statsTimeFilter === "last_30_days" ? "Last 30 Days" : "All Time"}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {openDropdown === "statsTime" && (
                  <div className="absolute right-0 mt-2 w-[120px] bg-card-bg border border-border-card rounded-lg shadow-lg z-50 py-1 overflow-hidden animate-in fade-in">
                    {[
                      { label: "All Time", value: "all_time" },
                      { label: "Last 7 Days", value: "last_7_days" },
                      { label: "Last 30 Days", value: "last_30_days" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setStatsTimeFilter(opt.value); setOpenDropdown(null); }}
                        className={cn("w-full px-3 py-1.5 text-left text-[11px] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors", statsTimeFilter === opt.value ? "text-brand-orange font-bold" : "text-text-primary")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  <span className="text-[15px] font-extrabold text-text-primary leading-none">{totalSubmissionsCount}</span>
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
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === "statsTime2" ? null : "statsTime2")}
                  className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 hover:text-text-primary transition cursor-pointer"
                >
                  <span>{statsTimeFilter === "last_7_days" ? "Last 7 Days" : statsTimeFilter === "last_30_days" ? "Last 30 Days" : "All Time"}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {openDropdown === "statsTime2" && (
                  <div className="absolute right-0 mt-2 w-[120px] bg-card-bg border border-border-card rounded-lg shadow-lg z-50 py-1 overflow-hidden animate-in fade-in">
                    {[
                      { label: "All Time", value: "all_time" },
                      { label: "Last 7 Days", value: "last_7_days" },
                      { label: "Last 30 Days", value: "last_30_days" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setStatsTimeFilter(opt.value); setOpenDropdown(null); }}
                        className={cn("w-full px-3 py-1.5 text-left text-[11px] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors", statsTimeFilter === opt.value ? "text-brand-orange font-bold" : "text-text-primary")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] font-bold text-[#10b981] leading-none tracking-[-0.02em]">{statsData?.acceptanceRate ?? 0}%</span>
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



        </div>
      </SectionWrapper>

      <SubmissionModal 
        submissionId={selectedSubmissionId} 
        onClose={() => setSelectedSubmissionId(null)} 
      />
    </ContentContainer>
  );
}

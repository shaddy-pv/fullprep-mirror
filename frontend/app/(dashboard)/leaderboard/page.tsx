"use client";

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Zap, Award, Info, ChevronDown, ChevronRight, Flame, Search, ChevronLeft, Calendar, Clock, Globe, Code } from "lucide-react";
import { motion } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import DashboardCard from "@/components/ui/DashboardCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useNotificationStore } from "@/store/notificationStore";

interface LeaderboardUser {
  rank: number;
  username: string;
  rating: number;
  solved: string;
  problems: string;
  streak: number;
  isCurrentUser?: boolean;
  avatarChar: string;
  avatarBg: string;
}

export default function LeaderboardPage() {
  const showToast = useNotificationStore((state) => state.showToast);

  // States
  const [activeMainTab, setActiveMainTab] = useState("Global");
  const [activeFilterTab, setActiveFilterTab] = useState("Overall");
  const [searchVal, setSearchVal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [countdownSeconds, setCountdownSeconds] = useState(37475); // 10:24:35 in seconds

  const mainTabs = ["Global", "Country", "Friends"];
  const filterTabs = ["Overall", "Monthly", "Weekly", "All Time"];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = () => {
    const hrs = Math.floor(countdownSeconds / 3600);
    const mins = Math.floor((countdownSeconds % 3600) / 60);
    const secs = countdownSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Mock Table Data
  const leaderboardUsers: LeaderboardUser[] = [
    { rank: 4, username: "khushi.dev", rating: 1876, solved: "2,031", problems: "1,245", streak: 12, isCurrentUser: true, avatarChar: "K", avatarBg: "from-brand-orange to-[#8b5cf6]" },
    { rank: 5, username: "sahil_ace", rating: 1764, solved: "1,883", problems: "1,102", streak: 8, avatarChar: "S", avatarBg: "from-[#ec4899] to-[#f43f5e]" },
    { rank: 6, username: "devansh_01", rating: 1650, solved: "1,671", problems: "973", streak: 6, avatarChar: "D", avatarBg: "from-[#10b981] to-[#059669]" },
    { rank: 7, username: "nitin.verma", rating: 1543, solved: "1,482", problems: "862", streak: 5, avatarChar: "N", avatarBg: "from-[#eab308] to-[#ca8a04]" },
    { rank: 8, username: "manoj_codes", rating: 1498, solved: "1,390", problems: "815", streak: 4, avatarChar: "M", avatarBg: "from-[#a855f7] to-[#7e22ce]" },
    { rank: 9, username: "tanmay001", rating: 1392, solved: "1,281", problems: "742", streak: 3, avatarChar: "T", avatarBg: "from-[#14b8a6] to-[#0d9488]" },
    { rank: 10, username: "vivek_247", rating: 1287, solved: "1,102", problems: "648", streak: 2, avatarChar: "V", avatarBg: "from-[#3b82f6] to-[#1d4ed8]" },
    { rank: 11, username: "rahul_nk", rating: 1245, solved: "1,050", problems: "610", streak: 2, avatarChar: "R", avatarBg: "from-[#10b981] to-[#059669]" },
    { rank: 12, username: "sneha_patel", rating: 1190, solved: "980", problems: "580", streak: 1, avatarChar: "S", avatarBg: "from-[#ec4899] to-[#f43f5e]" },
    { rank: 13, username: "alok_kumar", rating: 1150, solved: "920", problems: "540", streak: 1, avatarChar: "A", avatarBg: "from-[#eab308] to-[#ca8a04]" },
    { rank: 14, username: "priya_sharma", rating: 1120, solved: "890", problems: "510", streak: 0, avatarChar: "P", avatarBg: "from-[#a855f7] to-[#7e22ce]" },
    { rank: 15, username: "amit_singh", rating: 1080, solved: "820", problems: "480", streak: 0, avatarChar: "A", avatarBg: "from-[#14b8a6] to-[#0d9488]" },
  ];

  // Mock Podium Data
  const podiumData = {
    first: { username: "rohit_ku", rating: 2287, solved: "2,890 solved", avatarChar: "R", avatarBg: "from-[#f59e0b] to-[#d97706]" },
    second: { username: "aryan.codes", rating: 2045, solved: "2,412 solved", avatarChar: "A", avatarBg: "from-[#a855f7] to-[#7e22ce]" },
    third: { username: "pranav.dev", rating: 1987, solved: "2,210 solved", avatarChar: "P", avatarBg: "from-[#10b981] to-[#059669]" },
  };

  // Top gainers
  const topGainers = [
    { rank: 1, username: "aryan.codes", diff: "+156", avatarChar: "A", avatarBg: "bg-[#a855f7]/15 text-[#a855f7]" },
    { rank: 2, username: "rohit_ku", diff: "+128", avatarChar: "R", avatarBg: "bg-[#eab308]/15 text-[#eab308]" },
    { rank: 3, username: "pranav.dev", diff: "+98", avatarChar: "P", avatarBg: "bg-[#10b981]/15 text-[#10b981]" },
    { rank: 4, username: "sahil_ace", diff: "+87", avatarChar: "S", avatarBg: "bg-[#ec4899]/15 text-[#ec4899]" },
    { rank: 5, username: "vivek_247", diff: "+76", avatarChar: "V", avatarBg: "bg-[#3b82f6]/15 text-[#3b82f6]" },
  ];

  return (
    <ContentContainer>
      {/* Page Header (Consistently styled matching contests/dashboard) */}
      <PageHeader
        title="Leaderboard"
        description="See how you rank among the best coders in the community."
        className="mb-5 select-none"
      />

      {/* Main sliding tabs */}
      <div className="flex border-b border-border-card mb-6 gap-6 select-none overflow-x-auto pb-1 shrink-0">
        {mainTabs.map((tab) => {
          const isActive = activeMainTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`pb-3 text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 whitespace-nowrap ${
                isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="leaderboardTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-orange rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic filters and Updates countdown timer row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 select-none shrink-0">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scroll-none">
          {filterTabs.map((tab) => {
            const isActive = activeFilterTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold tracking-[-0.01em] transition-all cursor-pointer ${
                  isActive 
                    ? "bg-[#ffece0] text-brand-orange dark:bg-[#ff6a00]/10 dark:text-[#ff6a00] border border-[#ff6a00]/15" 
                    : "bg-white dark:bg-[#11131c] border border-border-card text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Ticking updates clock */}
        <div className="flex items-center gap-2 text-[12.5px] font-semibold text-text-secondary">
          <Clock className="w-4 h-4 text-brand-orange" />
          <span>Rank Updates in: <span className="font-mono text-text-primary font-bold">{formatCountdown()}</span></span>
        </div>
      </div>

      {/* Section split Wrapper */}
      <SectionWrapper className="!items-stretch">
        {/* Left Column: Unified continuous Podium + Standings table container */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          
          <div className="w-full bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] overflow-hidden shadow-sm flex flex-col h-full justify-between">
            
            {/* Top: Podium Layout Area inside the continuous container */}
            <div className="grid grid-cols-3 gap-4 items-end select-none w-full p-6 bg-transparent border-b border-border-card">
              
              {/* 2nd Place Card (Left) */}
              <div className="flex flex-col items-center">
                <DashboardCard className="w-full p-4 flex flex-col items-center justify-center relative border border-border-card/60 h-[170px] bg-[#fcfcfa]/60 dark:bg-[#151722]/40 shadow-inner">
                  {/* 2nd Badge */}
                  <div className="w-6 h-6 rounded-full bg-slate-400 border border-white dark:border-[#111827] text-white flex items-center justify-center font-extrabold text-[11px] absolute -top-3 shadow-md">
                    2
                  </div>
                  {/* Avatar char circular */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${podiumData.second.avatarBg} border-2 border-white dark:border-[#111827] flex items-center justify-center font-bold text-base text-white shadow-md`}>
                    {podiumData.second.avatarChar}
                  </div>
                  <div className="flex flex-col items-center text-center mt-3.5 gap-0.5 w-full min-w-0">
                    <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em] truncate w-full leading-tight">
                      {podiumData.second.username}
                    </span>
                    <span className="text-[16px] font-extrabold text-brand-orange leading-none mt-0.5">
                      {podiumData.second.rating}
                    </span>
                    <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider leading-none mt-0.5">
                      {podiumData.second.solved}
                    </span>
                  </div>
                </DashboardCard>
              </div>

              {/* 1st Place Card (Center - Sized slightly larger with warm accent frame) */}
              <div className="flex flex-col items-center">
                <DashboardCard className="w-full p-5 flex flex-col items-center justify-center relative border-2 border-brand-orange/45 h-[200px] bg-[#fcfcfa]/60 dark:bg-[#151722]/40 shadow-md shadow-brand-orange/[0.03]">
                  {/* 1st Golden Badge */}
                  <div className="w-7 h-7 rounded-full bg-[#eab308] border border-white dark:border-[#111827] text-white flex items-center justify-center font-extrabold text-[12px] absolute -top-3.5 shadow-md">
                    1
                  </div>
                  {/* Avatar circular */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${podiumData.first.avatarBg} border-2 border-white dark:border-[#111827] flex items-center justify-center font-bold text-lg text-white shadow-md`}>
                    {podiumData.first.avatarChar}
                  </div>
                  <div className="flex flex-col items-center text-center mt-4 gap-0.5 w-full min-w-0">
                    <span className="text-[14px] font-extrabold text-text-primary tracking-[-0.01em] truncate w-full leading-tight">
                      {podiumData.first.username}
                    </span>
                    <span className="text-[19px] font-black text-brand-orange leading-none mt-0.5">
                      {podiumData.first.rating}
                    </span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider leading-none mt-0.5">
                      {podiumData.first.solved}
                    </span>
                  </div>
                </DashboardCard>
              </div>

              {/* 3rd Place Card (Right) */}
              <div className="flex flex-col items-center">
                <DashboardCard className="w-full p-4 flex flex-col items-center justify-center relative border border-border-card/60 h-[170px] bg-[#fcfcfa]/60 dark:bg-[#151722]/40 shadow-inner">
                  {/* 3rd Bronze Badge */}
                  <div className="w-6 h-6 rounded-full bg-[#d97706] border border-white dark:border-[#111827] text-white flex items-center justify-center font-extrabold text-[11px] absolute -top-3 shadow-md">
                    3
                  </div>
                  {/* Avatar circular */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${podiumData.third.avatarBg} border-2 border-white dark:border-[#111827] flex items-center justify-center font-bold text-base text-white shadow-md`}>
                    {podiumData.third.avatarChar}
                  </div>
                  <div className="flex flex-col items-center text-center mt-3.5 gap-0.5 w-full min-w-0">
                    <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em] truncate w-full leading-tight">
                      {podiumData.third.username}
                    </span>
                    <span className="text-[16px] font-extrabold text-brand-orange leading-none mt-0.5">
                      {podiumData.third.rating}
                    </span>
                    <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider leading-none mt-0.5">
                      {podiumData.third.solved}
                    </span>
                  </div>
                </DashboardCard>
              </div>

            </div>

            {/* Bottom: Standing Table element */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left align-middle">
                <thead>
                  <tr className="border-b border-border-card text-[12px] font-bold text-text-secondary uppercase tracking-wider select-none bg-transparent">
                    <th className="py-3 px-4 w-[60px] align-middle text-center">#</th>
                    <th className="py-3 px-4 align-middle text-left">User</th>
                    <th className="py-3 px-4 w-[110px] align-middle text-center">Rating</th>
                    <th className="py-3 px-4 w-[110px] align-middle text-center">Solved</th>
                    <th className="py-3 px-4 w-[110px] align-middle text-center">Problems</th>
                    <th className="py-3 px-4 w-[110px] align-middle text-center">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card/50 text-[13.5px]">
                  {leaderboardUsers.map((user) => (
                    <tr 
                      key={user.rank}
                      className={`group transition-all duration-150 align-middle ${
                        user.isCurrentUser 
                          ? "bg-[#ff6a00]/5 dark:bg-[#ff6a00]/5 border-y border-brand-orange/30 font-semibold text-text-primary" 
                          : "hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
                      }`}
                    >
                      {/* Rank */}
                      <td className={`py-2 px-4 align-middle text-center font-bold select-none ${
                        user.isCurrentUser ? "text-[#10b981]" : "text-text-secondary"
                      }`}>
                        {user.rank}
                      </td>

                      {/* Username details */}
                      <td className="py-2 px-4 align-middle text-left">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                            user.isCurrentUser ? "from-brand-orange to-[#8b5cf6]" : user.avatarBg
                          } flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0`}>
                            {user.avatarChar}
                          </div>
                          <span className={`text-[14px] font-semibold leading-none tracking-[-0.01em] flex items-center ${
                            user.isCurrentUser ? "text-[#10b981]" : "text-text-primary"
                          }`}>
                            {user.username}
                            {user.isCurrentUser && (
                              <span className="text-[#10b981]/90 font-medium ml-1.5">
                                (You)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-2 px-4 align-middle text-center font-bold text-brand-orange text-[14px]">
                        {user.rating}
                      </td>

                      {/* Solved */}
                      <td className="py-2 px-4 align-middle text-center text-text-primary font-semibold">
                        {user.solved}
                      </td>

                      {/* Problems */}
                      <td className="py-2 px-4 align-middle text-center text-text-secondary font-medium select-all">
                        {user.problems}
                      </td>

                      {/* Streak ticker */}
                      <td className="py-2 px-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-1 text-[#ff6a00] font-bold select-none text-[13.5px]">
                          <span>{user.streak}</span>
                          <Flame className="w-3.5 h-3.5 text-brand-orange fill-brand-orange shrink-0 animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clickable interactive Pagination row */}
            <div className="p-4 border-t border-border-card flex items-center justify-center gap-1.5 select-none bg-[#fcfcfa] dark:bg-white/[0.01] shrink-0">
              <button 
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200 ${
                  currentPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  currentPage === 1 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                1
              </button>
              <button 
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  currentPage === 2 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                2
              </button>
              <button 
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  currentPage === 3 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                3
              </button>
              <span className="text-[13px] text-text-secondary font-bold px-1 select-none">...</span>
              <button 
                onClick={() => setCurrentPage(100)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  currentPage === 100 
                    ? "bg-brand-orange text-white shadow-md shadow-[#ff6a00]/25 border border-brand-orange" 
                    : "border border-border-card bg-card-bg text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                100
              </button>

              <button 
                onClick={() => setCurrentPage((prev) => Math.min(100, prev + 1))}
                disabled={currentPage === 100}
                className={`w-8 h-8 rounded-lg border border-border-card bg-card-bg text-text-secondary hover:text-text-primary flex items-center justify-center shadow-sm transition-colors duration-200 ${
                  currentPage === 100 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Sidebar Column with strict responsive width limit (w-full lg:w-[380px]) */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
          
          {/* Your Rank Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[200px] shadow-sm select-none text-left shrink-0">
            <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
              Your Rank
            </span>
            
            <div className="flex items-center gap-4 mt-1">
              {/* Profile Avatar circular */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-orange to-[#8b5cf6] flex items-center justify-center font-bold text-lg text-white border border-white/20 shadow-md shadow-black/5 shrink-0">
                K
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[24px] font-bold text-brand-orange tracking-tight leading-none">
                  #4,215
                </span>
                <span className="text-[11.5px] text-text-secondary font-medium mt-1.5 leading-none">
                  of 52,841 users
                </span>
              </div>
            </div>

            {/* Bottom Row Metrics Row (Rating Solved Streak) */}
            <div className="grid grid-cols-3 gap-3 border-t border-border-card/50 pt-4 mt-1">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Rating</span>
                <span className="text-[15px] font-extrabold text-brand-orange mt-1 leading-none">1,876</span>
              </div>
              <div className="flex flex-col items-center border-x border-border-card/40">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Solved</span>
                <span className="text-[15px] font-extrabold text-[#10b981] mt-1 leading-none">2,031</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Streak</span>
                <div className="flex items-center gap-0.5 text-brand-orange font-extrabold mt-1 leading-none">
                  <span>12</span>
                  <Flame className="w-3.5 h-3.5 fill-brand-orange text-brand-orange" />
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Top Gainers card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[300px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Top Gainers (This Week)
              </span>
              <button className="text-[11px] font-semibold text-brand-orange hover:text-[#e05d00] transition cursor-pointer">
                View all
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mt-0.5">
              {topGainers.map((gainer) => (
                <div key={gainer.rank} className="flex items-center justify-between border-b border-border-card/45 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[12.5px] font-bold text-[#10b981]">
                      +{gainer.rank}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${gainer.avatarBg}`}>
                      {gainer.avatarChar}
                    </div>
                    <span className="text-[12.5px] font-semibold text-text-primary truncate max-w-[140px] tracking-[-0.01em]">
                      {gainer.username}
                    </span>
                  </div>
                  <span className="text-[11.5px] font-extrabold text-[#10b981]">
                    {gainer.diff}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Filters Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[320px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Filters
              </span>
              <button 
                onClick={() => showToast("Filters reset successfully.", "info")}
                className="text-[11px] font-semibold text-brand-orange hover:text-[#e05d00] transition cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Country Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Country</span>
                <button className="w-full flex items-center justify-between border border-border-card rounded-xl px-3.5 py-2 bg-bg-page text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-text-secondary" />
                    <span>All Countries</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                </button>
              </div>

              {/* Time Period Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Time Period</span>
                <button className="w-full flex items-center justify-between border border-border-card rounded-xl px-3.5 py-2 bg-bg-page text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span>Overall</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                </button>
              </div>

              {/* Platform Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Platform</span>
                <button className="w-full flex items-center justify-between border border-border-card rounded-xl px-3.5 py-2 bg-bg-page text-[12.5px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-text-secondary" />
                    <span>All Platforms</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* Info Card bottom */}
          <DashboardCard className="p-5 flex items-start gap-3.5 select-none shrink-0 text-left">
            <Info className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-text-primary leading-none">Leaderboard updates</span>
              <p className="text-[11.5px] text-text-secondary font-medium leading-relaxed mt-2">
                Leaderboard is updated every 15 minutes. Keep solving to improve your rank!
              </p>
            </div>
          </DashboardCard>

        </div>
      </SectionWrapper>
    </ContentContainer>
  );
}

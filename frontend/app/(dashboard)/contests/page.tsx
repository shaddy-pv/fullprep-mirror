"use client";

import React, { useState } from "react";
import { Zap, Calendar, TrendingUp, Trophy, Award, Search, HelpCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import DashboardCard from "@/components/ui/DashboardCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Button from "@/components/ui/Button";
import ContestCard from "@/components/contests/ContestCard";
import RatingTrendChart from "@/components/contests/RatingTrendChart";

export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState("All Contests");
  const [searchVal, setSearchVal] = useState("");

  const tabs = ["All Contests", "Upcoming", "Live", "Completed", "Participated"];

  // Mock stats (same colors and gaps as Dashboard stats)
  const stats = [
    {
      title: "Contests Participated",
      value: "24",
      subtext: "+14 this month",
      subtextColor: "text-[#10b981]",
      icon: Zap,
      iconColor: "text-brand-orange",
      bgColor: "bg-[#fff3eb] dark:bg-[#ff6a00]/10",
    },
    {
      title: "Global Rank",
      value: "#2,142",
      subtext: "↑ 512 rankings",
      subtextColor: "text-[#10b981]",
      icon: Trophy,
      iconColor: "text-[#8b5cf6]",
      bgColor: "bg-[#f5f3ff] dark:bg-[#8b5cf6]/10",
    },
    {
      title: "Rating",
      value: "1867",
      subtext: "↑ 86 points",
      subtextColor: "text-[#10b981]",
      icon: TrendingUp,
      iconColor: "text-[#10b981]",
      bgColor: "bg-[#eafaf1] dark:bg-[#10b981]/10",
    },
    {
      title: "Highest Rank",
      value: "#1,028",
      subtext: "Weekly Contest 398",
      subtextColor: "text-[#3b82f6]",
      icon: Award,
      iconColor: "text-[#3b82f6]",
      bgColor: "bg-[#eff6ff] dark:bg-[#3b82f6]/10",
    },
  ];

  // Mock contest list (with countdown seconds)
  const contests = [
    {
      id: "wc-406",
      title: "Weekly Contest 406",
      date: "May 18, 2025 (Sun)",
      timeRange: "8:00 PM - 10:30 PM IST",
      duration: "2.5 Hrs",
      tags: ["Array", "String", "DP"],
      initialSecondsLeft: 2 * 24 * 3600 + 14 * 3600 + 36 * 60,
      featured: true,
      type: "Rated" as const,
    },
    {
      id: "bc-148",
      title: "Biweekly Contest 148",
      date: "May 24, 2025 (Sat)",
      timeRange: "8:00 PM - 10:00 PM IST",
      duration: "2 Hrs",
      tags: ["Searching", "Tree", "Graph"],
      initialSecondsLeft: 8 * 24 * 3600 + 14 * 3600 + 36 * 60,
      featured: false,
      type: "Rated" as const,
    },
    {
      id: "cs-15",
      title: "CodeSprint 15",
      date: "May 31, 2025 (Sat)",
      timeRange: "6:00 PM - 9:00 PM IST",
      duration: "3 Hrs",
      tags: ["Design", "Stack", "Recursion"],
      initialSecondsLeft: 15 * 24 * 3600 + 12 * 3600 + 36 * 60,
      featured: false,
      type: "Practice" as const,
    },
    {
      id: "fpmc-1",
      title: "FullPrep Monthly Championship",
      date: "Jun 07, 2025 (Sat)",
      timeRange: "7:00 PM - 11:00 PM IST",
      duration: "4 Hrs",
      tags: ["Algorithms", "DP", "Math"],
      initialSecondsLeft: 22 * 24 * 3600 + 13 * 3600 + 36 * 60,
      featured: false,
      type: "Rated" as const,
    },
  ];

  // Mock Performance records
  const performance = [
    { name: "Weekly Contest 405", rank: "#1,256", diff: "+86", positive: true },
    { name: "Biweekly Contest 147", rank: "#2,341", diff: "+23", positive: true },
    { name: "Weekly Contest 404", rank: "#1,987", diff: "-54", positive: false },
    { name: "CodeSprint 14", rank: "#892", diff: "+120", positive: true },
  ];

  // Filtered contests
  const filteredContests = contests.filter((c) =>
    c.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <ContentContainer>
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 select-none">
        <PageHeader
          title="Contests"
          description="Compete, improve and climb the rankings"
        />
        <Button 
          variant="secondary" 
          className="self-start py-2.5 px-4 font-bold border border-border-card text-[13px]"
          onClick={() => {}}
        >
          <Calendar className="w-4 h-4 text-brand-orange" />
          <span>Contest Calendar</span>
        </Button>
      </div>

      <div className="relative group w-full flex flex-col mt-2">
        <div className="absolute inset-0 bg-bg-page/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <span className="px-4 py-2 rounded-xl bg-card-bg border border-border-card text-[14px] font-bold text-brand-orange shadow-xl">Coming Soon</span>
        </div>

        <div className="w-full flex flex-col select-none opacity-60 pointer-events-none">
          {/* Reusable Tab Component layout with matching slide underlines */}
          <div className="flex border-b border-border-card mb-6 gap-6 select-none overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 whitespace-nowrap ${
                isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="contestsTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-orange rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full shrink-0 mb-6 select-none">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <DashboardCard key={idx} animate className="p-5 flex items-center gap-4.5">
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${stat.iconColor} stroke-[2]`} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-medium text-text-secondary tracking-[-0.01em]">
                  {stat.title}
                </span>
                <span className="text-[24px] font-bold text-text-primary mt-0.5 leading-none tracking-[-0.02em]">
                  {stat.value}
                </span>
                <span className={`text-[11px] font-semibold mt-1.5 ${stat.subtextColor} tracking-[-0.01em]`}>
                  {stat.subtext}
                </span>
              </div>
            </DashboardCard>
          );
        })}
      </div>

      {/* Main contests section layout */}
      <SectionWrapper>
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start mt-2">
            {/* Left Column: Contests Catalog */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              
              {/* Header search input bar */}
              <div className="w-full flex items-center bg-white dark:bg-[#11131c] border border-border-card rounded-xl px-4 py-3 shadow-sm focus-within:border-[#ff6a00]/50 transition-all select-none">
                <Search className="w-4.5 h-4.5 text-[#9ca3af] shrink-0" />
                <input
                  type="text"
                  placeholder="Search contests..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full ml-3 bg-transparent text-text-primary text-[13.5px] font-medium focus:outline-none placeholder-[#9ca3af]/60"
                />
              </div>

              <h2 className="text-[16px] font-bold text-text-primary text-left select-none -mb-1 mt-1">
                Upcoming Contests
              </h2>

              {/* Catalog list */}
              <div className="flex flex-col gap-4">
                <ErrorBoundary>
                  {filteredContests.length > 0 ? (
                    filteredContests.map((c) => (
                      <ContestCard
                        key={c.id}
                        id={c.id}
                        title={c.title}
                        date={c.date}
                        timeRange={c.timeRange}
                        duration={c.duration}
                        tags={c.tags}
                        initialSecondsLeft={c.initialSecondsLeft}
                        featured={c.featured}
                        type={c.type}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-text-secondary border border-border-card bg-white dark:bg-[#11131c] rounded-[24px]">
                      No upcoming contests found.
                    </div>
                  )}
                </ErrorBoundary>
              </div>

              {/* Footer View All */}
              <div className="flex justify-center select-none mt-2">
                <Button variant="secondary" className="py-2.5 font-bold border border-border-card text-[13px]">
                  <span>View All Contests</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

            </div>

            {/* Right Sidebar Column with strict matching width constraints */}
            <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
              
              {/* Rating chart Card */}
              <ErrorBoundary>
                <RatingTrendChart />
              </ErrorBoundary>

              {/* Recent Performance card matching exact margins and paddings */}
              <DashboardCard className="p-5 flex flex-col justify-between h-[260px] shadow-sm select-none text-left">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                    Recent Performance
                  </span>
                  <button className="text-[11px] font-semibold text-brand-orange hover:text-[#e05d00] transition cursor-pointer">
                    View all
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 mt-0.5">
                  {performance.map((record, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between border-b border-border-card/45 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12.5px] font-semibold text-text-primary">
                          {record.name}
                        </span>
                        <span className="text-[11px] text-text-secondary font-medium mt-0.5">
                          Rank {record.rank}
                        </span>
                      </div>
                      <span className={`text-[12px] font-bold ${
                        record.positive ? "text-[#10b981]" : "text-red-500"
                      }`}>
                        {record.diff}
                      </span>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              {/* Contest Tips Card */}
              <DashboardCard className="p-5 flex flex-col justify-between h-[250px] shadow-sm select-none text-left">
                <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em] mb-4">
                  Contest Tips
                </span>

                <div className="flex flex-col gap-3.5 mt-0.5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-semibold text-text-primary leading-none">Read problems carefully</span>
                      <span className="text-[11.5px] text-text-secondary mt-1.5 leading-normal">Understanding is key to solving</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-semibold text-text-primary leading-none">Manage your time well</span>
                      <span className="text-[11.5px] text-text-secondary mt-1.5 leading-normal">Don&apos;t get stuck on one problem</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#8b5cf6] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-semibold text-text-primary leading-none">Practice regularly</span>
                      <span className="text-[11.5px] text-text-secondary mt-1.5 leading-normal">Consistency leads to improvement</span>
                    </div>
                  </div>
                </div>

                <button className="text-[11px] font-semibold text-brand-orange hover:text-[#e05d00] transition cursor-pointer self-start mt-4 flex items-center gap-1 group">
                  <span>View all tips</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </DashboardCard>

            </div>
          </div>
      </SectionWrapper>
        </div>
      </div>
    </ContentContainer>
  );
}

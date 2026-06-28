"use client";

import React, { useState, useEffect } from "react";
import { Zap, Calendar, TrendingUp, Trophy, Award, Search, HelpCircle, ChevronRight, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import DashboardCard from "@/components/ui/DashboardCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Button from "@/components/ui/Button";
import ContestCard from "@/components/contests/ContestCard";
import RatingTrendChart from "@/components/contests/RatingTrendChart";
import { ContestsService, ContestData } from "@/services/contests.service";
import { useAuthStore } from "@/store/authStore";



export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState("All Contests");
  const [searchVal, setSearchVal] = useState("");
  const { user } = useAuthStore();

  const [dailyContest, setDailyContest] = useState<ContestData | null>(null);
  const [weeklyContest, setWeeklyContest] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs = ["All Contests", "Upcoming", "Live", "Completed", "Participated"];

  useEffect(() => {
    async function loadContests() {
      try {
        const [daily, weekly] = await Promise.all([
          ContestsService.getDailyContest(),
          ContestsService.getWeeklyContest()
        ]);
        setDailyContest(daily);
        setWeeklyContest(weekly);
      } catch (_err) {
        console.error("Failed to load contests:", _err);
      } finally {
        setLoading(false);
      }
    }
    loadContests();
  }, []);

  const stats = [
    {
      title: "Contests Participated",
      value: user?.contestsParticipated?.toString() || "0",
      subtext: "Total",
      subtextColor: "text-[#10b981]",
      icon: Zap,
      iconColor: "text-brand-orange",
      bgColor: "bg-[#fff3eb] dark:bg-[#ff6a00]/10",
    },
    {
      title: "Global Rank",
      value: "N/A",
      subtext: "Unranked",
      subtextColor: "text-[#9ca3af]",
      icon: Trophy,
      iconColor: "text-[#8b5cf6]",
      bgColor: "bg-[#f5f3ff] dark:bg-[#8b5cf6]/10",
    },
    {
      title: "Rating",
      value: (!user?.contestsParticipated || user.contestsParticipated === 0) ? "0" : (user.contestRating?.toString() ?? "0"),
      subtext: "Current",
      subtextColor: "text-[#10b981]",
      icon: TrendingUp,
      iconColor: "text-[#10b981]",
      bgColor: "bg-[#eafaf1] dark:bg-[#10b981]/10",
    },
    {
      title: "Highest Rank",
      value: user?.highestRank ? `#${user.highestRank}` : "N/A",
      subtext: "All Time",
      subtextColor: "text-[#3b82f6]",
      icon: Award,
      iconColor: "text-[#3b82f6]",
      bgColor: "bg-[#eff6ff] dark:bg-[#3b82f6]/10",
    },
  ];

  const buildContestCards = () => {
    const list = [];
    const now = new Date();

    // Daily: counts down to midnight tonight
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const dailySecondsLeft = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));

    // Weekly: active ONLY on weekdays (Monday to Friday)
    let weeklySecondsLeft = 0;
    let weeklyStatus: "live" | "upcoming" = "upcoming";
    
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (isWeekday) {
      // Currently live, count down to Friday 23:59:59
      const endOfWeekday = new Date();
      const daysToFriday = 5 - dayOfWeek;
      endOfWeekday.setDate(endOfWeekday.getDate() + daysToFriday);
      endOfWeekday.setHours(23, 59, 59, 999);
      weeklySecondsLeft = Math.max(0, Math.floor((endOfWeekday.getTime() - now.getTime()) / 1000));
      weeklyStatus = "live";
    } else {
      // It's the weekend, upcoming! Count down to Monday 00:00:00
      const startOfWeekday = new Date();
      const daysToMonday = dayOfWeek === 6 ? 2 : 1; // if Sat, +2 days; if Sun, +1 day
      startOfWeekday.setDate(startOfWeekday.getDate() + daysToMonday);
      startOfWeekday.setHours(0, 0, 0, 0);
      weeklySecondsLeft = Math.max(0, Math.floor((startOfWeekday.getTime() - now.getTime()) / 1000));
      weeklyStatus = "upcoming";
    }

    if (dailyContest && dailyContest.problem) {
      list.push({
        id: dailyContest.id,
        title: dailyContest.title,
        date: "Today",
        timeRange: "All Day",
        duration: "24 Hrs",
        tags: dailyContest.problem.tags?.slice(0, 3) || ["Daily"],
        initialSecondsLeft: dailySecondsLeft,
        featured: true,
        type: "Rated" as const,
        slug: dailyContest.problem.slug,
        status: "live",
      });
    }
    if (weeklyContest && weeklyContest.problems?.length) {
      list.push({
        id: weeklyContest.id,
        title: weeklyContest.title,
        date: "This Week",
        timeRange: "Anytime",
        duration: "1.5 Hrs",
        tags: ["Weekly", "Competition"],
        initialSecondsLeft: weeklySecondsLeft,
        featured: false,
        type: "Rated" as const,
        slug: weeklyContest.problems[0].slug,
        status: weeklyStatus,
      });
    }
    return list;
  };

  const contestsList = buildContestCards();

  const tabFilteredContests = contestsList.filter((c) => {
    if (activeTab === "All Contests") return true;
    if (activeTab === "Live") return true; // Daily and weekly are currently active
    if (activeTab === "Upcoming") return false; // None are strictly upcoming in this mock
    if (activeTab === "Completed") return false;
    if (activeTab === "Participated") return false; // To be implemented with real user history
    return true;
  });

  const filteredContests = tabFilteredContests.filter((c) =>
    c.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    c.tags.some((t: string) => t.toLowerCase().includes(searchVal.toLowerCase()))
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

      <div className="w-full flex flex-col mt-2">
        <div className="w-full flex flex-col select-none">
          {/* Reusable Tab Component layout */}
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
                  {activeTab === "All Contests" ? "Upcoming Contests" : `${activeTab} Contests`}
                </h2>

                {/* Catalog list */}
                <div className="flex flex-col gap-4">
                  <ErrorBoundary>
                    {loading ? (
                      <div className="p-12 flex justify-center text-text-secondary border border-border-card bg-white dark:bg-[#11131c] rounded-[24px]">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                      </div>
                    ) : filteredContests.length > 0 ? (
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
                          slug={c.slug}
                        />
                      ))
                    ) : (
                      <div className="p-12 text-center text-text-secondary border border-border-card bg-white dark:bg-[#11131c] rounded-[24px]">
                        No {activeTab.toLowerCase()} contests found.
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

              {/* Right Sidebar Column */}
              <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
                
                {/* Rating chart Card */}
                <ErrorBoundary>
                  <RatingTrendChart />
                </ErrorBoundary>

                {/* Contest Tips Card */}
                <DashboardCard className="p-5 flex flex-col justify-between h-[250px] shadow-sm select-none text-left">
                  <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em] mb-4">
                    Pro Tips
                  </span>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 bg-brand-orange/[0.04] p-3 rounded-xl border border-brand-orange/10">
                      <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-brand-orange" />
                      </div>
                      <p className="text-[12px] text-text-secondary leading-relaxed">
                        Read all problems before starting. Often the second problem is easier than you think!
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-brand-orange/[0.04] p-3 rounded-xl border border-brand-orange/10">
                      <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-brand-orange" />
                      </div>
                      <p className="text-[12px] text-text-secondary leading-relaxed">
                        Don&apos;t get stuck. If you spend &gt;30 mins on a bug, move to the next problem.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-card flex items-center gap-2 text-[12px] text-brand-orange hover:text-[#e05d00] font-semibold cursor-pointer transition-colors w-fit">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>View full guide</span>
                  </div>
                </DashboardCard>
                
              </div>
          </div>
        </SectionWrapper>
      </div>
    </ContentContainer>
  );
}

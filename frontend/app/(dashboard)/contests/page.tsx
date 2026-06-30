"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Zap, Calendar, TrendingUp, Trophy, Award, Search,
  HelpCircle, ChevronRight, Loader2, Clock, ExternalLink,
  RefreshCw, AlertCircle, Code, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
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
import { useNotificationStore } from "@/store/notificationStore";

// ── Platform colour mapping ──────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Codnite:    "bg-[#ff6a00]/10 text-[#ff6a00] border border-[#ff6a00]/20",
  Codeforces: "bg-blue-500/10 text-blue-400 border border-blue-400/20",
  LeetCode:   "bg-yellow-500/10 text-yellow-400 border border-yellow-400/20",
  AtCoder:    "bg-purple-500/10 text-purple-400 border border-purple-400/20",
  HackerRank: "bg-green-500/10 text-green-400 border border-green-400/20",
  CodeChef:   "bg-amber-500/10 text-amber-400 border border-amber-400/20",
  Other:      "bg-gray-500/10 text-gray-400 border border-gray-400/20",
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    live:      "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20",
    upcoming:  "bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20",
    completed: "bg-gray-500/10 text-gray-400 border border-gray-400/20",
  };
  const label: Record<string, string> = {
    live: "● LIVE", upcoming: "⬆ UPCOMING", completed: "✓ ENDED",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || map.completed}`}>
      {label[status] || status}
    </span>
  );
}

// ── Custom Contest Card ──────────────────────────────────────────────────────
function CalendarContestCard({ contest }: { contest: any }) {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const isLive = now >= start && now <= end;
  const isUpcoming = now < start;
  const status = isLive ? "live" : isUpcoming ? "upcoming" : "completed";

  const platformColor = PLATFORM_COLORS[contest.platform] || PLATFORM_COLORS.Other;

  const durationMs = end.getTime() - start.getTime();
  const durationHrs = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
  const durationStr = durationHrs >= 24
    ? `${Math.round(durationHrs / 24)}d`
    : `${durationHrs}h`;

  const dateStr = start.toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#11131c] border border-border-card rounded-[20px] p-5 shadow-sm hover:shadow-md hover:border-brand-orange/30 transition-all"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusPill status={status} />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${platformColor}`}>
              {contest.platform || "Codnite"}
            </span>
          </div>
          <h3 className="text-[14px] font-bold text-text-primary leading-snug truncate">
            {contest.title}
          </h3>
        </div>
        {contest.registrationUrl && (
          <a
            href={contest.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange text-white text-[11px] font-bold hover:bg-[#e05d00] transition-colors"
          >
            Register <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Description */}
      {contest.description && (
        <p className="text-[12px] text-text-secondary leading-relaxed mb-3 line-clamp-2">
          {contest.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-[11.5px] text-text-secondary flex-wrap">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-brand-orange" />
          {dateStr}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          {timeStr}
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-brand-orange" />
          {durationStr}
        </span>
        {contest.problems?.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-brand-orange" />
            {contest.problems.length} problem{contest.problems.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState("All Contests");
  const [searchVal, setSearchVal] = useState("");
  const { user } = useAuthStore();
  const showToast = useNotificationStore((s) => s.showToast);

  const [dailyContest, setDailyContest] = useState<ContestData | null>(null);
  const [weeklyContest, setWeeklyContest] = useState<ContestData | null>(null);
  const [calendarContests, setCalendarContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ["All Contests", "Live", "Upcoming", "Completed"];

  const loadContests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [daily, weekly, allContests] = await Promise.allSettled([
        ContestsService.getDailyContest(),
        ContestsService.getWeeklyContest(),
        ContestsService.getAllContests(),
      ]);

      if (daily.status === "fulfilled") setDailyContest(daily.value);
      if (weekly.status === "fulfilled") setWeeklyContest(weekly.value);
      if (allContests.status === "fulfilled") {
        setCalendarContests(allContests.value || []);
      }
    } catch (err) {
      console.error("Failed to load contests:", err);
      setError("Failed to load contests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContests();
  }, [loadContests]);

  // ── Stats ──────────────────────────────────────────────────────────────────
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
      value: (!user?.contestsParticipated || user.contestsParticipated === 0)
        ? "0"
        : (user.contestRating?.toString() ?? "0"),
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

  // ── Daily / Weekly contest cards ───────────────────────────────────────────
  const buildSystemContestCards = () => {
    const list: any[] = [];
    const now = new Date();

    // Daily
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const dailySecondsLeft = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));

    if (dailyContest?.problem) {
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

    // Weekly
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let weeklySecondsLeft = 0;
    let weeklyStatus: "live" | "upcoming" = "upcoming";

    if (isWeekend) {
      const endOfWeekend = new Date();
      const daysToSunday = dayOfWeek === 6 ? 1 : 0;
      endOfWeekend.setDate(endOfWeekend.getDate() + daysToSunday);
      endOfWeekend.setHours(23, 59, 59, 999);
      weeklySecondsLeft = Math.max(0, Math.floor((endOfWeekend.getTime() - now.getTime()) / 1000));
      weeklyStatus = "live";
    } else {
      const startOfWeekend = new Date();
      const daysToSaturday = 6 - dayOfWeek;
      startOfWeekend.setDate(startOfWeekend.getDate() + daysToSaturday);
      startOfWeekend.setHours(0, 0, 0, 0);
      weeklySecondsLeft = Math.max(0, Math.floor((startOfWeekend.getTime() - now.getTime()) / 1000));
    }

    if (weeklyContest?.problems?.length) {
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

  // ── Filter calendar contests ───────────────────────────────────────────────
  const now = new Date();
  const filteredCalendarContests = calendarContests
    .filter((c) => {
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      const isLive = now >= start && now <= end;
      const isUpcoming = now < start;
      const isCompleted = now > end;

      const matchesSearch =
        (c.title || "").toLowerCase().includes(searchVal.toLowerCase()) ||
        (c.platform || "").toLowerCase().includes(searchVal.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchVal.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === "All Contests") return true;
      if (activeTab === "Live") return isLive;
      if (activeTab === "Upcoming") return isUpcoming;
      if (activeTab === "Completed") return isCompleted;
      return true;
    })
    .sort((a, b) => {
      // Sort: live first, then upcoming, then completed
      const getOrder = (c: any) => {
        const s = new Date(c.startTime);
        const e = new Date(c.endTime);
        if (now >= s && now <= e) return 0;
        if (now < s) return 1;
        return 2;
      };
      const oa = getOrder(a), ob = getOrder(b);
      if (oa !== ob) return oa - ob;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  const systemCards = buildSystemContestCards();
  const systemFiltered = systemCards.filter((c) => {
    const matchSearch =
      (c.title || "").toLowerCase().includes(searchVal.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === "All Contests") return true;
    if (activeTab === "Live") return c.status === "live";
    if (activeTab === "Upcoming") return c.status === "upcoming";
    if (activeTab === "Completed") return false;
    return true;
  });

  // Live contest count badge
  const liveCount = calendarContests.filter(c => {
    const s = new Date(c.startTime), e = new Date(c.endTime);
    return now >= s && now <= e;
  }).length;

  return (
    <ContentContainer>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 select-none">
        <PageHeader
          title="Contests"
          description="Compete, improve and climb the rankings"
        />
        <div className="flex items-center gap-2 self-start">
          <Button
            variant="secondary"
            className="py-2.5 px-4 font-bold border border-border-card text-[13px]"
            onClick={loadContests}
          >
            <RefreshCw className="w-4 h-4 text-brand-orange" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col mt-2">
        {/* Tabs */}
        <div className="flex border-b border-border-card mb-6 gap-6 select-none overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
                {tab === "Live" && liveCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold">
                    {liveCount}
                  </span>
                )}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full shrink-0 mb-6 select-none">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <DashboardCard key={idx} animate className="p-5 flex items-center gap-4">
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

        {/* Main section */}
        <SectionWrapper>
          <div className="w-full flex flex-col lg:flex-row gap-6 items-start mt-2">

            {/* Left: Contest Catalog */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">

              {/* Search */}
              <div className="w-full flex items-center bg-white dark:bg-[#11131c] border border-border-card rounded-xl px-4 py-3 shadow-sm focus-within:border-[#ff6a00]/50 transition-all select-none">
                <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                <input
                  type="text"
                  placeholder="Search contests by name, platform..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full ml-3 bg-transparent text-text-primary text-[13.5px] font-medium focus:outline-none placeholder-[#9ca3af]/60"
                />
              </div>

              {/* System contests (daily/weekly) */}
              {systemFiltered.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-[14px] font-bold text-text-primary text-left select-none flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-orange" />
                    System Contests
                  </h2>
                  <ErrorBoundary>
                    {systemFiltered.map((c) => (
                      <ContestCard
                        key={c.id}
                        id={c.id || ""}
                        title={c.title || ""}
                        date={c.date}
                        timeRange={c.timeRange}
                        duration={c.duration}
                        tags={c.tags || []}
                        initialSecondsLeft={c.initialSecondsLeft}
                        featured={c.featured}
                        type={c.type}
                        slug={c.slug}
                      />
                    ))}
                  </ErrorBoundary>
                </div>
              )}

              {/* Admin-created calendar contests */}
              <div className="flex flex-col gap-3">
                <h2 className="text-[14px] font-bold text-text-primary text-left select-none flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-orange" />
                  Contest Calendar
                  <span className="text-[11px] text-text-secondary font-normal">
                    ({filteredCalendarContests.length} contest{filteredCalendarContests.length !== 1 ? "s" : ""})
                  </span>
                </h2>

                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-text-secondary border border-border-card bg-white dark:bg-[#11131c] rounded-[24px]">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                    <span className="text-[13px] font-medium">Loading contests...</span>
                  </div>
                ) : error ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 border border-border-card bg-white dark:bg-[#11131c] rounded-[24px]">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <span className="text-[13px] font-medium text-red-400">{error}</span>
                    <button
                      onClick={loadContests}
                      className="flex items-center gap-1.5 text-[12px] text-brand-orange hover:text-[#e05d00] font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  </div>
                ) : filteredCalendarContests.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {filteredCalendarContests.map((c) => (
                      <CalendarContestCard key={c._id || c.id} contest={c} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border border-border-card bg-white dark:bg-[#11131c] rounded-[24px] flex flex-col items-center gap-3">
                    <Calendar className="w-8 h-8 text-text-secondary/40" />
                    <div>
                      <p className="text-[14px] font-semibold text-text-primary">
                        {activeTab === "All Contests"
                          ? "No contests available"
                          : `No ${activeTab.toLowerCase()} contests`}
                      </p>
                      <p className="text-[12px] text-text-secondary mt-1">
                        {activeTab === "All Contests"
                          ? "Admin will add upcoming contests soon."
                          : `Check the All Contests tab to see more.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">

              {/* Rating Chart */}
              <ErrorBoundary>
                <RatingTrendChart />
              </ErrorBoundary>

              {/* Contest Tips */}
              <DashboardCard className="p-5 flex flex-col justify-between shadow-sm select-none text-left">
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

                  <div className="flex items-start gap-3 bg-brand-orange/[0.04] p-3 rounded-xl border border-brand-orange/10">
                    <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                    </div>
                    <p className="text-[12px] text-text-secondary leading-relaxed">
                      Participate consistently — even if you don&apos;t finish, the exposure improves your speed.
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

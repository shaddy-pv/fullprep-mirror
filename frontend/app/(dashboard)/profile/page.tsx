"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  ChevronDown,
  Trophy,
  Award,
  Zap,
  Code2,
  Activity,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import ContentContainer from "@/components/layout/ContentContainer";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore, getCurrentStreak } from "@/store/authStore";
import { AuthService } from "@/services/auth.service";
import { ProblemsService } from "@/services/problems.service";
import { BookmarksService } from "@/services/bookmarks.service";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Inline SVG Icons — social handles
   ───────────────────────────────────────────── */

const GithubIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* Colored language logos */
const PythonLogo = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pyA" x1="12.96%" y1="12.07%" x2="79.64%" y2="78.8%">
        <stop offset="0%" stopColor="#387EB8" />
        <stop offset="100%" stopColor="#366994" />
      </linearGradient>
      <linearGradient id="pyB" x1="19.13%" y1="20.58%" x2="90.43%" y2="88.01%">
        <stop offset="0%" stopColor="#FFC836" />
        <stop offset="100%" stopColor="#FFD43B" />
      </linearGradient>
    </defs>
    <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 1 1 0 22.24 11.12 11.12 0 0 1 0-22.24z" fill="url(#pyA)" />
    <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.746h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.52 33.897zm34.114-19.586a11.12 11.12 0 1 1 0-22.24 11.12 11.12 0 0 1 0 22.24z" fill="url(#pyB)" />
  </svg>
);

const CppLogo = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.2 2.2l10.8-3.4 10.8 3.4v10.5l-10.8 9.1L1.2 12.7V2.2z" fill="#00599C" />
    <path d="M12 1.1v20l8.7-7.4V3.9L12 1.1z" fill="#0080CD" />
    <path d="M12.5 5.5h-1.5c-3.1 0-4.5 2-4.5 4.5s1.4 4.5 4.5 4.5h1.5v-2.2h-1.5c-1.8 0-2.3-1-2.3-2.3s.5-2.3 2.3-2.3h1.5V5.5z" fill="#FFFFFF" />
    <path d="M16 8.5v1.2h-1.2v1.2H16v1.2h1.2v-1.2H18.4V9.7H17.2V8.5H16zM20.5 8.5v1.2h-1.2v1.2h1.2v1.2h1.2v-1.2h1.2V9.7H21.7V8.5h-1.2z" fill="#FFFFFF" />
  </svg>
);

const JavaLogo = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 14.5c.2-1.5.8-2.5 1.8-3.5 1.5-1.5 2.5-3 1.8-5-.5-1.5-1.8-2.5-2.5-3.5 1.8.2 3 .8 3.8 1.8 1.2 1.5 1.2 3.5.2 5.2-.8 1.2-1.8 2.2-1.8 3.5s.5 2 1.5 2.5c-2.3-.2-3.8-1.5-4.8-1z" fill="#E41F23" />
    <path d="M9.5 11c.2-1 .5-2 1.2-2.8.8-.8 1.5-1.8 1.2-3-.3-1-.8-1.8-1.2-2.5 1 .2 1.8.5 2.2 1.2.8 1 .8 2.2.2 3.2-.5.8-1.2 1.5-1.2 2.2s.3 1.2.8 1.5c-1.4-.2-2.3-1-2.9-1z" fill="#F05B26" />
    <path d="M1.5 18.5c2.5-.2 5-.8 7.5-.8 3.5 0 7 .8 10.5 1 2.3.2 4.5-.5 5.5-2.5-1.2 1.8-3.5 2-5.5 1.8-3.5-.2-7-1-10.5-1-2.5 0-5 .5-7.5.8C1 18 1 18.2 1.5 18.5z" fill="#5382A1" />
    <path d="M4 14.5c.5-.2 1.2-.5 1.8-.5 2 0 4 .5 6 .8 2 .2 4.5-.2 5-2.2-.5 1.8-2.5 2-4.5 1.8-2-.2-4-.8-6-.8-.8 0-1.5.2-2 .5 0 .2-.1.3-.3.4z" fill="#5382A1" />
    <path d="M2.5 21.5c1.8-.2 3.8-.5 5.5-.5 2.8 0 5.5.5 8.2.8 1.8.2 3.5-.5 4.5-2-.8 1.5-2.5 1.8-4.2 1.5-2.8-.2-5.5-.8-8.2-.8-1.8 0-3.8.3-5.5.5-.2 0-.3.2-.3.5z" fill="#0074BD" />
  </svg>
);

const JavaScriptLogo = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#F7DF1E" />
    <path d="M12.2 18.5c.3.5.7.8 1.3 1 .6.2 1.1.3 1.7.3.7 0 1.2-.1 1.6-.4.4-.3.6-.7.6-1.3 0-.5-.2-.9-.5-1.1s-.8-.5-1.5-.7c-.8-.3-1.4-.5-1.8-.8s-.7-.6-.9-1c-.2-.4-.3-.9-.3-1.5 0-.8.3-1.5.8-2 .5-.5 1.3-.8 2.3-.8 1 0 1.8.3 2.3.9.5.6.8 1.3.8 2.2h-2.5c0-.5-.1-.8-.3-1s-.6-.3-1.1-.3c-.5 0-.8.1-1 .3s-.3.5-.3.8c0 .3.1.6.4.8.3.2.7.4 1.3.6 1 .3 1.7.6 2.1 1s.7.9.7 1.6c0 .9-.3 1.6-.9 2.2-.6.6-1.5.9-2.7.9-1.2 0-2.1-.3-2.7-1-.6-.6-.9-1.5-.9-2.6H12.2zM6.5 18.5c0 .6.2.9.5 1.1.3.2.8.3 1.4.3.5 0 .9-.1 1.2-.3.3-.2.5-.6.5-1.2V9.8h2.5V19c0 1.2-.4 2.2-1.1 2.8-.7.6-1.8.9-3.2.9-1.3 0-2.3-.3-3-.9-.7-.6-1.1-1.5-1.1-2.8h2.5z" fill="#000000" />
  </svg>
);

/* ─────────────────────────────────────────────
   Hexagonal Badge Component
   ───────────────────────────────────────────── */

interface HexBadgeProps {
  color: "gold" | "orange" | "red" | "teal" | "green" | "purple";
  title: string;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const HexagonBadge: React.FC<HexBadgeProps> = ({ color, title, subtitle, icon: IconComponent }) => {
  const colorMap: Record<string, { stroke: string; glow: string }> = {
    gold:   { stroke: "#eab308", glow: "rgba(234,179,8,0.22)" },
    orange: { stroke: "#ff6a00", glow: "rgba(255,106,0,0.22)" },
    red:    { stroke: "#f43f5e", glow: "rgba(244,63,94,0.22)" },
    teal:   { stroke: "#14b8a6", glow: "rgba(20,184,166,0.22)" },
    green:  { stroke: "#10b981", glow: "rgba(16,185,129,0.22)" },
    purple: { stroke: "#8b5cf6", glow: "rgba(139,92,246,0.22)" },
  };

  const { stroke: strokeColor, glow: glowColor } = colorMap[color];
  const gradientId = `grad-${color}`;
  const innerGradientId = `inner-${color}`;

  return (
    <div className="flex flex-col items-center justify-start select-none group cursor-pointer w-full text-center">
      <div
        className="w-[56px] h-[64px] flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105 shrink-0"
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 106" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="metallicDark" x1="50" y1="0" x2="50" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e2230" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#12141c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0a0b10" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor={strokeColor} />
              <stop offset="70%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id={innerGradientId} x1="50" y1="11" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M 50 3 L 93.3 28 L 93.3 78 L 50 103 L 6.7 78 L 6.7 28 Z" fill="url(#metallicDark)" stroke={`url(#${gradientId})`} strokeWidth="3" />
          <path d="M 50 11 L 86.4 32 L 86.4 74 L 50 95 L 13.6 74 L 13.6 32 Z" stroke={`url(#${innerGradientId})`} strokeWidth="1.2" fill="none" />
          <path d="M 6.7 28 C 20 16, 80 16, 93.3 28 L 93.3 28 L 50 3 L 6.7 28 Z" fill="#ffffff" fillOpacity="0.04" />
        </svg>
        <div className="relative z-10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 drop-shadow-sm animate-pulse-slow" style={{ color: strokeColor }} />
        </div>
      </div>
      <div className="flex flex-col items-center mt-3 w-full gap-1">
        <span className="text-[11px] font-semibold text-text-primary leading-none tracking-tight truncate max-w-[90px] group-hover:text-brand-orange transition-colors">{title}</span>
        <span className="text-[9px] text-text-secondary/60 font-medium uppercase tracking-wider leading-none">{subtitle}</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Profile Page
   ───────────────────────────────────────────── */

export default function ProfilePage() {
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [bookmarkedProblems, setBookmarkedProblems] = useState<any[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Settings Tab states
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("India");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        const validTabs = ["overview", "stats", "activity", "submissions", "bookmarks", "settings"];
        if (tabParam && validTabs.includes(tabParam)) {
          setActiveTab(tabParam);
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    async function loadStats() {
      try {
        const [stats, db, subs] = await Promise.all([
          AuthService.getStats(),
          ProblemsService.getStats(),
          AuthService.getSubmissions(1, 10),
        ]);
        if (stats) setStatsData(stats);
        if (db) setDbStats(db);
        if (subs && subs.data) setRecentSubmissions(subs.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    loadStats();
  }, [mounted]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    async function loadBookmarks() {
      setLoadingBookmarks(true);
      try {
        const bookmarks = await BookmarksService.getBookmarkedProblems();
        setBookmarkedProblems(bookmarks);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoadingBookmarks(false);
      }
    }
    loadBookmarks();
  }, [mounted, activeTab]);

  if (!mounted) {
    return <div className="min-h-screen bg-bg-page" />;
  }

  /* ── Data ── */

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "stats", name: "Stats" },
    { id: "activity", name: "Activity" },
    { id: "submissions", name: "Submissions" },
    { id: "bookmarks", name: "Bookmarks" },
    { id: "settings", name: "Settings" },
  ];

  const solved = statsData?.problemsSolved ?? 0;
  const rank = statsData?.globalRank ?? "-";
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = getCurrentStreak(user);

  const statMetrics = [
    { label: "LEVEL", value: `Lvl ${level}`, sub: `XP: ${xp}`, color: "text-white", glow: "hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]" },
    { label: "DAILY STREAK", value: `${streak} Days`, sub: "Consecutive days", color: "text-brand-orange", glow: "hover:shadow-[0_0_15px_rgba(255,106,0,0.08)]" },
    { label: "PROBLEMS SOLVED", value: solved.toString(), sub: "Verified solutions", color: "text-[#10b981]", glow: "hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]" },
    { label: "GLOBAL RANK", value: rank !== "-" ? `#${rank}` : "-", sub: "On the leaderboard", color: "text-[#06b6d4]", glow: "hover:shadow-[0_0_15px_rgba(6,182,212,0.08)]" },
    { label: "CONTEST RATING", value: user?.contestRating?.toString() || "1200", sub: "Global Rating", color: "text-[#8b5cf6]", glow: "hover:shadow-[0_0_15px_rgba(139,92,246,0.08)]" },
  ];

  const topLanguages = statsData?.languageBreakdown && statsData.languageBreakdown.length > 0
    ? statsData.languageBreakdown.map((l: any) => {
        const lang = l.language;
        const count = l.count;
        const total = statsData.totalSubmissions || 1;
        const progress = Math.round((count / total) * 100);
        let icon = JavaScriptLogo;
        if (lang.includes("PYTHON")) icon = PythonLogo;
        else if (lang.includes("CPP") || lang.includes("C++")) icon = CppLogo;
        else if (lang.includes("JAVA")) icon = JavaLogo;
        
        return {
          name: lang.charAt(0) + lang.slice(1).toLowerCase(),
          progress,
          icon
        };
      })
    : [
        { name: "Python", progress: 60, icon: PythonLogo },
        { name: "C++", progress: 25, icon: CppLogo },
        { name: "Java", progress: 10, icon: JavaLogo },
        { name: "JavaScript", progress: 5, icon: JavaScriptLogo },
      ];

  const chartData = [
    { month: "Jan", rating: 1540 },
    { month: "Feb", rating: 1565 },
    { month: "Mar", rating: 1550 },
    { month: "Apr", rating: 1612 },
    { month: "May", rating: 1590 },
    { month: "Jun", rating: 1624 },
    { month: "Jul", rating: 1642 },
  ];

  // Dynamic Difficulty Calculations
  const diffBreakdown = statsData?.difficultyBreakdown || [];
  const getCount = (diff: string) => diffBreakdown.find((d: any) => d.difficulty?.toUpperCase() === diff)?.count || 0;

  const easySolved = getCount("EASY");
  const mediumSolved = getCount("MEDIUM");
  const hardCountSolved = getCount("HARD") + getCount("HARDER") + getCount("HARDEST") + getCount("EXPERT") + getCount("VERY HARD");

  const easyTotal = dbStats?.byDifficulty?.EASY || 1;
  const mediumTotal = dbStats?.byDifficulty?.MEDIUM || 1;
  const hardTotal = (dbStats?.byDifficulty?.HARD || 0) + (dbStats?.byDifficulty?.HARDER || 0) + (dbStats?.byDifficulty?.HARDEST || 0) + (dbStats?.byDifficulty?.EXPERT || 0) + (dbStats?.byDifficulty?.["VERY HARD"] || 0) || 1;

  const difficultyStats = [
    { label: "Easy", solved: easySolved, total: easyTotal, color: "#10b981", pct: Math.round((easySolved / easyTotal) * 100) },
    { label: "Medium", solved: mediumSolved, total: mediumTotal, color: "#ff6a00", pct: Math.round((mediumSolved / mediumTotal) * 100) },
    { label: "Hard", solved: hardCountSolved, total: hardTotal, color: "#f43f5e", pct: Math.round((hardCountSolved / hardTotal) * 100) },
  ];

  /* ── Heatmap config ── */
  const CELL = 12; // Increased size
  const GAP = 3;
  const STEP = CELL + GAP;
  
  // Create a map of date -> count
  const yearlyActivityMap: Record<string, number> = {};
  if (statsData?.yearlyActivity) {
    statsData.yearlyActivity.forEach((y: any) => {
      yearlyActivityMap[y.date] = y.count;
    });
  }

  // Generate a robust 52-week grid (7 rows x 52 columns)
  const heatmapGrid: { date: string, level: number }[][] = Array.from({ length: 7 }, () => Array(52).fill({ date: "", level: 0 }));
  
  const today = new Date();
  let currRow = today.getDay(); // 0 (Sun) to 6 (Sat)
  let currCol = 51; // Last column
  
  for (let i = 0; i < 364; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    // Use local time for YYYY-MM-DD to match backend date grouping
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    
    const count = yearlyActivityMap[dateStr] || 0;
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 4) level = 3;
    if (count > 6) level = 4;
    
    if (currCol >= 0) {
      heatmapGrid[currRow][currCol] = { date: dateStr, level };
    }
    
    currRow--;
    if (currRow < 0) {
      currRow = 6;
      currCol--;
    }
  }

  // Generate dynamic month labels based on the dates in the first row of the grid
  const dynamicMonths: { name: string, col: number }[] = [];
  let lastMonth = -1;
  for (let c = 0; c < 52; c++) {
    const cell = heatmapGrid[0][c];
    if (cell && cell.date) {
      // Parse YYYY-MM-DD safely
      const parts = cell.date.split('-');
      if (parts.length === 3) {
        const monthNum = parseInt(parts[1], 10) - 1; // 0-indexed
        if (monthNum !== lastMonth && c > 0) {
          const monthDate = new Date(2000, monthNum, 1);
          const name = monthDate.toLocaleString('default', { month: 'short' });
          dynamicMonths.push({ name, col: c });
          lastMonth = monthNum;
        } else if (lastMonth === -1) {
          lastMonth = monthNum;
        }
      }
    }
  }

  /* ── Helpers ── */

  const cardBase = "bg-card-bg border border-border-card rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.1] hover:-translate-y-[1px] transition-all duration-300 p-6 flex flex-col h-full justify-between text-text-primary";

  const handleEditProfile = () => {
    router.push("/settings");
  };

  /* ── Render ── */

  return (
    <ContentContainer className="pb-8 relative min-h-screen font-sans antialiased text-text-primary selection:bg-brand-orange selection:text-white">

      {/* ═══════════════════════════════════════════
          PROFILE HERO CARD
          ═══════════════════════════════════════════ */}
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-6 border border-border-card bg-card-bg backdrop-blur-md rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] relative overflow-hidden select-none text-left mb-6">
        <div className="flex items-center gap-6 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || "User"} className="w-20 h-20 rounded-full object-cover shadow-lg shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c084fc] via-[#8b5cf6] to-[#6366f1] flex items-center justify-center font-bold text-[28px] text-white border border-white/[0.08] shadow-lg shadow-purple-500/10 shrink-0 font-sans">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <span className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#0c0d16] absolute bottom-0.5 right-0.5 shadow-md shadow-[#10b981]/30" />
          </div>

          <div className="flex flex-col gap-2 min-w-0 justify-center text-left">
            {/* Name + Badge */}
            <div className="flex items-center gap-3">
              <span className="text-[22px] font-bold text-text-primary tracking-[-0.02em] font-sans">{user?.name || "User"}</span>
              <span className="px-2.5 py-[3px] rounded-md border border-brand-orange/25 bg-brand-orange/10 text-[9px] font-bold text-brand-orange uppercase tracking-wider leading-none shadow-[0_0_8px_rgba(255,106,0,0.12)]">
                Pro Coder
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-text-secondary font-medium mt-0.5">
              <span className="text-text-secondary font-semibold">@{user?.email ? user.email.split("@")[0] : "user"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/[0.1] shrink-0" />
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                <span>
                  {user?.createdAt 
                    ? `Joined ${new Date(user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })}` 
                    : "Joined recently"}
                </span>
              </div>
            </div>

            {/* Bio */}
            {user?.bio && (
              <p className="text-[12.5px] text-text-secondary font-normal tracking-tight leading-relaxed max-w-[500px] mt-1.5">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Edit Profile */}
        <button
          onClick={handleEditProfile}
          className="flex items-center justify-center border border-border-card bg-slate-900/5 dark:bg-[#111217]/50 rounded-xl px-4 py-2 text-[12px] font-semibold text-text-primary hover:bg-slate-900/10 dark:hover:bg-white/[0.04] hover:border-slate-900/15 dark:hover:border-white/[0.14] shadow-sm transition-all duration-200 cursor-pointer self-start sm:self-center"
        >
          Edit Profile
        </button>
      </div>

      {/* ═══════════════════════════════════════════
          NAVIGATION TABS
          ═══════════════════════════════════════════ */}
      <div className="sticky -top-6 z-20 bg-bg-page/80 backdrop-blur-2xl border-b border-border-card mb-6 select-none overflow-x-auto scrollbar-none py-2 px-6 flex items-center gap-5 h-[52px] -mx-8 px-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-1 text-[13px] font-semibold relative cursor-pointer transition-colors duration-200 whitespace-nowrap leading-none tracking-tight",
                isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.name}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -bottom-[16px] left-0 right-0 h-[2px] bg-brand-orange rounded-full shadow-[0_1px_4px_rgba(255,106,0,0.45)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════
          TAB CONTENT
          ═══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col gap-6"
        >

          {/* ──────────────────────────────────────────
              OVERVIEW TAB
              ────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <>
              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full text-center">
                {statMetrics.map((m) => (
                  <div
                    key={m.label}
                    className={cn(
                      "bg-card-bg border border-border-card rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:border-slate-900/15 dark:hover:border-white/[0.19] transition-all duration-300 p-4 flex flex-col justify-center items-center h-[120px] hover:-translate-y-0.5",
                      m.glow
                    )}
                  >
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.08em] leading-none mb-2">{m.label}</span>
                    <span className={cn("text-[30px] font-bold leading-none tracking-tight", m.color)}>{m.value}</span>
                    <span className="text-[11px] text-text-muted font-normal leading-none mt-2">{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* 3-Column Grid: Heatmap | Badges | Top Languages */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-stretch">

                {/* ── Submission Activity Heatmap (5fr) ── */}
                <div className={cn(cardBase, "xl:col-span-5 flex flex-col justify-between p-6")}>
                  <div className="w-full flex flex-col">
                    <h3 className="text-[13px] font-bold text-text-primary tracking-tight mb-6 leading-none">
                      Submission Activity
                    </h3>

                    <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar pb-2 relative">
                      <div className="flex flex-col min-w-max" style={{ width: `${52 * STEP + 40}px` }}>
                        
                        {/* Month labels */}
                        <div className="relative h-4 mb-2 select-none" style={{ marginLeft: "32px", width: `${52 * STEP}px` }}>
                          {dynamicMonths.map((m) => (
                            <span
                              key={m.name}
                              className="absolute text-[10px] text-text-secondary/70 font-semibold leading-none"
                              style={{ left: `${m.col * STEP}px` }}
                            >
                              {m.name}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-[3px] ml-8 relative">
                          <span className="absolute -left-8 top-[15px] text-[10px] text-text-secondary/70 font-medium leading-none">Mon</span>
                          <span className="absolute -left-8 top-[45px] text-[10px] text-text-secondary/70 font-medium leading-none">Wed</span>
                          <span className="absolute -left-8 top-[75px] text-[10px] text-text-secondary/70 font-medium leading-none">Fri</span>
                          
                          <div className="flex flex-col gap-[3px]">
                            {Array.from({ length: 7 }).map((_, rowIdx) => (
                              <div key={rowIdx} className="flex gap-[3px]">
                                {Array.from({ length: 52 }).map((_, colIdx) => {
                                  const cell = heatmapGrid[rowIdx]?.[colIdx];
                                  const level = cell ? cell.level : 0;
                                  return (
                                    <div
                                      key={colIdx}
                                      title={cell ? `${cell.date}` : ""}
                                      className={cn(
                                        "w-[12px] h-[12px] rounded-[3px] transition-colors duration-300",
                                        level === 0 && "bg-white/[0.03] hover:bg-white/[0.08]",
                                        level === 1 && "bg-[#10b981]/30 hover:bg-[#10b981]/40",
                                        level === 2 && "bg-[#10b981]/50 hover:bg-[#10b981]/60",
                                        level === 3 && "bg-[#10b981]/80 hover:bg-[#10b981]/90",
                                        level === 4 && "bg-[#10b981] hover:bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                                      )}
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary/60 font-medium mt-5 self-end select-none">
                          <span>Less</span>
                          <div className="w-[12px] h-[12px] rounded-[3px] bg-white/[0.03]" />
                          <div className="w-[12px] h-[12px] rounded-[3px] bg-[#10b981]/30" />
                          <div className="w-[12px] h-[12px] rounded-[3px] bg-[#10b981]/50" />
                          <div className="w-[12px] h-[12px] rounded-[3px] bg-[#10b981]/80" />
                          <div className="w-[12px] h-[12px] rounded-[3px] bg-[#10b981]" />
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Badges (4fr) ── */}
                <div className={cn(cardBase, "xl:col-span-4 flex flex-col p-6 relative overflow-hidden group")}>
                  <div className="absolute inset-0 bg-bg-page/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-3 py-1.5 rounded-lg bg-card-bg border border-border-card text-[12px] font-bold text-brand-orange shadow-lg">Coming Soon</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-6">
                    <h3 className="text-[13px] font-bold text-text-primary tracking-tight leading-none">Badges</h3>
                    <button className="text-[11px] font-bold text-brand-orange hover:text-[#e05d00] transition-colors cursor-pointer leading-none">
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-3 grid-rows-2 gap-x-4 gap-y-8 w-full flex-1 items-center justify-items-center mt-2 opacity-60">
                    <HexagonBadge color="gold" title="Problem Solver" subtitle="SOLVED 100" icon={Code2} />
                    <HexagonBadge color="orange" title="Contest Warrior" subtitle="10 CONTESTS" icon={Zap} />
                    <HexagonBadge color="red" title="Week Streak" subtitle="7 DAYS" icon={Calendar} />
                    <HexagonBadge color="teal" title="Top 10%" subtitle="RATING MAX" icon={Award} />
                    <HexagonBadge color="green" title="Consistency Master" subtitle="90 DAYS" icon={Activity} />
                    <HexagonBadge color="purple" title="Quick Solver" subtitle="SUB 1 MIN" icon={Trophy} />
                  </div>
                </div>

                {/* ── Top Languages (3fr) ── */}
                <div className={cn(cardBase, "xl:col-span-3 flex flex-col p-6")}>
                  <div className="flex items-baseline justify-between mb-6">
                    <h3 className="text-[13px] font-bold text-text-primary tracking-tight leading-none">Top Languages</h3>
                    <button onClick={() => setActiveTab("stats")} className="text-[11px] font-bold text-brand-orange hover:text-[#e05d00] transition-colors cursor-pointer leading-none">
                      View all
                    </button>
                  </div>
                  <div className="flex flex-col gap-5 flex-1 justify-center">
                    {topLanguages.map((lang: any) => {
                      const LangIcon = lang.icon;
                      return (
                        <div key={lang.name} className="flex items-center gap-3 py-1 w-full">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center shrink-0">
                            <LangIcon className="w-4 h-4 shrink-0" />
                          </div>
                          <span className="text-[12px] font-semibold text-text-primary w-16 shrink-0 text-left leading-none">{lang.name}</span>
                          <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-orange to-[#ff8c3a] rounded-full shadow-[0_0_4px_rgba(255,106,0,0.3)]" style={{ width: `${lang.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-text-secondary/70 w-10 text-right leading-none shrink-0">{lang.progress}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────
              STATS TAB
              ────────────────────────────────────────── */}
          {activeTab === "stats" && (
            <div className="w-full flex flex-col gap-6">
              {/* Difficulty Ring Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                {difficultyStats.map((d) => (
                  <div key={d.label} className={cn(cardBase, "p-6 flex flex-col items-center justify-center text-center h-[200px]")}>
                    <div className="relative w-[80px] h-[80px]">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={d.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${d.pct * 2.51} ${251 - d.pct * 2.51}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[18px] font-bold text-text-primary leading-none">{d.solved}</span>
                        <span className="text-[8px] text-text-secondary/60 font-medium mt-1 leading-none">/ {d.total}</span>
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-text-primary mt-3 leading-none">{d.label}</span>
                    <span className="text-[10px] text-text-secondary/60 font-normal mt-1 leading-none">{d.pct}% completion</span>
                  </div>
                ))}
              </div>

              {/* Contest Rating Chart */}
              <div className={cn(cardBase, "p-6 flex flex-col h-[240px] relative overflow-hidden group")}>
                <div className="absolute inset-0 bg-bg-page/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-3 py-1.5 rounded-lg bg-card-bg border border-border-card text-[12px] font-bold text-brand-orange shadow-lg">Coming Soon</span>
                </div>
                <div className="flex items-baseline justify-between mb-3 opacity-60">
                  <span className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] leading-none">Contest Rating History</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#10b981] font-semibold bg-[#10b981]/15 px-1.5 py-0.5 rounded leading-none border border-[#10b981]/15">↑ 8.21%</span>
                    <button className="text-[11px] font-medium text-text-secondary flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer leading-none">
                      <span>All Time</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-2 opacity-60">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[22px] font-bold text-[#8b5cf6] tracking-tight leading-none">1,642</span>
                    <span className="text-[10px] text-text-secondary/70 font-medium mt-1.5 leading-none">Top 12.12%</span>
                  </div>
                </div>
                <div className="h-[100px] w-full relative opacity-60">
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -28, bottom: -5 }}>
                      <defs>
                        <linearGradient id="profileRatingColorStats" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity="0.15" />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 500 }} dy={4} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 500 }} domain={[1500, 1660]} ticks={[1500, 1550, 1600, 1650]} />
                      <Tooltip contentStyle={{ backgroundColor: "#111217", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", color: "white", fontSize: "10px", fontWeight: 500, padding: "4px 8px" }} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "3 3" }} />
                      <Area type="monotone" dataKey="rating" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#profileRatingColorStats)" dot={{ r: 2.5, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 1 }} activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 1.5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Topic Strengths */}
              <div className={cn(cardBase, "p-6 relative overflow-hidden group")}>
                <div>
                  <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] mb-4 leading-none">Topic Strengths</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                    {(statsData?.topicStrength && statsData.topicStrength.length > 0) ? (
                      (() => {
                        const topTopics = statsData.topicStrength.slice(0, 6);
                        const totalSolved = statsData.problemsSolved || 1;
                        return topTopics.map((t: any) => {
                          const formattedName = t.topic
                            .split("-")
                            .join(" ")
                            .split(" ")
                            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ");
                          const val = Math.round((t.count / totalSolved) * 100);
                          return (
                            <div key={t.topic} className="flex flex-col gap-1.5 py-1">
                              <div className="flex items-center justify-between text-[11px] font-medium text-text-primary">
                                <span>{formattedName}</span>
                                <span className="text-brand-orange">{val}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                <div className="h-full bg-brand-orange rounded-full" style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()
                    ) : (
                      <div className="col-span-1 md:col-span-2 text-[12px] text-text-secondary italic">
                        Solve some problems to see your topic strengths!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────
              ACTIVITY TAB
              ────────────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="w-full flex flex-col gap-6">
              <div className={cn(cardBase, "p-6 text-left")}>
                <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] mb-5 leading-none">Milestone Activity Timeline</h3>
                <div className="flex flex-col border-l-2 border-white/[0.06] ml-3 pl-6 gap-6 relative">
                  {[
                    { title: "Consistency Master Badge Unlocked", desc: "Maintained active coding streak for 90 days straight.", time: "Today, May 28", badge: Crown, badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                    { title: "Weekly Contest 406 Completed", desc: "Finished 406th globally out of 18,452 participants.", time: "May 24, 2026", badge: Trophy, badgeColor: "text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20" },
                    { title: "Solved Trapping Rain Water (Hard)", desc: "Completed code in 12ms utilizing dynamic programming.", time: "May 22, 2026", badge: Code2, badgeColor: "text-[#ff6a00] bg-[#ff6a00]/10 border-[#ff6a00]/20" },
                    { title: "LeetCode Profile Successfully Linked", desc: "Synchronized account settings and historic records.", time: "May 18, 2026", badge: Crown, badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  ].map((m, idx) => {
                    const Icon = m.badge;
                    return (
                      <div key={idx} className="relative flex flex-col text-left py-0.5">
                        <span className={cn("absolute -left-[33px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border text-xs", m.badgeColor)}>
                          <Icon className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-[12px] font-semibold text-text-primary tracking-tight leading-none">{m.title}</span>
                        <span className="text-[11px] text-text-secondary/70 mt-1.5 leading-tight font-normal">{m.desc}</span>
                        <span className="text-[9px] text-text-secondary/50 font-medium uppercase tracking-wider mt-1.5 leading-none">{m.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────
              SUBMISSIONS TAB
              ────────────────────────────────────────── */}
          {activeTab === "submissions" && (
            <div className={cn(cardBase, "overflow-hidden")}>
              <div className="p-5 flex flex-col gap-3">
                <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] leading-none px-1">Recent Profile Submissions</h3>
                <div className="flex flex-col border-t border-white/[0.06] mt-1">
                  {recentSubmissions && recentSubmissions.length > 0 ? (
                    recentSubmissions.map((sub, idx) => {
                      const isAcc = sub.status === "ACCEPTED";
                      const statBg = isAcc ? "bg-[#10b981]/15 text-[#10b981]" : "bg-[#f43f5e]/10 text-[#f43f5e]";
                      return (
                        <div key={idx} onClick={() => router.push(`/problems/${sub.problemExternalId}`)} className="flex items-center justify-between py-3.5 px-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-all duration-200 group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className={cn("text-[9px] font-semibold uppercase w-14 text-center py-0.5 rounded border border-current/20 bg-current/5 text-text-secondary")}>
                              PROB
                            </span>
                            <span className="text-[12px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors tracking-tight leading-none">{sub.problemExternalId}</span>
                          </div>
                          <div className="flex items-center gap-8 shrink-0 text-[11px] font-normal text-text-secondary leading-none">
                            <span className={cn("px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none", statBg)}>{sub.status}</span>
                            <span className="w-16">{sub.language}</span>
                            <span className="w-12">{sub.executionTime ? `${sub.executionTime}ms` : "--"}</span>
                            <span className="w-20 text-right">{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-text-secondary text-[12px]">No recent submissions found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────
              BOOKMARKS TAB
              ────────────────────────────────────────── */}
          {activeTab === "bookmarks" && (
            <div className={cn(cardBase, "overflow-hidden")}>
              <div className="p-5 flex flex-col gap-3">
                <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] leading-none px-1">Bookmarked Problems</h3>
                <div className="flex flex-col border-t border-white/[0.06] mt-1">
                  {loadingBookmarks ? (
                    <div className="py-8 text-center text-text-secondary text-[12px] animate-pulse">Loading bookmarks...</div>
                  ) : bookmarkedProblems.length > 0 ? (
                    bookmarkedProblems.map((bk, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3.5 px-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-[9px] font-semibold uppercase w-14 text-center py-0.5 rounded border border-current/20 bg-current/5", bk.color)}>{bk.diff}</span>
                          <span className="text-[12px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors tracking-tight leading-none">{bk.name}</span>
                        </div>
                        <div className="flex items-center gap-5 shrink-0 leading-none">
                          <span className="text-[11px] text-text-secondary/60 font-normal">{bk.rate}</span>
                          <span className="text-[11px] text-text-secondary/60 font-normal pr-3">{bk.time}</span>
                          <button
                            onClick={() => router.push(`/problems/${bk.slug}`)}
                            className="border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12] bg-[#111217]/50 rounded-lg px-3 py-1.5 text-[10px] font-medium text-text-primary shadow-sm transition-all cursor-pointer leading-none"
                          >
                            Resume Solving
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-text-secondary text-[12px]">No bookmarked problems found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────
              SETTINGS TAB
              ────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="w-full flex flex-col gap-6">
              <div className={cn(cardBase, "p-6 text-left")}>
                <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] mb-4 leading-none">Profile Settings</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] text-text-secondary/60 font-medium uppercase tracking-wider leading-none mb-1">Display Name</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="border border-white/[0.06] rounded-xl bg-[#111217]/50 px-4 py-2.5 text-[12px] font-medium text-text-primary focus:outline-none focus:border-brand-orange/30 w-full transition-colors" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] text-text-secondary/60 font-medium uppercase tracking-wider leading-none mb-1">Geolocation</label>
                      <input 
                        type="text" 
                        value={editLocation} 
                        onChange={(e) => setEditLocation(e.target.value)} 
                        className="border border-white/[0.06] rounded-xl bg-[#111217]/50 px-4 py-2.5 text-[12px] font-medium text-text-primary focus:outline-none focus:border-brand-orange/30 w-full transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-left mt-1">
                    <label className="text-[10px] text-text-secondary/60 font-medium uppercase tracking-wider leading-none mb-1">Short Biography</label>
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)} 
                      rows={2} 
                      className="border border-white/[0.06] rounded-xl bg-[#111217]/50 px-4 py-2.5 text-[12px] font-medium text-text-primary focus:outline-none focus:border-brand-orange/30 w-full resize-none leading-relaxed transition-colors" 
                    />
                  </div>
                  <button
                    onClick={async () => {
                      showToast("Saving settings...", "info");
                      try {
                        await AuthService.updateProfile({
                          name: editName,
                          bio: editBio
                        });
                        showToast("Profile settings saved successfully!", "success");
                      } catch (err: any) {
                        console.error(err);
                        showToast(err.message || "Failed to save settings.", "info");
                      }
                    }}
                    className="bg-brand-orange hover:bg-[#e05d00] text-white rounded-xl px-5 py-2.5 text-[12px] font-semibold shadow-md shadow-[#ff6a00]/15 mt-2 self-end cursor-pointer transition-all duration-200 leading-none"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className={cn(cardBase, "p-6 text-left relative overflow-hidden group")}>
                <div className="absolute inset-0 bg-bg-page/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-3 py-1.5 rounded-lg bg-card-bg border border-border-card text-[12px] font-bold text-brand-orange shadow-lg">Coming Soon</span>
                </div>
                <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em] mb-4 leading-none opacity-60">Linked Account Integrations</h3>
                <div className="flex flex-col gap-4 opacity-60">
                  {[
                    { label: "LeetCode Live Sync", active: true },
                    { label: "Codeforces Rating Checker", active: true },
                    { label: "GitHub Repositories Autopilot", active: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 pb-3 last:pb-0">
                      <span className="text-[12px] font-semibold text-text-primary tracking-tight leading-none">{item.label}</span>
                      <button
                        onClick={() => showToast(`${item.label} setting toggled successfully!`, "info")}
                        className={cn(
                          "w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer flex relative items-center",
                          item.active ? "bg-brand-orange" : "bg-white/[0.04] border border-white/[0.06]"
                        )}
                      >
                        <span className={cn(
                          "w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-300 absolute",
                          item.active ? "left-5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </ContentContainer>
  );
}

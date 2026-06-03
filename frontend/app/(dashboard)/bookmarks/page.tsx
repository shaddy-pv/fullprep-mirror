"use client";

import React, { useState } from "react";
import { 
  Bookmark, 
  Search, 
  ChevronRight, 
  Play, 
  Code2, 
  Compass, 
  Sparkles, 
  Trophy, 
  FileCheck2, 
  SlidersHorizontal, 
  ChevronDown, 
  MoreVertical, 
  MessageSquare, 
  BookOpen, 
  Award,
  Zap,
  Bell,
  BellOff,
  FileText,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";
import DashboardCard from "@/components/ui/DashboardCard";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";

interface SavedProblem {
  rank: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  acceptance: string;
  lastVisited: string;
}

interface SavedPath {
  title: string;
  progress: number;
  lastAccessed: string;
  color: string;
  iconBg: string;
  estimatedTime?: string;
}

interface SavedAIChat {
  id: number;
  title: string;
  lastOpened: string;
  tags: string[];
}

interface BookmarkedContest {
  id: number;
  title: string;
  date: string;
  status: "Registered" | "Upcoming" | "Completed";
  reminderActive: boolean;
}

interface SavedNote {
  id: number;
  title: string;
  snippet: string;
  lastUpdated: string;
  tags: string[];
}

interface RecentBookmark {
  title: string;
  badge: string;
  badgeType: "problem" | "chat" | "contest";
  time: string;
  color: string;
  icon: React.ComponentType<any>;
}

export default function BookmarksPage() {
  const showToast = useNotificationStore((state) => state.showToast);
  const [activeTab, setActiveTab] = useState("problems");
  const [searchVal, setSearchVal] = useState("");

  const tabs = [
    { id: "problems", name: "Problems", icon: Code2 },
    { id: "paths", name: "Learning Paths", icon: Compass },
    { id: "chats", name: "AI Chats", icon: Sparkles },
    { id: "contests", name: "Contests", icon: Trophy },
    { id: "notes", name: "Notes", icon: FileCheck2 },
  ];

  // Saved Problems dataset matching the reference screenshot exactly
  const savedProblems: SavedProblem[] = [
    { rank: 1, title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"], acceptance: "81.21%", lastVisited: "2 months ago" },
    { rank: 2, title: "Median of Two Sorted Arrays", difficulty: "Hard", tags: ["Array", "Binary Search", "Divide & Conquer"], acceptance: "72.11%", lastVisited: "1 week ago" },
    { rank: 3, title: "LRU Cache", difficulty: "Medium", tags: ["Design", "Hash Table", "Linked List"], acceptance: "66.25%", lastVisited: "3 days ago" },
    { rank: 4, title: "Word Ladder", difficulty: "Hard", tags: ["Hash Table", "Breadth First Search"], acceptance: "79.34%", lastVisited: "5 days ago" },
    { rank: 5, title: "Trapping Rain Water", difficulty: "Hard", tags: ["Array", "Two Pointers", "Dynamic Programming"], acceptance: "68.45%", lastVisited: "1 month ago" },
  ];

  // Saved Learning Paths matching reference screenshot
  const savedPaths: SavedPath[] = [
    { title: "Data Structures & Algorithms", progress: 63, lastAccessed: "2 days ago", color: "bg-[#10b981]", iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20", estimatedTime: "12 hours left" },
    { title: "Frontend Development", progress: 42, lastAccessed: "1 week ago", color: "bg-[#8b5cf6]", iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20", estimatedTime: "18 hours left" },
    { title: "Backend Development", progress: 38, lastAccessed: "5 days ago", color: "bg-[#10b981]", iconBg: "bg-green-500/10 text-green-500 border-green-500/20", estimatedTime: "22 hours left" },
    { title: "System Design", progress: 25, lastAccessed: "3 weeks ago", color: "bg-[#eab308]", iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20", estimatedTime: "8 hours left" },
  ];

  // Saved AI Conversations dataset
  const [savedChats, setSavedChats] = useState<SavedAIChat[]>([
    { id: 1, title: "Dynamic Programming Optimization", lastOpened: "2 hours ago", tags: ["#DP", "#Optimization"] },
    { id: 2, title: "Recursion Tree Debugging for Merge Sort", lastOpened: "1 day ago", tags: ["#Recursion", "#Sorting"] },
    { id: 3, title: "Graph BFS vs DFS Traversal Patterns", lastOpened: "3 days ago", tags: ["#Graph", "#Traversal"] },
    { id: 4, title: "Sliding Window Edge Case Explanations", lastOpened: "1 week ago", tags: ["#String", "#SlidingWindow"] },
  ]);

  // Bookmarked Contests dataset
  const [savedContests, setSavedContests] = useState<BookmarkedContest[]>([
    { id: 1, title: "Weekly Contest 406", date: "June 1, 2026 - 08:00 AM", status: "Registered", reminderActive: true },
    { id: 2, title: "Biweekly Contest 134", date: "June 14, 2026 - 07:00 PM", status: "Upcoming", reminderActive: false },
    { id: 3, title: "FullPrep Cup 2026", date: "June 28, 2026 - 10:00 AM", status: "Upcoming", reminderActive: true },
  ]);

  // Saved Notes dataset
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([
    { id: 1, title: "Dijkstra's Shortest Path Template", snippet: "const dijkstra = (graph, start) => {\n  const distances = {};\n  const visited = new Set();\n  // ...\n}", lastUpdated: "3 days ago", tags: ["#Graph", "#Algorithms"] },
    { id: 2, title: "Binary Search Edge Cases Cheatsheet", snippet: "let left = 0, right = arr.length - 1;\nwhile (left <= right) {\n  const mid = left + Math.floor((right - left) / 2);\n  // ...\n}", lastUpdated: "1 week ago", tags: ["#Searching", "#Arrays"] },
    { id: 3, title: "Sliding Window Maximum Proof", snippet: "// Monotonic queue template\nconst q = [];\nfor (let i = 0; i < nums.length; i++) {\n  while (q.length && nums[q[q.length - 1]] <= nums[i]) q.pop();\n  // ...\n}", lastUpdated: "2 weeks ago", tags: ["#Stack", "#SlidingWindow"] },
  ]);

  // Recent Bookmarks matching reference screenshot
  const recentBookmarks: RecentBookmark[] = [
    { title: "Longest Substring Without Repeating Characters", badge: "Medium", badgeType: "problem", time: "2 hours ago", color: "text-[#ffece0] bg-brand-orange/10 border-brand-orange/20", icon: Code2 },
    { title: "Dynamic Programming Patterns", badge: "AI Chat", badgeType: "chat", time: "5 hours ago", color: "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20", icon: Sparkles },
    { title: "Weekly Contest 386", badge: "Contest", badgeType: "contest", time: "1 day ago", color: "text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20", icon: Trophy },
  ];

  // Favorite topics matching reference screenshot
  const favoriteTopics = [
    { name: "Array", count: 32 },
    { name: "Dynamic Programming", count: 28 },
    { name: "Graph", count: 18 },
    { name: "Binary Search", count: 15 },
    { name: "String", count: 12 },
    { name: "Hash Table", count: 10 },
  ];

  // Search filter trigger
  const filteredProblems = savedProblems.filter((p) =>
    p.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchVal.toLowerCase()))
  );

  const toggleReminder = (id: number, title: string) => {
    setSavedContests((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.reminderActive;
          showToast(
            nextState 
              ? `Reminder set for ${title}!` 
              : `Reminder cancelled for ${title}.`, 
            "info"
          );
          return { ...c, reminderActive: nextState };
        }
        return c;
      })
    );
  };

  return (
    <ContentContainer>
      {/* Page Header prefix orange badge */}
      <div className="flex items-start gap-4 mb-5 select-none text-left">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0 mt-0.5 shadow-sm">
          <Bookmark className="w-5 h-5 text-brand-orange fill-brand-orange/10" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[26px] font-black text-text-primary tracking-[-0.02em] leading-none mb-2">Bookmarks</h1>
          <p className="text-[13.5px] text-text-secondary font-medium leading-none">All your saved content in one place. Access and continue anytime.</p>
        </div>
      </div>

      {/* Main sliding sub-navigation tabs (normalized typography spacing) */}
      <div className="flex border-b border-border-card mb-6 gap-5 select-none overflow-x-auto pb-1 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchVal("");
                showToast(`Switched to ${tab.name} bookmarks.`, "info");
              }}
              className={cn(
                "pb-3.5 text-[14px] font-semibold tracking-[-0.012em] relative cursor-pointer transition-all duration-200 whitespace-nowrap flex items-center gap-2",
                isActive ? "text-brand-orange font-bold" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.name}</span>
              {isActive && (
                <motion.div
                  layoutId="bookmarksTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-orange rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Columns wrapper stretched */}
      <SectionWrapper className="!items-stretch">
        
        {/* Left Column: Tables & Grids with AnimatePresence */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 h-full">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col gap-6"
            >
              
              {/* 1. PROBLEMS TAB ACTIVE */}
              {activeTab === "problems" && (
                <>
                  <div className="w-full bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="p-5 flex flex-col gap-4">
                      
                      {/* Search Bar / Filters Row with normalized padding */}
                      <div className="flex items-center justify-between flex-wrap gap-3 select-none px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14.5px] font-bold text-text-primary tracking-[-0.01em]">Saved Problems</span>
                          <span className="px-2 py-0.5 rounded-full bg-border-card/50 dark:bg-white/[0.04] text-[11px] font-bold text-text-secondary">128</span>
                        </div>

                        {/* Filter and Search Actions */}
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search saved problems..."
                              value={searchVal}
                              onChange={(e) => setSearchVal(e.target.value)}
                              className="bg-transparent border border-border-card rounded-xl py-1.5 pl-8 pr-3 text-[12px] font-medium text-text-primary placeholder-[#9ca3af] dark:placeholder-[#6b7280] focus:outline-none focus:border-brand-orange/45 w-[180px] sm:w-[220px] transition-all"
                            />
                          </div>

                          <button className="flex items-center justify-between border border-border-card rounded-xl px-3 py-1.5 bg-card-bg text-[12px] font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer shadow-sm gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                            <span>Filter</span>
                            <ChevronDown className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                          </button>
                        </div>
                      </div>

                      {/* Problems Table Rows List with improved left/right padding and vertical centering */}
                      <div className="flex flex-col border-t border-border-card/45 mt-1 select-none">
                        {filteredProblems.length > 0 ? (
                          filteredProblems.map((prob) => (
                            <div 
                              key={prob.rank}
                              className="flex items-center justify-between py-4 px-3 border-b border-border-card/45 last:border-0 group transition-all"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                {/* Orange bookmark icon outline */}
                                <Bookmark className="w-4.5 h-4.5 text-brand-orange fill-transparent shrink-0 cursor-pointer hover:fill-brand-orange transition-all" />
                                
                                <span className="text-[12.5px] font-semibold text-text-secondary w-4 text-center shrink-0">
                                  {prob.rank}
                                </span>

                                {/* Title, tags, badges */}
                                <div className="flex flex-col gap-1.5 min-w-0 justify-center">
                                  <div className="flex items-center gap-2 flex-wrap leading-none">
                                    <span className="text-[13.5px] font-bold text-text-primary group-hover:text-brand-orange transition-colors tracking-[-0.01em] align-middle">
                                      {prob.title}
                                    </span>
                                    <DifficultyBadge difficulty={prob.difficulty} />
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {prob.tags.map((tag, i) => (
                                      <span 
                                        key={i} 
                                        className="px-2 py-0.5 rounded-[6px] bg-border-card/35 dark:bg-white/[0.02] text-[10.5px] font-medium text-text-secondary border border-border-card/25"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Columns right side */}
                              <div className="flex items-center gap-6 sm:gap-10 shrink-0 select-none">
                                {/* Acceptance column */}
                                <div className="flex flex-col text-left justify-center">
                                  <span className="text-[13px] font-bold text-text-primary leading-tight">{prob.acceptance}</span>
                                  <span className="text-[9.5px] text-[#6b7280] font-semibold leading-none mt-0.5">Acceptance</span>
                                </div>

                                {/* Last visited column */}
                                <div className="flex flex-col text-left justify-center">
                                  <span className="text-[13px] font-bold text-text-primary leading-tight">{prob.lastVisited}</span>
                                  <span className="text-[9.5px] text-[#6b7280] font-semibold leading-none mt-0.5">Last visited</span>
                                </div>

                                {/* Resume Solving button (increased height slightly & vertical centering) */}
                                <button 
                                  onClick={() => showToast(`Resuming Monaco environment for ${prob.title}...`, "success")}
                                  className="flex items-center justify-center gap-1.5 border border-brand-orange/40 hover:bg-brand-orange hover:text-white rounded-xl px-4 py-2 bg-transparent text-[11.5px] font-bold text-brand-orange shadow-sm transition-all cursor-pointer shrink-0 h-[34px] leading-none"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Resume Solving</span>
                                </button>

                                {/* Actions drop trigger */}
                                <button className="text-text-secondary/50 hover:text-text-primary transition shrink-0 cursor-pointer">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-[13px] text-text-secondary font-medium tracking-[-0.01em]">
                            No saved problems match your search.
                          </div>
                        )}
                      </div>

                      {/* View all problems toggle footer */}
                      <button 
                        onClick={() => showToast("Loading all saved problems...", "info")}
                        className="w-full py-2.5 border border-border-card rounded-2xl bg-card-bg hover:bg-gray-50 dark:hover:bg-white/[0.01] text-[12px] font-bold text-text-secondary hover:text-text-primary transition flex items-center justify-center gap-1.5 shadow-sm mt-1 cursor-pointer select-none"
                      >
                        <span>View all saved problems</span>
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      </button>

                    </div>
                  </div>

                  {/* Inline Saved Learning Paths below table */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between select-none px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-bold text-text-primary tracking-[-0.01em]">Saved Learning Paths</span>
                        <span className="px-2 py-0.5 rounded-full bg-border-card/50 dark:bg-white/[0.04] text-[11px] font-bold text-text-secondary">12</span>
                      </div>
                      <button 
                        onClick={() => showToast("Opening learning paths catalog...", "info")}
                        className="text-[11.5px] font-bold text-brand-orange hover:text-[#e05d00] transition cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {savedPaths.map((path) => (
                        <div 
                          key={path.title}
                          className="bg-white dark:bg-[#11131c] border border-border-card rounded-[20px] p-4.5 flex flex-col justify-between h-[155px] shadow-sm select-none text-left hover:border-brand-orange/20 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs shrink-0", path.iconBg)}>
                              <Compass className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-[12.5px] font-extrabold text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[130px] leading-tight tracking-[-0.01em]">
                              {path.title}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-text-primary leading-tight">
                              <span>{path.progress}% Completed</span>
                            </div>
                            <div className="w-full h-1.5 bg-border-card dark:bg-white/[0.04] rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all duration-300", path.color)} style={{ width: `${path.progress}%` }} />
                            </div>
                          </div>

                          <div className="border-t border-border-card/45 pt-2 mt-2 text-[10.5px] text-[#6b7280] font-semibold leading-none">
                            Last accessed: {path.lastAccessed}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 2. LEARNING PATHS TAB ACTIVE */}
              {activeTab === "paths" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between select-none px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-bold text-text-primary tracking-[-0.01em]">All Saved Learning Paths</span>
                      <span className="px-2 py-0.5 rounded-full bg-border-card/50 dark:bg-white/[0.04] text-[11px] font-bold text-text-secondary">12</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedPaths.map((path) => (
                      <div 
                        key={path.title}
                        className="bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] p-5 flex flex-col justify-between h-[180px] shadow-sm select-none text-left hover:border-brand-orange/20 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border font-bold shrink-0", path.iconBg)}>
                              <Compass className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[14.5px] font-extrabold text-text-primary group-hover:text-brand-orange transition-colors leading-tight tracking-[-0.01em]">
                                {path.title}
                              </span>
                              <span className="text-[11px] text-[#6b7280] font-semibold">{path.estimatedTime}</span>
                            </div>
                          </div>
                          <button className="text-text-secondary/50 hover:text-text-primary transition shrink-0 cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Progress slider bar */}
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center justify-between text-[12px] font-bold text-text-primary leading-none">
                            <span>{path.progress}% Complete</span>
                            <span className="text-[#10b981] font-extrabold">Active</span>
                          </div>
                          <div className="w-full h-2 bg-border-card dark:bg-white/[0.04] rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-300", path.color)} style={{ width: `${path.progress}%` }} />
                          </div>
                        </div>

                        <div className="border-t border-border-card/45 pt-3.5 mt-2 flex items-center justify-between text-[11px] text-[#6b7280] font-bold">
                          <span>Last accessed: {path.lastAccessed}</span>
                          <span className="text-brand-orange hover:text-[#e05d00] flex items-center gap-0.5 cursor-pointer">
                            Resume Path <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. AI CHATS TAB ACTIVE */}
              {activeTab === "chats" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between select-none px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-bold text-text-primary tracking-[-0.01em]">Saved AI Conversations</span>
                      <span className="px-2 py-0.5 rounded-full bg-border-card/50 dark:bg-white/[0.04] text-[11px] font-bold text-text-secondary">{savedChats.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {savedChats.map((chat) => (
                      <div 
                        key={chat.id}
                        className="bg-white dark:bg-[#11131c] border border-border-card rounded-[20px] p-4.5 flex items-center justify-between shadow-sm select-none text-left hover:border-brand-orange/20 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Sparkles circle logo */}
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-sm">
                            <Sparkles className="w-4.5 h-4.5 fill-purple-500/10" />
                          </div>

                          <div className="flex flex-col gap-1.5 min-w-0 justify-center">
                            <span className="text-[14px] font-bold text-text-primary group-hover:text-brand-orange transition-colors leading-tight tracking-[-0.01em] truncate max-w-[280px] sm:max-w-md">
                              {chat.title}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {chat.tags.map((tag, idx) => (
                                <span 
                                  key={idx}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] bg-[#1c1d27]/40 dark:bg-white/[0.02] text-text-secondary border border-border-card/25"
                                >
                                  {tag}
                                </span>
                              ))}
                              <span className="text-[10.5px] text-[#6b7280] font-semibold leading-none ml-2">
                                Last opened: {chat.lastOpened}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Resume Chat Button */}
                        <div className="flex items-center gap-2.5 shrink-0 select-none">
                          <button 
                            onClick={() => showToast(`Restoring AI Assistant context for "${chat.title}"...`, "success")}
                            className="flex items-center justify-center gap-1.5 border border-brand-orange/40 hover:bg-brand-orange hover:text-white rounded-xl px-4 py-2 bg-transparent text-[11.5px] font-bold text-brand-orange shadow-sm transition-all cursor-pointer h-[34px] leading-none"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span>Resume Conversation</span>
                          </button>

                          <button className="text-text-secondary/50 hover:text-text-primary transition shrink-0 cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CONTESTS TAB ACTIVE */}
              {activeTab === "contests" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between select-none px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-bold text-text-primary tracking-[-0.01em]">Saved Contests & Reminders</span>
                      <span className="px-2 py-0.5 rounded-full bg-border-card/50 dark:bg-white/[0.04] text-[11px] font-bold text-text-secondary">{savedContests.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {savedContests.map((contest) => (
                      <div 
                        key={contest.id}
                        className="bg-white dark:bg-[#11131c] border border-border-card rounded-[20px] p-4.5 flex items-center justify-between shadow-sm select-none text-left hover:border-brand-orange/20 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Contest crown icon */}
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm">
                            <Trophy className="w-4.5 h-4.5" />
                          </div>

                          <div className="flex flex-col gap-1.5 min-w-0 justify-center">
                            <span className="text-[14px] font-bold text-text-primary group-hover:text-brand-orange transition-colors leading-tight tracking-[-0.01em] truncate max-w-[280px] sm:max-w-md">
                              {contest.title}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-[5px] border",
                                contest.status === "Registered" 
                                  ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20" 
                                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              )}>
                                {contest.status}
                              </span>
                              <span className="text-[10.5px] text-[#6b7280] font-semibold leading-none ml-2">
                                Date: {contest.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reminders / Actions controls */}
                        <div className="flex items-center gap-3 shrink-0 select-none">
                          <button 
                            onClick={() => toggleReminder(contest.id, contest.title)}
                            className={cn(
                              "flex items-center justify-center gap-1.5 border rounded-xl px-4 py-2 text-[11.5px] font-bold shadow-sm transition-all cursor-pointer h-[34px] leading-none",
                              contest.reminderActive 
                                ? "bg-brand-orange/10 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/20" 
                                : "bg-transparent text-text-secondary border-border-card hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                            )}
                          >
                            {contest.reminderActive ? (
                              <>
                                <Bell className="w-3.5 h-3.5 fill-current" />
                                <span>Reminder Active</span>
                              </>
                            ) : (
                              <>
                                <BellOff className="w-3.5 h-3.5" />
                                <span>Set Reminder</span>
                              </>
                            )}
                          </button>

                          <button className="text-text-secondary/50 hover:text-text-primary transition shrink-0 cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. NOTES TAB ACTIVE */}
              {activeTab === "notes" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between select-none px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-bold text-text-primary tracking-[-0.01em]">Saved Coding Notes</span>
                      <span className="px-2 py-0.5 rounded-full bg-border-card/50 dark:bg-white/[0.04] text-[11px] font-bold text-text-secondary">{savedNotes.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedNotes.map((note) => (
                      <div 
                        key={note.id}
                        className="bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] p-5 flex flex-col justify-between h-[230px] shadow-sm select-none text-left hover:border-brand-orange/20 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-sm">
                              <FileText className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-[13.5px] font-extrabold text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[190px] leading-tight tracking-[-0.01em]">
                              {note.title}
                            </span>
                          </div>
                          <button className="text-text-secondary/50 hover:text-text-primary transition shrink-0 cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Snippet preview panel */}
                        <div className="bg-[#fcfcfa] dark:bg-[#151722]/50 border border-border-card/45 rounded-xl p-3 my-2.5 font-mono text-[10.5px] text-text-secondary overflow-hidden h-[95px] select-text">
                          <pre className="overflow-x-auto h-full scroll-none whitespace-pre-wrap">{note.snippet}</pre>
                        </div>

                        <div className="border-t border-border-card/45 pt-3 flex items-center justify-between text-[11px] text-[#6b7280] font-bold">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {note.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] text-text-secondary">{tag}</span>
                            ))}
                          </div>
                          <span className="flex items-center gap-1 cursor-pointer text-brand-orange hover:text-[#e05d00]" onClick={() => showToast(`Opening editor to edit "${note.title}"...`, "info")}>
                            Edit Note <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

        {/* Right Sidebar Column with strict width limitation (w-full lg:w-[380px]) */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5 select-none h-full justify-start">
          
          {/* Bookmark Stats micro cards grid */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[200px] shadow-sm select-none text-left shrink-0">
            <span className="text-[13px] font-bold text-text-primary tracking-[-0.015em] mb-3 inline-block">
              Bookmark Stats
            </span>

            {/* 2x2 grid layout exactly like reference */}
            <div className="grid grid-cols-2 gap-3.5 flex-1">
              
              {/* Total Bookmarks */}
              <div className="flex items-center gap-3 bg-[#fcfcfa]/55 dark:bg-[#151722]/30 border border-border-card/45 rounded-2xl p-2.5 shadow-inner">
                <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Bookmark className="w-4 h-4 fill-purple-500/10" />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-[10px] text-text-secondary font-bold leading-none">Total Bookmarks</span>
                  <span className="text-[16px] font-black text-text-primary leading-none mt-1.5">248</span>
                </div>
              </div>

              {/* Problems Saved */}
              <div className="flex items-center gap-3 bg-[#fcfcfa]/55 dark:bg-[#151722]/30 border border-border-card/45 rounded-2xl p-2.5 shadow-inner">
                <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-[10px] text-text-secondary font-bold leading-none">Problems Saved</span>
                  <span className="text-[16px] font-black text-text-primary leading-none mt-1.5">128</span>
                </div>
              </div>

              {/* Paths Saved */}
              <div className="flex items-center gap-3 bg-[#fcfcfa]/55 dark:bg-[#151722]/30 border border-border-card/45 rounded-2xl p-2.5 shadow-inner">
                <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 fill-purple-500/10" />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-[10px] text-text-secondary font-bold leading-none">Paths Saved</span>
                  <span className="text-[16px] font-black text-text-primary leading-none mt-1.5">12</span>
                </div>
              </div>

              {/* AI Chats Saved */}
              <div className="flex items-center gap-3 bg-[#fcfcfa]/55 dark:bg-[#151722]/30 border border-border-card/45 rounded-2xl p-2.5 shadow-inner">
                <div className="w-8.5 h-8.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 fill-green-500/10" />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-[10px] text-text-secondary font-bold leading-none">AI Chats Saved</span>
                  <span className="text-[16px] font-black text-text-primary leading-none mt-1.5">36</span>
                </div>
              </div>

            </div>
          </DashboardCard>

          {/* Recently Viewed Bookmarks Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[300px] shadow-sm select-none text-left shrink-0">
            <span className="text-[13px] font-bold text-text-primary tracking-[-0.015em] mb-3.5 inline-block">
              Recently Viewed Bookmarks
            </span>

            <div className="flex flex-col gap-2.5 mt-0.5">
              {recentBookmarks.map((bookmark) => {
                const BookmarkIcon = bookmark.icon;
                return (
                  <div 
                    key={bookmark.title} 
                    className="flex items-center justify-between border-b border-border-card/45 pb-2.5 last:border-0 last:pb-0 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-7.5 h-7.5 rounded-xl flex items-center justify-center border shrink-0", bookmark.color)}>
                        <BookmarkIcon className="w-3.5 h-3.5" />
                      </div>
                      
                      <div className="flex flex-col gap-0.5 min-w-0 justify-center">
                        <span className="text-[12.5px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[170px] leading-tight">
                          {bookmark.title}
                        </span>
                        
                        <div className="flex items-center mt-0.5 select-none">
                          <span className={cn(
                            "text-[9px] font-extrabold px-1.5 py-0.5 rounded-[5px]",
                            bookmark.badgeType === "problem" 
                              ? "bg-amber-500/10 text-amber-500" 
                              : bookmark.badgeType === "chat" 
                              ? "bg-blue-500/10 text-blue-500" 
                              : "bg-purple-500/10 text-purple-500"
                          )}>
                            {bookmark.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#6b7280] font-semibold shrink-0">
                      {bookmark.time}
                    </span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => showToast("Loading all recently viewed bookmarks...", "info")}
              className="text-[11.5px] font-bold text-brand-orange hover:text-[#e05d00] transition cursor-pointer text-center w-full mt-3 inline-block"
            >
              View all
            </button>
          </DashboardCard>

          {/* Favorite Topics Card with breathing space and baseline alignment */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[200px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-baseline justify-between mb-4 select-none">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.015em] leading-none">
                Favorite Topics
              </span>
              <button 
                onClick={() => showToast("Opening topics catalog...", "info")}
                className="text-[11.5px] font-bold text-brand-orange hover:text-[#e05d00] transition cursor-pointer leading-none"
              >
                View all
              </button>
            </div>

            {/* Flex horizontal wrap pills with perfect gaps */}
            <div className="flex flex-wrap gap-2.5 flex-1 items-start mt-0.5 select-none">
              {favoriteTopics.map((topic) => (
                <div 
                  key={topic.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-card bg-[#fcfcfa]/55 dark:bg-[#151722]/30 text-[11.5px] font-semibold text-text-secondary cursor-pointer hover:border-brand-orange/20 transition shadow-sm hover:text-text-primary"
                >
                  <span>{topic.name}</span>
                  <span className="text-[10px] text-[#6b7280] font-bold">{topic.count}</span>
                </div>
              ))}
            </div>
          </DashboardCard>

        </div>

      </SectionWrapper>
    </ContentContainer>
  );
}

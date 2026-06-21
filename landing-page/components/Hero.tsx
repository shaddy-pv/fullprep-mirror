"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Trophy, Award, CheckCircle2,
  Bot, Code2, Play, Send, Compass,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
}

interface SidebarTab {
  icon: LucideIcon;
  name: string;
  active?: boolean;
}

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
const SIDEBAR_TABS: SidebarTab[] = [
  { icon: Compass,      name: "Problems",    active: true },
  { icon: Trophy,       name: "Contests" },
  { icon: CheckCircle2, name: "Submissions" },
  { icon: Bot,          name: "AI Tutor" },
];

const INITIAL_COUNTDOWN: Countdown = { hours: 2, minutes: 13, seconds: 30 };

// Pure function defined outside component — no closure over state
const formatNumber = (n: number): string => n.toString().padStart(2, "0");

const tickCountdown = (prev: Countdown): Countdown => {
  if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
  if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
  if (prev.hours > 0)   return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
  return INITIAL_COUNTDOWN; // reset
};

export default function Hero() {
  const [countdown, setCountdown] = useState<Countdown>(INITIAL_COUNTDOWN);
  const [showHint, setShowHint] = useState<boolean>(true);

  // G3: useCallback — stable reference for setInterval
  const tick = useCallback(() => setCountdown(tickCountdown), []);

  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  const dismissHint = useCallback(() => setShowHint(false), []);

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative overflow-hidden py-20 lg:py-28 bg-[#FAFAFA] dark:bg-[#050816] text-[#0F172A] dark:text-gray-100"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#FF6B00]/10 to-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute right-0 bottom-10 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#FF6B00]/5 to-[#FF9E00]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-1/3 -z-10 h-[500px] w-[500px] bg-orange-100/30 blur-[140px] rounded-full dark:hidden pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">

          {/* ── Left Column: Headline & CTAs ── */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-bold text-[#FF6B00] tracking-widest uppercase self-start"
            >
              The Smart Way to Master DSA
            </motion.div>

            <motion.h1
              id="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl leading-[1.05] font-sans"
            >
              Crack Placements. <br />
              <span className="text-[#FF6B00]">Master DSA.</span> <br />
              Build Real Skills.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-normal"
            >
              FullPrep helps you learn, practice, and master Data Structures and
              Algorithms with AI-powered hints, contests, and real-time progress tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF6B00] px-6 py-4 text-base font-semibold text-white hover:bg-[#E56000] active:scale-95 transition-all duration-200 shadow-xl shadow-orange-500/25 group cursor-pointer"
              >
                Start Solving
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#why-fullprep"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 py-4 text-base font-semibold hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Explore Problems
              </a>
            </motion.div>

            {/* Micro stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200/50 dark:border-white/5"
            >
              {(
                [
                  { value: "10,000+", label: "Problems Solved" },
                  { value: "500+",    label: "Active Learners" },
                  { value: "100+",    label: "Coding Contests" },
                ] as const
              ).map((stat) => (
                <div key={stat.label}>
                  <span className="block text-2xl font-bold text-[#FF6B00]">{stat.value}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right Column: Dashboard Mockup ── */}
          <div className="lg:col-span-7 relative w-full mt-10 lg:mt-0 flex justify-center">

            {/* Contest Live widget */}
            <motion.div
              initial={{ opacity: 0, y: -20, x: -30 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -top-6 left-4 md:left-12 z-20"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center space-x-3 rounded-2xl bg-white dark:bg-[#0B0F26]/90 p-4 border border-gray-200/40 dark:border-[rgba(255,255,255,0.06)] shadow-2xl hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-default group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                  <Trophy size={20} className="fill-amber-500/20" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Contest Live</div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-white">Weekly Contest 76</div>
                  <div className="text-xs font-medium text-amber-500 mt-0.5">
                    Ends in {formatNumber(countdown.hours)}h {formatNumber(countdown.minutes)}m {formatNumber(countdown.seconds)}s
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Global Rank widget */}
            <motion.div
              initial={{ opacity: 0, y: -20, x: 30 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -top-10 right-4 md:right-8 z-20"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center space-x-3 rounded-2xl bg-white dark:bg-[#0B0F26]/90 p-4 border border-gray-200/40 dark:border-[rgba(255,255,255,0.06)] shadow-2xl hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-default group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Global Rank</div>
                  <div className="text-base font-extrabold text-[#0F172A] dark:text-white">24,531</div>
                  <div className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400">Top 12.3%</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Solved Problems widget */}
            <motion.div
              initial={{ opacity: 0, y: 30, x: -40 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="absolute -bottom-8 -left-4 md:left-6 z-20"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center space-x-3 rounded-2xl bg-white dark:bg-[#0B0F26]/90 p-4 border border-gray-200/40 dark:border-[rgba(255,255,255,0.06)] shadow-2xl hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-default group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                    <path className="text-gray-200 dark:text-white/5" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeWidth="3.5" strokeDasharray="75, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="text-[10px] font-bold">75%</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Solved Problems</div>
                  <div className="text-base font-extrabold text-[#0F172A] dark:text-white">342</div>
                  <div className="text-[10px] font-semibold text-emerald-500">+12 this week</div>
                </div>
              </motion.div>
            </motion.div>

            {/* AI Hint widget */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 30, x: 40 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute -bottom-12 -right-4 md:right-2 z-20 max-w-[260px]"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="rounded-2xl bg-white dark:bg-[#0B0F26]/95 p-4 border border-orange-500/20 dark:border-orange-500/30 shadow-2xl hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-default transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF6B00]/10 text-[#FF6B00]">
                          <Bot size={15} />
                        </div>
                        <span className="text-xs font-bold text-[#FF6B00]">AI Hint</span>
                      </div>
                      <button
                        onClick={dismissHint}
                        className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-bold cursor-pointer px-1"
                        aria-label="Dismiss hint"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-[11px] font-normal leading-relaxed text-slate-600 dark:text-slate-400 mt-2">
                      Think of using a HashMap to store numbers and their indices as you iterate.
                    </p>
                    <button className="mt-3 flex w-full items-center justify-center rounded-lg border border-[#FF6B00]/30 hover:border-[#FF6B00] bg-[#FF6B00]/5 hover:bg-[#FF6B00]/10 py-1.5 text-[10px] font-semibold text-[#FF6B00] transition-all cursor-pointer">
                      View Full Hint
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Main IDE Window ── */}
            <div className="relative w-full max-w-[620px] rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0E22] border border-slate-200 dark:border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden">

              {/* Browser chrome */}
              <div className="flex h-11 items-center justify-between px-4 border-b border-slate-200 dark:border-white/5 bg-[#F1F5F9] dark:bg-[#090C1D]">
                <div className="flex space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/90" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/90" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/90" />
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 font-mono">
                  <Code2 size={12} className="text-[#FF6B00]" />
                  <span>app.fullprep.dev / two-sum</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Editor shell */}
              <div className="grid grid-cols-12 h-[340px] text-xs">

                {/* Sidebar */}
                <div className="col-span-3 border-r border-slate-200 dark:border-white/5 bg-[#F1F5F9]/50 dark:bg-[#070A17] p-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Overview
                    </div>
                    {SIDEBAR_TABS.map((tab) => (
                      <div
                        key={tab.name}
                        className={`flex items-center space-x-2 rounded-lg px-2 py-1.5 font-semibold cursor-default transition-all ${
                          tab.active
                            ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                        }`}
                      >
                        <tab.icon size={13} className={tab.active ? "text-[#FF6B00]" : ""} />
                        <span className="text-[10px]">{tab.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-lg text-center">
                    <span className="block text-[10px] font-extrabold text-[#FF6B00]">PRO ACCESS</span>
                  </div>
                </div>

                {/* Problem description */}
                <div className="col-span-4 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0A0D1E] p-3 flex flex-col justify-between">
                  <div className="overflow-y-auto max-h-[280px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-white text-[13px]">1. Two Sum</span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500">Easy</span>
                    </div>
                    <div className="mt-3 text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 space-y-2">
                      <p>
                        Given an array of integers <code className="font-mono bg-slate-100 dark:bg-white/5 px-1 rounded">nums</code> and an integer <code className="font-mono bg-slate-100 dark:bg-white/5 px-1 rounded">target</code>.
                      </p>
                      <p>
                        Return <em>indices</em> of the two numbers such that they add up to <code className="font-mono bg-slate-100 dark:bg-white/5 px-1 rounded">target</code>.
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white pt-1">Example 1:</p>
                      <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2 font-mono text-[9px] space-y-1">
                        <div><span className="text-slate-400">Input:</span> nums = [2,7,11,15], target = 9</div>
                        <div><span className="text-slate-400">Output:</span> [0,1]</div>
                        <div><span className="text-slate-400">Explain:</span> nums[0] + nums[1] == 9</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-white/5">
                    <button className="flex items-center space-x-1.5 bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/25 transition-all px-2.5 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer">
                      <Bot size={11} />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>

                {/* Code editor */}
                <div className="col-span-5 bg-white dark:bg-[#070A18] p-3 flex flex-col justify-between font-mono text-[10px]">
                  <div className="space-y-1 select-none leading-normal">
                    <div className="text-slate-400 dark:text-slate-500 font-sans text-[9px] border-b border-slate-100 dark:border-white/5 pb-1 mb-2 flex items-center justify-between">
                      <span>Solution.java</span>
                      <span className="text-[#FF6B00]">Java 21</span>
                    </div>
                    <div><span className="text-[#8250DF] dark:text-[#569CD6]">class</span>{" "}<span className="text-[#0550AE] dark:text-[#4EC9B0]">Solution</span>{" "}<span className="text-slate-400">{`{`}</span></div>
                    <div>&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">public</span>{" "}<span className="text-[#8250DF] dark:text-[#569CD6]">int</span>[]{" "}<span className="text-[#0550AE] dark:text-[#DCDCAA]">twoSum</span>(</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">int</span>[]{" "}<span className="text-slate-700 dark:text-[#9CDCFE]">nums</span>,</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">int</span>{" "}<span className="text-slate-700 dark:text-[#9CDCFE]">target</span></div>
                    <div>&nbsp;&nbsp;) {`{`}</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-700 dark:text-[#6A9955] font-medium">// Write clean code</span></div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#0550AE] dark:text-[#4EC9B0]">Map</span>&lt;<span className="text-[#0550AE] dark:text-[#4EC9B0]">Integer</span>, <span className="text-[#0550AE] dark:text-[#4EC9B0]">Integer</span>&gt;{" "}<span className="text-slate-700 dark:text-[#9CDCFE]">map</span> =</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">new</span>{" "}<span className="text-[#0550AE] dark:text-[#4EC9B0]">HashMap</span>&lt;&gt;();</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-400">...</span></div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">return</span> <span className="text-[#8250DF] dark:text-[#569CD6]">new</span> <span className="text-[#8250DF] dark:text-[#569CD6]">int</span>[]{`{}`};</div>
                    <div>&nbsp;&nbsp;{`}`}</div>
                    <div>{`}`}</div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/5">
                    <button className="flex items-center space-x-1 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer">
                      <Play size={10} />
                      <span>Run</span>
                    </button>
                    <button className="flex items-center space-x-1 bg-[#FF6B00] hover:bg-[#E56000] text-white px-4 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer shadow-md shadow-orange-500/20">
                      <Send size={10} />
                      <span>Submit</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

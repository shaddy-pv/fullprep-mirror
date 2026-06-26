"use client";

import { motion } from "framer-motion";
import { CheckSquare, Users, Trophy, Percent, type LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface Topic {
  name: string;
  percentage: number;
}

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
const STATS: StatItem[] = [
  { label: "Problems Solved", value: "10K+", icon: CheckSquare },
  { label: "Active Learners",  value: "500+", icon: Users },
  { label: "Coding Contests",  value: "100+", icon: Trophy },
  { label: "Satisfaction Rate", value: "98%", icon: Percent },
];

const TOPICS: Topic[] = [
  { name: "Arrays",               percentage: 85 },
  { name: "Dynamic Programming",  percentage: 72 },
  { name: "Graphs",               percentage: 60 },
];

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"] as const;

// Heatmap: 7 rows (Mon→Sun) × 24 columns. Defined once at module level.
// Values 0–4 map to intensity classes (see getIntensityClass).
const HEATMAP_DATA: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 0, 2, 0, 3, 1, 0, 2, 4, 1, 0, 2, 3, 0, 1, 2, 0, 1, 3, 0, 1, 2, 0, 4], // Mon
  [0, 1, 0, 2, 1, 0, 3, 0, 1, 2, 3, 0, 1, 4, 0, 1, 0, 2, 0, 3, 1, 0, 2, 1], // Tue
  [2, 0, 3, 1, 0, 4, 1, 2, 0, 1, 0, 3, 2, 1, 3, 0, 4, 1, 0, 2, 1, 0, 3, 0], // Wed
  [0, 2, 1, 0, 2, 1, 0, 3, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 3, 0, 1, 2, 0, 1], // Thu
  [3, 1, 0, 4, 0, 2, 1, 0, 3, 4, 1, 0, 2, 3, 0, 1, 0, 3, 2, 1, 0, 4, 1, 0], // Fri
  [0, 0, 2, 1, 3, 0, 1, 2, 0, 1, 3, 4, 1, 0, 2, 1, 0, 2, 1, 0, 3, 1, 0, 2], // Sat
  [1, 2, 0, 1, 0, 3, 2, 0, 4, 1, 0, 2, 3, 1, 0, 2, 1, 0, 4, 1, 0, 2, 3, 1], // Sun
] as const;

// Pre-built intensity class lookup — O(1), no switch at runtime
const INTENSITY_CLASS: Record<number, string> = {
  0: "bg-slate-200/60 dark:bg-white/5",
  1: "bg-[#FF6B00]/20",
  2: "bg-[#FF6B00]/40",
  3: "bg-[#FF6B00]/70",
  4: "bg-[#FF6B00]",
} as const;

const getIntensityClass = (val: number): string =>
  INTENSITY_CLASS[val] ?? "bg-slate-200/60 dark:bg-white/5";

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative py-24 bg-[#FAFAFA] dark:bg-[#050816] text-[#0F172A] dark:text-gray-100 scroll-mt-16 overflow-hidden transition-colors duration-300"
    >
      {/* Ambient glow layers */}
      <div className="absolute top-1/4 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-white/[0.02] dark:bg-white/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-[#FF6B00]/[0.02] dark:bg-[#FF6B00]/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] bg-orange-100/30 blur-[140px] rounded-full dark:hidden pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* ── Left Column: Brand Info & Stats ── */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 id="about-title" className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B00] mb-3">
                ABOUT FULLPREP
              </h2>
              <p className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.04em] leading-[1.05] text-slate-900 dark:text-white font-sans">
                Built by developers,<br />
                for future developers.
              </p>
              <p className="text-sm lg:text-base font-normal leading-[1.8] text-slate-600 dark:text-slate-400 mt-5">
                FullPrep is an all-in-one platform to help you master DSA,
                prepare for coding interviews and achieve your dream job.
                Practice. Compete. Grow. All in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-slate-200 dark:border-white/5">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-start space-x-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600/20 to-orange-600/5 border border-orange-500/20 text-[#FF6B00] shrink-0 shadow-sm shadow-orange-500/5">
                    <stat.icon size={16} className="stroke-[2] drop-shadow-[0_0_6px_rgba(255,107,0,0.5)]" />
                  </div>
                  <div>
                    <span className="block text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                      {stat.value}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Dashboard Bento ── */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Top Row: Code Editor (65%) + Topics Strength (35%) */}
            <div className="flex flex-col md:flex-row gap-6 w-full items-stretch">

              {/* Code Editor Card */}
              <motion.section
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                aria-labelledby="code-editor-title"
                className="w-full md:w-[65%] shrink-0 flex flex-col justify-between rounded-2xl bg-white dark:bg-[#0B0F26] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] p-5 shadow-sm hover:shadow-[0_12px_30px_rgba(255,107,0,0.04)] hover:-translate-y-1 transition-all duration-300 dark:hover:shadow-[0_0_40px_rgba(255,107,0,0.12)] relative overflow-hidden group"
              >
                <h3 id="code-editor-title" className="sr-only">Interactive Code Editor Widget</h3>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Traffic lights & filename */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3 mb-4">
                  <div className="flex space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider">
                    solve.js
                  </span>
                </div>

                {/* Syntax-highlighted code body */}
                <div className="font-mono text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300 flex-grow select-none">
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">1</span><span className="text-emerald-700 dark:text-emerald-500 font-medium">{"// Write clean, optimized code"}</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">2</span><span><span className="text-[#8250DF] dark:text-[#569CD6]">function</span>{" "}<span className="text-[#0550AE] dark:text-[#DCDCAA]">solve</span>(arr, target) {`{`}</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">3</span><span>&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">const</span> map ={" "}<span className="text-[#8250DF] dark:text-[#569CD6]">new</span>{" "}<span className="text-[#0550AE] dark:text-[#4EC9B0]">Map</span>();</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">4</span><span>&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#C586C0]">for</span> (<span className="text-[#8250DF] dark:text-[#569CD6]">let</span> i = <span className="text-emerald-600 dark:text-[#B5CEA8]">0</span>; i &lt; arr.length; i++) {`{`}</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">5</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#569CD6]">const</span> complement = target - arr[i];</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">6</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#C586C0]">if</span> (map.<span className="text-[#0550AE] dark:text-[#DCDCAA]">has</span>(complement)) {`{`}</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">7</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#C586C0]">return</span> [map.<span className="text-[#0550AE] dark:text-[#DCDCAA]">get</span>(complement), i];</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">8</span><span>&nbsp;&nbsp;&nbsp;&nbsp;{`}`}</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">9</span><span>&nbsp;&nbsp;&nbsp;&nbsp;map.<span className="text-[#0550AE] dark:text-[#DCDCAA]">set</span>(arr[i], i);</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">10</span><span>&nbsp;&nbsp;{`}`}</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">11</span><span>&nbsp;&nbsp;<span className="text-[#8250DF] dark:text-[#C586C0]">return</span> [];</span></div>
                  <div className="flex"><span className="w-5 text-slate-400 dark:text-slate-600 text-right pr-2">12</span><span>{`}`}</span></div>
                </div>

                {/* Status bar */}
                <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-white/5 pt-3 mt-4 text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono">
                  <span>JAVASCRIPT</span>
                  <span className="text-[#FF6B00]">LINE 12, COL 2</span>
                </div>
              </motion.section>

              {/* Topics Strength Card */}
              <motion.section
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                aria-labelledby="topics-strength-title"
                className="w-full md:w-[35%] shrink-0 flex flex-col justify-between rounded-2xl bg-white dark:bg-[#0B0F26] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] p-5 shadow-sm hover:shadow-[0_12px_30px_rgba(255,107,0,0.04)] hover:-translate-y-1 transition-all duration-300 dark:hover:shadow-[0_0_40px_rgba(255,107,0,0.12)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div>
                  <h3 id="topics-strength-title" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">
                    Topics Strength
                  </h3>
                  <div className="space-y-3.5">
                    {TOPICS.map((topic) => (
                      <div key={topic.name} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{topic.name}</span>
                          <span className="text-[#FF6B00] shrink-0">{topic.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${topic.percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.1 }}
                            className="h-full rounded-full bg-[#FF6B00]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-[rgba(255,255,255,0.06)] pt-3 mt-4 text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono">
                  <span>OVERALL LEVEL</span>
                  <span className="text-[#FF6B00]">72.3% PRO</span>
                </div>
              </motion.section>
            </div>

            {/* Bottom Row: Activity Heatmap */}
            <motion.section
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              aria-labelledby="activity-heatmap-title"
              className="w-full rounded-2xl bg-white dark:bg-[#0B0F26] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] p-5 shadow-sm hover:shadow-[0_12px_30px_rgba(255,107,0,0.04)] hover:-translate-y-1 transition-all duration-300 dark:hover:shadow-[0_0_40px_rgba(255,107,0,0.12)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="flex justify-between items-center mb-4">
                <h3 id="activity-heatmap-title" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Activity Heatmap
                </h3>
                <div className="flex items-center space-x-1.5 text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                  <span>Less</span>
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-200/60 dark:bg-white/5" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#FF6B00]/20" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#FF6B00]/40" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#FF6B00]/70" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#FF6B00]" />
                  <span>More</span>
                </div>
              </div>

              {/* Heatmap grid — pure CSS transitions, no per-cell Framer Motion (G2) */}
              <div className="flex items-stretch w-full overflow-x-auto pb-1">
                {/* Day labels */}
                <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 select-none pr-3 py-[2px] shrink-0">
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <span key={idx} className="flex-1 flex items-center leading-none">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Grid: 24 columns × 7 rows */}
                <motion.div
                  className="flex-1 flex gap-1 justify-between min-w-[500px] select-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {Array.from({ length: 24 }, (_, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1 flex-1">
                      {Array.from({ length: 7 }, (_, rowIdx) => {
                        const val = HEATMAP_DATA[rowIdx][colIdx] ?? 0;
                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className={`w-full aspect-square rounded-[2px] cursor-pointer hover:scale-125 transition-transform duration-150 ${getIntensityClass(val)}`}
                            title={`Level ${val} contribution`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </section>
  );
}

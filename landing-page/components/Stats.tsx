"use client";

import { motion } from "framer-motion";
import { CheckSquare, Users, Trophy, Sparkles, type LucideIcon } from "lucide-react";

// ─── Static data hoisted outside component (G2: zero re-computation on render) ───
interface StatItem {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const STATS: StatItem[] = [
  {
    icon: CheckSquare,
    value: "10,000+",
    label: "Problems Solved",
    description: "Across diverse categories and difficulty levels",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Users,
    value: "500+",
    label: "Active Learners",
    description: "Practicing and refining their skills daily",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Trophy,
    value: "100+",
    label: "Coding Contests",
    description: "Weekly mock tests to gauge performance",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Sparkles,
    value: "AI Powered",
    label: "Smart Hints",
    description: "Tailored debugging tips without spoiling answers",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export default function Stats() {
  return (
    <section aria-labelledby="stats-title" className="py-12 bg-slate-50/50 dark:bg-[#070A18] border-y border-slate-200/50 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="stats-title" className="sr-only">Key Statistics</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex items-center space-x-4 rounded-2xl bg-white dark:bg-[#0B0F26] p-5 border border-slate-200/60 dark:border-[rgba(255,255,255,0.06)] shadow-sm hover:shadow-md dark:hover:border-[#FF6B00]/20 transition-all duration-300 group cursor-default"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white truncate">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-300 mt-0.5 truncate">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

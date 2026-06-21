"use client";

import { motion } from "framer-motion";
import { BookOpen, Bot, Map, Trophy, BarChart3, Flame, type LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Whether the icon uses a filled variant */
  filled?: boolean;
}

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Curated Problems",
    description: "Handpicked problems from easy to hard with detailed explanations.",
  },
  {
    icon: Bot,
    title: "AI Hints",
    description: "Stuck on a problem? Get smart hints and step-by-step guidance.",
  },
  {
    icon: Map,
    title: "Learning Paths",
    description: "Structured roadmaps to go from beginner to placement ready.",
  },
  {
    icon: Trophy,
    title: "Coding Contests",
    description: "Compete weekly, climb the leaderboard and boost your rank.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track progress, solve streaks and improve consistently.",
  },
  {
    icon: Flame,
    title: "Progress Tracking",
    description: "Monitor your strong topics and identify areas to improve.",
    filled: true,
  },
];

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-24 bg-slate-50/30 dark:bg-[#070A17]/60 border-t border-slate-200/50 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 id="features-title" className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-3">
            Our Features
          </h2>
          <p className="text-3xl font-extrabold tracking-[-0.04em] leading-[1.05] sm:text-4xl text-[#0F172A] dark:text-white font-sans">
            Everything you need to level up
          </p>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
            Powerful tools and smart features to accelerate your coding journey.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="h-full"
            >
              <motion.div
                whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 0, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-[#0B0F26] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] shadow-sm hover:shadow-[0_12px_30px_rgba(255,107,0,0.04)] dark:hover:shadow-[0_0_40px_rgba(255,107,0,0.12)] hover:-translate-y-1 dark:hover:border-[#FF6B00]/30 transition-all duration-300 cursor-default h-full"
              >
                {/* Card hover glow overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-600/5 border border-orange-500/20 text-[#FF6B00] mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm shadow-orange-500/5">
                  <feature.icon
                    size={26}
                    className="stroke-[2] drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]"
                    fill={feature.filled ? "#FF6B00" : "none"}
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 relative z-10">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

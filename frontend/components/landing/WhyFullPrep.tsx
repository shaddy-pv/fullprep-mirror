"use client";

import { motion } from "framer-motion";
import { Code2, Target, Briefcase, type LucideIcon } from "lucide-react";

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
interface Card {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CARDS: Card[] = [
  {
    icon: Code2,
    title: "Learn DSA Effectively",
    description: "Structured learning paths from basics to advanced topics.",
  },
  {
    icon: Target,
    title: "Practice Consistently",
    description: "Handpicked problems to build strong problem-solving skills.",
  },
  {
    icon: Briefcase,
    title: "Crack Interviews",
    description: "Prepare for top tech interviews and land your dream job.",
  },
];

export default function WhyFullPrep() {
  return (
    <section
      id="why-fullprep"
      aria-labelledby="why-fullprep-title"
      className="py-20 bg-[#FAFAFA] dark:bg-[#050816] text-[#0F172A] dark:text-gray-100 scroll-mt-16 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="why-fullprep-title" className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-3">
            Why FullPrep
          </h2>
          <p className="text-3xl font-extrabold tracking-[-0.04em] leading-[1.05] sm:text-4xl text-[#0F172A] dark:text-white font-sans">
            A coding platform built for actual growth.
          </p>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
            We bypass the fluff and offer a laser-focused interface designed to
            develop deep engineering intuition.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 0, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-[#0B0F26] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] shadow-sm hover:shadow-[0_0_30px_rgba(255,107,0,0.12)] transition-all duration-300 cursor-default h-full"
              >
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-600/5 border border-orange-500/20 text-[#FF6B00] group-hover:scale-110 transition-transform duration-300 mb-6 shadow-sm relative z-10 shadow-orange-500/5">
                  <card.icon size={26} className="stroke-[2] drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                  {card.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

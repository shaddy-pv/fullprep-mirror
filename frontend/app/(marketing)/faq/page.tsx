"use client";
import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Is FullPrep really free?", a: "Yes, our core problem set and basic contests are completely free. We offer a Premium plan that unlocks AI hints, video editorials, and unlimited submissions." },
  { q: "How does the AI Tutor work?", a: "Our AI Tutor analyzes your code in real-time. Instead of giving you the answer, it provides Socratic hints to guide you toward the solution, helping you actually learn the concepts." },
  { q: "What programming languages are supported?", a: "We currently support Python, JavaScript, TypeScript, C++, Java, and Go in our execution environment." },
  { q: "Can I use FullPrep to prepare for FAANG interviews?", a: "Absolutely! Our learning paths are specifically tailored around patterns (like Sliding Window, Two Pointers, DP) that are frequently asked at top tech companies." }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Frequently Asked Questions" description="Everything you need to know about the product and billing.">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-sm">
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="text-lg font-medium text-slate-900 dark:text-white">{faq.q}</span>
                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                      <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

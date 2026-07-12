"use client";

import React from "react";
import { motion } from "framer-motion";

interface PremiumPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PremiumPageWrapper({ children, title, description }: PremiumPageWrapperProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050816] overflow-hidden text-slate-800 dark:text-slate-200">
      {/* Background Gradients (matches landing page style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-orange-500/10 dark:bg-orange-500/15 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-500/15 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

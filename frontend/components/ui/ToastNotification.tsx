"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";

export default function ToastNotification() {
  const { toast, hideToast } = useNotificationStore();

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-[#111217] border border-slate-900/10 dark:border-white/10 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-xl px-4 py-3 min-w-[300px] max-w-[400px]"
        >
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
              toast.type === "success"
                ? "bg-[#10b981]/10 text-[#10b981]"
                : "bg-brand-orange/10 text-brand-orange"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1 text-[13px] font-semibold text-[#111827] dark:text-white leading-tight">
            {toast.message}
          </div>

          {/* Close Button */}
          <button
            onClick={hideToast}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

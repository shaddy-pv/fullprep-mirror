"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

/**
 * LocationToast
 * Permanent, non-closable bottom-right toast shown to any user (new or existing)
 * who has not set their location yet.
 *
 * Disappears automatically when:
 * - user.location becomes truthy in the auth store
 * - OR the custom "fp-location-set" event is dispatched (fired by Settings page on save)
 */
export default function LocationToast() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show toast only when user is loaded and has no location
    if (user && !user.location) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user?.location, user?._id]);

  useEffect(() => {
    // Listen for the event dispatched by Settings page when location is saved
    const handler = () => setVisible(false);
    window.addEventListener("fp-location-set", handler);
    return () => window.removeEventListener("fp-location-set", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
        >
          <div className="relative flex items-center gap-3.5 rounded-2xl border border-brand-orange/25 bg-[#0c0d16]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.08)] px-4 py-3.5 max-w-[320px]">
            {/* Left glow dot */}
            <div className="w-9 h-9 rounded-xl bg-brand-orange/15 border border-brand-orange/20 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-brand-orange" />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-[12.5px] font-bold text-white leading-tight">
                Set your location
              </span>
              <span className="text-[11px] text-white/55 leading-tight">
                Personalize your FullPrep experience.
              </span>
            </div>

            <button
              onClick={() => router.push("/settings")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-[#e05d00] text-white text-[11px] font-bold transition-all duration-200 shrink-0 cursor-pointer"
            >
              Go
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Subtle bottom glow line */}
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

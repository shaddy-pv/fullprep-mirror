"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Bell, ExternalLink, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface ContestCardProps {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  duration: string;
  tags: string[];
  initialSecondsLeft: number;
  featured?: boolean;
  type?: "Rated" | "Practice";
  slug?: string;
  status?: "live" | "upcoming";
  isCompleted?: boolean;
}

export default function ContestCard({
  id,
  title,
  date,
  timeRange,
  duration,
  tags,
  initialSecondsLeft,
  featured = false,
  type = "Rated",
  slug,
  status = "live",
  isCompleted = false,
}: ContestCardProps) {
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [isReminderSet, setIsReminderSet] = useState(false);

  // Live Countdown ticking
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Format countdown text
  const formatCountdown = () => {
    if (secondsLeft <= 0) return { days: "00", hrs: "00", mins: "00", secs: "00" };
    const days = Math.floor(secondsLeft / (24 * 3600));
    const hours = Math.floor((secondsLeft % (24 * 3600)) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    return {
      days: String(days).padStart(2, "0"),
      hrs: String(hours).padStart(2, "0"),
      mins: String(minutes).padStart(2, "0"),
      secs: String(seconds).padStart(2, "0"),
    };
  };

  const { days, hrs, mins } = formatCountdown();

  const handleReminderToggle = () => {
    setIsReminderSet(!isReminderSet);
    if (!isReminderSet) {
      showToast(`Reminder set for ${title}!`, "success");
    } else {
      showToast(`Reminder removed for ${title}.`, "info");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] p-6 hover:shadow-md hover:border-[#ff6a00]/30 dark:hover:border-[#ff6a00]/20 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative select-none">
      
      {/* Left side: Icon, Details, Tags */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        
        {/* Contest Accent Icon Wrapper */}
        <div className="w-12 h-12 rounded-2xl bg-[#fff5eb] dark:bg-[#ff6a00]/10 border border-[#ff6a00]/10 flex items-center justify-center text-brand-orange shrink-0 mt-0.5 shadow-sm">
          <CalendarDays className="w-5 h-5 stroke-[2]" />
        </div>

        {/* Content details */}
        <div className="flex flex-col text-left min-w-0">
          
          {/* Header Title with Featured tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-bold text-text-primary tracking-[-0.015em] leading-snug hover:text-brand-orange transition-colors truncate max-w-[240px] sm:max-w-[320px] md:max-w-none">
              {title}
            </h3>
            {featured && (
              <Badge variant="medium" className="text-[9px] py-0.5 font-bold uppercase tracking-wider scale-90">
                Featured
              </Badge>
            )}
          </div>

          {/* Time & Meta rows */}
          <div className="flex flex-col gap-1 mt-1.5">
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-text-secondary leading-none">
              <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
              <span>{date}</span>
              <span className="text-border-card dark:text-white/[0.08]">•</span>
              <Clock className="w-4 h-4 text-brand-orange shrink-0" />
              <span>{timeRange} ({duration})</span>
            </div>
          </div>

          {/* Chips tags using Standard Badge Primitive */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge 
              variant={type === "Rated" ? "medium" : "default"} 
              className="text-[10px] py-0.5 font-bold tracking-wide uppercase"
            >
              {type}
            </Badge>
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="default"
                className="text-[10px] py-0.5 font-medium tracking-wide text-text-secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>

        </div>

      </div>

      {/* Middle side: Countdown Tickers (visual layout matches mockup) */}
      <div className="flex flex-col items-start lg:items-center text-left lg:text-center min-w-[140px] shrink-0 border-l border-r border-transparent lg:border-border-card px-0 lg:px-6 py-1 lg:py-0">
        <span className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-wider">
          {isCompleted ? "Completed" : status === "live" ? "Time Left" : "Starts In"}
        </span>
        
        {/* Countdown layout matches screenshot exactly */}
        <div className="flex items-center gap-3 mt-1.5 text-text-primary">
          <div className="flex flex-col items-center">
            <span className="text-[20px] font-extrabold tracking-tight leading-none">{days}</span>
            <span className="text-[8px] text-text-secondary font-bold uppercase mt-1">days</span>
          </div>
          <span className="text-[16px] font-normal text-text-secondary/30 pb-3">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-[20px] font-extrabold tracking-tight leading-none">{hrs}</span>
            <span className="text-[8px] text-text-secondary font-bold uppercase mt-1">hrs</span>
          </div>
          <span className="text-[16px] font-normal text-text-secondary/30 pb-3">:</span>

          <div className="flex flex-col items-center">
            <span className="text-[20px] font-extrabold tracking-tight leading-none">{mins}</span>
            <span className="text-[8px] text-text-secondary font-bold uppercase mt-1">mins</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions buttons */}
      <div className="flex flex-col gap-2 shrink-0 w-full lg:w-[150px]">
        <Button
          variant="primary"
          disabled={status === "upcoming" || isCompleted}
          className="w-full sm:w-[150px] py-[10px] font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:shadow-[0_6px_16px_rgba(255,106,0,0.35)] active:shadow-none transition-all duration-200"
          onClick={() => {
            if (tags.includes("Weekly")) {
              router.push(`/contests/${id}`);
            } else if (slug) {
              const contestType = tags.includes("Daily") || title.toLowerCase().includes("daily") ? "daily" : "custom";
              router.push(`/problems/${slug}?mode=contest&contestId=${id}&type=${contestType}`);
            } else {
              showToast(`Entering lobby for ${title}!`, "success");
            }
          }}
        >
          <span>{isCompleted ? "Completed" : status === "upcoming" ? "Wait..." : "Join Contest"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="secondary"
          className={`py-2.5 text-center justify-center font-bold w-full ${
            isReminderSet ? "border-brand-orange/40 text-brand-orange bg-[#ff6a00]/5" : ""
          }`}
          onClick={handleReminderToggle}
        >
          <Bell className={`w-3.5 h-3.5 ${isReminderSet ? "fill-brand-orange" : ""}`} />
          <span>{isReminderSet ? "Reminder Set" : "Set Reminder"}</span>
        </Button>
      </div>

    </div>
  );
}

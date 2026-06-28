"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ContestsService } from "@/services/contests.service";
import { AuthService } from "@/services/auth.service";
import { Trophy, Clock, PlayCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ContestLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContest = async () => {
      // Validate weekend for weekly contest
      const today = new Date().getDay();
      const isWeekend = today === 0 || today === 6;
      if (!isWeekend) {
        showToast("Weekly contests are only available on weekends!", "error");
        router.push("/contests");
        return;
      }

      try {
        const data = await ContestsService.getWeeklyContest();
        if (data && data.problems) {
          setContest(data);
        } else {
          showToast("Failed to load contest.", "error");
          router.push("/contests");
        }
      } catch (err) {
        showToast("Error loading contest.", "error");
        router.push("/contests");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id, router, showToast]);

  const handleEndContest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await ContestsService.submitContestResult(
        contest.id,
        "weekly",
        45 * 60 * 1000,
        true
      );
      
      if (res) {
        showToast(`Contest completed! You earned ${res.pointsEarned || 0} points.`, "success");
        // Reload user from authStore
        await AuthService.getCurrentUser();
      } else {
        showToast("Contest ended.", "success");
      }
      router.push("/contests");
    } catch (err) {
      showToast("Error submitting contest.", "error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 lg:p-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div>
          <Link href="/contests" className="flex items-center text-text-secondary hover:text-text-primary transition-colors text-[13px] font-bold mb-4 uppercase tracking-wider">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Contests
          </Link>
          <h1 className="text-[28px] font-extrabold text-text-primary flex items-center gap-3 tracking-tight">
            <Trophy className="w-8 h-8 text-brand-orange" />
            {contest?.title || "Weekly Contest"}
          </h1>
          <p className="text-text-secondary mt-2 text-[14px] font-medium max-w-2xl leading-relaxed">
            Solve all {contest?.problems?.length || 4} problems before the time runs out. Each problem is worth 20 points! You must submit the contest using the End Contest button when you are finished.
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={handleEndContest}
          disabled={submitting}
          className="bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white font-bold px-6 py-2.5 rounded-xl border-none"
        >
          {submitting ? "Ending..." : "End Contest"}
        </Button>
      </div>

      {/* Problems List */}
      <div className="grid grid-cols-1 gap-4">
        {contest?.problems?.map((prob: any, index: number) => (
          <div 
            key={prob.slug || prob._id || index}
            className="flex items-center justify-between bg-white dark:bg-[#11131c] border border-border-card rounded-2xl p-5 hover:border-brand-orange/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-lg">
                {String.fromCharCode(65 + index)}
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-text-primary hover:text-brand-orange transition-colors">
                  {prob.name}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                    prob.difficulty === "EASY" ? "bg-green-500/10 text-green-500" :
                    prob.difficulty === "MEDIUM" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {prob.difficulty}
                  </span>
                  <span className="text-[12px] font-medium text-text-secondary">
                    20 Points
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant="secondary"
              className="font-bold gap-2 py-2"
              onClick={() => router.push(`/problems/${prob.slug || prob.externalId}?mode=contest`)}
            >
              <PlayCircle className="w-4 h-4 text-brand-orange" />
              Solve Problem
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

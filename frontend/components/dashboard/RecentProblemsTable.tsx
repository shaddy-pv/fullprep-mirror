"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";
import TableRow from "./TableRow";
import { ProblemsService } from "@/services/problems.service";
import { SubmissionsService } from "@/services/submissions.service";
import { ExtendedProblemItem } from "@/mocks/problems.mock";

export default function ProblemsTable() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Recent Problems");
  const [recentProblems, setRecentProblems] = useState<ExtendedProblemItem[]>([]);
  const [recommendedProblems, setRecommendedProblems] = useState<ExtendedProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent problems
        const subsRes = await SubmissionsService.getSubmissions(1, 20);
        if (subsRes && subsRes.data) {
          // Deduplicate by problemExternalId
          const seen = new Set();
          const mapped = subsRes.data
            .filter((s: any) => {
              if (seen.has(s.problemExternalId)) return false;
              seen.add(s.problemExternalId);
              return true;
            })
            .slice(0, 5)
            .map((s: any) => ({
              externalId: s.problemExternalId,
              title: s.problemName || "Unknown Problem",
              status: s.status === "ACCEPTED" ? "completed" : "pending",
              difficulty: s.problem?.difficulty || "Medium",
              topic: s.problem?.cfTags && s.problem.cfTags.length > 0 ? s.problem.cfTags[0] : "Algorithms",
              time: new Date(s.createdAt).toLocaleDateString(),
            }));
          setRecentProblems(mapped as unknown as ExtendedProblemItem[]);
        }

        // Fetch recommended
        const probs = await ProblemsService.getProblems();
        setRecommendedProblems(probs.slice(5, 10)); // Just offset some problems for recommendation
      } catch (err) {
        console.error("Error fetching dashboard problems", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = ["Recent Problems", "Upcoming Contests", "Recommended"];

  const getDisplayedContent = () => {
    if (activeTab === "Recent Problems") {
      if (recentProblems.length === 0 && !isLoading) {
         return <div className="text-sm text-text-secondary py-4 text-center">No recent problems found. Start solving!</div>;
      }
      return recentProblems.map((problem, idx) => (
        <TableRow
          key={idx}
          title={problem.title}
          status={problem.status}
          difficulty={problem.difficulty}
          topic={problem.topic}
          time={problem.time}
          externalId={(problem as any).externalId}
        />
      ));
    }
    
    if (activeTab === "Upcoming Contests") {
      const today = new Date().getDay();
      const isWeekend = today === 0 || today === 6;
      if (!isWeekend) {
        return <div className="text-sm text-text-secondary py-4 text-center">No upcoming contests currently. Check back on the weekend!</div>;
      }
      return (
        <div className="flex items-center justify-between py-3 px-2">
          <div>
            <h4 className="text-[14px] font-medium text-text-primary">Weekly Coding Contest</h4>
            <p className="text-[13px] text-text-secondary mt-1">Join the weekend challenge!</p>
          </div>
          <Button onClick={() => router.push("/contests")} className="px-4 py-1.5 text-sm h-auto">View Details</Button>
        </div>
      );
    }
    
    // Recommended
    return recommendedProblems.map((problem, idx) => (
      <TableRow
        key={idx}
        title={problem.title}
        status={problem.status}
        difficulty={problem.difficulty}
        topic={problem.topic}
        time={problem.time}
        externalId={(problem as any).externalId}
      />
    ));
  };

  return (
    <DashboardCard className="h-auto md:h-[490px] p-4 md:p-6 flex flex-col justify-between">
      <div className="flex flex-col w-full min-w-0">
        {/* Table Tabs Header */}
        <div className="flex border-b border-border-card mb-4 gap-4 md:gap-6 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 w-full min-w-0 pr-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[13px] md:text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 shrink-0 ${
                  isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-orange rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Problems Rows */}
        <div className="divide-y divide-border-card">
          {isLoading ? (
            <div className="text-sm text-text-secondary py-4 text-center">Loading...</div>
          ) : (
            getDisplayedContent()
          )}
        </div>
      </div>

      {/* Footer View All Button */}
      <div className="pt-3 border-t border-border-card mt-auto">
        <Button 
          variant="link" 
          className="flex items-center gap-1.5 hover:text-brand-orange transition-colors group"
          onClick={() => router.push("/problems")}
        >
          <span>View All Problems</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
        </Button>
      </div>
    </DashboardCard>
  );
}

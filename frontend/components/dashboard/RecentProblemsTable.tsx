"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";
import TableRow from "./TableRow";
import { PROBLEMS_MOCK_DATA } from "@/constants/navigation";

export default function ProblemsTable() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Recent Problems");

  const tabs = ["Recent Problems", "Upcoming Contests", "Recommended for You"];

  return (
    <DashboardCard className="h-[490px] p-6 flex flex-col justify-between">
      <div>
        {/* Table Tabs Header */}
        <div className="flex border-b border-border-card mb-4 gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 ${
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
          {PROBLEMS_MOCK_DATA.map((problem, idx) => (
            <TableRow
              key={idx}
              title={problem.title}
              status={problem.status}
              difficulty={problem.difficulty}
              topic={problem.topic}
              time={problem.time}
            />
          ))}
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

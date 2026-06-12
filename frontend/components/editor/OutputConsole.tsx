"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardCard from "../ui/DashboardCard";

interface OutputConsoleProps {
  activeConsoleTab: "testcase" | "result" | "console";
  setActiveConsoleTab: (tab: "testcase" | "result" | "console") => void;
  selectedTestCase: number;
  setSelectedTestCase: (tc: number) => void;
  testResultState: "none" | "running" | "accepted" | "wrong_answer" | "compile_error" | "runtime_error";
  submissionDetails?: any;
}

export default function OutputConsole({
  activeConsoleTab,
  setActiveConsoleTab,
  selectedTestCase,
  setSelectedTestCase,
  testResultState,
  submissionDetails
}: OutputConsoleProps) {
  return (
    <DashboardCard className="p-4 flex flex-col justify-between h-[230px] rounded-[24px] border border-border-card bg-card-bg shadow-sm shrink-0 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Tab Selector Header */}
        <div className="flex border-b border-border-card pb-2.5 gap-5 select-none shrink-0">
          {[
            { id: "testcase", label: "Testcase" },
            { id: "result", label: "Test Result" },
            { id: "console", label: "Console" },
          ].map((tab) => {
            const isActive = activeConsoleTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveConsoleTab(tab.id as "testcase" | "result" | "console")}
                className={cn(
                  "pb-1.5 text-[13px] font-bold tracking-[-0.01em] relative cursor-pointer transition-colors duration-200 focus:outline-none",
                  isActive 
                    ? "text-brand-orange" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-[-11px] left-0 right-0 h-[2.5px] bg-brand-orange rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Workspace Panels */}
        <div className="flex-1 min-h-0 pt-3 relative overflow-hidden">
          {testResultState === "running" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none">
              <div className="w-5 h-5 rounded-full border-[2.5px] border-[#d1d5db] dark:border-white/[0.1] border-t-brand-orange animate-spin" />
              <span className="text-[12px] font-bold text-text-secondary animate-pulse font-mono uppercase tracking-wider">
                Compiling & running tests...
              </span>
            </div>
          ) : activeConsoleTab === "testcase" ? (
            /* Testcase Inputs Column */
            <div className="flex flex-col h-full gap-2.5 overflow-y-auto custom-scrollbar pr-1">
              <div className="flex items-center gap-1.5 select-none">
                {[1, 2, 3].map((tc) => (
                  <button
                    key={tc}
                    onClick={() => setSelectedTestCase(tc)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[12px] font-bold cursor-pointer transition focus:outline-none",
                      selectedTestCase === tc
                        ? "bg-gray-200 dark:bg-white/[0.08] text-text-primary"
                        : "bg-gray-100 dark:bg-white/[0.03] text-text-secondary hover:text-text-primary"
                    )}
                  >
                    Case {tc}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-bold text-text-secondary font-mono">nums =</span>
                  <div className="p-2.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text">
                    {selectedTestCase === 1 ? "[2,7,11,15]" : selectedTestCase === 2 ? "[3,2,4]" : "[3,3]"}
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-bold text-text-secondary font-mono">target =</span>
                  <div className="p-2.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text">
                    {selectedTestCase === 1 ? "9" : selectedTestCase === 2 ? "6" : "6"}
                  </div>
                </div>
              </div>
            </div>
          ) : activeConsoleTab === "result" ? (
            testResultState === "none" ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary text-[12px] font-semibold select-none">
                <span>Please run or submit your solution first.</span>
              </div>
            ) : testResultState === "compile_error" || testResultState === "runtime_error" ? (
              /* Compilation/Runtime Error Panel */
              <div className="w-full h-full bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 font-mono text-[11.5px] leading-relaxed text-red-600 dark:text-red-400 select-text overflow-y-auto custom-scrollbar text-left shadow-inner">
                <div className="font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
                  {testResultState === "compile_error" ? "Compile Error" : "Runtime Error"}
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-semibold leading-relaxed">
                  {submissionDetails?.errorMessage || "An error occurred during code evaluation."}
                </pre>
              </div>
            ) : (
              /* Testcase Results Column */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto custom-scrollbar pr-1">
                {/* Left case selectors & details */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 select-none">
                    {[1, 2, 3].map((tc) => (
                      <button
                        key={tc}
                        onClick={() => setSelectedTestCase(tc)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-[12px] font-bold cursor-pointer transition focus:outline-none",
                          selectedTestCase === tc
                            ? "bg-gray-200 dark:bg-white/[0.08] text-text-primary"
                            : "bg-gray-100 dark:bg-white/[0.03] text-text-secondary hover:text-text-primary"
                        )}
                      >
                        Case {tc}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5 text-left text-[12px]">
                    <span className="font-bold text-text-secondary font-mono">Input</span>
                    <div className="p-2 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text overflow-x-auto">
                      {selectedTestCase === 1 ? "nums = [2,7,11,15], target = 9" : selectedTestCase === 2 ? "nums = [3,2,4], target = 6" : "nums = [3,3], target = 6"}
                    </div>
                  </div>
                </div>

                {/* Right console output details */}
                <div className="flex flex-col gap-2 border-l border-border-card/60 pl-0 md:pl-4 text-left text-[12px]">
                  {/* Accepted/Failed Status header */}
                  <div className="flex items-baseline justify-between select-none">
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-[13px] font-bold",
                        testResultState === "accepted" ? "text-[#10b981]" : "text-red-500"
                      )}>
                        {testResultState === "accepted" ? "Accepted" : "Wrong Answer"}
                      </span>
                      <span className="text-[11px] text-text-secondary font-bold font-mono">
                        Runtime: {submissionDetails?.executionTimeMs ?? 32} ms
                      </span>
                    </div>
                    <span className="text-[11px] text-text-secondary font-bold font-mono">
                      Memory: {submissionDetails?.memoryUsedMb ?? "12.4"} MB
                    </span>
                  </div>

                  {/* Casepassed tick */}
                  {testResultState === "accepted" ? (
                    <div className="flex items-center gap-1.5 text-[#10b981] font-bold text-[11.5px] select-none">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span>All {submissionDetails?.testCasesTotal ?? 3} test cases passed</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-[11.5px] select-none text-left">
                      <span className="text-red-500 font-bold">
                        Failed Case ({submissionDetails?.testCasesPassed ?? 2} / {submissionDetails?.testCasesTotal ?? 3} cases passed)
                      </span>
                      {submissionDetails?.errorMessage && (
                        <span className="text-text-secondary font-mono text-[10.5px] mt-0.5 leading-snug">
                          {submissionDetails.errorMessage}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Output / Expected */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-text-secondary font-mono">Output</span>
                      <div className={cn(
                        "p-1.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono font-bold select-text text-center",
                        testResultState === "accepted" ? "text-[#10b981]" : "text-red-500"
                      )}>
                        {testResultState === "accepted"
                          ? (selectedTestCase === 1 ? "[0,1]" : selectedTestCase === 2 ? "[1,2]" : "[0,1]")
                          : (selectedTestCase === 1 ? "[0,1]" : selectedTestCase === 2 ? "[1,2]" : "[]")
                        }
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-text-secondary font-mono">Expected</span>
                      <div className="p-1.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text text-center">
                        {selectedTestCase === 1 ? "[0,1]" : selectedTestCase === 2 ? "[1,2]" : "[0,1]"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Raw Console execution logs */
            <div className="w-full h-full bg-gray-100 dark:bg-white/[0.02] border border-border-card rounded-xl p-3.5 font-mono text-[11.5px] leading-relaxed text-text-secondary select-text overflow-y-auto custom-scrollbar text-left shadow-inner">
              <div className="text-text-primary font-bold">~ Compiled code successfully on Sandbox.</div>
              <div className="text-brand-orange font-bold mt-1">Running test suite cases...</div>
              {testResultState === "accepted" ? (
                <>
                  <div className="text-[#10b981] mt-0.5">&gt; TestCase 1: Passed (Runtime: 12ms, Memory: 11MB)</div>
                  <div className="text-[#10b981]">&gt; TestCase 2: Passed (Runtime: 18ms, Memory: 12MB)</div>
                  <div className="text-[#10b981]">&gt; TestCase 3: Passed (Runtime: 15ms, Memory: 11MB)</div>
                  <div className="text-[#10b981] font-bold mt-1">&gt;&gt; All test suite validations passed. Accepted solution.</div>
                </>
              ) : testResultState === "wrong_answer" ? (
                <>
                  <div className="text-[#10b981] mt-0.5">&gt; TestCase 1: Passed (Runtime: 12ms, Memory: 11MB)</div>
                  <div className="text-[#10b981]">&gt; TestCase 2: Passed (Runtime: 18ms, Memory: 12MB)</div>
                  <div className="text-red-500">&gt; TestCase 3: Failed (Assertion failed: expected [1,2] but got [0,1])</div>
                  <div className="text-red-500 font-bold mt-1">&gt;&gt; Test suite failed. Wrong Answer.</div>
                </>
              ) : testResultState === "compile_error" || testResultState === "runtime_error" ? (
                <div className="text-red-500 font-bold">
                  &gt;&gt; Code execution failed. Check the &apos;Test Result&apos; tab for detail logs.
                </div>
              ) : (
                <div className="text-text-secondary mt-1">~ Idle. Run or submit your solution.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

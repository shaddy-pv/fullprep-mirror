"use client";

import React from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardCard from "../ui/DashboardCard";
import type { RunTestResult } from "@/services/submissions.service";

interface OutputConsoleProps {
  activeConsoleTab: "testcase" | "result" | "console";
  setActiveConsoleTab: (tab: "testcase" | "result" | "console") => void;
  selectedTestCase: number;
  setSelectedTestCase: (tc: number) => void;
  testResultState: "none" | "running" | "accepted" | "wrong_answer" | "compile_error" | "runtime_error";
  submissionDetails?: any;
  // Run-mode results (public test cases, shown immediately)
  runResults?: RunTestResult[] | null;
  isRunMode?: boolean;
  // Real public tests to display in "Testcase" tab
  publicTests?: { input: string; output: string }[];
}

export default function OutputConsole({
  activeConsoleTab,
  setActiveConsoleTab,
  selectedTestCase,
  setSelectedTestCase,
  testResultState,
  submissionDetails,
  runResults,
  isRunMode,
  publicTests,
}: OutputConsoleProps) {

  const displayTests = publicTests && publicTests.length > 0 ? publicTests : [];
  const numTestCases = Math.max(displayTests.length, 1);

  // For run-mode result display
  const runResult = runResults && runResults.length > 0
    ? runResults[selectedTestCase - 1] ?? runResults[0]
    : null;

  return (
    <DashboardCard className="p-4 flex flex-col justify-between h-[230px] rounded-[24px] border border-border-card bg-card-bg shadow-sm shrink-0 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Tab Selector Header */}
        <div className="flex border-b border-border-card pb-2.5 gap-5 select-none shrink-0">
          {[
            { id: "testcase", label: "Testcase" },
            { id: "result",   label: "Test Result" },
            { id: "console",  label: "Console" },
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
                {isRunMode ? "Running against example tests..." : "Judging against hidden tests..."}
              </span>
            </div>
          ) : activeConsoleTab === "testcase" ? (
            /* ── Testcase Tab: show real public test inputs ── */
            <div className="flex flex-col h-full gap-2.5 overflow-y-auto custom-scrollbar pr-1">
              <div className="flex items-center gap-1.5 select-none">
                {Array.from({ length: numTestCases }, (_, i) => i + 1).map((tc) => (
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

              {displayTests.length > 0 ? (
                <div className="flex flex-col gap-1.5 text-[12px]">
                  <span className="font-bold text-text-secondary font-mono">Input</span>
                  <div className="p-2.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text overflow-auto max-h-[100px] whitespace-pre">
                    {displayTests[selectedTestCase - 1]?.input ?? ""}
                  </div>
                  <span className="font-bold text-text-secondary font-mono mt-1">Expected Output</span>
                  <div className="p-2.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text overflow-auto max-h-[60px] whitespace-pre">
                    {displayTests[selectedTestCase - 1]?.output ?? ""}
                  </div>
                </div>
              ) : (
                <div className="text-[12px] text-text-secondary font-semibold">
                  No public test cases available for this problem.
                </div>
              )}
            </div>

          ) : activeConsoleTab === "result" ? (
            /* ── Result Tab ── */
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
                  {submissionDetails?.errorMessage
                    ?? runResult?.stderr
                    ?? "An error occurred during code evaluation."}
                </pre>
              </div>
            ) : isRunMode && runResults ? (
              /* ── Run Mode: show per-test results ── */
              <div className="flex flex-col h-full gap-2 overflow-y-auto custom-scrollbar pr-1">
                {/* Test case selector with pass/fail indicators */}
                <div className="flex items-center gap-1.5 select-none">
                  {runResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTestCase(i + 1)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-lg text-[12px] font-bold cursor-pointer transition focus:outline-none",
                        selectedTestCase === i + 1
                          ? "bg-gray-200 dark:bg-white/[0.08] text-text-primary"
                          : "bg-gray-100 dark:bg-white/[0.03] text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {r.passed
                        ? <Check className="w-3 h-3 text-[#10b981] stroke-[3]" />
                        : <X className="w-3 h-3 text-red-500 stroke-[3]" />
                      }
                      Case {i + 1}
                    </button>
                  ))}
                </div>

                {runResult && (
                  <div className="flex flex-col gap-1.5 text-[12px]">
                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[13px] font-bold",
                        runResult.passed ? "text-[#10b981]" : "text-red-500"
                      )}>
                        {runResult.passed ? "✓ Passed" : "✗ Failed"}
                      </span>
                      {runResult.executionTime > 0 && (
                        <span className="text-[11px] text-text-secondary font-mono">
                          {runResult.executionTime.toFixed(3)}s
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-text-secondary font-mono">Your Output</span>
                        <div className={cn(
                          "p-1.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono font-bold select-text overflow-auto max-h-[60px] whitespace-pre text-[11px]",
                          runResult.passed ? "text-[#10b981]" : "text-red-500"
                        )}>
                          {runResult.actual || <span className="text-text-secondary italic">(empty)</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-text-secondary font-mono">Expected</span>
                        <div className="p-1.5 bg-gray-100 dark:bg-white/[0.03] border border-border-card rounded-lg font-mono text-text-primary select-text overflow-auto max-h-[60px] whitespace-pre text-[11px]">
                          {runResult.expected}
                        </div>
                      </div>
                    </div>

                    {runResult.stderr && !runResult.passed && (
                      <div className="text-[11px] text-red-500 font-mono bg-red-500/5 p-2 rounded-lg border border-red-500/20 overflow-auto max-h-[50px] whitespace-pre">
                        {runResult.stderr}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ── Submit Mode result ── */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto custom-scrollbar pr-1">
                {/* Left */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between select-none">
                    <span className={cn(
                      "text-[13px] font-bold",
                      testResultState === "accepted" ? "text-[#10b981]" : "text-red-500"
                    )}>
                      {testResultState === "accepted" ? "✓ Accepted" : "✗ Wrong Answer"}
                    </span>
                    <span className="text-[11px] text-text-secondary font-bold font-mono">
                      Runtime: {submissionDetails?.executionTimeMs ?? 0} ms
                    </span>
                  </div>

                  {testResultState === "accepted" ? (
                    <div className="flex items-center gap-1.5 text-[#10b981] font-bold text-[11.5px] select-none">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span>All {submissionDetails?.testCasesTotal ?? "–"} test cases passed</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-[11.5px] select-none text-left">
                      <span className="text-red-500 font-bold">
                        Failed ({submissionDetails?.testCasesPassed ?? 0} / {submissionDetails?.testCasesTotal ?? "–"} cases passed)
                      </span>
                      {submissionDetails?.errorMessage && (
                        <span className="text-text-secondary font-mono text-[10.5px] mt-0.5 leading-snug">
                          {submissionDetails.errorMessage}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: memory */}
                <div className="flex flex-col gap-2 border-l border-border-card/60 pl-0 md:pl-4 text-left text-[12px]">
                  <span className="text-[11px] text-text-secondary font-bold font-mono">
                    Memory: {submissionDetails?.memoryUsedMb ?? "–"} MB
                  </span>
                </div>
              </div>
            )
          ) : (
            /* ── Console Tab ── */
            <div className="w-full h-full bg-gray-100 dark:bg-white/[0.02] border border-border-card rounded-xl p-3.5 font-mono text-[11.5px] leading-relaxed text-text-secondary select-text overflow-y-auto custom-scrollbar text-left shadow-inner">
              <div className="text-text-primary font-bold">~ Compiled code on Sandbox.</div>
              <div className="text-brand-orange font-bold mt-1">Running test cases...</div>
              {testResultState === "accepted" ? (
                <>
                  {(runResults ?? []).map((r, i) => (
                    <div key={i} className={r.passed ? "text-[#10b981]" : "text-red-500"}>
                      &gt; Case {i + 1}: {r.passed ? `Passed (${r.executionTime.toFixed(3)}s)` : `Failed — got "${r.actual}", expected "${r.expected}"`}
                    </div>
                  ))}
                  {!runResults && (
                    <div className="text-[#10b981] font-bold mt-1">&gt;&gt; All test cases passed. Accepted.</div>
                  )}
                </>
              ) : testResultState === "wrong_answer" ? (
                <>
                  {(runResults ?? []).map((r, i) => (
                    <div key={i} className={r.passed ? "text-[#10b981]" : "text-red-500"}>
                      &gt; Case {i + 1}: {r.passed ? "Passed" : `Failed — got "${r.actual?.trim()}", expected "${r.expected?.trim()}"`}
                    </div>
                  ))}
                  {!runResults && (
                    <div className="text-red-500 font-bold mt-1">&gt;&gt; Wrong Answer.</div>
                  )}
                </>
              ) : testResultState === "compile_error" || testResultState === "runtime_error" ? (
                <div className="text-red-500 font-bold">
                  &gt;&gt; Code execution failed. Check the &apos;Test Result&apos; tab for details.
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

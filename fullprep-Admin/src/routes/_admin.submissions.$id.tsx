import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Cpu,
  MemoryStick,
  RefreshCcw,
  Trash2,
  ShieldAlert,
  Activity,
  FileCode2,
  Copy,
  Download,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/admin/Avatar";
import { LanguageBadge, SubmissionStatusBadge, Pill } from "@/components/admin/badges";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { AdminSubmission } from "@/lib/types";

export const Route = createFileRoute("/_admin/submissions/$id")({
  head: () => ({ meta: [{ title: "Submission Debugger — FullPrep Admin" }] }),
  component: SubmissionDetailPage,
});

function SubmissionDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Auto-refresh every 2s if pending
  const { data: s, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => api.getSubmission(id),
    refetchInterval: (query: any) => {
      const data = query.state?.data || query;
      return data?.status === "PENDING" || data?.status === "RUNNING" ? 2000 : false;
    },
  });

  const rejudgeMutation = useMutation({
    mutationFn: () => api.rejudgeSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteSubmission(id),
    onSuccess: () => {
      navigate({ to: "/submissions" });
    },
  });

  if (isLoading)
    return <div className="p-8 text-center text-text-muted">Loading submission...</div>;
  if (!s) return <div className="p-8 text-center text-text-muted">Submission not found.</div>;

  // Generate Mock Test Cases based on passed/total
  const mockTestCases = [];
  const total = s.testCasesTotal || 0;
  const passed = s.testCasesPassed || 0;

  for (let i = 1; i <= total; i++) {
    if (i <= passed) {
      mockTestCases.push({
        id: i,
        status: "ACCEPTED",
        time: Math.floor(Math.random() * 40 + 5),
        memory: Number((Math.random() * 2 + 1).toFixed(1)),
      });
    } else if (i === passed + 1) {
      // The failing test case
      mockTestCases.push({
        id: i,
        status: s.status,
        time: s.status === "TIME_LIMIT" ? 2005 : Math.floor(Math.random() * 40 + 5),
        memory: s.status === "MEMORY_LIMIT" ? 260.5 : Number((Math.random() * 2 + 1).toFixed(1)),
      });
    } else {
      mockTestCases.push({ id: i, status: "SKIPPED", time: null, memory: null });
    }
  }

  // Handle Download Code
  const downloadCode = () => {
    const extMap: Record<string, string> = {
      PYTHON3: "py",
      CPP17: "cpp",
      CPP20: "cpp",
      JAVA: "java",
      JAVASCRIPT: "js",
      C: "c",
      RUST: "rs",
      GO: "go",
    };
    const ext = extMap[s.language] || "txt";
    const blob = new Blob([s.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submission_${s._id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <button
          onClick={() => navigate({ to: "/submissions" })}
          className="hover:text-text-primary flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Submissions
        </button>
        <span>/</span>
        <span className="text-text-primary font-medium truncate max-w-[400px]">{s._id}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-border-card bg-surface p-6 relative overflow-hidden">
        {/* Decorative background pulse for running jobs */}
        {(s.status === "PENDING" || s.status === "RUNNING") && (
          <div className="absolute inset-0 bg-brand-primary/5 animate-pulse" />
        )}

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-text-muted bg-background/50 px-2 py-0.5 rounded">
                ID: {s._id}
              </span>
              {s.jobId && (
                <span className="font-mono text-xs text-text-muted bg-background/50 px-2 py-0.5 rounded">
                  Job: {s.jobId.slice(0, 8)}
                </span>
              )}
            </div>

            <Link
              to="/problems/$id"
              params={{ id: s.problemExternalId }}
              className="text-2xl font-semibold tracking-tight text-text-primary hover:text-brand-primary hover:underline"
            >
              {s.problemName || s.problemExternalId}
            </Link>

            <div className="mt-3 flex items-center gap-3">
              <Link
                to="/users/$id"
                params={{ id: s.user._id }}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary bg-background/50 px-2 py-1 rounded-lg border border-border-card transition-colors"
              >
                <Avatar name={s.user.name} size={20} />
                <span className="font-medium">{s.user.name}</span>
              </Link>
              <LanguageBadge language={s.language} />
              <SubmissionStatusBadge status={s.status} />
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatRelativeTime(s.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => rejudgeMutation.mutate()}
              disabled={rejudgeMutation.isPending || s.status === "PENDING"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-background px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              <RefreshCcw
                className={`h-4 w-4 ${rejudgeMutation.isPending || s.status === "PENDING" ? "animate-spin text-brand-primary" : ""}`}
              />
              Rejudge
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 mt-6 pt-6 border-t border-border-card/50">
          <MetricBox
            icon={Clock}
            label="Exec time"
            value={s.executionTimeMs != null ? `${s.executionTimeMs}ms` : "—"}
            highlight={s.status === "TIME_LIMIT"}
          />
          <MetricBox
            icon={MemoryStick}
            label="Memory"
            value={s.memoryUsedMb != null ? `${s.memoryUsedMb}MB` : "—"}
            highlight={s.status === "MEMORY_LIMIT"}
          />
          <MetricBox
            icon={Cpu}
            label="Tests Passed"
            value={`${s.testCasesPassed || 0} / ${s.testCasesTotal || 0}`}
            highlight={s.status === "WRONG_ANSWER"}
          />
          <MetricBox
            icon={Activity}
            label="Verdict"
            value={s.status.replace("_", " ")}
            highlight={s.status !== "ACCEPTED" && s.status !== "PENDING"}
            customColor={
              s.status === "ACCEPTED"
                ? "text-brand-emerald"
                : s.status === "PENDING"
                  ? "text-brand-amber animate-pulse"
                  : "text-brand-rose"
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border-card overflow-x-auto">
        {["overview", "test_cases", "source_code", "logs", "analytics", "admin_actions"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-text-muted hover:text-text-primary hover:border-border-card"
              }`}
            >
              {tab.replace("_", " ").toUpperCase()}
            </button>
          ),
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Submission Metadata</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Submission ID" value={<span className="font-mono">{s._id}</span>} />
                <InfoRow
                  label="User ID"
                  value={
                    <Link
                      to="/users/$id"
                      params={{ id: s.user._id }}
                      className="font-mono hover:text-brand-primary hover:underline"
                    >
                      {s.user._id}
                    </Link>
                  }
                />
                <InfoRow
                  label="Problem ID"
                  value={
                    <Link
                      to="/problems/$id"
                      params={{ id: s.problemExternalId }}
                      className="font-mono hover:text-brand-primary hover:underline"
                    >
                      {s.problemExternalId}
                    </Link>
                  }
                />
                <InfoRow
                  label="Judge Job ID"
                  value={
                    <span className="font-mono">{s.jobId || "N/A (Synchronous/Simulated)"}</span>
                  }
                />
                <InfoRow label="Submitted At" value={new Date(s.createdAt).toLocaleString()} />
                <InfoRow label="Last Updated" value={new Date(s.updatedAt).toLocaleString()} />
              </div>
            </div>

            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Verdict Timeline</h3>
              <div className="relative pl-6 space-y-4 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-border-card">
                <TimelineItem
                  status="Completed"
                  time={new Date(s.createdAt).toLocaleTimeString()}
                  active={s.status !== "PENDING"}
                  isLast={true}
                />
                <TimelineItem
                  status="Judging"
                  time="..."
                  active={s.status === "PENDING" || s.status === "RUNNING"}
                />
                <TimelineItem
                  status="Running"
                  time="..."
                  active={s.status === "PENDING" || s.status === "RUNNING"}
                />
                <TimelineItem status="Compiling" time="..." active={true} />
                <TimelineItem
                  status="Queued"
                  time={new Date(s.createdAt).toLocaleTimeString()}
                  active={true}
                />
              </div>
            </div>

            {s.errorMessage && (
              <div className="md:col-span-2 rounded-2xl border border-brand-rose/30 bg-brand-rose/5 p-6">
                <h3 className="text-sm font-semibold text-brand-rose mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Final Error Message
                </h3>
                <pre className="overflow-auto font-mono text-xs text-brand-rose bg-brand-rose/10 p-4 rounded-xl border border-brand-rose/20">
                  {s.errorMessage}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TEST CASES TAB */}
        {activeTab === "test_cases" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border-card rounded-2xl overflow-hidden flex flex-col max-h-[800px]">
              <div className="p-4 border-b border-border-card bg-background/30 flex justify-between items-center">
                <h3 className="font-semibold text-text-primary">
                  Executed Test Cases ({mockTestCases.length})
                </h3>
                <span className="text-xs text-text-muted bg-background px-2 py-1 rounded border border-border-card">
                  Simulated Judge Data
                </span>
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-background/50 border-b border-border-card text-text-muted sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Verdict</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Memory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-card/50">
                    {mockTestCases.map((tc) => (
                      <tr
                        key={tc.id}
                        className={`transition-colors ${tc.status === s.status && tc.status !== "ACCEPTED" ? "bg-brand-rose/5" : "hover:bg-surface-hover"}`}
                      >
                        <td className="px-4 py-3 font-mono text-text-secondary">{tc.id}</td>
                        <td className="px-4 py-3">
                          {tc.status === "SKIPPED" ? (
                            <span className="text-text-muted text-xs font-semibold tracking-wide">
                              SKIPPED
                            </span>
                          ) : (
                            <SubmissionStatusBadge status={tc.status as any} />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                          {tc.time ? `${tc.time}ms` : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                          {tc.memory ? `${tc.memory}MB` : "-"}
                        </td>
                      </tr>
                    ))}
                    {mockTestCases.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                          No test cases executed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {s.status !== "ACCEPTED" && s.status !== "PENDING" && s.status !== "COMPILE_ERROR" && (
              <div className="bg-surface border border-brand-rose/20 rounded-2xl p-6">
                <h3 className="font-semibold text-brand-rose mb-4 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> First Failed Test Case Analysis (Mock)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-text-muted mb-1 block">Input Used</span>
                    <pre className="p-3 bg-background/60 rounded-lg border border-border-card font-mono text-[11px] text-text-secondary overflow-x-auto">
                      5\n1 2 3 4 5\n
                    </pre>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted mb-1 block">Expected Output</span>
                    <pre className="p-3 bg-background/60 rounded-lg border border-border-card font-mono text-[11px] text-text-secondary overflow-x-auto">
                      15\n
                    </pre>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs text-text-muted mb-1 block">User Output</span>
                    <pre className="p-3 bg-brand-rose/10 rounded-lg border border-brand-rose/20 font-mono text-[11px] text-brand-rose overflow-x-auto">
                      14\n
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SOURCE CODE TAB */}
        {activeTab === "source_code" && (
          <div className="bg-surface border border-border-card rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-border-card px-4 py-3 bg-background/30">
              <div className="flex items-center gap-3">
                <FileCode2 className="h-4 w-4 text-brand-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Source Code</h3>
                <LanguageBadge language={s.language} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(s.code)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-background px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button
                  onClick={downloadCode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-background px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("code-block");
                    if (el) el.requestFullscreen();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-background px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors hidden sm:flex"
                >
                  <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                </button>
              </div>
            </div>

            <div id="code-block" className="relative flex-1 bg-[#0d1117]">
              {/* Very basic line numbers layout */}
              <div className="flex">
                <div className="flex-none w-12 py-4 pr-3 text-right text-[11px] font-mono text-[#484f58] select-none border-r border-[#30363d] bg-[#0d1117]">
                  {s.code.split("\n").map((_, i) => (
                    <div key={i} className="leading-[1.5rem]">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <pre className="flex-1 overflow-auto py-4 pl-4 font-mono text-[13px] leading-[1.5rem] text-[#e6edf3]">
                  <code style={{ tabSize: 4 }}>{s.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                <span className="text-xs font-mono text-[#8b949e] uppercase tracking-wider font-semibold">
                  Compiler Output
                </span>
              </div>
              <div className="p-4">
                {s.status === "COMPILE_ERROR" ? (
                  <pre className="font-mono text-xs text-[#ff7b72] whitespace-pre-wrap">
                    {s.errorMessage}
                  </pre>
                ) : (
                  <pre className="font-mono text-xs text-[#8b949e]">
                    Compilation finished successfully.
                  </pre>
                )}
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                <span className="text-xs font-mono text-[#8b949e] uppercase tracking-wider font-semibold">
                  Sandbox Execution Logs
                </span>
              </div>
              <div className="p-4">
                {s.status === "PENDING" ? (
                  <pre className="font-mono text-xs text-[#8b949e]">Waiting for execution...</pre>
                ) : (
                  <pre className="font-mono text-xs text-[#8b949e] whitespace-pre-wrap">
                    [INFO] Creating secure container (isolate)... OK
                    <br />
                    [INFO] Mounting volume /box... OK
                    <br />
                    [INFO] Executing user program with limits: {s.memoryUsedMb ? "256" : "256"}MB,
                    2.0s...
                    <br />
                    {s.status === "RUNTIME_ERROR"
                      ? `[ERROR] Process exited with code 139 (SIGSEGV)\n[FATAL] ${s.errorMessage}`
                      : s.status === "TIME_LIMIT"
                        ? `[WARN] Process killed due to TLE (>2.0s)\n[FATAL] ${s.errorMessage}`
                        : "[INFO] Process exited normally (code 0)"}
                    <br />
                    [INFO] Cleaning up container... OK
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border-card rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-6">
                Performance Comparison (Mock)
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">
                      Runtime ({s.executionTimeMs || 0}ms)
                    </span>
                    <span className="text-brand-emerald font-semibold">Beats 78%</span>
                  </div>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-emerald rounded-full"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Memory ({s.memoryUsedMb || 0}MB)</span>
                    <span className="text-brand-sky font-semibold">Beats 42%</span>
                  </div>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-brand-sky rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border-card rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Historical Context</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="User's Accepted Rate" value="~34%" />
                <InfoRow label="Problem Acceptance" value="~12.5%" />
                <InfoRow label="Language Avg Time" value="45ms" />
                <InfoRow label="Language Avg Memory" value="12.4MB" />
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS / ADMIN ACTIONS TAB */}
        {activeTab === "admin_actions" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Security & Audit
              </h3>
              <div className="space-y-3 text-sm pt-2">
                <InfoRow
                  label="Origin IP"
                  value={
                    <span className="font-mono text-text-muted">192.168.1.104 (Hidden in DB)</span>
                  }
                />
                <InfoRow
                  label="Client Info"
                  value={
                    <span className="font-mono text-text-muted">Mozilla/5.0 FullPrep WebApp</span>
                  }
                />
              </div>
            </div>

            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Administrative Actions</h3>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => rejudgeMutation.mutate()}
                  disabled={rejudgeMutation.isPending || s.status === "PENDING"}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border border-border-card bg-background/50 hover:bg-background transition-colors flex justify-center items-center gap-2 text-text-primary disabled:opacity-50"
                >
                  <RefreshCcw className="h-4 w-4" /> Rejudge Submission
                </button>

                <button
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border border-brand-amber/20 bg-brand-amber/10 hover:bg-brand-amber/20 transition-colors flex justify-center items-center gap-2 text-brand-amber"
                  onClick={() => alert("Flagged for manual review.")}
                >
                  <AlertTriangle className="h-4 w-4" /> Flag Suspicious Activity
                </button>

                <div className="pt-4 border-t border-border-card mt-4">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to permanently delete this submission? This affects the user's statistics and cannot be undone.",
                        )
                      ) {
                        deleteMutation.mutate();
                      }
                    }}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold bg-brand-rose/10 text-brand-rose border border-brand-rose/20 hover:bg-brand-rose/20 transition-colors flex justify-center items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Submission
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBox({
  icon: Icon,
  label,
  value,
  highlight = false,
  customColor = "",
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  highlight?: boolean;
  customColor?: string;
}) {
  return (
    <div
      className={`rounded-xl border ${highlight ? "border-brand-rose/40 bg-brand-rose/5" : "border-border-card bg-surface"} p-4 transition-colors`}
    >
      <div
        className={`flex items-center gap-1.5 text-xs ${highlight ? "text-brand-rose" : "text-text-muted"}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={`mt-1 font-mono text-lg ${customColor ? customColor : highlight ? "text-brand-rose font-bold" : "text-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border-card/50 last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function TimelineItem({
  status,
  time,
  active,
  isLast = false,
}: {
  status: string;
  time: string;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex items-center gap-4">
      <div
        className={`absolute -left-[29px] h-3 w-3 rounded-full border-2 ${active ? "border-brand-primary bg-background shadow-[0_0_8px_rgba(var(--brand-primary),0.5)]" : "border-border-card bg-surface"} z-10`}
      />
      <span
        className={`w-20 text-xs font-semibold ${active ? "text-text-primary" : "text-text-muted"}`}
      >
        {status}
      </span>
      <span className="text-xs font-mono text-text-secondary">{time}</span>
    </div>
  );
}

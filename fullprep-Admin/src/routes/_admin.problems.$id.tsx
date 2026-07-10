import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Trash2,
  Clock,
  MemoryStick,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Code2,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { DifficultyBadge, Pill, SourceBadge, StatusBadge } from "@/components/admin/badges";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { DataTable, type Column } from "@/components/admin/DataTable";
import type { AdminSubmission } from "@/lib/types";

export const Route = createFileRoute("/_admin/problems/$id")({
  head: () => ({ meta: [{ title: "Manage Problem — FullPrep Admin" }] }),
  component: ProblemDetailsPage,
});

function ProblemDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: p,
    isLoading: isProblemLoading,
    error,
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => api.getProblem(id),
  });

  const { data: submissions = [], isLoading: isSubsLoading } = useQuery({
    queryKey: ["problem-submissions", id],
    queryFn: () => api.listSubmissions({ problemExternalId: id, limit: 1000 }),
    enabled: !!p,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteProblem(p!._id),
    onSuccess: () => navigate({ to: "/problems" }),
  });

  const rejudgeMutation = useMutation({
    mutationFn: () => api.rejudgeProblem(p!._id),
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ["problem-submissions", id] });
    },
    onError: (err: any) => {
      alert("Failed to rejudge problem: " + err.message);
    },
  });

  if (isProblemLoading) {
    return <div className="p-8 text-center text-text-muted">Loading problem details...</div>;
  }

  if (error || !p) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Problem not found</h2>
        <p className="text-text-muted">Could not find problem with ID: {id}</p>
        <button
          onClick={() => navigate({ to: "/problems" })}
          className="text-brand-primary hover:underline"
        >
          Back to Problems
        </button>
      </div>
    );
  }

  // Calculate Analytics locally from submissions
  const totalSubs = submissions.length;
  const acceptedSubs = submissions.filter((s) => s.status === "ACCEPTED");
  const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs.length / totalSubs) * 100) : 0;

  const uniqueSolvers = new Set(acceptedSubs.map((s) => s.user._id)).size;

  const languageDistribution = submissions.reduce(
    (acc, s) => {
      acc[s.language] = (acc[s.language] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const subColumns: Column<AdminSubmission>[] = [
    {
      key: "user",
      header: "User",
      cell: (s) => <span className="text-sm font-medium text-text-primary">{s.user.name}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${s.status === "ACCEPTED" ? "bg-brand-emerald/10 text-brand-emerald" : s.status === "PENDING" ? "bg-brand-amber/10 text-brand-amber" : "bg-brand-rose/10 text-brand-rose"}`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: "language",
      header: "Language",
      cell: (s) => <span className="text-xs text-text-secondary">{s.language}</span>,
    },
    {
      key: "time",
      header: "Time",
      cell: (s) => (
        <span className="text-xs text-text-secondary">
          {s.executionTimeMs ? `${s.executionTimeMs}ms` : "-"}
        </span>
      ),
    },
    {
      key: "memory",
      header: "Memory",
      cell: (s) => (
        <span className="text-xs text-text-secondary">
          {s.memoryUsedMb ? `${s.memoryUsedMb}MB` : "-"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (s) => (
        <span className="text-xs text-text-secondary">{formatRelativeTime(s.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <button
          onClick={() => navigate({ to: "/problems" })}
          className="hover:text-text-primary flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Problems
        </button>
        <span>/</span>
        <span className="text-text-primary font-medium truncate max-w-[400px]">{p.name}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-border-card bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-text-muted bg-background/50 px-2 py-0.5 rounded">
                ID: {p.externalId}
              </span>
              <span className="font-mono text-xs text-text-muted bg-background/50 px-2 py-0.5 rounded">
                Serial: #{p.serialNo}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SourceBadge source={p.source} />
              <DifficultyBadge difficulty={p.difficulty} />
              <StatusBadge active={p.isActive} />
              <Pill tone="neutral">CF {p.cfRating || "N/A"}</Pill>
              <Pill tone="neutral">
                <Clock className="mr-1 h-3 w-3" />
                {p.timeLimitSeconds}s
              </Pill>
              <Pill tone="neutral">
                <MemoryStick className="mr-1 h-3 w-3" />
                {p.memoryLimitMb}MB
              </Pill>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-text-muted">
            <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
            <span>
              Last Synced: {p.lastSyncedAt ? formatRelativeTime(p.lastSyncedAt) : "Never"}
            </span>
            <Link
              to="/problems/create"
              search={{ clone: p._id }}
              className="flex items-center gap-1 text-brand-primary hover:underline mt-2"
            >
              <Code2 className="h-3 w-3" /> Clone Problem
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border-card">
        {["overview", "content", "test_cases", "editorial", "analytics", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-muted hover:text-text-primary hover:border-border-card"
            }`}
          >
            {tab.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Basic Information</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Problem Code" value={p.problemCode || "N/A"} />
                <InfoRow label="Slug" value={p.problemSlug || "N/A"} />
                <InfoRow
                  label="Original Link"
                  value={
                    p.originalProblemLink ? (
                      <a
                        href={p.originalProblemLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary hover:underline"
                      >
                        View Source
                      </a>
                    ) : (
                      "N/A"
                    )
                  }
                />
                <InfoRow label="Author (Created By)" value={p.createdBy || "System Sync"} />
                <div className="pt-3 border-t border-border-card">
                  <span className="block text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.cfTags.length > 0 ? (
                      p.cfTags.map((t) => (
                        <Pill key={t} tone="neutral">
                          {t}
                        </Pill>
                      ))
                    ) : (
                      <span className="text-text-muted">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Judge Configuration</h3>
              <div className="space-y-3 text-sm">
                <InfoRow
                  label="Time Limit"
                  value={`${p.judgeConfig?.timeLimit || p.timeLimitSeconds} seconds`}
                />
                <InfoRow
                  label="Memory Limit"
                  value={`${p.judgeConfig?.memoryLimit || p.memoryLimitMb} MB`}
                />
                <InfoRow
                  label="Output Strategy"
                  value={p.judgeConfig?.outputMatchingStrategy || "Exact Match"}
                />
                <div className="pt-3 border-t border-border-card">
                  <span className="block text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">
                    Constraints
                  </span>
                  {p.constraints && p.constraints.length > 0 ? (
                    <ul className="list-disc list-inside text-text-primary space-y-1">
                      {p.constraints.map((c, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: c }}></li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-text-muted">No specific constraints parsed.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border-card rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Problem Statement</h3>
              <div
                className="prose prose-invert max-w-none text-sm text-text-secondary bg-background/50 p-4 rounded-xl border border-border-card overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: p.description || "No description provided." }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-border-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4">Input Format</h3>
                <div
                  className="text-sm text-text-secondary bg-background/50 p-4 rounded-xl border border-border-card"
                  dangerouslySetInnerHTML={{ __html: p.inputFormat || "Not specified." }}
                />
              </div>
              <div className="bg-surface border border-border-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4">Output Format</h3>
                <div
                  className="text-sm text-text-secondary bg-background/50 p-4 rounded-xl border border-border-card"
                  dangerouslySetInnerHTML={{ __html: p.outputFormat || "Not specified." }}
                />
              </div>
            </div>

            {p.notes && (
              <div className="bg-surface border border-border-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4">Notes</h3>
                <div
                  className="text-sm text-text-secondary bg-background/50 p-4 rounded-xl border border-border-card"
                  dangerouslySetInnerHTML={{ __html: p.notes }}
                />
              </div>
            )}
          </div>
        )}

        {/* TEST CASES TAB */}
        {activeTab === "test_cases" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-surface border border-border-card rounded-xl p-4 text-center">
                <span className="text-2xl font-bold text-text-primary">
                  {p.publicTests?.length || 0}
                </span>
                <span className="block text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                  Public Tests
                </span>
              </div>
              <div className="bg-surface border border-border-card rounded-xl p-4 text-center">
                <span className="text-2xl font-bold text-text-primary">
                  {p.privateTests?.length || 0}
                </span>
                <span className="block text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                  Hidden Tests
                </span>
              </div>
              <div className="bg-surface border border-border-card rounded-xl p-4 text-center">
                <span className="text-2xl font-bold text-text-primary">
                  {p.generatedTests?.length || 0}
                </span>
                <span className="block text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                  Generated Tests
                </span>
              </div>
            </div>

            <div className="bg-surface border border-border-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border-card bg-background/30">
                <h3 className="font-semibold text-text-primary">Examples (Visible to Users)</h3>
              </div>
              <div className="divide-y divide-border-card/60">
                {p.examples && p.examples.length > 0 ? (
                  p.examples.map((ex, i) => (
                    <div key={i} className="p-4">
                      <div className="text-xs font-semibold text-text-muted mb-2 uppercase">
                        Example {i + 1}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-text-muted mb-1 block">Input</span>
                          <pre className="p-3 bg-background/60 rounded-lg border border-border-card font-mono text-[11px] text-text-secondary overflow-x-auto">
                            {ex.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs text-text-muted mb-1 block">Output</span>
                          <pre className="p-3 bg-background/60 rounded-lg border border-border-card font-mono text-[11px] text-text-secondary overflow-x-auto">
                            {ex.output}
                          </pre>
                        </div>
                      </div>
                      {ex.explanation && (
                        <div className="mt-3 text-xs text-text-secondary bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10">
                          <span className="font-semibold text-brand-primary">Explanation:</span>{" "}
                          <span dangerouslySetInnerHTML={{ __html: ex.explanation }} />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-text-muted">
                    No examples configured.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface border border-border-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border-card bg-background/30">
                <h3 className="font-semibold text-text-primary">Starter Code Templates</h3>
              </div>
              <div className="p-4 space-y-4">
                {p.starterCodeTemplates && p.starterCodeTemplates.length > 0 ? (
                  p.starterCodeTemplates.map((t, i) => (
                    <div key={i}>
                      <Pill tone="sky" className="mb-2">
                        {t.language}
                      </Pill>
                      <pre className="p-3 bg-background/60 rounded-lg border border-border-card font-mono text-[11px] text-text-secondary overflow-x-auto">
                        {t.code}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-text-muted text-center py-4">
                    No starter code templates configured. Users will start with a blank editor.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDITORIAL TAB */}
        {activeTab === "editorial" && (
          <div className="space-y-6">
            {p.hints && p.hints.length > 0 && (
              <div className="bg-surface border border-border-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  Hints ({p.hints.length})
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
                  {p.hints.map((hint, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: hint }}></li>
                  ))}
                </ul>
              </div>
            )}

            {p.editorial ? (
              <div className="bg-surface border border-border-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-text-primary">
                    {p.editorial.title || "Editorial"}
                  </h3>
                  <div className="flex gap-2">
                    <Pill tone="rose">Time: {p.editorial.timeComplexity || "O(?)"}</Pill>
                    <Pill tone="sky">Space: {p.editorial.spaceComplexity || "O(?)"}</Pill>
                  </div>
                </div>
                <div
                  className="prose prose-invert max-w-none text-sm text-text-secondary bg-background/50 p-4 rounded-xl border border-border-card"
                  dangerouslySetInnerHTML={{ __html: p.editorial.content }}
                />
              </div>
            ) : (
              <div className="bg-surface border border-border-card rounded-2xl p-12 text-center">
                <AlertTriangle className="h-8 w-8 text-brand-amber mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-text-primary">No Editorial Available</h3>
                <p className="text-sm text-text-muted mt-1">
                  This problem does not have an official editorial or solution guide.
                </p>
              </div>
            )}

            {p.solutions && p.solutions.length > 0 && (
              <div className="bg-surface border border-border-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4">
                  Reference Solutions (Judge)
                </h3>
                <div className="space-y-4">
                  {p.solutions.map((s, i) => (
                    <div key={i}>
                      <Pill tone="green" className="mb-2">
                        {s.language}
                      </Pill>
                      <pre className="p-3 bg-background/60 rounded-lg border border-border-card font-mono text-[11px] text-text-secondary overflow-x-auto">
                        {s.solution}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Submissions"
                value={isSubsLoading ? "..." : formatNumber(totalSubs)}
              />
              <StatCard
                label="Accepted"
                value={isSubsLoading ? "..." : formatNumber(acceptedSubs.length)}
              />
              <StatCard
                label="Acceptance Rate"
                value={isSubsLoading ? "..." : `${acceptanceRate}%`}
              />
              <StatCard
                label="Unique Solvers"
                value={isSubsLoading ? "..." : formatNumber(uniqueSolvers)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-surface border border-border-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4">Language Distribution</h3>
                {isSubsLoading ? (
                  <p className="text-sm text-text-muted">Loading...</p>
                ) : Object.keys(languageDistribution).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(languageDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([lang, count]) => (
                        <div key={lang} className="flex justify-between items-center text-sm">
                          <span className="text-text-primary">{lang}</span>
                          <span className="text-text-muted">{count} subs</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No submissions yet.</p>
                )}
              </div>

              <div className="lg:col-span-2 bg-surface border border-border-card rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border-card bg-background/30 flex justify-between items-center">
                  <h3 className="font-semibold text-text-primary flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Submissions
                  </h3>
                  <Link
                    to="/submissions"
                    search={{ problemExternalId: p.externalId }}
                    className="text-xs text-brand-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="p-0 flex-1 overflow-auto">
                  <DataTable
                    data={submissions.slice(0, 10)}
                    columns={subColumns}
                    emptyMessage={
                      isSubsLoading
                        ? "Loading submissions..."
                        : "No submissions for this problem yet."
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-text-primary">Administrative Actions</h3>

              <div className="space-y-3 pt-2">
                <Link
                  to="/problems/create"
                  search={{ edit: p.externalId }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border border-border-card bg-background/50 hover:bg-background transition-colors flex justify-center items-center gap-2 text-text-primary"
                >
                  <Code2 className="h-4 w-4" /> Edit Problem Configuration
                </Link>

                <button
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border border-border-card bg-background/50 hover:bg-background transition-colors flex justify-center items-center gap-2 text-text-primary disabled:opacity-50"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to rejudge all submissions for ${p.name}? This will reset them to PENDING.`,
                      )
                    ) {
                      rejudgeMutation.mutate();
                    }
                  }}
                  disabled={rejudgeMutation.isPending}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${rejudgeMutation.isPending ? "animate-spin" : ""}`}
                  />
                  {rejudgeMutation.isPending ? "Rejudging..." : "Trigger Rejudge"}
                </button>

                <div className="pt-4 border-t border-border-card mt-4">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to deactivate this problem? It will no longer be visible to users, but their submissions will be retained.",
                        )
                      ) {
                        deleteMutation.mutate();
                      }
                    }}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold bg-brand-rose/10 text-brand-rose border border-brand-rose/20 hover:bg-brand-rose/20 transition-colors flex justify-center items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Deactivate Problem
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border-card rounded-xl p-4 flex flex-col justify-center items-center text-center">
      <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">
        {label}
      </span>
      <span className="text-xl font-bold text-text-primary">{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border-card/50 last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

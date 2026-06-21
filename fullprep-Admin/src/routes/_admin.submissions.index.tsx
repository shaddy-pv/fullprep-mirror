import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Avatar } from "@/components/admin/Avatar";
import { LanguageBadge, SubmissionStatusBadge } from "@/components/admin/badges";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { AdminSubmission } from "@/lib/types";

export const Route = createFileRoute("/_admin/submissions/")({
  head: () => ({ meta: [{ title: "Submissions — FullPrep Admin" }] }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => api.listSubmissions(),
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [lang, setLang] = useState("all");
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => refetch(), 10_000);
    return () => clearInterval(t);
  }, [auto, refetch]);

  const filtered = data.filter((s) => {
    if (status !== "all" && s.status !== status) return false;
    if (lang !== "all" && s.language !== lang) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.user.name.toLowerCase().includes(q) && !s.problemName.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const columns: Column<AdminSubmission>[] = [
    {
      key: "id",
      header: "ID",
      cell: (s) => (
        <code className="font-mono text-[10px] text-text-muted">{s._id.slice(0, 10)}</code>
      ),
    },
    {
      key: "user",
      header: "User",
      cell: (s) => (
        <Link
          to="/users/$id"
          params={{ id: s.user._id }}
          className="flex items-center gap-2 hover:text-brand-primary"
        >
          <Avatar name={s.user.name} size={24} />
          <span className="truncate text-sm">{s.user.name}</span>
        </Link>
      ),
    },
    {
      key: "problem",
      header: "Problem",
      cell: (s) => <span className="truncate font-medium text-text-primary">{s.problemName}</span>,
    },
    { key: "lang", header: "Lang", cell: (s) => <LanguageBadge language={s.language} /> },
    { key: "status", header: "Status", cell: (s) => <SubmissionStatusBadge status={s.status} /> },
    {
      key: "tests",
      header: "Tests",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">
            {s.testCasesPassed}/{s.testCasesTotal}
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full bg-brand-primary"
              style={{ width: `${(s.testCasesPassed / Math.max(1, s.testCasesTotal)) * 100}%` }}
            />
          </div>
        </div>
      ),
      sortValue: (s) => s.testCasesPassed / Math.max(1, s.testCasesTotal),
    },
    {
      key: "time",
      header: "Time",
      cell: (s) => (
        <span className="font-mono text-xs">
          {s.executionTimeMs != null ? `${s.executionTimeMs}ms` : "—"}
        </span>
      ),
      sortValue: (s) => s.executionTimeMs ?? 0,
      align: "right",
    },
    {
      key: "mem",
      header: "Memory",
      cell: (s) => (
        <span className="font-mono text-xs">
          {s.memoryUsedMb != null ? `${s.memoryUsedMb}MB` : "—"}
        </span>
      ),
      align: "right",
    },
    {
      key: "at",
      header: "Submitted",
      cell: (s) => <span className="text-text-secondary">{formatRelativeTime(s.createdAt)}</span>,
      sortValue: (s) => new Date(s.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Submissions</h1>
          <p className="text-sm text-text-muted">
            {formatNumber(filtered.length)} of {formatNumber(data.length)} submissions
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="h-3.5 w-3.5 accent-[color:var(--color-brand-primary)]"
          />
          Auto-refresh every 10s
        </label>
      </div>

      <DataTable
        data={isLoading ? [] : filtered}
        columns={columns}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search by user or problem…"
        pageSize={30}
        emptyMessage={isLoading ? "Loading submissions…" : "No submissions match."}
        rowHref={(s) => `/submissions/${s._id}`}
        toolbar={
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-border-card bg-background/50 px-2.5 py-1.5 text-sm"
            >
              <option value="all">Any status</option>
              {[
                "PENDING",
                "RUNNING",
                "ACCEPTED",
                "WRONG_ANSWER",
                "TIME_LIMIT",
                "RUNTIME_ERROR",
                "COMPILE_ERROR",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-lg border border-border-card bg-background/50 px-2.5 py-1.5 text-sm"
            >
              <option value="all">Any language</option>
              {["PYTHON3", "CPP17", "JAVA", "JAVASCRIPT", "GO", "RUST", "C"].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}

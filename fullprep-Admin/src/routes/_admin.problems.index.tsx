import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DifficultyBadge, Pill, SourceBadge, StatusBadge } from "@/components/admin/badges";
import { formatRelativeTime } from "@/lib/format";
import type { AdminProblem } from "@/lib/types";

export const Route = createFileRoute("/_admin/problems/")({
  head: () => ({ meta: [{ title: "Problems — FullPrep Admin" }] }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: api.listProblems,
  });
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [src, setSrc] = useState("all");

  const filtered = data.filter((p) => {
    if (diff !== "all" && p.difficulty !== diff) return false;
    if (src !== "all" && p.source !== src) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<AdminProblem>[] = [
    {
      key: "no",
      header: "#",
      cell: (p) => <span className="text-text-muted">{p.serialNo}</span>,
      sortValue: (p) => p.serialNo,
      align: "right",
    },
    {
      key: "name",
      header: "Name",
      cell: (p) => (
        <Link
          to="/problems/$id"
          params={{ id: p.externalId }}
          className="font-medium text-text-primary hover:text-brand-primary"
        >
          {p.name}
        </Link>
      ),
      sortValue: (p) => p.name,
    },
    { key: "source", header: "Source", cell: (p) => <SourceBadge source={p.source} /> },
    {
      key: "difficulty",
      header: "Difficulty",
      cell: (p) => <DifficultyBadge difficulty={p.difficulty} />,
      sortValue: (p) => p.difficulty,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (p) => <span className="font-mono text-xs">{p.cfRating}</span>,
      sortValue: (p) => p.cfRating,
      align: "right",
    },
    {
      key: "tags",
      header: "Tags",
      cell: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.cfTags.slice(0, 3).map((t) => (
            <Pill key={t} tone="neutral">
              {t}
            </Pill>
          ))}
          {p.cfTags.length > 3 && (
            <span className="text-[10px] text-text-muted">+{p.cfTags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "tests",
      header: "Tests",
      cell: (p) => (
        <span className="text-xs text-text-secondary">
          {p.stats.totalPublicTests} pub / {p.stats.totalPrivateTests} priv
        </span>
      ),
    },
    { key: "active", header: "Status", cell: (p) => <StatusBadge active={p.isActive} /> },
    {
      key: "synced",
      header: "Last sync",
      cell: (p) => {
        if (!p.lastSyncedAt) return <span className="text-xs text-text-muted">never</span>;
        const stale = Date.now() - new Date(p.lastSyncedAt).getTime() > 24 * 3600_000;
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">
              {formatRelativeTime(p.lastSyncedAt)}
            </span>
            {stale && <Pill tone="amber">stale</Pill>}
          </div>
        );
      },
      sortValue: (p) => (p.lastSyncedAt ? new Date(p.lastSyncedAt) : new Date(0)),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Problems</h1>
          <p className="text-sm text-text-muted">
            {filtered.length} of {data.length} problems
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/problems/sync"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Sync
          </Link>
          <Link
            to="/problems/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" /> New problem
          </Link>
        </div>
      </div>

      <DataTable
        data={isLoading ? [] : filtered}
        columns={columns}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search problems by name…"
        pageSize={25}
        emptyMessage={isLoading ? "Loading problems…" : "No problems match."}
        toolbar={
          <>
            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              className="rounded-lg border border-border-card bg-background/50 px-2.5 py-1.5 text-sm"
            >
              <option value="all">Any difficulty</option>
              {["EASY", "MEDIUM", "HARD", "HARDER", "HARDEST", "EXPERT"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              className="rounded-lg border border-border-card bg-background/50 px-2.5 py-1.5 text-sm"
            >
              <option value="all">Any source</option>
              {["CODEFORCES", "CODECHEF", "HACKEREARTH", "ATCODER", "CODEJAM"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}

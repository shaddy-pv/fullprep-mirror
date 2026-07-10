import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pill, StatusBadge } from "@/components/admin/badges";

export const Route = createFileRoute("/_admin/contests/")({
  head: () => ({ meta: [{ title: "Contests — FullPrep Admin" }] }),
  component: ContestsPage,
});

function ContestsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: api.listContests,
  });
  const [search, setSearch] = useState("");

  const filtered = data.filter((c: any) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Title",
      cell: (c) => (
        <Link
          to="/contests/$id"
          params={{ id: c._id }}
          className="font-medium text-text-primary hover:text-brand-primary"
        >
          {c.title}
        </Link>
      ),
      sortValue: (c) => c.title,
    },
    {
      key: "type",
      header: "Type",
      cell: (c) => (
        <Pill tone="neutral" className="uppercase text-[10px]">
          {c.type}
        </Pill>
      ),
    },
    {
      key: "problems",
      header: "Problems",
      cell: (c) => <span className="text-text-secondary">{c.problems?.length || 0}</span>,
    },
    {
      key: "startTime",
      header: "Start Time",
      cell: (c) => (
        <span className="text-xs text-text-secondary">
          {new Date(c.startTime).toLocaleString()}
        </span>
      ),
      sortValue: (c) => new Date(c.startTime),
    },
    {
      key: "endTime",
      header: "End Time",
      cell: (c) => (
        <span className="text-xs text-text-secondary">{new Date(c.endTime).toLocaleString()}</span>
      ),
      sortValue: (c) => new Date(c.endTime),
    },
    { key: "active", header: "Status", cell: (c) => <StatusBadge active={c.isActive} /> },
    {
      key: "actions",
      header: "",
      cell: (c) => (
        <div className="flex justify-end">
          <Link
            to="/contests/$id"
            params={{ id: c._id }}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-text-muted hover:bg-border-card hover:text-text-primary transition-colors"
            title="Edit Contest"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Contests</h1>
          <p className="text-sm text-text-muted">
            {filtered.length} of {data.length} contests
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/contests/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" /> New contest
          </Link>
        </div>
      </div>

      <DataTable
        data={isLoading ? [] : filtered}
        columns={columns}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search contests by title…"
        pageSize={25}
        emptyMessage={isLoading ? "Loading contests…" : "No contests match."}
      />
    </div>
  );
}

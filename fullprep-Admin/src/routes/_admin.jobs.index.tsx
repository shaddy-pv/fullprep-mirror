import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pill } from "@/components/admin/badges";

export const Route = createFileRoute("/_admin/jobs/")({
  head: () => ({ meta: [{ title: "Jobs — FullPrep Admin" }] }),
  component: JobsPage,
});

function JobsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
  });
  const [search, setSearch] = useState("");

  const filtered = data.filter((j: any) => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Title",
      cell: (j) => <span className="font-medium text-text-primary">{j.title}</span>,
      sortValue: (j) => j.title,
    },
    {
      key: "role",
      header: "Role",
      cell: (j) => <span className="text-text-secondary">{j.role}</span>,
    },
    {
      key: "country",
      header: "Country",
      cell: (j) => <span className="text-text-secondary">{j.country}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (j) => (
        <Pill tone={j.isActive ? "green" : "neutral"}>{j.isActive ? "Active" : "Inactive"}</Pill>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      cell: (j) => (
        <span className="text-text-secondary">{new Date(j.createdAt).toLocaleDateString()}</span>
      ),
      sortValue: (j) => j.createdAt,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Jobs</h1>
          <p className="text-text-secondary mt-1">Manage careers and job postings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/jobs/create"
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </Link>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs bg-bg-screen border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No jobs found." />
      </div>
    </div>
  );
}

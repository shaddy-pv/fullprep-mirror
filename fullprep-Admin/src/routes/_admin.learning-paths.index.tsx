import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, BookOpen, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pill } from "@/components/admin/badges";

export const Route = createFileRoute("/_admin/learning-paths/")({
  head: () => ({ meta: [{ title: "Learning Paths — FullPrep Admin" }] }),
  component: LearningPathsPage,
});

function LearningPathsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: api.listLearningPaths,
  });
  const [search, setSearch] = useState("");

  const filtered = data.filter((p: any) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Title",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-border-card shrink-0">
            {p.contentType === "notes" ? (
              <FileText className="h-4 w-4 text-brand-primary" />
            ) : (
              <BookOpen className="h-4 w-4 text-brand-orange" />
            )}
          </div>
          <Link
            to="/learning-paths/$id"
            params={{ id: p.id }}
            className="font-medium text-text-primary hover:text-brand-primary line-clamp-1"
          >
            {p.title}
          </Link>
        </div>
      ),
      sortValue: (p) => p.title,
    },
    {
      key: "tier",
      header: "Tier",
      cell: (p) => (
        <Pill tone={p.isPro ? "amber" : "green"} className="uppercase text-[10px]">
          {p.isPro ? "Premium" : "Free"}
        </Pill>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (p) => (
        <Pill tone="neutral" className="uppercase text-[10px]">
          {p.contentType === "notes" ? "Notes" : "Problems"}
        </Pill>
      ),
    },
    {
      key: "stats",
      header: "Content",
      cell: (p) => {
        if (p.contentType === "notes") {
          return <span className="text-text-secondary">Markdown Notes</span>;
        }
        return (
          <span className="text-text-secondary">
            {p.modules?.length || 0} Modules, {p.problemsCount || 0} Problems
          </span>
        );
      },
    },
    {
      key: "level",
      header: "Level",
      cell: (p) => (
        <span className="text-xs font-semibold text-text-secondary">
          {p.level}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (p) => (
        <div className="flex justify-end">
          <Link
            to="/learning-paths/$id"
            params={{ id: p.id }}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-text-muted hover:bg-border-card hover:text-text-primary transition-colors"
            title="Edit Learning Path"
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
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Learning Paths</h1>
          <p className="text-sm text-text-muted">
            {filtered.length} of {data.length} courses
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/learning-paths/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" /> Add Course
          </Link>
        </div>
      </div>

      <DataTable
        data={isLoading ? [] : filtered}
        columns={columns}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search courses by title..."
        pageSize={25}
        emptyMessage={isLoading ? "Loading courses..." : "No courses match."}
      />
    </div>
  );
}

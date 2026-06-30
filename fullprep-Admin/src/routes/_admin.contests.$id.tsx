import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, X, Search, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminProblem } from "@/lib/types";
import { StatusBadge, DifficultyBadge } from "@/components/admin/badges";
import { InlineProblemModal } from "@/components/admin/InlineProblemModal";

export const Route = createFileRoute("/_admin/contests/$id")({
  head: () => ({ meta: [{ title: "Edit Contest — FullPrep Admin" }] }),
  component: EditContestPage,
});

function EditContestPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "custom",
    startTime: "",
    endTime: "",
    problems: [] as string[],
    isActive: true,
  });

  const { data: contestData, isLoading: isContestLoading } = useQuery({
    queryKey: ["contest", id],
    queryFn: () => api.getContest(id),
  });

  useEffect(() => {
    if (contestData) {
      // Helper to format date for datetime-local input (YYYY-MM-DDThh:mm) in local timezone
      const formatLocal = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setForm({
        title: contestData.title || "",
        description: contestData.description || "",
        type: contestData.type || "custom",
        startTime: formatLocal(contestData.startTime),
        endTime: formatLocal(contestData.endTime),
        problems: contestData.problems ? contestData.problems.map((p: any) => p._id || p) : [],
        isActive: contestData.isActive ?? true,
      });
    }
  }, [contestData]);

  // Problem Search State
  const [search, setSearch] = useState("");
  const { data: allProblems = [] } = useQuery({
    queryKey: ["problems"],
    queryFn: api.listProblems,
  });

  const filteredProblems = allProblems.filter(
    (p) =>
      search &&
      !form.problems.includes(p._id) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedProblemsData = form.problems
    .map((pid) => allProblems.find((p) => p._id === pid))
    .filter(Boolean) as AdminProblem[];

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addProblem = (pid: string) => {
    setForm((prev) => ({ ...prev, problems: [...prev.problems, pid] }));
    setSearch("");
  };

  const removeProblem = (pid: string) => {
    setForm((prev) => ({ ...prev, problems: prev.problems.filter((p) => p !== pid) }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateContest(id, {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      navigate({ to: "/contests" });
    } catch (err) {
      console.error("Failed to update contest:", err);
      alert("Failed to update contest. See console.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDelete() {
    if (!window.confirm("Are you sure you want to delete this contest? This cannot be undone.")) return;
    setIsSubmitting(true);
    try {
      await api.deleteContest(id);
      navigate({ to: "/contests" });
    } catch (err) {
      console.error("Failed to delete contest:", err);
      alert("Failed to delete contest.");
      setIsSubmitting(false);
    }
  }

  if (isContestLoading) {
    return <div className="p-12 text-center text-text-muted">Loading contest details...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <button
        onClick={() => navigate({ to: "/contests" })}
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to contests
      </button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Edit Contest</h1>
        <p className="text-sm text-text-muted">Modify existing contest settings and problems</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">Contest Details</h2>
          
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">Start Time</span>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => updateForm("startTime", e.target.value)}
                className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">End Time</span>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => updateForm("endTime", e.target.value)}
                className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">Active Status</span>
            <button
              type="button"
              onClick={() => updateForm("isActive", !form.isActive)}
              className={`h-9 w-full rounded-lg border text-sm ${form.isActive ? "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald" : "border-border-card text-text-muted"}`}
            >
              {form.isActive ? "Active" : "Inactive"}
            </button>
          </label>
        </div>

        <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Problems</h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Create Problem Inline
            </button>
          </div>

          {/* Search Existing */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search existing problems to add..."
              className="w-full rounded-lg border border-border-card bg-background/60 pl-9 pr-3 py-2.5 text-sm"
            />
            {filteredProblems.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border-card bg-surface shadow-lg z-10">
                {filteredProblems.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => addProblem(p._id!)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover flex justify-between items-center"
                  >
                    <span>{p.name}</span>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected List */}
          <div className="space-y-2 mt-4">
            {selectedProblemsData.map((p, i) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-lg border border-border-card bg-background/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-text-muted">{i + 1}.</span>
                  <span className="font-medium text-sm">{p.name}</span>
                  <DifficultyBadge difficulty={p.difficulty} />
                </div>
                <button
                  type="button"
                  onClick={() => removeProblem(p._id!)}
                  className="text-text-muted hover:text-destructive p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {selectedProblemsData.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No problems added yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-6 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </form>

      {/* Inline Problem Creation Modal */}
      {isModalOpen && (
        <InlineProblemModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newProblemId) => addProblem(newProblemId)}
        />
      )}
    </div>
  );
}



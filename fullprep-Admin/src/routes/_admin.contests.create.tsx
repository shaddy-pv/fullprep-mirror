import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminProblem } from "@/lib/types";
import { DifficultyBadge } from "@/components/admin/badges";
import { InlineProblemModal } from "@/components/admin/InlineProblemModal";

export const Route = createFileRoute("/_admin/contests/create")({
  head: () => ({ meta: [{ title: "Create Contest — FullPrep Admin" }] }),
  component: CreateContestPage,
});

const PLATFORMS = ["Codnite", "Codeforces", "LeetCode", "AtCoder", "HackerRank", "CodeChef", "Other"];

function CreateContestPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "Codnite",
    registrationUrl: "",
    type: "custom",
    startTime: "",
    endTime: "",
    problems: [] as string[],
    isActive: true,
  });

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
    .map((id) => allProblems.find((p) => p._id === id))
    .filter(Boolean) as AdminProblem[];

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addProblem = (id: string) => {
    setForm((prev) => ({ ...prev, problems: [...prev.problems, id] }));
    setSearch("");
  };

  const removeProblem = (id: string) => {
    setForm((prev) => ({ ...prev, problems: prev.problems.filter((p) => p !== id) }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.startTime) { setError("Start time is required."); return; }
    if (!form.endTime) { setError("End time is required."); return; }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createContest({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      navigate({ to: "/contests" });
    } catch (err: any) {
      setError(err?.message || "Failed to create contest. See console.");
      console.error("Failed to create contest:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <button
        onClick={() => navigate({ to: "/contests" })}
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to contests
      </button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Create Contest</h1>
        <p className="text-sm text-text-muted">Schedule a new custom contest for the Contest Calendar</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* ── Contest Details ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">Contest Details</h2>

          {/* Title */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
              Title <span className="text-red-400">*</span>
            </span>
            <input
              required
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className={inputCls}
              placeholder="e.g. Codnite Weekly Challenge #55"
            />
          </label>

          {/* Description */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="Optional contest description..."
            />
          </label>

          {/* Platform + Registration URL */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                Platform
              </span>
              <select
                value={form.platform}
                onChange={(e) => updateForm("platform", e.target.value)}
                className={inputCls}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                Registration / Contest URL
              </span>
              <input
                type="url"
                value={form.registrationUrl}
                onChange={(e) => updateForm("registrationUrl", e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </label>
          </div>

          {/* Start Time + End Time */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                Start Time <span className="text-red-400">*</span>
              </span>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => updateForm("startTime", e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                End Time <span className="text-red-400">*</span>
              </span>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => updateForm("endTime", e.target.value)}
                className={inputCls}
              />
            </label>
          </div>

          {/* Active Status */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
              Status
            </span>
            <button
              type="button"
              onClick={() => updateForm("isActive", !form.isActive)}
              className={`h-9 w-full rounded-lg border text-sm font-semibold transition-colors ${
                form.isActive
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : "border-border-card bg-background/40 text-text-muted"
              }`}
            >
              {form.isActive ? "✓ Published (Visible to users)" : "✗ Draft (Hidden from users)"}
            </button>
          </label>
        </div>

        {/* ── Problems ────────────────────────────────────────────── */}
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
              className="w-full rounded-lg border border-border-card bg-background/60 pl-9 pr-3 py-2.5 text-sm focus:outline-none"
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
              <div
                key={p._id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-card bg-background/50"
              >
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
              <p className="text-sm text-text-muted text-center py-4">
                No problems added yet. Contests without problems are allowed.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/contests" })}
            className="inline-flex items-center gap-2 rounded-lg border border-border-card px-6 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Contest"}
          </button>
        </div>
      </form>

      {isModalOpen && (
        <InlineProblemModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newProblemId) => addProblem(newProblemId)}
        />
      )}
    </div>
  );
}

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, X, Save, ArrowLeft, Search, BookOpen, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { InlineProblemModal } from "@/components/admin/InlineProblemModal";
import { DifficultyBadge } from "@/components/admin/badges";

export const Route = createFileRoute("/_admin/learning-paths/$id")({
  head: () => ({ meta: [{ title: "Edit Learning Path — FullPrep Admin" }] }),
  component: EditLearningPathPage,
});

function EditLearningPathPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams({ strict: false });

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    level: "Beginner",
    estimatedTime: "",
    color: "#3b82f6",
    icon: "BookOpen",
    isPro: false,
    contentType: "problems",
    content: "",
    modules: [] as Array<{ title: string; description: string; problems: string[] }>,
  });

  const { data: pathData, isLoading: isLoadingPath } = useQuery({
    queryKey: ["learning-paths", id],
    queryFn: () => api.getLearningPath(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (pathData) {
      setForm({
        id: pathData.id || "",
        title: pathData.title || "",
        description: pathData.description || "",
        level: pathData.level || "Beginner",
        estimatedTime: pathData.estimatedTime || "",
        color: pathData.color || "#3b82f6",
        icon: pathData.icon || "BookOpen",
        isPro: !!pathData.isPro,
        contentType: pathData.contentType || "problems",
        content: pathData.content || "",
        modules: pathData.modules || [],
      });
    }
  }, [pathData]);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);

  const { data: allProblems = [] } = useQuery({
    queryKey: ["problems"],
    queryFn: api.listProblems,
  });

  const filteredProblems = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return allProblems
      .filter(
        (p: any) =>
          p.name.toLowerCase().includes(term) || p.externalId.toLowerCase().includes(term),
      )
      .slice(0, 5);
  }, [search, allProblems]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) => api.updateLearningPath(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-paths"] });
      navigate({ to: "/learning-paths" });
    },
    onError: (err: any) => alert(err.message),
  });

  const { mutate: deletePath, isPending: isDeleting } = useMutation({
    mutationFn: () => api.deleteLearningPath(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-paths"] });
      navigate({ to: "/learning-paths" });
    },
    onError: (err: any) => alert(err.message),
  });

  const updateForm = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { title: `Module ${prev.modules.length + 1}`, description: "", problems: [] },
      ],
    }));
  };

  const removeModule = (index: number) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const updateModule = (index: number, field: string, value: any) => {
    setForm((prev) => {
      const updated = [...prev.modules];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, modules: updated };
    });
  };

  const addProblemToModule = (problemId: string, moduleIndex: number) => {
    setForm((prev) => {
      const updated = [...prev.modules];
      if (!updated[moduleIndex].problems.includes(problemId)) {
        updated[moduleIndex].problems.push(problemId);
      }
      return { ...prev, modules: updated };
    });
    setSearch("");
  };

  const removeProblemFromModule = (problemId: string, moduleIndex: number) => {
    setForm((prev) => {
      const updated = [...prev.modules];
      updated[moduleIndex].problems = updated[moduleIndex].problems.filter(
        (id) => id !== problemId,
      );
      return { ...prev, modules: updated };
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.title) return alert("ID and Title are required");
    mutate(form);
  };

  if (isLoadingPath) {
    return <div className="p-8">Loading...</div>;
  }

  const inputCls =
    "w-full rounded-lg border border-border-card bg-background/60 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/learning-paths" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-card bg-surface hover:bg-border-card hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Edit Learning Path
          </h1>
          <p className="text-sm text-text-muted">Modify existing course details.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this course?")) deletePath();
          }}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          Delete Course
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => updateForm("isPro", false)}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            !form.isPro
              ? "border-green-500 bg-green-500/10 shadow-sm"
              : "border-border-card bg-surface hover:border-text-muted"
          }`}
        >
          <div>
            <div
              className={`font-semibold ${!form.isPro ? "text-green-500" : "text-text-primary"}`}
            >
              Free Course
            </div>
            <div className="text-xs text-text-muted mt-0.5">Available to all users</div>
          </div>
        </button>
        <button
          onClick={() => updateForm("isPro", true)}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            form.isPro
              ? "border-brand-orange bg-brand-orange/10 shadow-sm"
              : "border-border-card bg-surface hover:border-text-muted"
          }`}
        >
          <div>
            <div
              className={`font-semibold ${form.isPro ? "text-brand-orange" : "text-text-primary"}`}
            >
              Premium Course
            </div>
            <div className="text-xs text-text-muted mt-0.5">Requires Pro Subscription</div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => updateForm("contentType", "problems")}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            form.contentType === "problems"
              ? "border-brand-primary bg-brand-primary/10 shadow-sm"
              : "border-border-card bg-surface hover:border-text-muted"
          }`}
        >
          <BookOpen
            className={`h-5 w-5 ${form.contentType === "problems" ? "text-brand-primary" : "text-text-muted"}`}
          />
          <div>
            <div className="font-semibold text-text-primary">Learning Path (Problems)</div>
            <div className="text-xs text-text-muted mt-0.5">
              Build modules with interactive problems
            </div>
          </div>
        </button>
        <button
          onClick={() => updateForm("contentType", "notes")}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            form.contentType === "notes"
              ? "border-brand-primary bg-brand-primary/10 shadow-sm"
              : "border-border-card bg-surface hover:border-text-muted"
          }`}
        >
          <FileText
            className={`h-5 w-5 ${form.contentType === "notes" ? "text-brand-primary" : "text-text-muted"}`}
          />
          <div>
            <div className="font-semibold text-text-primary">Markdown Notes</div>
            <div className="text-xs text-text-muted mt-0.5">
              Provide a rich text/markdown course
            </div>
          </div>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">Course Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                URL ID / Slug <span className="text-red-400">*</span>
              </span>
              <input
                required
                value={form.id}
                onChange={(e) =>
                  updateForm("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                className={inputCls}
                disabled
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                Title <span className="text-red-400">*</span>
              </span>
              <input
                required
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className={inputCls}
                placeholder="e.g. Top 100 System Design Notes"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
              Description <span className="text-red-400">*</span>
            </span>
            <input
              required
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className={inputCls}
              placeholder="Brief description of the course..."
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                Level
              </span>
              <select
                value={form.level}
                onChange={(e) => updateForm("level", e.target.value)}
                className={inputCls}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase">
                Estimated Time
              </span>
              <input
                value={form.estimatedTime}
                onChange={(e) => updateForm("estimatedTime", e.target.value)}
                className={inputCls}
                placeholder="e.g. 15 hours"
              />
            </label>
          </div>
        </div>

        {form.contentType === "notes" && (
          <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-text-primary mb-4">Course Content (Markdown)</h2>
            <textarea
              value={form.content}
              onChange={(e) => updateForm("content", e.target.value)}
              className={`${inputCls} min-h-[300px] font-mono`}
              placeholder="# Introduction\n\nWelcome to the course..."
            />
          </div>
        )}

        {form.contentType === "problems" && (
          <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-primary">Module Builder</h2>
              <button
                type="button"
                onClick={addModule}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Module
              </button>
            </div>

            {form.modules.map((mod, modIdx) => (
              <div
                key={modIdx}
                className="border border-border-card rounded-xl p-4 bg-background/30 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <input
                      value={mod.title}
                      onChange={(e) => updateModule(modIdx, "title", e.target.value)}
                      className={inputCls}
                      placeholder="Module Title (e.g. Dynamic Programming Basics)"
                    />
                    <input
                      value={mod.description}
                      onChange={(e) => updateModule(modIdx, "description", e.target.value)}
                      className={inputCls}
                      placeholder="Optional description..."
                    />
                  </div>
                  {form.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(modIdx)}
                      className="text-text-muted hover:text-destructive p-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border-card/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-text-secondary uppercase">
                      Problems ({mod.problems.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModuleIndex(modIdx);
                        setIsModalOpen(true);
                      }}
                      className="text-xs font-medium text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Create New Problem
                    </button>
                  </div>

                  {/* Search Existing */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                    <input
                      value={activeModuleIndex === modIdx ? search : ""}
                      onFocus={() => setActiveModuleIndex(modIdx)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setActiveModuleIndex(modIdx);
                      }}
                      placeholder="Search existing database problems to add..."
                      className="w-full rounded-lg border border-border-card bg-background/60 pl-9 pr-3 py-2 text-sm focus:outline-none"
                    />
                    {activeModuleIndex === modIdx && filteredProblems.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border-card bg-surface shadow-lg z-10">
                        {filteredProblems.map((p: any) => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => addProblemToModule(p.externalId, modIdx)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover flex justify-between items-center"
                          >
                            <span>{p.name}</span>
                            <DifficultyBadge difficulty={p.difficulty} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected list */}
                  <div className="space-y-2">
                    {mod.problems.map((pid, idx) => {
                      const prob = allProblems.find((p: any) => p.externalId === pid);
                      return (
                        <div
                          key={pid}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border-card bg-background/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-text-muted">{idx + 1}.</span>
                            <span className="font-medium text-sm">{prob ? prob.name : pid}</span>
                            {prob && <DifficultyBadge difficulty={prob.difficulty} />}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProblemFromModule(pid, modIdx)}
                            className="text-text-muted hover:text-destructive p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/learning-paths" })}
            className="inline-flex items-center gap-2 rounded-lg border border-border-card px-6 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Course"}
          </button>
        </div>
      </form>

      {isModalOpen && activeModuleIndex !== null && (
        <InlineProblemModal
          onClose={() => {
            setIsModalOpen(false);
            setActiveModuleIndex(null);
          }}
          onSuccess={(newProblemId) => {
            const problem = allProblems.find((p: any) => p._id === newProblemId);
            addProblemToModule(problem?.externalId || newProblemId, activeModuleIndex);
          }}
        />
      )}
    </div>
  );
}

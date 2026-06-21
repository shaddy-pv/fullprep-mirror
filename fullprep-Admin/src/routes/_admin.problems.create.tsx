import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, Eye, Edit2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminProblem } from "@/lib/types";

export const Route = createFileRoute("/_admin/problems/create")({
  head: () => ({ meta: [{ title: "Create Problem — FullPrep Admin" }] }),
  component: CreateProblemPage,
});

function CreateProblemPage() {
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Partial<AdminProblem>>({
    name: "",
    difficulty: "EASY",
    source: "CODEFORCES",
    cfRating: 1200,
    isActive: true,
    cfTags: [],
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: [""],
    notes: "",
    examples: [{ input: "", output: "", explanation: "" }],
    publicTests: [],
    privateTests: [],
    hints: [""],
    starterCodeTemplates: [],
    editorial: { title: "", content: "", timeComplexity: "", spaceComplexity: "" },
    judgeConfig: { timeLimit: 2, memoryLimit: 256, outputMatchingStrategy: "EXACT_MATCH" },
    problemCode: "",
    problemSlug: "",
    originalProblemLink: "",
  });

  function updateForm(field: keyof AdminProblem, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Helpers for dynamic arrays
  const addArrayItem = (field: string, defaultVal: any) => {
    setForm((prev) => ({ ...prev, [field]: [...(prev[field as keyof AdminProblem] as any[] || []), defaultVal] }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field as keyof AdminProblem] as any[]).filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: string, index: number, val: any) => {
    setForm((prev) => {
      const arr = [...(prev[field as keyof AdminProblem] as any[])];
      arr[index] = val;
      return { ...prev, [field]: arr };
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Concatenate all description parts into a master description if needed, or send as is
      await api.createProblem(form);
      navigate({ to: "/problems" });
    } catch (err) {
      console.error("Failed to create problem:", err);
      alert("Failed to create problem. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/problems" })}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to problems
        </button>

        <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border-card">
          <button
            onClick={() => setIsPreview(false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!isPreview ? "bg-background shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isPreview ? "bg-background shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Create new problem
        </h1>
        <p className="text-sm text-text-muted">Author a fully complete competitive programming problem.</p>
      </div>

      {isPreview ? (
        <Preview problem={form as AdminProblem} />
      ) : (
        <form onSubmit={onSubmit} className="space-y-8">
          {/* SECTION: Basic Info */}
          <Section title="Basic Information">
            <Field label="Problem Name">
              <input required value={form.name} onChange={(e) => updateForm("name", e.target.value)} className={inputCls} placeholder="e.g. Two Sum" />
            </Field>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Difficulty">
                <select value={form.difficulty} onChange={(e) => updateForm("difficulty", e.target.value)} className={inputCls}>
                  {["EASY", "MEDIUM", "HARD", "HARDER", "HARDEST", "EXPERT"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Source">
                <select value={form.source} onChange={(e) => updateForm("source", e.target.value)} className={inputCls}>
                  {["CODEFORCES", "CODECHEF", "HACKEREARTH", "LEETCODE", "FULLPREP", "UNKNOWN"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="CF Rating">
                <input type="number" value={form.cfRating} onChange={(e) => updateForm("cfRating", +e.target.value)} className={inputCls} />
              </Field>
              <Field label="Active Status">
                <button type="button" onClick={() => updateForm("isActive", !form.isActive)} className={`h-9 w-full rounded-lg border text-sm ${form.isActive ? "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald" : "border-border-card text-text-muted"}`}>
                  {form.isActive ? "Active" : "Inactive"}
                </button>
              </Field>
            </div>
            <Field label="Tags (comma separated)">
              <input value={form.cfTags?.join(", ")} onChange={(e) => updateForm("cfTags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} className={inputCls} placeholder="dp, graphs, greedy" />
            </Field>
          </Section>

          {/* SECTION: Problem Content */}
          <Section title="Problem Content">
            <Field label="Problem Statement (Markdown)">
              <textarea required value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={6} className={textareaCls} placeholder="Describe the problem..." />
            </Field>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Input Format">
                <textarea value={form.inputFormat} onChange={(e) => updateForm("inputFormat", e.target.value)} rows={4} className={textareaCls} placeholder="e.g. The first line contains an integer n..." />
              </Field>
              <Field label="Output Format">
                <textarea value={form.outputFormat} onChange={(e) => updateForm("outputFormat", e.target.value)} rows={4} className={textareaCls} placeholder="e.g. Print a single integer denoting..." />
              </Field>
            </div>
            
            <Field label="Constraints">
              <DynamicArray 
                items={form.constraints as string[]} 
                onAdd={() => addArrayItem("constraints", "")}
                onRemove={(i) => removeArrayItem("constraints", i)}
              >
                {(item, i) => (
                  <input value={item} onChange={(e) => updateArrayItem("constraints", i, e.target.value)} className={inputCls} placeholder={`Constraint ${i+1}`} />
                )}
              </DynamicArray>
            </Field>

            <Field label="Notes (Optional)">
              <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} rows={3} className={textareaCls} placeholder="Additional notes or hints for the user..." />
            </Field>
          </Section>

          {/* SECTION: Examples */}
          <Section title="Examples Section">
            <DynamicArray 
              items={form.examples as any[]} 
              onAdd={() => addArrayItem("examples", { input: "", output: "", explanation: "" })}
              onRemove={(i) => removeArrayItem("examples", i)}
            >
              {(item, i) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 bg-background/50 p-4 rounded-xl border border-border-card">
                  <Field label="Input">
                    <textarea value={item.input} onChange={(e) => updateArrayItem("examples", i, { ...item, input: e.target.value })} rows={3} className={textareaCls} />
                  </Field>
                  <Field label="Output">
                    <textarea value={item.output} onChange={(e) => updateArrayItem("examples", i, { ...item, output: e.target.value })} rows={3} className={textareaCls} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Explanation (Optional)">
                      <input value={item.explanation} onChange={(e) => updateArrayItem("examples", i, { ...item, explanation: e.target.value })} className={inputCls} placeholder="Explain how the output was derived..." />
                    </Field>
                  </div>
                </div>
              )}
            </DynamicArray>
          </Section>

          {/* SECTION: Test Cases */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Section title="Public Test Cases (Visible)">
              <DynamicArray 
                items={form.publicTests as any[]} 
                onAdd={() => addArrayItem("publicTests", { input: "", output: "", explanation: "" })}
                onRemove={(i) => removeArrayItem("publicTests", i)}
              >
                {(item, i) => (
                  <div className="flex gap-2">
                    <textarea value={item.input} onChange={(e) => updateArrayItem("publicTests", i, { ...item, input: e.target.value })} rows={2} className={textareaCls} placeholder="Input" />
                    <textarea value={item.output} onChange={(e) => updateArrayItem("publicTests", i, { ...item, output: e.target.value })} rows={2} className={textareaCls} placeholder="Output" />
                  </div>
                )}
              </DynamicArray>
            </Section>

            <Section title="Hidden Test Cases (Secret)">
              <DynamicArray 
                items={form.privateTests as any[]} 
                onAdd={() => addArrayItem("privateTests", { input: "", output: "", explanation: "" })}
                onRemove={(i) => removeArrayItem("privateTests", i)}
              >
                {(item, i) => (
                  <div className="flex gap-2">
                    <textarea value={item.input} onChange={(e) => updateArrayItem("privateTests", i, { ...item, input: e.target.value })} rows={2} className={textareaCls} placeholder="Input" />
                    <textarea value={item.output} onChange={(e) => updateArrayItem("privateTests", i, { ...item, output: e.target.value })} rows={2} className={textareaCls} placeholder="Output" />
                  </div>
                )}
              </DynamicArray>
            </Section>
          </div>

          {/* SECTION: Starter Code */}
          <Section title="Starter Code Templates">
             <DynamicArray 
                items={form.starterCodeTemplates as any[]} 
                onAdd={() => addArrayItem("starterCodeTemplates", { language: "JAVASCRIPT", code: "" })}
                onRemove={(i) => removeArrayItem("starterCodeTemplates", i)}
              >
                {(item, i) => (
                  <div className="space-y-2">
                    <select value={item.language} onChange={(e) => updateArrayItem("starterCodeTemplates", i, { ...item, language: e.target.value })} className={inputCls + " w-1/3"}>
                      {["PYTHON3", "CPP17", "JAVA", "JAVASCRIPT", "TYPESCRIPT", "RUST", "GO"].map((l) => <option key={l}>{l}</option>)}
                    </select>
                    <textarea value={item.code} onChange={(e) => updateArrayItem("starterCodeTemplates", i, { ...item, code: e.target.value })} rows={4} className={textareaCls} placeholder="Write initial starter code..." />
                  </div>
                )}
              </DynamicArray>
          </Section>

          {/* SECTION: Editorial */}
          <Section title="Editorial / Solution Section">
            <div className="space-y-4">
              <Field label="Title">
                 <input value={form.editorial?.title || ""} onChange={(e) => updateForm("editorial", { ...form.editorial, title: e.target.value })} className={inputCls} placeholder="e.g. Optimal O(N) using HashMap" />
              </Field>
              <Field label="Content (Markdown)">
                 <textarea value={form.editorial?.content || ""} onChange={(e) => updateForm("editorial", { ...form.editorial, content: e.target.value })} rows={5} className={textareaCls} placeholder="Explain the solution..." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Time Complexity">
                  <input value={form.editorial?.timeComplexity || ""} onChange={(e) => updateForm("editorial", { ...form.editorial, timeComplexity: e.target.value })} className={inputCls} placeholder="e.g. O(N)" />
                </Field>
                <Field label="Space Complexity">
                  <input value={form.editorial?.spaceComplexity || ""} onChange={(e) => updateForm("editorial", { ...form.editorial, spaceComplexity: e.target.value })} className={inputCls} placeholder="e.g. O(1)" />
                </Field>
              </div>
            </div>
          </Section>

          {/* SECTION: Hints */}
          <Section title="Hints Section">
             <DynamicArray 
                items={form.hints as string[]} 
                onAdd={() => addArrayItem("hints", "")}
                onRemove={(i) => removeArrayItem("hints", i)}
              >
                {(item, i) => (
                  <input value={item} onChange={(e) => updateArrayItem("hints", i, e.target.value)} className={inputCls} placeholder={`Hint ${i+1}`} />
                )}
              </DynamicArray>
          </Section>

          {/* SECTION: Judge & Metadata */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Section title="Judge Configuration">
              <div className="space-y-4">
                <Field label="Time Limit (Seconds)">
                  <input type="number" value={form.judgeConfig?.timeLimit ?? form.timeLimitSeconds} onChange={(e) => updateForm("judgeConfig", { ...form.judgeConfig, timeLimit: +e.target.value })} className={inputCls} />
                </Field>
                <Field label="Memory Limit (MB)">
                  <input type="number" value={form.judgeConfig?.memoryLimit ?? form.memoryLimitMb} onChange={(e) => updateForm("judgeConfig", { ...form.judgeConfig, memoryLimit: +e.target.value })} className={inputCls} />
                </Field>
                <Field label="Output Matching Strategy">
                  <select value={form.judgeConfig?.outputMatchingStrategy || "EXACT_MATCH"} onChange={(e) => updateForm("judgeConfig", { ...form.judgeConfig, outputMatchingStrategy: e.target.value })} className={inputCls}>
                    <option value="EXACT_MATCH">Exact Match</option>
                    <option value="IGNORE_WHITESPACE">Ignore Whitespace</option>
                    <option value="CUSTOM_CHECKER">Custom Checker</option>
                  </select>
                </Field>
              </div>
            </Section>
            <Section title="Metadata">
              <div className="space-y-4">
                <Field label="Problem Code">
                  <input value={form.problemCode || ""} onChange={(e) => updateForm("problemCode", e.target.value)} className={inputCls} placeholder="e.g. 1575G" />
                </Field>
                <Field label="Problem Slug">
                  <input value={form.problemSlug || ""} onChange={(e) => updateForm("problemSlug", e.target.value)} className={inputCls} placeholder="e.g. gcd-festival" />
                </Field>
                <Field label="Original Problem Link">
                  <input value={form.originalProblemLink || ""} onChange={(e) => updateForm("originalProblemLink", e.target.value)} className={inputCls} placeholder="https://codeforces.com/..." />
                </Field>
              </div>
            </Section>
          </div>

          <div className="flex justify-end gap-3 border-t border-border-card pt-6">
            <button
              type="button"
              onClick={() => navigate({ to: "/problems" })}
              className="rounded-lg border border-border-card px-5 py-2 text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {isSubmitting ? "Creating..." : "Create Problem"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── UI Components ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all";

const textareaCls = inputCls + " font-mono text-[13px] resize-y";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-card bg-surface p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-text-primary">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function DynamicArray({ items, onAdd, onRemove, children }: { items: any[], onAdd: () => void, onRemove: (i: number) => void, children: (item: any, i: number) => React.ReactNode }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <div className="flex-1">{children(item, i)}</div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="mt-1 flex-shrink-0 p-2 rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add Item
      </button>
    </div>
  );
}

// ── Preview Component ─────────────────────────────────────────────────────────

function Preview({ problem }: { problem: AdminProblem }) {
  return (
    <div className="p-8 rounded-[24px] border border-border-card bg-card-bg shadow-sm space-y-8 select-text">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{problem.name || "Untitled Problem"}</h1>
        <div className="flex items-center gap-3 text-xs font-semibold">
           <span className="text-brand-primary px-2 py-1 rounded bg-brand-primary/10">{problem.difficulty}</span>
           <span className="text-text-secondary border border-border-card px-2 py-1 rounded">{problem.source}</span>
        </div>
      </div>

      <div className="space-y-6 text-[14px] text-text-primary leading-relaxed font-medium">
        <div>
          {problem.description || <span className="text-text-muted italic">No description provided</span>}
        </div>
        
        {problem.inputFormat && (
          <div>
            <h3 className="font-bold text-[15px] mb-2 uppercase text-text-secondary tracking-wider">Input</h3>
            <div className="whitespace-pre-wrap">{problem.inputFormat}</div>
          </div>
        )}

        {problem.outputFormat && (
          <div>
            <h3 className="font-bold text-[15px] mb-2 uppercase text-text-secondary tracking-wider">Output</h3>
            <div className="whitespace-pre-wrap">{problem.outputFormat}</div>
          </div>
        )}

        {problem.examples && problem.examples.length > 0 && (
           <div className="space-y-4">
              <h3 className="font-bold text-[15px] uppercase text-text-secondary tracking-wider">Examples</h3>
              {problem.examples.map((ex, i) => (
                 <div key={i} className="space-y-2">
                    <span className="font-bold text-text-primary">Example {i + 1}:</span>
                    <div className="p-4 bg-background/50 border border-border-card rounded-xl font-mono text-[13px] whitespace-pre-wrap">
                       <div><strong>Input:</strong>{"\n"}{ex.input}</div>
                       <div className="mt-2"><strong>Output:</strong>{"\n"}{ex.output}</div>
                       {ex.explanation && (
                         <div className="mt-3 text-text-secondary font-sans">
                           <strong>Explanation:</strong> {ex.explanation}
                         </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}

        {problem.constraints && problem.constraints.length > 0 && problem.constraints[0] !== "" && (
          <div>
            <h3 className="font-bold text-[15px] mb-2 uppercase text-text-secondary tracking-wider">Constraints</h3>
            <ul className="list-disc pl-5 space-y-1 text-[13px]">
               {problem.constraints.map((c, i) => c ? (
                 <li key={i}><code className="font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border-card">{c}</code></li>
               ) : null)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

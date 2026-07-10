import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminProblem } from "@/lib/types";

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
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </span>
      {children}
    </label>
  );
}

function DynamicArray({
  items,
  onAdd,
  onRemove,
  children,
}: {
  items: any[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  children: (item: any, i: number) => React.ReactNode;
}) {
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

// ── Modal Component ────────────────────────────────────────────────────────
export function InlineProblemModal({
  onClose,
  onSuccess,
  defaultContestType = "NONE",
}: {
  onClose: () => void;
  onSuccess: (id: string) => void;
  defaultContestType?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Partial<AdminProblem>>({
    name: "",
    difficulty: "EASY",
    source: "FULLPREP",
    cfRating: 1200,
    isActive: true,
    contestType: defaultContestType,
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

  const addArrayItem = (field: string, defaultVal: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...((prev[field as keyof AdminProblem] as any[]) || []), defaultVal],
    }));
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

  async function submitProblem(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createProblem(form as any);
      onSuccess(res._id!);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create inline problem");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-surface rounded-2xl shadow-xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-5 border-b border-border-card">
          <h2 className="text-xl font-bold">Create Contest Problem</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="inline-problem-form" onSubmit={submitProblem} className="space-y-8">
            {/* SECTION: Basic Info */}
            <Section title="Basic Information">
              <Field label="Problem Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Two Sum"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Difficulty">
                  <select
                    value={form.difficulty}
                    onChange={(e) => updateForm("difficulty", e.target.value)}
                    className={inputCls}
                  >
                    {["EASY", "MEDIUM", "HARD", "HARDER", "HARDEST", "EXPERT"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Source">
                  <select
                    value={form.source}
                    onChange={(e) => updateForm("source", e.target.value)}
                    className={inputCls}
                  >
                    {[
                      "CODEFORCES",
                      "CODECHEF",
                      "HACKEREARTH",
                      "LEETCODE",
                      "FULLPREP",
                      "UNKNOWN",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="CF Rating">
                  <input
                    type="number"
                    value={form.cfRating}
                    onChange={(e) => updateForm("cfRating", +e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Active Status">
                  <button
                    type="button"
                    onClick={() => updateForm("isActive", !form.isActive)}
                    className={`h-9 w-full rounded-lg border text-sm ${form.isActive ? "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald" : "border-border-card text-text-muted"}`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </Field>
                <Field label="Contest Classification">
                  <select
                    value={form.contestType || "NONE"}
                    onChange={(e) => updateForm("contestType", e.target.value)}
                    className={inputCls}
                  >
                    {["NONE", "DAILY", "WEEKLY"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Tags (comma separated)">
                <input
                  value={form.cfTags?.join(", ")}
                  onChange={(e) =>
                    updateForm(
                      "cfTags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    )
                  }
                  className={inputCls}
                  placeholder="dp, graphs, greedy"
                />
              </Field>
            </Section>

            {/* SECTION: Problem Content */}
            <Section title="Problem Content">
              <Field label="Problem Statement (Markdown)">
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={6}
                  className={textareaCls}
                  placeholder="Describe the problem..."
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Input Format">
                  <textarea
                    value={form.inputFormat}
                    onChange={(e) => updateForm("inputFormat", e.target.value)}
                    rows={4}
                    className={textareaCls}
                    placeholder="e.g. The first line contains an integer n..."
                  />
                </Field>
                <Field label="Output Format">
                  <textarea
                    value={form.outputFormat}
                    onChange={(e) => updateForm("outputFormat", e.target.value)}
                    rows={4}
                    className={textareaCls}
                    placeholder="e.g. Print a single integer denoting..."
                  />
                </Field>
              </div>
              <Field label="Constraints">
                <DynamicArray
                  items={form.constraints as string[]}
                  onAdd={() => addArrayItem("constraints", "")}
                  onRemove={(i) => removeArrayItem("constraints", i)}
                >
                  {(item, i) => (
                    <input
                      value={item}
                      onChange={(e) => updateArrayItem("constraints", i, e.target.value)}
                      className={inputCls}
                      placeholder={`Constraint ${i + 1}`}
                    />
                  )}
                </DynamicArray>
              </Field>
              <Field label="Notes (Optional)">
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  rows={3}
                  className={textareaCls}
                  placeholder="Additional notes or hints for the user..."
                />
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
                      <textarea
                        value={item.input}
                        onChange={(e) =>
                          updateArrayItem("examples", i, { ...item, input: e.target.value })
                        }
                        rows={3}
                        className={textareaCls}
                      />
                    </Field>
                    <Field label="Output">
                      <textarea
                        value={item.output}
                        onChange={(e) =>
                          updateArrayItem("examples", i, { ...item, output: e.target.value })
                        }
                        rows={3}
                        className={textareaCls}
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Explanation (Optional)">
                        <input
                          value={item.explanation}
                          onChange={(e) =>
                            updateArrayItem("examples", i, { ...item, explanation: e.target.value })
                          }
                          className={inputCls}
                          placeholder="Explain how the output was derived..."
                        />
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
                  onAdd={() =>
                    addArrayItem("publicTests", { input: "", output: "", explanation: "" })
                  }
                  onRemove={(i) => removeArrayItem("publicTests", i)}
                >
                  {(item, i) => (
                    <div className="flex gap-2">
                      <textarea
                        value={item.input}
                        onChange={(e) =>
                          updateArrayItem("publicTests", i, { ...item, input: e.target.value })
                        }
                        rows={2}
                        className={textareaCls}
                        placeholder="Input"
                      />
                      <textarea
                        value={item.output}
                        onChange={(e) =>
                          updateArrayItem("publicTests", i, { ...item, output: e.target.value })
                        }
                        rows={2}
                        className={textareaCls}
                        placeholder="Output"
                      />
                    </div>
                  )}
                </DynamicArray>
              </Section>
              <Section title="Hidden Test Cases (Secret)">
                <DynamicArray
                  items={form.privateTests as any[]}
                  onAdd={() =>
                    addArrayItem("privateTests", { input: "", output: "", explanation: "" })
                  }
                  onRemove={(i) => removeArrayItem("privateTests", i)}
                >
                  {(item, i) => (
                    <div className="flex gap-2">
                      <textarea
                        value={item.input}
                        onChange={(e) =>
                          updateArrayItem("privateTests", i, { ...item, input: e.target.value })
                        }
                        rows={2}
                        className={textareaCls}
                        placeholder="Input"
                      />
                      <textarea
                        value={item.output}
                        onChange={(e) =>
                          updateArrayItem("privateTests", i, { ...item, output: e.target.value })
                        }
                        rows={2}
                        className={textareaCls}
                        placeholder="Output"
                      />
                    </div>
                  )}
                </DynamicArray>
              </Section>
            </div>

            {/* SECTION: Starter Code */}
            <Section title="Starter Code Templates">
              <DynamicArray
                items={form.starterCodeTemplates as any[]}
                onAdd={() =>
                  addArrayItem("starterCodeTemplates", { language: "JAVASCRIPT", code: "" })
                }
                onRemove={(i) => removeArrayItem("starterCodeTemplates", i)}
              >
                {(item, i) => (
                  <div className="space-y-2">
                    <select
                      value={item.language}
                      onChange={(e) =>
                        updateArrayItem("starterCodeTemplates", i, {
                          ...item,
                          language: e.target.value,
                        })
                      }
                      className={inputCls + " w-1/3"}
                    >
                      {["PYTHON3", "CPP17", "JAVA", "JAVASCRIPT", "TYPESCRIPT", "RUST", "GO"].map(
                        (l) => (
                          <option key={l}>{l}</option>
                        ),
                      )}
                    </select>
                    <textarea
                      value={item.code}
                      onChange={(e) =>
                        updateArrayItem("starterCodeTemplates", i, {
                          ...item,
                          code: e.target.value,
                        })
                      }
                      rows={4}
                      className={textareaCls}
                      placeholder="Write initial starter code..."
                    />
                  </div>
                )}
              </DynamicArray>
            </Section>

            {/* SECTION: Judge & Metadata */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Section title="Judge Configuration">
                <div className="space-y-4">
                  <Field label="Time Limit (Seconds)">
                    <input
                      type="number"
                      value={form.judgeConfig?.timeLimit ?? form.timeLimitSeconds}
                      onChange={(e) =>
                        updateForm("judgeConfig", {
                          ...form.judgeConfig,
                          timeLimit: +e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Memory Limit (MB)">
                    <input
                      type="number"
                      value={form.judgeConfig?.memoryLimit ?? form.memoryLimitMb}
                      onChange={(e) =>
                        updateForm("judgeConfig", {
                          ...form.judgeConfig,
                          memoryLimit: +e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Output Matching Strategy">
                    <select
                      value={form.judgeConfig?.outputMatchingStrategy || "EXACT_MATCH"}
                      onChange={(e) =>
                        updateForm("judgeConfig", {
                          ...form.judgeConfig,
                          outputMatchingStrategy: e.target.value,
                        })
                      }
                      className={inputCls}
                    >
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
                    <input
                      value={form.problemCode || ""}
                      onChange={(e) => updateForm("problemCode", e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 1575G"
                    />
                  </Field>
                  <Field label="Problem Slug">
                    <input
                      value={form.problemSlug || ""}
                      onChange={(e) => updateForm("problemSlug", e.target.value)}
                      className={inputCls}
                      placeholder="e.g. gcd-festival"
                    />
                  </Field>
                </div>
              </Section>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border-card flex justify-end gap-3 bg-background/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium hover:bg-surface-hover rounded-lg border border-border-card"
          >
            Cancel
          </button>
          <button
            form="inline-problem-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold bg-brand-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:brightness-110"
          >
            {isSubmitting ? "Saving..." : "Save & Add to Contest"}
          </button>
        </div>
      </div>
    </div>
  );
}

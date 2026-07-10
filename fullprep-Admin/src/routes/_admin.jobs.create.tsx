import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/jobs/create")({
  head: () => ({ meta: [{ title: "Create Job — FullPrep Admin" }] }),
  component: CreateJobPage,
});

function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    role: "",
    country: "",
    description: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createJob(formData);
      navigate({ to: "/jobs" });
    } catch (err: any) {
      setError(err.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/jobs"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create Job</h1>
          <p className="text-text-secondary mt-1">Add a new career opportunity.</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Job Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Software Engineer Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-bg-screen border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Role</label>
              <input
                required
                type="text"
                placeholder="e.g. Intern, Full-time"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-bg-screen border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Country / Location</label>
              <input
                required
                type="text"
                placeholder="e.g. Remote, India, USA"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-bg-screen border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${
                      formData.isActive
                        ? "bg-brand-primary"
                        : "bg-bg-screen border border-border-default"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData.isActive ? "transform translate-x-4" : ""
                    }`}
                  ></div>
                </div>
                <span className="text-sm font-medium text-text-primary">Active (Visible)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Description</label>
            <textarea
              required
              rows={6}
              placeholder="Job description, requirements, etc..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-bg-screen border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

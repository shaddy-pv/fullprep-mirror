import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth, useTheme } from "@/store/admin";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — FullPrep Admin" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const setTheme = useTheme((s) => s.setTheme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await api.login(email, password);
      setUser(r.user);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-primary/15 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-brand-secondary/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-emerald shadow-[0_8px_24px_-4px_oklch(0.78_0.18_152/0.5)]">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            FullPrep Admin
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">Sign in to manage the platform</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border-card bg-surface p-6 shadow-2xl"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <label className="mb-3 block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              placeholder="Enter your email"
            />
          </label>
          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

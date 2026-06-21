import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  tone = "primary",
  index = 0,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  hint?: string;
  tone?: "primary" | "secondary" | "orange" | "rose" | "amber" | "sky";
  index?: number;
}) {
  const tones: Record<string, string> = {
    primary: "from-brand-primary/15 to-brand-primary/0 text-brand-primary",
    secondary: "from-brand-secondary/15 to-brand-secondary/0 text-brand-secondary",
    orange: "from-brand-orange/15 to-brand-orange/0 text-brand-orange",
    rose: "from-brand-rose/15 to-brand-rose/0 text-brand-rose",
    amber: "from-brand-amber/15 to-brand-amber/0 text-brand-amber",
    sky: "from-brand-sky/15 to-brand-sky/0 text-brand-sky",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl border border-border-card bg-surface p-5 transition hover:border-border-card hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_oklch(0_0_0/0.4)]"
    >
      <div
        className={cn(
          "absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl opacity-60",
          tones[tone],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            {typeof trend === "number" && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  trend >= 0 ? "text-brand-emerald" : "text-brand-rose",
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {hint && <span className="text-text-muted">{hint}</span>}
          </div>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border border-border-card bg-background/50",
            tones[tone].split(" ").find((c) => c.startsWith("text-")),
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
import type {
  ProblemDifficulty,
  ProblemSource,
  SubmissionLanguage,
  SubmissionStatus,
  UserRole,
} from "@/lib/types";

export function Pill({
  children,
  tone = "neutral",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "rose" | "amber" | "sky" | "violet" | "orange" | "red";
  dot?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-text-secondary border-border-card",
    green: "bg-brand-emerald/12 text-brand-emerald border-brand-emerald/25",
    rose: "bg-brand-rose/12 text-brand-rose border-brand-rose/25",
    amber: "bg-brand-amber/12 text-brand-amber border-brand-amber/25",
    sky: "bg-brand-sky/12 text-brand-sky border-brand-sky/25",
    violet: "bg-brand-secondary/15 text-brand-secondary border-brand-secondary/25",
    orange: "bg-brand-orange/12 text-brand-orange border-brand-orange/25",
    red: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const dotColor: Record<string, string> = {
    neutral: "bg-text-muted",
    green: "bg-brand-emerald",
    rose: "bg-brand-rose",
    amber: "bg-brand-amber",
    sky: "bg-brand-sky",
    violet: "bg-brand-secondary",
    orange: "bg-brand-orange",
    red: "bg-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[tone])} />}
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const map = {
    user: { tone: "neutral" as const, label: "User" },
    mentor: { tone: "sky" as const, label: "Mentor" },
    admin: { tone: "violet" as const, label: "Admin" },
  };
  const m = map[role];
  return <Pill tone={m.tone}>{m.label}</Pill>;
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Pill tone={active ? "green" : "red"} dot>
      {active ? "Active" : "Deactivated"}
    </Pill>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: ProblemDifficulty }) {
  const map: Record<ProblemDifficulty, { tone: Parameters<typeof Pill>[0]["tone"] }> = {
    EASY: { tone: "green" },
    MEDIUM: { tone: "amber" },
    HARD: { tone: "rose" },
    HARDER: { tone: "rose" },
    HARDEST: { tone: "red" },
    EXPERT: { tone: "red" },
    "VERY HARD": { tone: "red" },
    UNKNOWN: { tone: "neutral" },
  };
  return <Pill tone={map[difficulty].tone}>{difficulty}</Pill>;
}

export function SourceBadge({ source }: { source: ProblemSource }) {
  return <Pill tone="neutral">{source}</Pill>;
}

export function LanguageBadge({ language }: { language: SubmissionLanguage }) {
  const map: Record<SubmissionLanguage, Parameters<typeof Pill>[0]["tone"]> = {
    PYTHON3: "sky",
    CPP17: "orange",
    CPP20: "orange",
    JAVA: "rose",
    JAVASCRIPT: "amber",
    C: "neutral",
    RUST: "orange",
    GO: "sky",
  };
  return <Pill tone={map[language]}>{language}</Pill>;
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const map: Record<SubmissionStatus, { tone: Parameters<typeof Pill>[0]["tone"]; label: string }> =
    {
      PENDING: { tone: "neutral", label: "Pending" },
      RUNNING: { tone: "sky", label: "Running" },
      ACCEPTED: { tone: "green", label: "Accepted" },
      WRONG_ANSWER: { tone: "rose", label: "Wrong Answer" },
      TIME_LIMIT: { tone: "amber", label: "Time Limit" },
      MEMORY_LIMIT: { tone: "orange", label: "Memory Limit" },
      RUNTIME_ERROR: { tone: "red", label: "Runtime Error" },
      COMPILE_ERROR: { tone: "violet", label: "Compile Error" },
      SYSTEM_ERROR: { tone: "red", label: "System Error" },
    };
  const m = map[status];
  return (
    <Pill tone={m.tone} dot>
      {m.label}
    </Pill>
  );
}

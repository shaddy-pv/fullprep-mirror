import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users as UsersIcon,
  BookOpen,
  Code,
  CheckCircle,
  RefreshCcw,
  Activity,
  Download,
  ServerCog,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { Avatar } from "@/components/admin/Avatar";
import { SubmissionStatusBadge } from "@/components/admin/badges";
import { formatNumber, formatRelativeTime } from "@/lib/format";

export const Route = createFileRoute("/_admin/")({
  head: () => ({ meta: [{ title: "Dashboard — FullPrep Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: api.listUsers,
  });
  const { data: problems = [] } = useQuery({
    queryKey: ["problems"],
    queryFn: api.listProblems,
  });
  const { data: subs = [] } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => api.listSubmissions(),
  });

  const activeProblems = problems.filter((p) => p.isActive).length;
  const accepted = subs.filter((s) => s.status === "ACCEPTED").length;
  const acceptanceRate = subs.length ? (accepted / subs.length) * 100 : 0;

  // Submissions by day (last 30 days)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const subsByDay = days.map((d) => {
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = subs.filter((s) => {
      const t = new Date(s.createdAt);
      return t >= d && t < next;
    }).length;
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    };
  });
  const signupsByDay = days.map((d) => {
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = users.filter((u) => {
      const t = new Date(u.createdAt);
      return t >= d && t < next;
    }).length;
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    };
  });

  // Submissions by status
  const statusBuckets = subs.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusBuckets).map(([name, value]) => ({
    name,
    value,
  }));
  const STATUS_COLORS: Record<string, string> = {
    ACCEPTED: "var(--color-brand-emerald)",
    WRONG_ANSWER: "var(--color-brand-rose)",
    TIME_LIMIT: "var(--color-brand-amber)",
    RUNTIME_ERROR: "var(--color-brand-orange)",
    COMPILE_ERROR: "var(--color-brand-secondary)",
    PENDING: "var(--color-text-muted)",
    RUNNING: "var(--color-brand-sky)",
    MEMORY_LIMIT: "var(--color-brand-orange)",
    SYSTEM_ERROR: "var(--color-destructive)",
  };

  // Difficulty distribution
  const diffBuckets = problems.reduce<Record<string, number>>((acc, p) => {
    acc[p.difficulty] = (acc[p.difficulty] ?? 0) + 1;
    return acc;
  }, {});
  const diffData = Object.entries(diffBuckets).map(([name, value]) => ({
    name,
    value,
  }));

  // Recent activity = recent submissions + recent users
  const activity = [...subs.slice(0, 8)].map((s) => ({
    id: s._id,
    avatar: s.user.name,
    text: (
      <>
        <span className="font-medium text-text-primary">{s.user.name}</span> submitted{" "}
        <span className="text-text-primary">{s.problemName}</span> —{" "}
        <SubmissionStatusBadge status={s.status} />
      </>
    ),
    at: s.createdAt,
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Platform overview
          </h1>
          <p className="text-sm text-text-muted">Real-time pulse of the FullPrep platform.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={formatNumber(users.length)}
          icon={UsersIcon}
          tone="primary"
          trend={12.4}
          hint="this week"
          index={0}
        />
        <StatCard
          label="Active Problems"
          value={formatNumber(activeProblems)}
          icon={BookOpen}
          tone="secondary"
          hint={`${problems.length} total`}
          index={1}
        />
        <StatCard
          label="Total Submissions"
          value={formatNumber(subs.length)}
          icon={Code}
          tone="orange"
          trend={4.7}
          hint="vs yesterday"
          index={2}
        />
        <StatCard
          label="Acceptance Rate"
          value={`${acceptanceRate.toFixed(1)}%`}
          icon={CheckCircle}
          tone="sky"
          hint="platform avg."
          index={3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Submissions over time" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={subsByDay}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-card)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-card)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-brand-primary)"
                strokeWidth={2}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Submissions by status" subtitle="All-time distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {statusData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={STATUS_COLORS[d.name] ?? "var(--color-text-muted)"}
                    stroke="var(--color-background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-card)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-text-secondary)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Problems by difficulty" subtitle={`${problems.length} problems`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diffData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-card)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-card)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {diffData.map((d) => {
                  const c =
                    d.name === "EASY"
                      ? "var(--color-brand-emerald)"
                      : d.name === "MEDIUM"
                        ? "var(--color-brand-amber)"
                        : d.name === "HARD"
                          ? "var(--color-brand-rose)"
                          : "var(--color-destructive)";
                  return <Cell key={d.name} fill={c} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New user signups" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signupsByDay}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-secondary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-brand-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-card)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-card)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-brand-secondary)"
                strokeWidth={2}
                fill="url(#g2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Activity + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border-card bg-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Recent activity</h3>
            <Link to="/submissions" className="text-xs text-brand-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-lg border border-border-card/60 bg-background/30 p-3"
              >
                <Avatar name={a.avatar} size={32} />
                <div className="min-w-0 flex-1 text-sm text-text-secondary">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">{a.text}</div>
                  <p className="mt-0.5 text-[11px] text-text-muted">{formatRelativeTime(a.at)}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border-card bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Quick actions</h3>
          <div className="space-y-2">
            <QuickAction to="/problems/sync" icon={RefreshCcw} label="Sync problems catalog" />
            <QuickAction to="/submissions" icon={Activity} label="View pending submissions" />
            <QuickAction to="/users" icon={Download} label="Export user data" />
            <QuickAction to="/settings" icon={ServerCog} label="System health check" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof RefreshCcw;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-border-card bg-background/30 px-3 py-2.5 text-sm text-text-secondary transition hover:border-brand-primary/40 hover:bg-surface-hover hover:text-text-primary"
    >
      <Icon className="h-4 w-4 text-brand-primary" />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-text-muted transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

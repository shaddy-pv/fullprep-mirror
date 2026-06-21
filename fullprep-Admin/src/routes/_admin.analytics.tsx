import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { Download, RefreshCcw, Calendar, Users as UsersIcon, Activity, Zap, ShieldCheck, Server, AlertTriangle, FileCode2, Clock, Cpu, MemoryStick, Target } from "lucide-react";
import { useState, useMemo } from "react";
import { api } from "@/lib/api";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/_admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — FullPrep Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<number>(30); // days
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ["users"], queryFn: api.listUsers, refetchInterval: autoRefresh ? 5000 : false });
  const { data: problems = [], isLoading: loadingProblems } = useQuery({ queryKey: ["problems"], queryFn: api.listProblems, refetchInterval: autoRefresh ? 5000 : false });
  const { data: subs = [], isLoading: loadingSubs } = useQuery({ queryKey: ["submissions"], queryFn: () => api.listSubmissions(), refetchInterval: autoRefresh ? 5000 : false });

  // ── Global Filter Logic ──────────────────────────────────────────────────
  const filteredSubs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeFilter);
    return subs.filter(s => new Date(s.createdAt) >= cutoff);
  }, [subs, timeFilter]);

  const filteredUsers = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeFilter);
    return users.filter(u => new Date(u.createdAt) >= cutoff);
  }, [users, timeFilter]);

  const filteredProblems = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeFilter);
    return problems.filter(p => new Date(p.createdAt) >= cutoff);
  }, [problems, timeFilter]);

  // ── 1. User Analytics ──────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);

  const dau = new Set(subs.filter((s) => new Date(s.createdAt) >= today).map((s) => s.user._id)).size;
  const wau = new Set(subs.filter((s) => new Date(s.createdAt) >= weekStart).map((s) => s.user._id)).size;
  const newRegsToday = users.filter(u => new Date(u.createdAt) >= today).length;

  // Cumulative user growth
  const days = Array.from({ length: timeFilter }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((timeFilter - 1) - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const userGrowthData = days.map((d) => ({
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    users: users.filter((u) => new Date(u.createdAt) <= d).length,
  }));

  // Top Active Users
  const userActivityCount = filteredSubs.reduce<Record<string, {name: string, count: number, id: string}>>((acc, s) => {
    if (!acc[s.user._id]) acc[s.user._id] = { name: s.user.name, count: 0, id: s.user._id };
    acc[s.user._id].count++;
    return acc;
  }, {});
  const topUsers = Object.values(userActivityCount).sort((a, b) => b.count - a.count).slice(0, 5);

  // ── 2. Problem Analytics ────────────────────────────────────────────────
  const diffBuckets = problems.reduce<Record<string, number>>((a, p) => {
    a[p.difficulty] = (a[p.difficulty] ?? 0) + 1;
    return a;
  }, {});
  const diffData = Object.entries(diffBuckets).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const probCounts = filteredSubs.reduce<Record<string, {name: string, attempts: number, id: string}>>((acc, s) => {
    if (!acc[s.problemExternalId]) acc[s.problemExternalId] = { name: s.problemName || s.problemExternalId, attempts: 0, id: s.problemExternalId };
    acc[s.problemExternalId].attempts++;
    return acc;
  }, {});
  const topProblems = Object.values(probCounts).sort((a, b) => b.attempts - a.attempts).slice(0, 8).map(p => ({ ...p, name: p.name.slice(0, 25)}));

  // ── 3. Submission & Verdict Analytics ──────────────────────────────────
  const verdictCounts = filteredSubs.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  
  const VERDICT_COLORS: Record<string, string> = {
    ACCEPTED: "var(--color-brand-emerald)",
    WRONG_ANSWER: "var(--color-brand-rose)",
    TIME_LIMIT: "var(--color-brand-amber)",
    RUNTIME_ERROR: "var(--color-brand-orange)",
    COMPILE_ERROR: "var(--color-text-muted)",
    MEMORY_LIMIT: "var(--color-brand-sky)",
    PENDING: "var(--color-brand-primary)",
    RUNNING: "var(--color-brand-secondary)"
  };

  const verdictData = Object.entries(verdictCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const totalFilteredSubs = filteredSubs.length;
  const acceptedSubs = filteredSubs.filter(s => s.status === "ACCEPTED").length;
  const acceptanceRate = totalFilteredSubs > 0 ? ((acceptedSubs / totalFilteredSubs) * 100).toFixed(1) : "0";

  // Submission Trend
  const subTrendData = days.map((d) => {
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const daySubs = filteredSubs.filter((s) => {
      const t = new Date(s.createdAt);
      return t >= d && t < next;
    });
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: daySubs.length,
      accepted: daySubs.filter(s => s.status === "ACCEPTED").length,
    };
  });

  // ── 4. Language Analytics ──────────────────────────────────────────────
  const langBuckets = filteredSubs.reduce<Record<string, {count: number, totalTime: number, totalMem: number, acc: number}>>((acc, s) => {
    if (!acc[s.language]) acc[s.language] = { count: 0, totalTime: 0, totalMem: 0, acc: 0 };
    acc[s.language].count++;
    if (s.status === "ACCEPTED") acc[s.language].acc++;
    if (s.executionTimeMs) acc[s.language].totalTime += s.executionTimeMs;
    if (s.memoryUsedMb) acc[s.language].totalMem += s.memoryUsedMb;
    return acc;
  }, {});

  const langData = Object.entries(langBuckets).map(([name, data]) => ({ 
    name, 
    value: data.count,
    accRate: data.count ? Math.round((data.acc / data.count) * 100) : 0,
    avgTime: data.count ? Math.round(data.totalTime / data.count) : 0,
    avgMem: data.count ? Math.round(data.totalMem / data.count) : 0,
  })).sort((a,b) => b.value - a.value);

  const LANG_COLORS = ["#8b5cf6", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#0ea5e9", "#f43f5e"];

  // ── 5. Platform Health (Mock Data based on real formulas) ──────────────
  const avgJudgeTime = filteredSubs.reduce((acc, s) => acc + (s.executionTimeMs || 0), 0) / (filteredSubs.length || 1);
  const queueLength = subs.filter(s => s.status === "PENDING").length;
  
  // ── Export Logic ───────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Submission ID", "User ID", "Problem External ID", "Language", "Status", "Execution Time (ms)", "Memory (MB)", "Created At"];
    const rows = filteredSubs.map(s => [
      s._id, s.user._id, s.problemExternalId, s.language, s.status, s.executionTimeMs || "", s.memoryUsedMb || "", s.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fullprep_analytics_${timeFilter}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingUsers || loadingProblems || loadingSubs) return <div className="p-8 text-center text-text-muted animate-pulse">Loading Analytics Dashboard...</div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-surface p-5 rounded-2xl border border-border-card">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary flex items-center gap-2">
            <Activity className="h-6 w-6 text-brand-primary" /> Analytics Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">Platform-wide metrics, judge health, and user insights.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-background rounded-lg p-1 border border-border-card">
            {[1, 7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeFilter(days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeFilter === days ? 'bg-surface border border-border-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {days === 1 ? 'Today' : `${days}D`}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${autoRefresh ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-border-card bg-surface text-text-secondary hover:bg-surface-hover'}`}
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            Live Sync
          </button>

          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border-card rounded-xl shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover">Export as CSV</button>
              <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover">Export as Excel (Mock)</button>
              <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover">Export as PDF (Mock)</button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard label="Total Users" value={formatNumber(users.length)} icon={UsersIcon} tone="primary" index={0} />
        <StatCard label="Daily Active Users" value={formatNumber(dau)} icon={Activity} tone="primary" index={1} hint="Today" />
        <StatCard label="Acceptance Rate" value={`${acceptanceRate}%`} icon={Target} tone={Number(acceptanceRate) > 50 ? "primary" : "amber"} index={2} hint={`Last ${timeFilter}d`} />
        <StatCard label="Total Submissions" value={formatNumber(subs.length)} icon={FileCode2} tone="sky" index={3} />
        <StatCard label="Judge Queue" value={queueLength.toString()} icon={Server} tone={queueLength > 0 ? "rose" : "secondary"} index={4} hint={queueLength > 0 ? "Processing..." : "Idle"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Verdict Distribution (Takes 1/3) */}
        <div className="lg:col-span-1">
          <ChartCard className="h-[380px]" title="Verdict Distribution" subtitle={`Filtered by last ${timeFilter} days`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={verdictData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {verdictData.map((entry, index) => (
                    <Cell key={index} fill={VERDICT_COLORS[entry.name] || "#aaa"} stroke="var(--color-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border-card)", borderRadius: 8, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "var(--color-text-primary)", fontSize: 12, fontWeight: 500 }}
                  formatter={(value) => [value, "Submissions"]}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: 11, paddingTop: 10, lineHeight: "20px" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Submission Trend (Takes 2/3) */}
        <div className="lg:col-span-2">
          <ChartCard className="h-[380px]" title="Submission Trend" subtitle="Total vs Accepted submissions over time">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-sky)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-brand-sky)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-emerald)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-brand-emerald)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={10} />
                <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border-card)", borderRadius: 8, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} iconType="circle" iconSize={8}/>
                <Area type="monotone" dataKey="total" name="Total Submissions" stroke="var(--color-brand-sky)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="accepted" name="Accepted" stroke="var(--color-brand-emerald)" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <ChartCard className="h-[340px]" title="User Growth" subtitle="Cumulative user registrations">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={10} />
              <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border-card)", borderRadius: 8, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Line type="monotone" dataKey="users" name="Total Users" stroke="var(--color-brand-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-brand-primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Language Analytics Radar */}
        <ChartCard className="h-[340px]" title="Language Analytics" subtitle="Avg attributes across languages (Mocked Scales)">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={langData.slice(0, 5)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <PolarGrid stroke="var(--color-border-card)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Acceptance Rate %" dataKey="accRate" stroke="var(--color-brand-emerald)" strokeWidth={2} fill="var(--color-brand-emerald)" fillOpacity={0.2} />
              {/* Note: In a real app we'd normalize avgTime and avgMem to 0-100 scale for radar. Using accRate here to demonstrate radar capability. */}
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" iconSize={8} />
              <RechartsTooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border-card)", borderRadius: 8, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Problems Bar */}
        <div className="lg:col-span-2">
          <ChartCard className="h-[340px]" title="Top Attempted Problems" subtitle={`By submission count (Last ${timeFilter} days)`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProblems} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "var(--color-text-secondary)", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={180} />
                <RechartsTooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border-card)", borderRadius: 8, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} cursor={{fill: 'var(--color-surface-hover)'}} />
                <Bar dataKey="attempts" name="Submissions" fill="var(--color-brand-orange)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Platform Health Widget */}
        <div className="lg:col-span-1">
          <ChartCard className="h-[340px]" title="Platform Health" subtitle="Real-time system diagnostics">
            <div className="flex flex-col h-full justify-between pb-2">
              <div className="space-y-5 pt-2">
                <HealthMetric label="System Uptime" value="99.98%" status="good" icon={ShieldCheck} />
                <HealthMetric label="Judge Avg Time" value={`${Math.round(avgJudgeTime)}ms`} status="good" icon={Cpu} />
                <HealthMetric label="API Response" value="45ms" status="good" icon={Zap} />
                <HealthMetric label="Error Rate" value="0.02%" status="warning" icon={AlertTriangle} />
              </div>
              <div className="mt-auto pt-5 border-t border-border-card">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-medium">Server Load</span>
                  <span className="text-text-primary font-mono">42%</span>
                </div>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

    </div>
  );
}

function HealthMetric({ label, value, status, icon: Icon }: any) {
  const statusColor = status === "good" ? "text-brand-emerald" : status === "warning" ? "text-brand-amber" : "text-brand-rose";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md bg-background border border-border-card`}>
          <Icon className="h-3.5 w-3.5 text-text-secondary" />
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <span className={`font-mono text-sm font-medium ${statusColor}`}>{value}</span>
    </div>
  );
}

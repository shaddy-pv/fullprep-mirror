import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/admin/Avatar";
import { RoleBadge, StatusBadge, Pill } from "@/components/admin/badges";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { DataTable, type Column } from "@/components/admin/DataTable";
import type { AdminSubmission } from "@/lib/types";

export const Route = createFileRoute("/_admin/users_/$id")({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["users", id],
    queryFn: () => api.getUser(id),
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["users", id, "stats"],
    queryFn: () => api.getUserStats(id),
  });

  const { data: submissions = [], isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ["users", id, "submissions"],
    queryFn: () => api.listSubmissions({ userId: id, limit: 50 }),
  });

  const roleMutation = useMutation({
    mutationFn: (role: string) => api.updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", id] }),
  });

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => api.updateUserStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteUser(id),
    onSuccess: () => navigate({ to: "/users" }),
  });

  if (isUserLoading) {
    return <div className="p-8 text-center text-text-muted">Loading user data...</div>;
  }

  if (userError || !user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary">User not found</h2>
        <p className="text-text-muted mt-2">The user you are looking for does not exist.</p>
        <button
          onClick={() => navigate({ to: "/users" })}
          className="mt-4 text-brand-primary hover:underline"
        >
          Back to Users
        </button>
      </div>
    );
  }

  // Submission Columns
  const columns: Column<AdminSubmission>[] = [
    {
      key: "problem",
      header: "Problem",
      cell: (s) => (
        <Link
          to="/problems/$id"
          params={{ id: s.problemExternalId }}
          className="font-medium text-text-primary hover:text-brand-primary hover:underline"
        >
          {s.problemName || s.problemExternalId}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${s.status === "ACCEPTED" ? "bg-brand-emerald/10 text-brand-emerald" : s.status === "PENDING" ? "bg-brand-amber/10 text-brand-amber" : "bg-brand-rose/10 text-brand-rose"}`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: "language",
      header: "Language",
      cell: (s) => <span className="text-xs text-text-secondary">{s.language}</span>,
    },
    {
      key: "time",
      header: "Submitted",
      cell: (s) => (
        <span className="text-xs text-text-secondary">{formatRelativeTime(s.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <button
          onClick={() => navigate({ to: "/users" })}
          className="hover:text-text-primary flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Users
        </button>
        <span>/</span>
        <span className="text-text-primary font-medium">{user.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Avatar name={user.name} size={64} />
              <div>
                <h1 className="text-xl font-bold text-text-primary">{user.name}</h1>
                <p className="text-sm text-text-muted">{user.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <RoleBadge role={user.role} />
                  <StatusBadge active={user.isActive} />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 pt-6 border-t border-border-card text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Joined</span>
                <span className="text-text-primary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Last Login</span>
                <span className="text-text-primary">
                  {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Email Verified</span>
                <span className="text-text-primary">
                  {user.isEmailVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald inline" />
                  ) : (
                    <XCircle className="h-4 w-4 text-brand-rose inline" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Administrative Controls */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" /> Administrative Controls
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1 block">
                  Change Role
                </label>
                <select
                  value={user.role}
                  onChange={(e) => roleMutation.mutate(e.target.value)}
                  className="w-full bg-background border border-border-card rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary"
                >
                  <option value="user">User</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1 block">
                  Account Status
                </label>
                <button
                  onClick={() => statusMutation.mutate(!user.isActive)}
                  className={`w-full py-2 rounded-lg text-sm font-semibold border transition-colors ${user.isActive ? "bg-brand-amber/10 text-brand-amber border-brand-amber/20 hover:bg-brand-amber/20" : "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 hover:bg-brand-emerald/20"}`}
                >
                  {user.isActive ? "Suspend Account" : "Activate Account"}
                </button>
              </div>

              <div className="pt-3 border-t border-border-card">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you absolutely sure you want to delete this user and ALL their submissions? This cannot be undone.",
                      )
                    ) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="w-full py-2 rounded-lg text-sm font-semibold bg-brand-rose/10 text-brand-rose border border-brand-rose/20 hover:bg-brand-rose/20 transition-colors flex justify-center items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete User Permanently
                </button>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-surface border border-border-card rounded-2xl p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4" /> Security Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">User ID</span>
                <span className="font-mono text-xs text-text-secondary">{user._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Updated At</span>
                <span className="text-text-primary">{formatRelativeTime(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Level" value={`L${stats?.level || 1}`} />
            <StatCard label="XP" value={formatNumber(stats?.xp || 0)} />
            <StatCard label="Streak" value={`🔥 ${stats?.streak || 0}`} />
            <StatCard label="Global Rank" value={`#${formatNumber(stats?.globalRank || 0)}`} />

            <StatCard label="Problems Solved" value={formatNumber(stats?.problemsSolved || 0)} />
            <StatCard
              label="Total Submissions"
              value={formatNumber(stats?.totalSubmissions || 0)}
            />
            <StatCard label="Accepted" value={formatNumber(stats?.acceptedSubmissions || 0)} />
            <StatCard label="Acceptance Rate" value={`${stats?.acceptanceRate || 0}%`} />
          </div>

          {/* Analytics / Charts block (Simplified UI for now) */}
          <div className="bg-surface border border-border-card rounded-2xl p-6">
            <h3 className="font-semibold text-text-primary mb-6">Activity Analytics</h3>
            {isStatsLoading ? (
              <div className="text-text-muted text-sm">Loading analytics...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-3">
                    Language Usage
                  </h4>
                  {stats?.languageBreakdown?.length > 0 ? (
                    <div className="space-y-2">
                      {stats.languageBreakdown.map((l: any) => (
                        <div key={l.language} className="flex items-center justify-between text-sm">
                          <span className="text-text-primary">{l.language}</span>
                          <span className="text-text-muted">{l.count} subs</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-text-muted">No language data</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-3">
                    Difficulty Breakdown
                  </h4>
                  {stats?.difficultyBreakdown?.length > 0 ? (
                    <div className="space-y-2">
                      {stats.difficultyBreakdown.map((d: any) => (
                        <div
                          key={d.difficulty}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-text-primary">{d.difficulty}</span>
                          <span className="text-text-muted">{d.count} solved</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-text-muted">No difficulty data</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="bg-surface border border-border-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border-card">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Activity className="h-4 w-4" /> Recent Submissions
              </h3>
            </div>
            <div className="p-0">
              <DataTable
                data={isSubmissionsLoading ? [] : submissions}
                columns={columns}
                emptyMessage="No recent submissions found for this user."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border-card rounded-xl p-4 flex flex-col justify-center items-center text-center">
      <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">
        {label}
      </span>
      <span className="text-xl font-bold text-text-primary">{value}</span>
    </div>
  );
}

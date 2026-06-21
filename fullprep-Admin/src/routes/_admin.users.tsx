import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, XCircle, Download, UserPlus, X } from "lucide-react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Avatar } from "@/components/admin/Avatar";
import { Pill, RoleBadge, StatusBadge } from "@/components/admin/badges";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { AdminUser } from "@/lib/types";

export const Route = createFileRoute("/_admin/users")({
  head: () => ({ meta: [{ title: "Users — FullPrep Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: api.listUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = data.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (status === "active" && !u.isActive) return false;
    if (status === "inactive" && u.isActive) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!u.name.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} />
          <div className="min-w-0">
            <Link
              to="/users/$id"
              params={{ id: u._id }}
              className="block truncate text-sm font-medium text-text-primary hover:text-brand-primary"
            >
              {u.name}
            </Link>
            <p className="truncate text-[11px] text-text-muted">{u.email}</p>
          </div>
        </div>
      ),
      sortValue: (u) => u.name,
    },
    {
      key: "role",
      header: "Role",
      cell: (u) => (
        <div className="flex items-center gap-2">
          <RoleBadge role={u.role} />
          <select 
            value={u.role}
            onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
            className="text-[10px] bg-surface border border-border-card rounded px-1 py-0.5 outline-none cursor-pointer hover:border-brand-primary transition-colors"
          >
            <option value="user">Make User</option>
            <option value="mentor">Make Mentor</option>
            <option value="admin">Make Admin</option>
          </select>
        </div>
      ),
      sortValue: (u) => u.role,
    },
    {
      key: "level",
      header: "Level",
      cell: (u) => <span className="font-medium">L{u.level}</span>,
      sortValue: (u) => u.level,
      align: "right",
    },
    {
      key: "xp",
      header: "XP",
      cell: (u) => formatNumber(u.xp),
      sortValue: (u) => u.xp,
      align: "right",
    },
    {
      key: "streak",
      header: "Streak",
      cell: (u) => <span>🔥 {u.streak}</span>,
      sortValue: (u) => u.streak,
      align: "right",
    },
    {
      key: "email",
      header: "Email",
      cell: (u) =>
        u.isEmailVerified ? (
          <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
        ) : (
          <XCircle className="h-4 w-4 text-brand-rose" />
        ),
      align: "center",
    },
    { key: "status", header: "Status", cell: (u) => <StatusBadge active={u.isActive} /> },
    {
      key: "joined",
      header: "Joined",
      cell: (u) => <span className="text-text-secondary">{formatRelativeTime(u.createdAt)}</span>,
      sortValue: (u) => new Date(u.createdAt),
    },
    {
      key: "lastLogin",
      header: "Last login",
      cell: (u) => <span className="text-text-secondary">{u.lastLoginAt ? formatRelativeTime(u.lastLoginAt) : "Never"}</span>,
      sortValue: (u) => u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Users</h1>
          <p className="text-sm text-text-muted">
            {formatNumber(filtered.length)} of {formatNumber(data.length)} users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
          >
            <UserPlus className="h-4 w-4" /> Create Admin
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border-card bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <DataTable
        data={isLoading ? [] : filtered}
        columns={columns}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search users by name or email…"
        emptyMessage={isLoading ? "Loading users…" : "No users match these filters."}
        toolbar={
          <>
            <FilterSelect
              value={role}
              onChange={setRole}
              options={[
                { value: "all", label: "All roles" },
                { value: "user", label: "User" },
                { value: "mentor", label: "Mentor" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Any status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Deactivated" },
              ]}
            />
            <Pill tone="neutral">{filtered.length} matches</Pill>
          </>
        }
      />

      {showCreateModal && <CreateAdminModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border-card bg-background/50 px-2.5 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createMutation = useMutation({
    mutationFn: api.createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err: any) => {
      alert("Failed to create admin: " + (err.response?.data?.message || err.message));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email, password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border-card bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-text-primary">Create Admin User</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:bg-background/50">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Full Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm focus:border-brand-primary outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm focus:border-brand-primary outline-none" placeholder="john@fullprep.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Initial Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-border-card bg-background/60 px-3 py-2.5 text-sm focus:border-brand-primary outline-none" placeholder="••••••••" />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border-card mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-background/50 border border-border-card">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground bg-brand-primary hover:brightness-110 disabled:opacity-50">
              {createMutation.isPending ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

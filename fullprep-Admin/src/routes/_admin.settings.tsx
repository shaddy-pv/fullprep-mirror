import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, IS_MOCK } from "@/lib/api";
import { useAuth } from "@/store/admin";
import { Avatar } from "@/components/admin/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  UserCircle,
  Settings2,
  Cpu,
  Users,
  ShieldCheck,
  Link2,
  Activity,
  DatabaseBackup,
  ScrollText,
  AlertTriangle,
  Save,
  CheckCircle2,
  RefreshCcw,
  Server,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({ meta: [{ title: "Settings — FullPrep Admin" }] }),
  component: SettingsPage,
});

const TABS = [
  { id: "general", label: "General", icon: UserCircle },
  { id: "platform", label: "Platform", icon: Settings2 },
  { id: "judge", label: "Judge Config", icon: Cpu },
  { id: "users", label: "User Policies", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "backups", label: "Backups", icon: DatabaseBackup },
  { id: "logs", label: "Audit Logs", icon: ScrollText },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, isDanger: true },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();
  const user = useAuth((s) => s.user);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: api.getSystemSettings,
  });

  const [formData, setFormData] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setHasChanges(false);
      toast.success("Settings saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save settings");
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (activeTab === "general") {
      profileMutation.mutate({ name: formData.adminName, bio: formData.adminBio });
    } else {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-text-muted animate-pulse">Loading Configuration...</div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Administration Center
        </h1>
        <p className="text-sm text-text-muted">
          Manage global platform settings, judge configurations, and security.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border-card bg-surface shadow-sm">
        {/* Sidebar */}
        <div className="w-64 border-r border-border-card bg-background/50 flex flex-col p-4 overflow-y-auto">
          <div className="space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? tab.isDanger
                        ? "bg-destructive/10 text-destructive"
                        : "bg-brand-primary/10 text-brand-primary"
                      : tab.isDanger
                        ? "text-destructive hover:bg-destructive/5"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  }`}
                >
                  <tab.icon
                    className={`h-4 w-4 ${isActive && !tab.isDanger ? "text-brand-primary" : ""}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface relative">
          <div className="flex-1 overflow-y-auto p-8 pb-32">
            <div className="max-w-2xl">
              {activeTab === "general" && (
                <GeneralTab user={user} formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "platform" && (
                <PlatformTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "judge" && (
                <JudgeTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "users" && (
                <UsersTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "security" && (
                <SecurityTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "integrations" && (
                <IntegrationsTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "monitoring" && <MonitoringTab />}
              {activeTab === "backups" && (
                <BackupsTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === "logs" && <LogsTab />}
              {activeTab === "danger" && <DangerTab />}
            </div>
          </div>

          {/* Floating Save Action */}
          <AnimatePresence>
            {hasChanges &&
              activeTab !== "danger" &&
              activeTab !== "monitoring" &&
              activeTab !== "logs" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background border border-border-card p-4 rounded-2xl shadow-xl z-10"
                >
                  <div className="text-sm text-text-secondary">You have unsaved changes.</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(settings);
                        setHasChanges(false);
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-surface-hover text-text-secondary"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending || profileMutation.isPending}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-primary-foreground hover:brightness-110 flex items-center gap-2"
                    >
                      {updateMutation.isPending || profileMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────

function GeneralTab({ user, formData, handleChange }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Admin Profile</h2>
        <p className="text-sm text-text-muted mt-1">Manage your personal admin account settings.</p>
      </div>

      <div className="flex items-center gap-6 pb-6 border-b border-border-card">
        <Avatar name={user?.name || "Admin"} size={80} />
        <div>
          <button className="px-4 py-2 bg-background border border-border-card rounded-lg text-sm hover:bg-surface font-medium">
            Upload New Photo
          </button>
          <p className="text-xs text-text-muted mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.adminName ?? user?.name}
          onChange={(v: any) => handleChange("adminName", v)}
        />
        <Input label="Email Address" value={user?.email} disabled />
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={formData.adminBio ?? user?.bio}
            onChange={(e) => handleChange("adminBio", e.target.value)}
            className="w-full rounded-lg border border-border-card bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function PlatformTab({ formData, handleChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Platform Configuration</h2>
        <p className="text-sm text-text-muted mt-1">
          Core settings that define how the platform operates.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Platform Name"
          value={formData.platformName}
          onChange={(v: any) => handleChange("platformName", v)}
        />
        <Input
          label="Platform Description"
          value={formData.platformDescription}
          onChange={(v: any) => handleChange("platformDescription", v)}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-border-card">
        <h3 className="text-sm font-semibold text-text-primary">Global Toggles</h3>
        <Toggle
          label="Maintenance Mode"
          desc="Blocks all non-admin users from accessing the platform."
          checked={formData.maintenanceMode}
          onChange={(v: any) => handleChange("maintenanceMode", v)}
        />
        <Toggle
          label="Enable Registration"
          desc="Allow new users to sign up."
          checked={formData.registrationEnabled}
          onChange={(v: any) => handleChange("registrationEnabled", v)}
        />
        <Toggle
          label="Require Email Verification"
          desc="Force users to verify their email before using the platform."
          checked={formData.emailVerificationRequired}
          onChange={(v: any) => handleChange("emailVerificationRequired", v)}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-border-card">
        <h3 className="text-sm font-semibold text-text-primary">Gamification</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="XP Per Problem"
            type="number"
            value={formData.xpPerProblem}
            onChange={(v: any) => handleChange("xpPerProblem", Number(v))}
          />
          <Input
            label="Streak Bonus XP"
            type="number"
            value={formData.streakBonus}
            onChange={(v: any) => handleChange("streakBonus", Number(v))}
          />
        </div>
      </div>
    </div>
  );
}

function JudgeTab({ formData, handleChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Judge Configuration</h2>
        <p className="text-sm text-text-muted mt-1">
          Execution limits and sandbox settings for code submissions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Input
          label="Default Time Limit (ms)"
          type="number"
          value={formData.executionTimeoutMs}
          onChange={(v: any) => handleChange("executionTimeoutMs", Number(v))}
        />
        <Input
          label="Default Memory Limit (MB)"
          type="number"
          value={formData.memoryLimitMb}
          onChange={(v: any) => handleChange("memoryLimitMb", Number(v))}
        />
        <Input
          label="Max Queue Size"
          type="number"
          value={formData.queueLimit}
          onChange={(v: any) => handleChange("queueLimit", Number(v))}
        />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Output Comparison Mode
          </label>
          <select
            value={formData.outputComparison}
            onChange={(e) => handleChange("outputComparison", e.target.value)}
            className="w-full rounded-lg border border-border-card bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-primary outline-none"
          >
            <option value="strict">Strict (Exact Match)</option>
            <option value="ignore_trailing_space">Ignore Trailing Whitespace</option>
            <option value="float_tolerance">Float Tolerance (1e-6)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border-card">
        <Toggle
          label="Enable Sandbox"
          desc="Run submissions in an isolated Docker container."
          checked={formData.sandboxEnabled}
          onChange={(v: any) => handleChange("sandboxEnabled", v)}
        />
        <Toggle
          label="Allow Rejudging"
          desc="Allow admins to re-queue completed submissions."
          checked={formData.rejudgeEnabled}
          onChange={(v: any) => handleChange("rejudgeEnabled", v)}
        />
      </div>
    </div>
  );
}

function UsersTab({ formData, handleChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">User Management Policies</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Username Regex Validator"
          value={formData.usernameRegex}
          onChange={(v: any) => handleChange("usernameRegex", v)}
        />
        <Input
          label="Minimum Password Length"
          type="number"
          value={formData.passwordMinLength}
          onChange={(v: any) => handleChange("passwordMinLength", Number(v))}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-border-card">
        <Toggle
          label="Enable User Suspension"
          desc="Allow moderators to suspend user accounts temporarily."
          checked={formData.suspensionEnabled}
          onChange={(v: any) => handleChange("suspensionEnabled", v)}
        />
        <Toggle
          label="Enable Account Deletion"
          desc="Allow users to permanently delete their own accounts."
          checked={formData.deletionEnabled}
          onChange={(v: any) => handleChange("deletionEnabled", v)}
        />
      </div>
    </div>
  );
}

function SecurityTab({ formData, handleChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Security Center</h2>
        <p className="text-sm text-text-muted mt-1">Rate limits and session security.</p>
      </div>

      <div className="space-y-4">
        <Toggle
          label="Enable Global Rate Limiting"
          desc="Protect APIs from DDoS attacks."
          checked={formData.rateLimitingEnabled}
          onChange={(v: any) => handleChange("rateLimitingEnabled", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Max Requests Per Minute"
          type="number"
          value={formData.maxRequestsPerMinute}
          onChange={(v: any) => handleChange("maxRequestsPerMinute", Number(v))}
          disabled={!formData.rateLimitingEnabled}
        />
        <Input
          label="Failed Login Lockout (Mins)"
          type="number"
          value={formData.failedLoginLockout}
          onChange={(v: any) => handleChange("failedLoginLockout", Number(v))}
        />
      </div>

      <div className="pt-4 border-t border-border-card">
        <h3 className="text-sm font-medium text-text-primary mb-4">Active Admin Sessions</h3>
        <div className="bg-background border border-border-card rounded-lg p-4 text-sm text-text-secondary flex justify-between items-center">
          <div>
            <div className="font-medium text-text-primary">Current Session (Windows, Chrome)</div>
            <div className="text-xs mt-0.5">IP: 192.168.1.100</div>
          </div>
          <span className="text-brand-emerald text-xs font-medium bg-brand-emerald/10 px-2 py-1 rounded">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}

function IntegrationsTab({ formData, handleChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">API & Integrations</h2>
        <p className="text-sm text-text-muted mt-1">Configure connections to external services.</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Backend URL"
          value={formData.backendUrl}
          onChange={(v: any) => handleChange("backendUrl", v)}
        />
        <Input
          label="Judge0 Endpoint"
          value={formData.judge0Endpoint}
          onChange={(v: any) => handleChange("judge0Endpoint", v)}
        />
        <Input
          label="Codnite API Endpoint"
          value={formData.codniteEndpoint}
          onChange={(v: any) => handleChange("codniteEndpoint", v)}
        />
        <Input
          label="SMTP Host (Emails)"
          value={formData.smtpHost}
          onChange={(v: any) => handleChange("smtpHost", v)}
        />
        <Input
          label="Global Webhook URL"
          value={formData.webhookUrl}
          onChange={(v: any) => handleChange("webhookUrl", v)}
          placeholder="https://"
        />
      </div>
    </div>
  );
}

function MonitoringTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">System Monitoring</h2>
        <p className="text-sm text-text-muted mt-1">
          Real-time server health and infrastructure status.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-border-card bg-background rounded-xl">
          <div className="text-xs text-text-muted mb-1">CPU Usage</div>
          <div className="text-2xl font-mono text-text-primary">14.2%</div>
        </div>
        <div className="p-4 border border-border-card bg-background rounded-xl">
          <div className="text-xs text-text-muted mb-1">Memory Usage</div>
          <div className="text-2xl font-mono text-text-primary">2.4 GB</div>
        </div>
        <div className="p-4 border border-border-card bg-background rounded-xl">
          <div className="text-xs text-text-muted mb-1">Database Connections</div>
          <div className="text-2xl font-mono text-text-primary">8 / 100</div>
        </div>
        <div className="p-4 border border-border-card bg-background rounded-xl">
          <div className="text-xs text-text-muted mb-1">Judge Queue Status</div>
          <div className="text-2xl font-mono text-brand-emerald">Healthy</div>
        </div>
      </div>
    </div>
  );
}

function BackupsTab({ formData, handleChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Backup & Recovery</h2>
        <p className="text-sm text-text-muted mt-1">
          Manage automated and manual database backups.
        </p>
      </div>

      <div className="space-y-4">
        <Toggle
          label="Enable Automated Backups"
          desc="Periodically back up the entire MongoDB database."
          checked={formData.autoBackupEnabled}
          onChange={(v: any) => handleChange("autoBackupEnabled", v)}
        />
        <Input
          label="Backup Schedule (Cron)"
          value={formData.backupSchedule}
          onChange={(v: any) => handleChange("backupSchedule", v)}
          disabled={!formData.autoBackupEnabled}
        />
      </div>

      <div className="pt-6 border-t border-border-card">
        <button className="px-4 py-2 bg-background border border-border-card hover:bg-surface-hover rounded-lg text-sm font-medium flex items-center gap-2">
          <DatabaseBackup className="h-4 w-4" /> Trigger Manual Backup
        </button>
        <div className="mt-4 text-sm text-text-secondary">No recent backups found in storage.</div>
      </div>
    </div>
  );
}

function LogsTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Audit Logs</h2>
        <p className="text-sm text-text-muted mt-1">
          Chronological record of system events and admin actions.
        </p>
      </div>

      <div className="border border-border-card rounded-xl overflow-hidden bg-background flex flex-col items-center justify-center py-12 text-text-muted">
        <ScrollText className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm">Audit logging system is currently initializing.</p>
      </div>
    </div>
  );
}

function DangerTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-text-muted mt-1">Irreversible destructive actions.</p>
      </div>

      <div className="border border-destructive/30 bg-destructive/5 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-text-primary">Clear Problem Cache</h4>
            <p className="text-xs text-text-muted mt-1">
              Forces a complete refresh on the next Codnite sync.
            </p>
          </div>
          <button className="px-4 py-2 bg-background border border-border-card rounded-lg text-sm font-medium hover:bg-surface-hover">
            Clear Cache
          </button>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border-card/50">
          <div>
            <h4 className="text-sm font-medium text-text-primary">Clear All Submission Data</h4>
            <p className="text-xs text-text-muted mt-1">
              Deletes all user code, verdicts, and execution logs.
            </p>
          </div>
          <button className="px-4 py-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20">
            Delete Submissions
          </button>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border-card/50">
          <div>
            <h4 className="text-sm font-medium text-text-primary">Full Database Reset</h4>
            <p className="text-xs text-text-muted mt-1">
              Wipes all data including users, problems, and settings.
            </p>
          </div>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:brightness-110">
            Factory Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared UI Components ───────────────────────────────────────────────

function Input({ label, type = "text", value, onChange, placeholder, disabled }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-border-card bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-primary outline-none disabled:opacity-50"
      />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 border border-border-card rounded-xl bg-background">
      <div>
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? "bg-brand-primary" : "bg-surface-hover"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

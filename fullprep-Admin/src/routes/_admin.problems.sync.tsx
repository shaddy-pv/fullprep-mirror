import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, RefreshCcw, Server, Clock, Database, AlertCircle, PlayCircle, Settings2, History } from "lucide-react";
import { api } from "@/lib/api";
import { formatNumber, formatRelativeTime } from "@/lib/format";

export const Route = createFileRoute("/_admin/problems/sync")({
  head: () => ({ meta: [{ title: "Sync Tool — FullPrep Admin" }] }),
  component: SyncPage,
});

function SyncPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"ALL" | "STALE" | "MISSING">("ALL");

  const { data: problems = [] } = useQuery({ queryKey: ["problems"], queryFn: api.listProblems });
  const { data: history = [] } = useQuery({ queryKey: ["syncHistory"], queryFn: api.getSyncHistory });
  const { data: activeJob } = useQuery({
    queryKey: ["syncStatus"],
    queryFn: api.getSyncStatus,
    refetchInterval: (query) => (query.state.data?.status === "RUNNING" ? 1000 : false),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.syncProblems(mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syncStatus"] });
    },
  });

  const staleCount = problems.filter((p) => !p.lastSyncedAt || Date.now() - new Date(p.lastSyncedAt).getTime() > 24 * 3600_000).length;
  const missingCount = 282 - problems.length; // Max known from Codnite
  const lastSynced = problems.filter((p) => p.lastSyncedAt).sort((a, b) => +new Date(b.lastSyncedAt!) - +new Date(a.lastSyncedAt!))[0];

  const isRunning = activeJob?.status === "RUNNING";
  const progress = isRunning && activeJob?.totalToSync > 0 
    ? Math.round(((activeJob.syncedCount + activeJob.skippedCount + activeJob.failedCount) / activeJob.totalToSync) * 100) 
    : 0;

  // Auto-scroll logs
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeJob?.logs]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Sync Engine</h1>
        <p className="text-sm text-text-muted">Manage background synchronization with the upstream Codnite problem catalog.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatBox icon={Database} label="Problems in DB" value={formatNumber(problems.length)} />
        <StatBox icon={AlertCircle} label="Missing Problems" value={formatNumber(Math.max(0, missingCount))} tone={missingCount > 0 ? "rose" : "primary"} />
        <StatBox icon={Server} label="Stale (>24h)" value={formatNumber(staleCount)} tone={staleCount > 0 ? "amber" : "primary"} />
        <StatBox icon={Clock} label="Last Synced" value={lastSynced?.lastSyncedAt ? formatRelativeTime(lastSynced.lastSyncedAt) : "never"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sync Controls & Active Job */}
        <div className="rounded-2xl border border-border-card bg-surface p-6 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-brand-primary" /> Active Sync Job
            </h3>
            
            <div className="flex items-center gap-3">
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value as any)}
                disabled={isRunning}
                className="bg-background border border-border-card text-text-secondary text-sm rounded-lg px-3 py-2 outline-none focus:border-brand-primary disabled:opacity-50"
              >
                <option value="ALL">Sync All</option>
                <option value="STALE">Sync Stale Only</option>
                <option value="MISSING">Sync Missing Only</option>
              </select>
              
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => syncMutation.mutate()}
                disabled={isRunning || syncMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? "Syncing…" : "Start Job"}
              </motion.button>
            </div>
          </div>

          {activeJob ? (
            <div className="flex-1 flex flex-col min-h-0 bg-background border border-border-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border-card bg-surface/50 grid grid-cols-4 gap-4 text-center">
                <div><div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Status</div><div className={`text-sm font-semibold ${activeJob.status === 'RUNNING' ? 'text-brand-primary' : activeJob.status === 'FAILED' ? 'text-brand-rose' : 'text-brand-emerald'}`}>{activeJob.status}</div></div>
                <div><div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Total</div><div className="text-sm font-medium text-text-primary">{activeJob.totalToSync}</div></div>
                <div><div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Synced</div><div className="text-sm font-medium text-brand-emerald">{activeJob.syncedCount}</div></div>
                <div><div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Skipped</div><div className="text-sm font-medium text-text-secondary">{activeJob.skippedCount}</div></div>
              </div>
              
              {isRunning && (
                <div className="px-4 pt-4">
                  <div className="flex justify-between text-xs text-text-muted mb-1.5">
                    <span>Processing {mode} mode...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <motion.div className="h-full bg-brand-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              )}

              <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-text-secondary space-y-1.5">
                {activeJob.logs?.map((l: string, i: number) => {
                  const isErr = l.includes("[Error]") || l.includes("[Fatal]");
                  const isSys = l.includes("[System]");
                  return (
                    <div key={i} className={isErr ? "text-brand-rose" : isSys ? "text-brand-primary" : ""}>
                      <span className="opacity-40 mr-2">{new Date(activeJob.updatedAt).toLocaleTimeString()}</span>
                      {l}
                    </div>
                  );
                })}
                {activeJob.logs?.length === 0 && <div className="text-text-muted italic">Waiting for logs...</div>}
                <div ref={logsEndRef} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted border border-dashed border-border-card rounded-xl bg-background/50">
              <Settings2 className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm">No active job.</p>
              <p className="text-xs mt-1">Select a mode and start a new sync.</p>
            </div>
          )}
        </div>

        {/* Sync History */}
        <div className="rounded-2xl border border-border-card bg-surface p-6 flex flex-col h-[500px]">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-text-secondary" /> Sync History
          </h3>
          <div className="flex-1 overflow-y-auto min-h-0 pr-2">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((job: any) => (
                  <div key={job._id} className="p-3.5 rounded-xl border border-border-card bg-background flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {job.status === "COMPLETED" ? <CheckCircle2 className="h-4 w-4 text-brand-emerald" /> : job.status === "FAILED" ? <AlertCircle className="h-4 w-4 text-brand-rose" /> : <RefreshCcw className="h-4 w-4 text-brand-primary animate-spin" />}
                        <span className="text-sm font-medium text-text-primary">{job.mode} Sync</span>
                      </div>
                      <span className="text-xs text-text-muted">{formatRelativeTime(job.createdAt)}</span>
                    </div>
                    <div className="grid grid-cols-4 text-xs text-center border-t border-border-card pt-2 mt-1">
                      <div><span className="text-text-muted block mb-0.5">Duration</span><span className="text-text-primary">{job.durationMs ? `${(job.durationMs / 1000).toFixed(1)}s` : "-"}</span></div>
                      <div><span className="text-text-muted block mb-0.5">Synced</span><span className="text-brand-emerald">{job.syncedCount}</span></div>
                      <div><span className="text-text-muted block mb-0.5">Skipped</span><span className="text-text-secondary">{job.skippedCount}</span></div>
                      <div><span className="text-text-muted block mb-0.5">Failed</span><span className={job.failedCount > 0 ? "text-brand-rose" : "text-text-secondary"}>{job.failedCount}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">No sync history available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, tone = "primary" }: any) {
  const tones = {
    primary: "text-brand-primary",
    amber: "text-brand-amber",
    rose: "text-brand-rose",
  };
  return (
    <div className="rounded-2xl border border-border-card bg-surface p-5">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Icon className={`h-3.5 w-3.5 ${(tones as any)[tone]}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

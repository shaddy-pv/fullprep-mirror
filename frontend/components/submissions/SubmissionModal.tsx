import React, { useState, useEffect } from "react";
import { X, Copy, Check, Clock, Cpu, Calendar } from "lucide-react";
import { SubmissionsService } from "@/services/submissions.service";
import Badge from "@/components/ui/Badge";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { cn } from "@/lib/utils";

interface SubmissionModalProps {
  submissionId: string | null;
  onClose: () => void;
}

export default function SubmissionModal({ submissionId, onClose }: SubmissionModalProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    
    async function fetchSubmission() {
      setLoading(true);
      try {
        const res = await SubmissionsService.getSubmissionById(submissionId!);
        if (res.success) {
          setSubmission(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch submission details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [submissionId]);

  if (!submissionId) return null;

  const handleCopy = () => {
    if (submission?.code) {
      navigator.clipboard.writeText(submission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusColor = 
    submission?.status === "ACCEPTED" ? "text-[#10b981]" : 
    submission?.status === "WRONG_ANSWER" ? "text-[#f43f5e]" : 
    submission?.status === "TIME_LIMIT" ? "text-brand-orange" : 
    submission?.status === "COMPILE_ERROR" ? "text-[#9ca3af]" : 
    "text-[#8b5cf6]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card-bg w-full max-w-4xl max-h-[90vh] rounded-[24px] border border-border-card shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-card bg-[#fcfcfa] dark:bg-[#11131c]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-text-primary tracking-[-0.01em]">
              Submission Details
            </h2>
            {submission && (
              <Badge variant="default" className={cn("px-2.5 py-1 text-[11px] font-bold border border-border-card bg-card-bg", statusColor)}>
                {submission.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {loading ? (
            <div className="w-full h-40 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-border-card border-t-brand-orange animate-spin" />
            </div>
          ) : !submission ? (
            <div className="text-center text-text-secondary py-10">Failed to load submission.</div>
          ) : (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#fcfcfa] dark:bg-[#11131c] border border-border-card rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Problem</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[14px] font-bold text-text-primary truncate">{submission.problemName}</span>
                    {submission.problem?.difficulty && (
                      <DifficultyBadge difficulty={submission.problem.difficulty} />
                    )}
                  </div>
                </div>

                <div className="bg-[#fcfcfa] dark:bg-[#11131c] border border-border-card rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Submitted At</span>
                  <div className="flex items-center gap-1.5 mt-1 text-text-primary font-semibold text-[13px]">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    <span>{new Date(submission.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-[#fcfcfa] dark:bg-[#11131c] border border-border-card rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Runtime</span>
                  <div className="flex items-center gap-1.5 mt-1 text-text-primary font-semibold text-[13px]">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span>{submission.executionTimeMs ?? "--"} ms</span>
                  </div>
                </div>

                <div className="bg-[#fcfcfa] dark:bg-[#11131c] border border-border-card rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Memory</span>
                  <div className="flex items-center gap-1.5 mt-1 text-text-primary font-semibold text-[13px]">
                    <Cpu className="w-4 h-4 text-text-secondary" />
                    <span>{submission.memoryUsedMb ?? "--"} MB</span>
                  </div>
                </div>
              </div>

              {/* Error Message if any */}
              {submission.errorMessage && (
                <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-xl p-4">
                  <h3 className="text-[13px] font-bold text-[#f43f5e] mb-2">Error Details</h3>
                  <pre className="text-[12px] font-mono text-[#f43f5e]/80 whitespace-pre-wrap overflow-x-auto">
                    {submission.errorMessage}
                  </pre>
                </div>
              )}

              {/* Code Section */}
              <div className="flex-1 flex flex-col min-h-[300px] border border-border-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#fcfcfa] dark:bg-[#11131c] border-b border-border-card">
                  <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                    {submission.language} Code
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="flex-1 bg-[#1e1e1e] p-4 overflow-auto">
                  <pre className="text-[13px] font-mono text-gray-300">
                    <code>{submission.code}</code>
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Circle, Lock } from "lucide-react";
import Link from "next/link";

import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { LearningPathsService } from "@/services/learning-paths.service";
import { LearningPath } from "@/types/learning";
import * as Icons from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LearningPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await LearningPathsService.getPathById(id);
        if (res.success) {
          setPath(res.data);
        } else {
          router.push("/learning-paths");
        }
      } catch (err) {
        console.error("Error fetching path:", err);
        router.push("/learning-paths");
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [id, router]);

  const handleEnroll = async () => {
    if (!path || path.isEnrolled) return;
    setEnrolling(true);
    try {
      const res = await LearningPathsService.enroll(id);
      if (res.success) {
        setPath({ ...path, isEnrolled: true });
      }
    } catch (err) {
      console.error("Error enrolling:", err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <ContentContainer>
        <div className="py-20 text-center"><span className="text-text-secondary">Loading learning path details...</span></div>
      </ContentContainer>
    );
  }

  if (!path) return null;

  const IconComponent = (typeof path.icon === "string" ? (Icons as any)[path.icon] : path.icon) || Icons.BookOpen;

  return (
    <ContentContainer>
      <button 
        onClick={() => router.push("/learning-paths")}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Learning Paths
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-10 items-start">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner"
          style={{ backgroundColor: path.color }}
        >
          <IconComponent className="w-8 h-8 stroke-[2]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text-primary">{path.title}</h1>
            {path.isPro && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[11px] font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" /> PRO
              </span>
            )}
          </div>
          <p className="text-text-secondary text-[15px] mb-4 max-w-3xl">{path.description}</p>
          
          <div className="flex items-center gap-4 text-[13px] font-medium text-text-secondary">
            <span>{path.problemsCount} Problems</span>
            <span>•</span>
            <span>{path.topicsCount} Topics</span>
            <span>•</span>
            <span>{path.estimatedTime}</span>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {path.isEnrolled ? (
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-[14px] font-bold text-text-primary">Your Progress</span>
              <div className="flex items-center gap-3 w-full md:w-48">
                <div className="flex-1 h-[6px] bg-[#f1f0ec] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${path.progress}%`, backgroundColor: path.color }}
                  />
                </div>
                <span className="text-[13px] font-bold" style={{ color: path.color }}>{path.progress}%</span>
              </div>
            </div>
          ) : (
            <Button onClick={handleEnroll} disabled={enrolling} className="w-full md:w-auto">
              {enrolling ? "Enrolling..." : "Start Learning Path"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {path.contentType === "notes" ? (
          <div className="bg-card-bg border border-border-card rounded-2xl overflow-hidden shadow-sm p-8 lg:p-10">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-primary prose-img:rounded-xl">
              <ReactMarkdown>{path.content || "This learning path is currently empty."}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-4">Roadmap</h2>
            
            {path.modules?.map((module, mIdx) => (
              <div key={mIdx} className="bg-card-bg border border-border-card rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border-card bg-gray-50/50 dark:bg-white/[0.01]">
                  <h3 className="text-[16px] font-bold text-text-primary mb-1">
                    Module {mIdx + 1}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-[13px] text-text-secondary">{module.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col divide-y divide-border-card">
                  {module.problems.map((prob, pIdx) => (
                    <Link 
                      key={prob.externalId} 
                      href={`/problems/${prob.externalId}`}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary/50 font-bold text-[13px] w-6">
                          {mIdx + 1}.{pIdx + 1}
                        </span>
                        {prob.status === "SOLVED" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-secondary/40 group-hover:text-text-secondary/70 transition-colors" />
                        )}
                        <span className={`font-semibold text-[14px] ${prob.status === "SOLVED" ? "text-text-primary" : "text-text-primary/90"}`}>
                          {prob.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-md
                          ${prob.difficulty === "EASY" ? "bg-emerald-500/10 text-emerald-500" : 
                            prob.difficulty === "MEDIUM" ? "bg-amber-500/10 text-amber-500" : 
                            "bg-red-500/10 text-red-500"}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  {module.problems.length === 0 && (
                    <div className="p-6 text-center text-text-secondary text-[13px]">
                      No problems in this module yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(!path.modules || path.modules.length === 0) && (
              <div className="py-10 text-center text-text-secondary text-[14px]">
                This learning path is currently empty.
              </div>
            )}
          </>
        )}
      </div>
    </ContentContainer>
  );
}

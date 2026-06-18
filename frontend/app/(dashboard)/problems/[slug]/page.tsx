"use client";

import React, { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  CheckCircle2, 
  Circle,
  Save,
  Clock,
  RotateCw,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { ProblemsService } from "@/services/problems.service";
import { BookmarksService } from "@/services/bookmarks.service";
import { SubmissionsService, type RunTestResult } from "@/services/submissions.service";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { getStarterCode, getApiLanguage } from "@/lib/starterCode";

// Zustand stores
import { useEditorStore } from "@/store/editorStore";
import { useNotificationStore } from "@/store/notificationStore";

// Child components
import ProblemDescription from "@/components/editor/ProblemDescription";
import EditorToolbar from "@/components/editor/EditorToolbar";
import MonacoEditor from "@/components/editor/MonacoEditor";
import EditorSettings from "@/components/editor/EditorSettings";
import OutputConsole from "@/components/editor/OutputConsole";

export default function ProblemWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  // Dynamic slug unpacking for Next.js App Router compliance
  const { slug } = use(params);
  const { theme } = useTheme();
  const router = useRouter();

  const [problem, setProblem] = useState<any>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  // Zustand stores bindings
  const editorStore = useEditorStore();
  const { toast, showToast } = useNotificationStore();
  const { user, setUser } = useAuthStore();

  // Page layout states (strictly for split panel resizing)
  const [leftWidth, setLeftWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Bookmarks & Star state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Sync page isBookmarked with authStore user bookmarks
  useEffect(() => {
    if (user) {
      setIsBookmarked(user.bookmarks?.includes(slug) || false);
    }
  }, [user, slug]);

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast("Please log in to bookmark problems.", "info");
      return;
    }
    try {
      const response = await BookmarksService.toggleBookmark(slug);
      if (response && response.success) {
        setIsBookmarked(response.isBookmarked);
        setUser({
          ...user,
          bookmarks: response.bookmarks
        });
        showToast(response.isBookmarked ? "Problem bookmarked!" : "Bookmark removed.", "success");
      }
    } catch (err) {
      showToast("Failed to toggle bookmark.", "info");
    }
  };
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Monaco local code buffer
  const [code, setCode] = useState("");

  // Console select case state
  const [selectedTestCase, setSelectedTestCase] = useState(1);
  const [testResultState, setTestResultState] = useState<"none" | "running" | "accepted" | "wrong_answer" | "compile_error" | "runtime_error">("none");
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  // Run mode state — results from the Run button (public tests)
  const [runResults, setRunResults] = useState<RunTestResult[] | null>(null);
  const [isRunMode, setIsRunMode] = useState(false);

  useEffect(() => {
    ProblemsService.getProblemBySlug(slug).then((data) => {
      if (data) {
        setProblem(data);
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        
        // Fetch user's latest submission for this problem
        SubmissionsService.getSubmissions(1, 1, undefined, data.slug).then(async (subRes) => {
          if (subRes?.data && subRes.data.length > 0) {
            const latestSub = subRes.data[0];
            const fullSub = await SubmissionsService.getSubmissionById(latestSub._id);
            if (fullSub?.data) {
              const details = fullSub.data;
              
              // Load the latest submission status into the console
              setSubmissionDetails(details);
              if (details.status === "ACCEPTED") {
                setTestResultState("accepted");
                editorStore.setActiveTab("result");
              } else if (details.status === "WRONG_ANSWER") {
                setTestResultState("wrong_answer");
                editorStore.setActiveTab("result");
              } else if (details.status === "COMPILE_ERROR") {
                setTestResultState("compile_error");
                editorStore.setActiveTab("result");
              } else if (details.status === "RUNTIME_ERROR") {
                setTestResultState("runtime_error");
                editorStore.setActiveTab("result");
              }
              
              // Set the code from the previous submission
              if (details.code) {
                setCode(details.code);
                // Also save to localStorage to override the empty template
                if (typeof window !== "undefined") {
                  const langMap: Record<string, string> = { "JAVASCRIPT": "javascript", "PYTHON3": "python", "JAVA": "java", "CPP17": "cpp", "CPP20": "cpp", "CPP": "cpp" };
                  const langToSave = details.language ? (langMap[details.language] || "cpp") : "cpp";
                  localStorage.setItem(`fullprep_code_${data.slug}_${langToSave}`, details.code);
                }
              }
            }
          }
        });
      }
      setLoadingProblem(false);
    });
  }, [slug]);

  // Modal display toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: localStorage key for code saves
  const getCodeStorageKey = useCallback((s: string, lang: string) => `fullprep_code_${s}_${lang}`, []);
  const getHistoryStorageKey = useCallback((s: string, lang: string) => `fullprep_history_${s}_${lang}`, []);

  // Load saved code history entries
  const loadHistory = useCallback((): { code: string; timestamp: string }[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(getHistoryStorageKey(slug, editorStore.language));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, [slug, editorStore.language, getHistoryStorageKey]);

  // Save code to localStorage + push to history (max 5 entries)
  const handleSaveCode = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getCodeStorageKey(slug, editorStore.language), code);
    
    const history = loadHistory();
    const entry = { code, timestamp: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, 5);
    localStorage.setItem(getHistoryStorageKey(slug, editorStore.language), JSON.stringify(updated));
    
    showToast("Code saved successfully", "success");
  }, [slug, editorStore.language, code, getCodeStorageKey, getHistoryStorageKey, loadHistory, showToast]);

  // Restore a history version
  const handleRestoreVersion = useCallback((historyCode: string) => {
    setCode(historyCode);
    setIsHistoryOpen(false);
    showToast("Version restored", "info");
  }, [showToast]);

  // Reset code to starter template
  const handleResetCode = useCallback(() => {
    const starter = getStarterCode(editorStore.language);
    setCode(starter);
    // Clear persisted code so refresh loads starter
    if (typeof window !== "undefined") {
      localStorage.removeItem(getCodeStorageKey(slug, editorStore.language));
    }
    setIsResetConfirmOpen(false);
    showToast("Code reset to starter template", "info");
  }, [editorStore.language, slug, getCodeStorageKey, showToast]);

  // Sync editor settings from localStorage on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setIsMounted(true);
      if (typeof window !== "undefined") {
        try {
          const savedLang = localStorage.getItem("fullprep_default_language");
          if (savedLang) {
            editorStore.setLanguage(savedLang);
          }

          const raw = localStorage.getItem("fullprep_editor_settings");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.fontSize) editorStore.updateSetting("fontSize", parsed.fontSize);
            if (parsed.wordWrap) editorStore.updateSetting("wordWrap", parsed.wordWrap);
            if (parsed.minimap !== undefined) editorStore.updateSetting("minimap", parsed.minimap);
            if (parsed.lineNumbers) editorStore.updateSetting("lineNumbers", parsed.lineNumbers);
            if (parsed.tabSize) editorStore.updateSetting("tabSize", parsed.tabSize);
            if (parsed.editorTheme) editorStore.updateSetting("theme", parsed.editorTheme);
          }
        } catch (e) {
          console.warn("Could not load editor settings:", e);
        }
      }
    }, 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync active code template per language / dynamic slug loading
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        const savedCode = localStorage.getItem(getCodeStorageKey(slug, editorStore.language));
        if (savedCode) {
          setCode(savedCode);
        } else {
          // Always fall back to our starter code template
          setCode(getStarterCode(editorStore.language));
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [slug, editorStore.language, problem, getCodeStorageKey]);

  // Auto save trigger every 10 seconds of keyboard inactivity
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!code || typeof window === "undefined") return;

    autoSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(getCodeStorageKey(slug, editorStore.language), code);
      showToast("Auto-save completed", "success");
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [code, slug, editorStore.language, getCodeStorageKey, showToast]);

  // Listen to keyboard shortcut Ctrl+S / Cmd+S for manual saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveCode]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Panel Resizer handlers
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const percentage = (e.clientX / window.innerWidth) * 100;
      if (percentage > 25 && percentage < 75) {
        setLeftWidth(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((u) => u - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((u) => u + 1);
      setHasUpvoted(true);
      if (hasDownvoted) {
        setDownvotes((d) => d - 1);
        setHasDownvoted(false);
      }
    }
  };

  const handleDownvote = () => {
    if (hasDownvoted) {
      setDownvotes((d) => d - 1);
      setHasDownvoted(false);
    } else {
      setDownvotes((d) => d + 1);
      setHasDownvoted(true);
      if (hasUpvoted) {
        setUpvotes((u) => u - 1);
        setHasUpvoted(false);
      }
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setTestResultState("running");
    setSubmissionDetails(null);
    setRunResults(null);
    setIsRunMode(true);
    editorStore.setActiveTab("result");

    try {
      const apiLang = getApiLanguage(editorStore.language);
      const response = await SubmissionsService.runCode(slug, code, apiLang);

      if (response?.success && response.data) {
        const { status, testResults, hasCompileError } = response.data;
        setRunResults(testResults);

        if (hasCompileError) {
          setTestResultState("compile_error");
          setSubmissionDetails({ errorMessage: testResults[0]?.stderr || "Compilation failed" });
          showToast("Compile Error.", "info");
        } else if (status === "ACCEPTED") {
          setTestResultState("accepted");
          showToast(`Ran ${testResults.length} example test(s) — all passed! ✓`, "success");
        } else {
          setTestResultState("wrong_answer");
          showToast("Wrong answer on example test case.", "info");
        }
        // Auto-select first failed test for easy viewing
        const firstFail = testResults.findIndex((r) => !r.passed);
        setSelectedTestCase(firstFail >= 0 ? firstFail + 1 : 1);
      } else {
        throw new Error("Invalid response from run endpoint.");
      }
    } catch (err: any) {
      console.error("Run failed:", err);
      setTestResultState("runtime_error");
      setSubmissionDetails({ errorMessage: err.message || "Failed to run code." });
      showToast(err.message || "Failed to run code.", "info");
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    setTestResultState("running");
    setSubmissionDetails(null);
    setRunResults(null);
    setIsRunMode(false);
    editorStore.setActiveTab("result");

    try {
      const apiLang = getApiLanguage(editorStore.language);

      // The slug serves as externalId
      const response = await SubmissionsService.submitCode(
        slug,
        problem.title || problem.name || "Problem",
        code,
        apiLang
      );

      if (response && response.success && response.data?.submissionId) {
        const subId = response.data.submissionId;

        // Poll every 1 second
        const intervalId = setInterval(async () => {
          try {
            const subRes = await SubmissionsService.getSubmissionById(subId);
            if (subRes && subRes.success && subRes.data) {
              const status = subRes.data.status;
              if (status !== "PENDING" && status !== "RUNNING") {
                clearInterval(intervalId);
                setSubmissionDetails(subRes.data);
                
                // Map status
                if (status === "ACCEPTED") {
                  setTestResultState("accepted");
                  showToast("Solution Accepted! 🎉 +10 XP", "success");
                  // Refresh user data (like Streak & XP) live
                  AuthService.getCurrentUser();
                } else if (status === "WRONG_ANSWER") {
                  setTestResultState("wrong_answer");
                  showToast("Wrong Answer on testcase.", "info");
                } else if (status === "COMPILE_ERROR") {
                  setTestResultState("compile_error");
                  showToast("Compile Error.", "info");
                } else {
                  setTestResultState("runtime_error");
                  showToast("Execution failed.", "info");
                }
              }
            }
          } catch (pollErr) {
            clearInterval(intervalId);
            console.error("Polling submission failed:", pollErr);
            setTestResultState("none");
            showToast("Failed to fetch submission results.", "info");
          }
        }, 1000);
      } else {
        throw new Error("Invalid submission response.");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setTestResultState("none");
      showToast(err.message || "Failed to submit code.", "info");
    }
  };

  if (loadingProblem) {
    return (
      <div className="flex items-center justify-center min-h-[500px] h-[calc(100vh-120px)] w-full select-none px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
          <span className="text-[13px] font-semibold text-text-secondary">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // 1. Elegant Fallback Handling: "Problem Not Found" state
  if (isMounted && !problem) {
    return (
      <div className="flex items-center justify-center min-h-[500px] h-[calc(100vh-120px)] w-full select-none px-4">
        <DashboardCard className="p-8 max-w-[480px] w-full text-center flex flex-col items-center justify-center border border-border-card bg-card-bg shadow-lg rounded-[24px]">
          <div className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-5 shrink-0 border border-brand-orange/20 shadow-sm animate-pulse">
            <Circle className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-[20px] font-bold text-text-primary tracking-[-0.02em]">Problem Not Found</h1>
          <p className="text-[13px] text-text-secondary mt-2.5 font-semibold leading-relaxed tracking-[-0.01em]">
            The requested coding workspace <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-brand-orange font-mono font-bold">{slug}</code> is either unavailable, has been moved, or does not exist yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7 w-full select-none">
            <Link href="/problems" className="flex-1">
              <Button variant="secondary" className="w-full py-2.5 font-bold">
                Problems Catalog
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="primary" className="w-full py-2.5 font-bold">
                Dashboard Overview
              </Button>
            </Link>
          </div>
        </DashboardCard>
      </div>
    );
  }

  // Derived theme states
  const isDarkTheme = isMounted ? theme === "dark" : false;
  const currentEditorTheme = editorStore.settings.theme === "auto" 
    ? (isDarkTheme ? "vs-dark" : "light") 
    : (editorStore.settings.theme === "vs-dark" ? "vs-dark" : "light");

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col lg:flex-row w-full h-[calc(100vh-120px)] min-h-[500px] gap-0 relative overflow-hidden select-none",
        isResizing && "cursor-col-resize"
      )}
    >
      {/* LEFT PANEL: Problem Details & Description */}
      <div 
        style={{ width: editorStore.isFullscreen ? '0%' : `${leftWidth}%` }}
        className={cn(
          "flex flex-col h-full relative shrink-0 transition-all duration-300 ease-in-out",
          editorStore.isFullscreen 
            ? "w-0 min-w-0 opacity-0 pointer-events-none" 
            : "min-w-[320px] max-w-[70%] overflow-hidden"
        )}
      >
        {problem && (
          <ProblemDescription
            problem={problem}
            isBookmarked={isBookmarked}
            setIsBookmarked={handleToggleBookmark}
            isStarred={isStarred}
            setIsStarred={setIsStarred}
            hasUpvoted={hasUpvoted}
            handleUpvote={handleUpvote}
            hasDownvoted={hasDownvoted}
            handleDownvote={handleDownvote}
            upvotes={upvotes}
            downvotes={downvotes}
            onBack={() => router.back()}
          />
        )}
      </div>

      {/* DRAGGABLE DIVIDER (col-resize handle) */}
      <div 
        onMouseDown={startResizing}
        className={cn(
          "hidden lg:block w-1.5 shrink-0 cursor-col-resize transition-all duration-300 relative z-40 select-none mx-0.5",
          isResizing ? "bg-brand-orange/40 w-2" : "hover:bg-brand-orange/20",
          editorStore.isFullscreen && "pointer-events-none opacity-0 w-0 mx-0"
        )}
      />

      {/* RIGHT PANEL: Coding Editor & Execution Console */}
      <div 
        style={{ width: editorStore.isFullscreen ? '100%' : `${100 - leftWidth}%` }}
        className={cn(
          "flex-1 flex flex-col h-full transition-all duration-300 ease-in-out",
          editorStore.isFullscreen ? "min-w-0" : "min-w-[320px] overflow-hidden"
        )}
      >
        <div className="flex flex-col gap-4 h-full">
          {/* Top IDE Card: Header Toolbar + Editor Canvas + Action bar */}
          <div className="flex-1 min-h-[300px] flex flex-col justify-between border border-border-card rounded-[24px] bg-[#111217] dark:bg-[#06090f] p-4.5 shadow-sm relative overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              {/* IDE Toolbar */}
              <EditorToolbar
                language={editorStore.language}
                setLanguage={editorStore.setLanguage}
                editorTheme={editorStore.settings.theme}
                updateSetting={editorStore.updateSetting}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                isFullscreen={editorStore.isFullscreen}
                setIsFullscreen={editorStore.setIsFullscreen}
                setIsSettingsOpen={setIsSettingsOpen}
              />

              {/* Editor Workspace Canvas */}
              <div className="flex-1 min-h-0 w-full py-4 relative">
                {isMounted && (
                  <MonacoEditor
                    language={editorStore.language}
                    theme={currentEditorTheme}
                    value={code}
                    onChange={setCode}
                    fontSize={editorStore.settings.fontSize}
                    minimapEnabled={editorStore.settings.minimap}
                    lineNumbers={editorStore.settings.lineNumbers}
                    wordWrap={editorStore.settings.wordWrap}
                    tabSize={editorStore.settings.tabSize}
                  />
                )}
              </div>

              {/* Action Bar (Save / History / Reset / Run / Submit) */}
              <div className="flex items-center justify-between border-t border-white/[0.05] dark:border-white/[0.03] pt-3.5 select-none shrink-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRunCode}
                    className="flex items-center gap-1.5 h-9 px-4.5 bg-[#181920] dark:bg-[#0d1017] border border-white/[0.08] dark:border-white/[0.04] hover:bg-white/[0.02] rounded-xl text-[12.5px] font-bold text-white transition cursor-pointer focus:outline-none"
                  >
                    <Circle className="w-3.5 h-3.5 fill-white stroke-[2]" />
                    <span>Run</span>
                  </button>
                  <button 
                    onClick={handleSubmitCode}
                    className="flex items-center gap-1.5 h-9 px-5 bg-brand-orange text-white hover:bg-[#e05e00] rounded-xl text-[12.5px] font-bold shadow-md shadow-[#ff6a00]/15 transition duration-200 cursor-pointer border border-[#ff7a1a]/30 focus:outline-none"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3.5]" />
                    <span>Submit</span>
                  </button>
                </div>

                {/* Save & Reset controls */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleSaveCode}
                    className="flex items-center gap-1 h-9 px-3.5 bg-transparent border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02] rounded-xl text-[12.5px] font-bold text-white transition duration-200 cursor-pointer focus:outline-none" 
                    title="Save file (Ctrl+S)"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="w-9 h-9 bg-transparent border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02] rounded-xl flex items-center justify-center text-white transition duration-200 cursor-pointer focus:outline-none" 
                    title="Code History"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex items-center gap-1 h-9 px-3.5 bg-transparent border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02] rounded-xl text-[12.5px] font-bold text-white transition duration-200 cursor-pointer focus:outline-none"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Execution Console */}
          <OutputConsole
            activeConsoleTab={editorStore.activeTab}
            setActiveConsoleTab={editorStore.setActiveTab}
            selectedTestCase={selectedTestCase}
            setSelectedTestCase={setSelectedTestCase}
            testResultState={testResultState}
            submissionDetails={submissionDetails}
            runResults={runResults}
            isRunMode={isRunMode}
            publicTests={problem?.examples ?? []}
          />
        </div>
      </div>

      {/* Editor Settings Modal */}
      <EditorSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        editorTheme={editorStore.settings.theme}
        fontSize={editorStore.settings.fontSize}
        wordWrap={editorStore.settings.wordWrap}
        minimapEnabled={editorStore.settings.minimap}
        lineNumbers={editorStore.settings.lineNumbers}
        tabSize={editorStore.settings.tabSize}
        updateSetting={editorStore.updateSetting}
      />

      {/* History Modal */}
      <Modal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        title="Code History" 
        className="bg-[#111217] dark:bg-[#06090f] text-white border-white/[0.08]"
      >
        <div className="py-2 space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
          {(() => {
            const history = loadHistory();
            if (history.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Clock className="w-8 h-8 text-white/[0.08]" />
                  <span className="text-[13px] text-[#9ca3af]/80 font-semibold tracking-[-0.01em]">No saved versions yet</span>
                  <span className="text-[11px] text-[#9ca3af]/50 font-medium">Click Save to create your first snapshot</span>
                </div>
              );
            }
            return history.map((entry, idx) => {
              const date = new Date(entry.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
              const preview = entry.code.split("\n").slice(0, 3).join("\n");
              const isCurrent = entry.code === code;
              return (
                <div 
                  key={idx}
                  className="p-3.5 bg-[#181920] dark:bg-[#0d1017] border border-white/[0.06] dark:border-white/[0.03] rounded-xl flex flex-col gap-2 group hover:border-brand-orange/20 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-md border border-brand-orange/20">
                        v{history.length - idx}
                      </span>
                      <span className="text-[11px] font-semibold text-[#9ca3af]">
                        {dateStr} at {timeStr}
                      </span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-md border border-[#10b981]/20">
                        Current
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRestoreVersion(entry.code)}
                        className="flex items-center gap-1 text-[11px] font-bold text-white bg-transparent border border-white/[0.1] hover:border-brand-orange/30 hover:bg-brand-orange/5 hover:text-brand-orange px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                  <pre className="text-[10.5px] font-mono text-[#9ca3af]/70 leading-relaxed overflow-hidden whitespace-pre-wrap line-clamp-3 select-text text-left">
                    {preview}
                  </pre>
                </div>
              );
            });
          })()}
        </div>
        <div className="pt-3 border-t border-white/[0.08] dark:border-white/[0.04] flex justify-end select-none">
          <button 
            onClick={() => setIsHistoryOpen(false)}
            className="h-9 px-5 bg-brand-orange text-white hover:bg-[#e05e00] rounded-xl text-[12.5px] font-bold shadow-md shadow-[#ff6a00]/15 transition duration-200 cursor-pointer border border-[#ff7a1a]/30"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal 
        isOpen={isResetConfirmOpen} 
        onClose={() => setIsResetConfirmOpen(false)} 
        title="Reset to Starter Code?" 
        className="bg-[#111217] dark:bg-[#06090f] text-white border-white/[0.08]"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#f43f5e]/10 flex items-center justify-center border border-[#f43f5e]/20 shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#f43f5e]" />
          </div>
          <p className="text-[12.5px] text-[#9ca3af] font-medium leading-relaxed tracking-[-0.01em]">
            This will discard all your current changes and restore the original starter template. This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button 
            onClick={() => setIsResetConfirmOpen(false)}
            className="flex-1 h-9 bg-transparent border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02] rounded-xl text-[12.5px] font-bold text-white transition duration-200 cursor-pointer focus:outline-none"
          >
            Cancel
          </button>
          <button 
            onClick={handleResetCode}
            className="flex-1 h-9 bg-[#f43f5e] text-white hover:bg-[#e11d48] rounded-xl text-[12.5px] font-bold shadow-md shadow-[#f43f5e]/15 transition duration-200 cursor-pointer border border-[#f43f5e]/30 focus:outline-none"
          >
            Reset Code
          </button>
        </div>
      </Modal>

    </div>
  );
}

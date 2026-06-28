"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Cpu, 
  Code2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Eye, 
  HelpCircle, 
  Shield, 
  Clock, 
  FileText,
  AlertTriangle,
  Zap,
  BookOpen,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import DashboardCard from "@/components/ui/DashboardCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useNotificationStore } from "@/store/notificationStore";
import { aiService, AiMessage } from "@/services/ai.service";

export default function AIHintsPage() {
  const showToast = useNotificationStore((state) => state.showToast);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States
  const [activeTab, setActiveTab] = useState("Ask AI");
  const [inputVal, setInputVal] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isApproachOpen, setIsApproachOpen] = useState(true);
  const [dryRunOutput, setDryRunOutput] = useState<string | null>(null);
  const [visualizeActive, setVisualizeActive] = useState(false);

  // Chat message logs state
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState<number | "Unlimited" | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("C++");
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const result = await aiService.getChatHistory("general");
      // result is now { messages: [...], hintsRemaining: number | "Unlimited" }
      if (result !== null) {
        setHintsRemaining(result.hintsRemaining);
        if (result.messages && result.messages.length > 0) {
          setMessages(result.messages);
        } else {
          setMessages([
            {
              _id: "1",
              sender: "assistant",
              text: "Hi there! I'm FullPrep AI, your coding mentor. Please share the problem description, and any code you've written so far, or just tell me what you're thinking about!",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
      } else {
        // API failed, show default state with fallback limit
        setHintsRemaining(5);
        setMessages([
          {
            _id: "1",
            sender: "assistant",
            text: "Hi there! I'm FullPrep AI, your coding mentor. Please share the problem description, and any code you've written so far, or just tell me what you're thinking about!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, []);


  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, dryRunOutput, visualizeActive]);

  const tabs = ["Ask AI"];

  const suggestions = [
    "Explain Binary Search",
    "How does DFS work?",
    "Optimize this code",
    "Top DSA topics",
  ];

  // Tool items for sidebar
  const popularTools = [
    { title: "Explain This Code", desc: "Get line-by-line explanation", icon: FileText, color: "text-[#3b82f6]" },
    { title: "Find Bugs", desc: "Detect issues in your code", icon: AlertTriangle, color: "text-brand-orange" },
    { title: "Optimize Code", desc: "Improve time & space complexity", icon: Zap, color: "text-[#10b981]" },
    { title: "Generate Code", desc: "Generate boilerplate or solution", icon: Code2, color: "text-[#8b5cf6]" },
    { title: "Understand Complexity", desc: "Analyze algorithm complexity", icon: Cpu, color: "text-brand-orange" },
  ];

  // Conversations history
  const recentConversations = [
    { title: "Two Sum optimal approach", time: "10:24 AM" },
    { title: "Binary Tree Inorder Traversal", time: "Yesterday" },
    { title: "Dynamic Programming basics", time: "2 days ago" },
    { title: "Graph BFS explanation", time: "3 days ago" },
    { title: "LRU Cache implementation", time: "5 days ago" },
  ];

  // Copy Code to Clipboard
  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setIsCopied(true);
    showToast("Code copied to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Submit User Message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Block if free limit reached
    if (hintsRemaining !== null && hintsRemaining !== "Unlimited" && hintsRemaining <= 0) {
      showToast("Daily AI Hint limit reached! Upgrade to Pro for more.", "info");
      return;
    }

    const userMsg: AiMessage = {
      _id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setDryRunOutput(null);
    setVisualizeActive(false);
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage("general", {
        text: textToSend,
        language: selectedLanguage,
      });
      
      setMessages((prev) => [...prev, response.message]);
      setHintsRemaining(response.hintsRemaining);
      
    } catch (error: any) {
      // Check for limit-reached (403) using our custom ApiError's statusCode
      if (error.statusCode === 403 || error.message?.includes("daily limit")) {
        setHintsRemaining(0);
        showToast("You've reached your daily AI Hint limit!", "info");
        setMessages((prev) => [...prev, {
          _id: Date.now().toString(),
          sender: "assistant",
          text: "⚠️ You've reached your **daily limit** of 5 free AI hints. Your limit resets every 24 hours.\n\nUpgrade to **Pro** for 100 hints per day and unlock advanced features!",
        }]);
      } else {
        showToast("Error connecting to AI Assistant. Please try again.", "info");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputVal);
    }
  };

  return (
    <div className="h-auto lg:h-[calc(100vh-124px)] flex flex-col overflow-y-auto lg:overflow-hidden w-full max-w-[1300px] mx-auto select-none font-sans">
      
      {/* Top Header Row (Strict mockup alignment) */}
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        <PageHeader
          title="AI Hints"
          description="Your intelligent coding assistant"
        />
        <Button 
          variant="secondary" 
          className="py-2.5 px-4 font-bold border border-border-card text-[13px] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
          onClick={() => {
            setMessages([
              {
                _id: "1",
                sender: "assistant",
                text: "Hello! I am your AI coding assistant. Ask me anything about Data Structures, Algorithms, or code optimization!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]);

            setDryRunOutput(null);
            setVisualizeActive(false);
            showToast("New chat conversation started.", "info");
          }}
        >
          <Plus className="w-4 h-4 text-brand-orange" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Tabs Filter Header (Same sliding underlines tab system) */}
      <div className="flex border-b border-border-card mb-6 gap-6 shrink-0 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-semibold tracking-[-0.01em] relative cursor-pointer transition-colors duration-250 whitespace-nowrap ${
                isActive ? "text-brand-orange" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="aiTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-orange rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Viewport-Locked Split Section (Absolutely stable, no overflow layout jumping) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 items-start w-full overflow-y-auto lg:overflow-hidden">
        
        {/* Left Column: Chat Conversation Card (Consolidated single dashboard block) */}
        <div className="flex-1 min-w-0 w-full h-[500px] lg:h-full flex flex-col bg-white dark:bg-[#11131c] border border-border-card rounded-[24px] overflow-hidden shadow-sm">
          
          {/* Chat scroll box (min-h-0 and flex-1 creates isolated scrollable container) */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-6 scrollbar min-h-0">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <div 
                  key={msg._id || idx}
                  className={`flex gap-4 max-w-[85%] text-left ${
                    isUser ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  {/* Avatar Icon */}
                  {isUser ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-[#8b5cf6] flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
                      K
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#fff5eb] dark:bg-[#ff6a00]/10 border border-[#ff6a00]/10 flex items-center justify-center text-brand-orange shrink-0 shadow-sm">
                      <Sparkles className="w-4.5 h-4.5 fill-current" />
                    </div>
                  )}

                  {/* Message Bubble Column */}
                  <div className="flex flex-col gap-1.5 min-w-0 w-full">
                    
                    {/* Timestamp banner (Strict mockup alignment) */}
                    <div className={`text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}>
                      <span>{isUser ? "YOU" : "FULLPREP AI"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Chat Bubble Body (mockup styled user amber bubble) */}
                    <div className={`p-4 rounded-2xl text-[13.5px] font-medium leading-relaxed tracking-[-0.015em] ${
                      isUser 
                        ? "bg-[#ff6a00]/5 border border-[#ff6a00]/20 text-brand-orange dark:text-[#ffece0] rounded-tr-none" 
                        : "bg-[#fcfcfa] dark:bg-[#0f1118]/60 border border-border-card text-text-primary rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Expandable Approach Section (AI Only) */}
                    {!isUser && msg.approach && (
                      <div className="border border-border-card rounded-xl overflow-hidden bg-[#fcfcfa] dark:bg-[#0f1118]/30 mt-2">
                        <button
                          onClick={() => setIsApproachOpen(!isApproachOpen)}
                          className="w-full px-4 py-3 flex items-center justify-between text-[12.5px] font-bold text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors focus:outline-none cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-brand-orange" />
                            <span>Approach</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                            isApproachOpen ? "" : "-rotate-95"
                          }`} />
                        </button>

                        {isApproachOpen && (
                          <div className="px-4 pb-3.5 pt-1.5 border-t border-border-card/45 text-[12.5px] text-text-secondary flex flex-col gap-2.5 font-medium leading-relaxed">
                            {msg.approach.map((step, idx) => (
                              <div key={idx} className="flex gap-2.5">
                                <span className="text-brand-orange font-bold">{idx + 1}.</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Syntax-highlighted Code block (Visually matching IDE pages) */}
                    {!isUser && msg.code && (
                      <div className="border border-border-card rounded-xl overflow-hidden mt-2 bg-[#0c0d12] shadow-md flex flex-col min-w-0 w-full max-w-full">
                        
                        {/* Tab header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#21232c] text-white">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Code ({msg.language})</span>
                          </div>
                          
                          <button
                            onClick={() => handleCopyCode(msg.code || "")}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-[#10b981]" />
                                <span className="text-[#10b981]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Fenced scroll box with exact IDE padding & styling */}
                        <pre className="p-4 font-mono text-[12.5px] text-left text-gray-300 overflow-x-auto leading-relaxed select-all">
                          <code>{msg.code}</code>
                        </pre>

                      </div>
                    )}

                    {/* Complexity badges (AI Only) */}
                    {!isUser && msg.complexity && (
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-[#eafaf1] dark:bg-[#10b981]/10 border border-[#10b981]/15 px-3 py-1 rounded-full text-[11px] font-bold">
                          <span className="text-[#10b981]">Time Complexity:</span>
                          <span className="text-text-primary">{msg.complexity.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#eff6ff] dark:bg-[#3b82f6]/10 border border-[#3b82f6]/15 px-3 py-1 rounded-full text-[11px] font-bold">
                          <span className="text-[#3b82f6]">Space Complexity:</span>
                          <span className="text-text-primary">{msg.complexity.space}</span>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Inline Outputs */}
                    {!isUser && msg.code && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Button
                          variant="secondary"
                          className="py-1.5 px-3 rounded-lg text-[11px] border border-border-card font-bold hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                          onClick={() => {
                            setDryRunOutput("Running solution.py...\nTest Case 1: [2,7,11,15], Target = 9\nOutput: [0, 1] (PASSED)\nTest Case 2: [3,2,4], Target = 6\nOutput: [1, 2] (PASSED)\nAll dry runs complete. Perfect complexity compliance!");
                            setVisualizeActive(false);
                            showToast("Code execution succeeded.", "success");
                          }}
                        >
                          <Play className="w-3 h-3 text-brand-orange fill-brand-orange" />
                          <span>Dry Run</span>
                        </Button>
                        <Button
                          variant="secondary"
                          className="py-1.5 px-3 rounded-lg text-[11px] border border-border-card font-bold hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                          onClick={() => {
                            setVisualizeActive(true);
                            setDryRunOutput(null);
                            showToast("Recursion tree visualized successfully.", "success");
                          }}
                        >
                          <Eye className="w-3 h-3 text-[#10b981]" />
                          <span>Visualize</span>
                        </Button>
                        <Button
                          variant="secondary"
                          className="py-1.5 px-3 rounded-lg text-[11px] border border-border-card font-bold hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                          onClick={() => {
                            setInputVal("Can you explain how this Hash Map approach handles duplicates?");
                            showToast("Follow-up question populated in input slot.", "info");
                          }}
                        >
                          <HelpCircle className="w-3 h-3 text-[#8b5cf6]" />
                          <span>Follow Up</span>
                        </Button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Dry Run console output */}
            {dryRunOutput && (
              <div className="w-full bg-[#0c0d12] border border-[#21232c] rounded-xl p-4 mt-1 text-left font-mono shadow-inner shrink-0">
                <div className="flex items-center justify-between border-b border-[#21232c] pb-2 mb-2 text-white">
                  <span className="text-[10px] font-bold text-gray-400">Dry Run Console Output</span>
                  <button 
                    onClick={() => setDryRunOutput(null)} 
                    className="text-[10px] font-bold text-gray-500 hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <pre className="text-[11.5px] text-[#10b981] whitespace-pre-wrap leading-relaxed">
                  {dryRunOutput}
                </pre>
              </div>
            )}

            {/* Visualize recursion tree */}
            {visualizeActive && (
              <div className="w-full bg-[#fcfcfa] dark:bg-[#0f1118]/60 border border-border-card rounded-xl p-4 mt-1 text-left flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between border-b border-border-card/40 pb-2 text-text-primary">
                  <span className="text-[11px] font-bold">Execution Map Visualization</span>
                  <button 
                    onClick={() => setVisualizeActive(false)} 
                    className="text-[10px] font-bold text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 gap-4 bg-white dark:bg-[#11131c] rounded-lg border border-border-card/50">
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-1.5 rounded-lg bg-brand-orange text-white font-bold text-[11px] shadow-sm">
                      twoSum([2, 7, 11, 15], 9)
                    </div>
                    <div className="w-[1.5px] h-6 bg-border-card" />
                  </div>
                  
                  <div className="flex gap-6 items-start">
                    <div className="flex flex-col items-center">
                      <div className="px-2.5 py-1 rounded bg-bg-page border border-border-card text-[10.5px] font-semibold text-text-secondary">
                        seen = &#123;2: 0&#125;
                      </div>
                      <span className="text-[9px] text-[#10b981] font-bold mt-1">i=0, complement=7</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="px-2.5 py-1 rounded bg-[#eafaf1] dark:bg-[#10b981]/15 border border-[#10b981]/25 text-[10.5px] font-bold text-[#10b981]">
                        found 7 in seen
                      </div>
                      <span className="text-[9px] text-[#10b981] font-bold mt-1">i=1, return [0, 1]</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Integrated bottom Chat input tray (Not detached visually, unified border styling) */}
          <div className="p-4 border-t border-border-card bg-[#fcfcfa] dark:bg-[#11131c]/40 flex flex-col gap-3.5 shrink-0">
            
            {/* Unified Input Container */}
            <div className="relative w-full flex items-center bg-white dark:bg-[#0f1118]/80 border border-border-card rounded-xl px-4 py-3 shadow-sm focus-within:border-[#ff6a00]/50 transition-all">
              
              {/* Custom Language Dropdown */}
              <div className="relative mr-3 shrink-0">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f3f4f6] dark:bg-white/[0.06] border border-border-card hover:border-brand-orange/50 text-[11px] font-bold text-text-secondary hover:text-brand-orange transition-all cursor-pointer select-none"
                >
                  <Code2 className="w-3 h-3" />
                  <span>{selectedLanguage}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute bottom-full mb-2 left-0 min-w-[110px] bg-[#11131c] border border-border-card rounded-xl shadow-xl overflow-hidden z-50">
                    {["C++", "Python", "Java", "JavaScript"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setSelectedLanguage(lang); setIsLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors cursor-pointer ${
                          selectedLanguage === lang
                            ? "bg-brand-orange/10 text-brand-orange"
                            : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                placeholder="Ask anything about DSA, algorithms, code..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                className="flex-1 pr-12 bg-transparent text-text-primary text-[13.5px] font-semibold tracking-[-0.015em] focus:outline-none placeholder-[#9ca3af]/60 resize-none font-sans"
              />
              <button
                onClick={() => handleSendMessage(inputVal)}
                disabled={!inputVal.trim() || isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  inputVal.trim() && !isLoading 
                    ? "bg-brand-orange text-white hover:bg-[#e05d00] cursor-pointer" 
                    : "bg-[#f3f4f6] dark:bg-white/[0.04] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scroll-none">
              {suggestions.map((text) => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="px-3 py-1.5 rounded-lg border border-border-card bg-white dark:bg-[#11131c]/60 text-[11px] font-bold text-text-secondary hover:text-text-primary hover:border-brand-orange/40 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{text}</span>
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Right Sidebar Column with strict width constraints preventing collapse, scrollable independently */}
        <div className="w-full lg:w-[380px] shrink-0 h-auto lg:h-full overflow-y-visible lg:overflow-y-auto flex flex-col gap-5 pr-1 pb-4 scrollbar">
          
          {/* AI Assistant Stats Card */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[210px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                AI Assistant
              </span>
              
              <button className="flex items-center gap-1 bg-card-bg border border-border-card px-2.5 py-1 rounded-lg text-[10px] font-bold text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer">
                <span className="px-1 py-0.5 rounded bg-[#fff5eb] text-brand-orange font-bold text-[8.5px] uppercase dark:bg-[#ff6a00]/10">
                  {hintsRemaining === null
                    ? "LOADING..."
                    : hintsRemaining === "Unlimited"
                    ? "PRO"
                    : `${hintsRemaining} HINTS LEFT`}
                </span>
                <ChevronDown className="w-3 h-3 text-text-secondary" />
              </button>
            </div>
            
            <p className="text-[12px] text-text-secondary font-medium -mt-2 tracking-[-0.01em] leading-normal">
              Advanced AI model tuned for competitive coding
            </p>

            <div className="grid grid-cols-3 gap-3 border-t border-border-card/50 pt-4 mt-2">
              <div className="flex flex-col items-center p-2 rounded-lg bg-bg-page border border-border-card/30">
                <Zap className="w-4 h-4 text-brand-orange mb-1 animate-pulse" />
                <span className="text-[12.5px] font-bold text-text-primary leading-none">98%</span>
                <span className="text-[8px] font-bold uppercase text-text-secondary mt-1">Accuracy</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-bg-page border border-border-card/30">
                <Clock className="w-4 h-4 text-[#10b981] mb-1" />
                <span className="text-[12.5px] font-bold text-text-primary leading-none">1.2s</span>
                <span className="text-[8px] font-bold uppercase text-text-secondary mt-1">Response</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-bg-page border border-border-card/30">
                <Shield className="w-4 h-4 text-[#3b82f6] mb-1" />
                <span className="text-[10px] font-bold text-text-primary leading-none">Secure</span>
                <span className="text-[8px] font-bold uppercase text-text-secondary mt-1">Data Shield</span>
              </div>
            </div>
          </DashboardCard>

          {/* Popular Tools (Flexible auto-height preventing vertical squeeze) */}
          <DashboardCard className="p-5 flex flex-col justify-between h-auto min-h-[340px] shadow-sm select-none text-left shrink-0">
            <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em] mb-3">
              Popular Tools
            </span>

            <div className="flex flex-col gap-2.5 mt-0.5">
              {popularTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setInputVal(tool.title);
                      showToast(`Tool "${tool.title}" loaded.`, "info");
                    }}
                    className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-bg-page dark:bg-[#11131c] dark:hover:bg-white/[0.02] border border-border-card hover:border-[#ff6a00]/30 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8.5 h-8.5 rounded-lg bg-bg-page border border-border-card/50 flex items-center justify-center shrink-0">
                        <Icon className={`w-4.5 h-4.5 ${tool.color}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12.5px] font-bold text-text-primary truncate tracking-[-0.01em]">
                          {tool.title}
                        </span>
                        <span className="text-[10.5px] text-text-secondary truncate mt-0.5 font-medium leading-none">
                          {tool.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          {/* Recent Conversations */}
          <DashboardCard className="p-5 flex flex-col justify-between h-[280px] shadow-sm select-none text-left shrink-0">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] font-bold text-text-primary tracking-[-0.01em]">
                Recent Conversations
              </span>
              <button className="text-[11px] font-semibold text-brand-orange hover:text-[#e05d00] transition cursor-pointer">
                View all
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-0.5">
              {recentConversations.map((conv, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    handleSendMessage(conv.title);
                    showToast(`Restored conversation: "${conv.title}"`, "success");
                  }}
                  className="flex items-center justify-between border-b border-border-card/45 pb-2.5 last:border-0 last:pb-0 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#9ca3af] group-hover:bg-brand-orange shrink-0 transition-colors" />
                    <span className="text-[12.5px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[200px] tracking-[-0.01em]">
                      {conv.title}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-text-secondary shrink-0 pl-2 font-medium">
                    {conv.time}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}

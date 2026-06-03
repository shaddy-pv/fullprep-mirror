"use client";

import React from "react";
import { ChevronDown, Check, Settings, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { EditorSettings } from "@/store/editorStore";

interface EditorToolbarProps {
  language: string;
  setLanguage: (lang: string) => void;
  editorTheme: string;
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  openDropdown: string | null;
  setOpenDropdown: (dropdown: string | null) => void;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export default function EditorToolbar({
  language,
  setLanguage,
  editorTheme,
  updateSetting,
  openDropdown,
  setOpenDropdown,
  isFullscreen,
  setIsFullscreen,
  setIsSettingsOpen
}: EditorToolbarProps) {
  const handleDropdownToggle = (type: "language" | "editorTheme") => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  return (
    <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.05] dark:border-white/[0.03] select-none shrink-0">
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => handleDropdownToggle("language")}
            className="flex items-center gap-1.5 h-8 px-3.5 bg-[#181920] dark:bg-[#0d1017] border border-white/[0.08] dark:border-white/[0.04] rounded-xl text-[12.5px] font-bold text-white hover:bg-white/[0.02] shadow-sm transition cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
            <span>
              {language === "javascript" ? "JavaScript" : 
               language === "python" ? "Python" : 
               language === "java" ? "Java" : "C++"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          
          {openDropdown === "language" && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
              <div className="absolute left-0 mt-1 w-36 bg-[#111217] dark:bg-[#06090f] border border-white/[0.08] dark:border-white/[0.04] rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                {["javascript", "python", "java", "cpp"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-[12.5px] hover:bg-white/[0.02] flex items-center justify-between transition-colors cursor-pointer",
                      language === lang ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-white/80 font-medium"
                    )}
                  >
                    <span className="capitalize">{lang === "cpp" ? "C++" : lang}</span>
                    {language === lang && <Check className="w-3.5 h-3.5 text-brand-orange" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Editor Theme Selector */}
        <div className="relative">
          <button 
            onClick={() => handleDropdownToggle("editorTheme")}
            className="flex items-center gap-1.5 h-8 px-3.5 bg-[#181920] dark:bg-[#0d1017] border border-white/[0.08] dark:border-white/[0.04] rounded-xl text-[12.5px] font-bold text-white hover:bg-white/[0.02] shadow-sm transition cursor-pointer"
          >
            <span>Theme: {editorTheme === "auto" ? "Auto" : editorTheme === "vs-dark" ? "VS Dark" : "VS Light"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>

          {openDropdown === "editorTheme" && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
              <div className="absolute left-0 mt-1 w-40 bg-[#111217] dark:bg-[#06090f] border border-white/[0.08] dark:border-white/[0.04] rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                {[
                  { label: "Auto", value: "auto" },
                  { label: "VS Dark", value: "vs-dark" },
                  { label: "VS Light", value: "light" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      updateSetting("theme", t.value);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-[12.5px] hover:bg-white/[0.02] flex items-center justify-between transition-colors cursor-pointer",
                      editorTheme === t.value ? "text-brand-orange font-bold bg-brand-orange/[0.02]" : "text-white/80 font-medium"
                    )}
                  >
                    <span>{t.label}</span>
                    {editorTheme === t.value && <Check className="w-3.5 h-3.5 text-brand-orange" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.02] transition cursor-pointer focus:outline-none"
          title="Editor Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.02] transition cursor-pointer focus:outline-none" 
          title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-brand-orange" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

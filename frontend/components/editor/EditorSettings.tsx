"use client";

import React from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "../ui/Modal";

import { EditorSettings as StoreSettings } from "@/store/editorStore";

interface EditorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  editorTheme: string;
  fontSize: number;
  wordWrap: "on" | "off";
  minimapEnabled: boolean;
  lineNumbers: "on" | "off";
  tabSize: number;
  updateSetting: <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => void;
}

export default function EditorSettings({
  isOpen,
  onClose,
  editorTheme,
  fontSize,
  wordWrap,
  minimapEnabled,
  lineNumbers,
  tabSize,
  updateSetting
}: EditorSettingsProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editor Settings" className="bg-[#111217] dark:bg-[#06090f] text-white border-white/[0.08]">
      {/* Content List */}
      <div className="py-2 space-y-4">
        {/* Theme Selector */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold text-white tracking-[-0.01em]">Editor Theme</span>
            <span className="text-[11px] text-[#9ca3af]/90 font-medium">Configure IDE appearance theme</span>
          </div>
          <select 
            value={editorTheme}
            onChange={(e) => updateSetting("theme", e.target.value)}
            className="bg-[#181920] dark:bg-[#0d1017] border border-white/[0.08] dark:border-white/[0.04] rounded-xl text-[12.5px] font-bold text-white px-3 py-1.5 outline-none shadow-sm focus:border-brand-orange transition cursor-pointer"
          >
            <option value="auto">Auto Sync</option>
            <option value="vs-dark">VS Dark</option>
            <option value="light">VS Light</option>
          </select>
        </div>

        {/* Font Size Slider */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white tracking-[-0.01em]">Font Size</span>
              <span className="text-[11px] text-[#9ca3af]/90 font-medium">Adjust workspace code character sizing</span>
            </div>
            <span className="text-[12.5px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-lg border border-brand-orange/20">
              {fontSize}px
            </span>
          </div>
          <input 
            type="range"
            min="12"
            max="20"
            step="0.5"
            value={fontSize}
            onChange={(e) => updateSetting("fontSize", parseFloat(e.target.value))}
            className="w-full h-1 bg-[#181920] dark:bg-[#0d1017] rounded-lg appearance-none cursor-pointer accent-brand-orange border border-white/[0.04]"
          />
        </div>

        {/* Word Wrap Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold text-white tracking-[-0.01em]">Word Wrap</span>
            <span className="text-[11px] text-[#9ca3af]/90 font-medium">Wrap long code lines to prevent horizontal scrolling</span>
          </div>
          <button 
            onClick={() => updateSetting("wordWrap", wordWrap === "on" ? "off" : "on")}
            className={cn(
              "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer border relative flex items-center justify-start",
              wordWrap === "on" 
                ? "bg-brand-orange border-brand-orange/30" 
                : "bg-[#181920] dark:bg-[#0d1017] border-white/[0.08]"
            )}
            aria-checked={wordWrap === "on"}
            role="switch"
          >
            <div 
              className={cn(
                "w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 absolute top-0.5",
                wordWrap === "on" ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        {/* Minimap Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold text-white tracking-[-0.01em]">Code Minimap</span>
            <span className="text-[11px] text-[#9ca3af]/90 font-medium">Display code bird&apos;s-eye navigator outline</span>
          </div>
          <button 
            onClick={() => updateSetting("minimap", !minimapEnabled)}
            className={cn(
              "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer border relative flex items-center justify-start",
              minimapEnabled 
                ? "bg-brand-orange border-brand-orange/30" 
                : "bg-[#181920] dark:bg-[#0d1017] border-white/[0.08]"
            )}
            aria-checked={minimapEnabled}
            role="switch"
          >
            <div 
              className={cn(
                "w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 absolute top-0.5",
                minimapEnabled ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        {/* Line Numbers Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold text-white tracking-[-0.01em]">Line Numbers</span>
            <span className="text-[11px] text-[#9ca3af]/90 font-medium">Show line counter indexes in left margin</span>
          </div>
          <button 
            onClick={() => updateSetting("lineNumbers", lineNumbers === "on" ? "off" : "on")}
            className={cn(
              "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer border relative flex items-center justify-start",
              lineNumbers === "on" 
                ? "bg-brand-orange border-brand-orange/30" 
                : "bg-[#181920] dark:bg-[#0d1017] border-white/[0.08]"
            )}
            aria-checked={lineNumbers === "on"}
            role="switch"
          >
            <div 
              className={cn(
                "w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 absolute top-0.5",
                lineNumbers === "on" ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        {/* Tab Size Selector */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold text-white tracking-[-0.01em]">Tab Size</span>
            <span className="text-[11px] text-[#9ca3af]/90 font-medium">Tab key indent spacer width size</span>
          </div>
          <select 
            value={tabSize}
            onChange={(e) => updateSetting("tabSize", parseInt(e.target.value))}
            className="bg-[#181920] dark:bg-[#0d1017] border border-white/[0.08] dark:border-white/[0.04] rounded-xl text-[12.5px] font-bold text-white px-3 py-1.5 outline-none shadow-sm focus:border-brand-orange transition cursor-pointer"
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
          </select>
        </div>
      </div>

      {/* Footer button */}
      <div className="pt-4 border-t border-white/[0.08] dark:border-white/[0.04] flex justify-end select-none">
        <button 
          onClick={onClose}
          className="h-9 px-5 bg-brand-orange text-white hover:bg-[#e05e00] rounded-xl text-[12.5px] font-bold shadow-md shadow-[#ff6a00]/15 transition duration-200 cursor-pointer border border-[#ff7a1a]/30"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}

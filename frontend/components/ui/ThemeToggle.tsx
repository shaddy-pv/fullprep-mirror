"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = mounted ? theme === "dark" : true; // Default to dark before mount

  return (
    <div 
      onClick={toggleTheme}
      className={cn(
        "flex items-center bg-gray-100 dark:bg-[#151821] border border-gray-200 dark:border-white/[0.08] rounded-full p-[3px] cursor-pointer relative w-[64px] h-[34px] transition-colors duration-300 select-none shadow-inner",
        className
      )}
    >
      {/* Sun icon on left */}
      <Sun className={cn("w-4 h-4 absolute left-2 transition-opacity duration-350", isDark ? "text-text-secondary opacity-100" : "text-brand-orange opacity-0")} />
      {/* Moon icon on right */}
      <Moon className={cn("w-4 h-4 absolute right-2 transition-opacity duration-350", isDark ? "text-brand-orange opacity-0" : "text-text-secondary opacity-100")} />
      
      {/* Active slider thumb */}
      <div 
        className={cn(
          "w-[26px] h-[26px] rounded-full shadow-md border transition-all duration-300 ease-out flex items-center justify-center",
          isDark 
            ? "transform translate-x-[30px] bg-[#0b0f17] border-white/10" 
            : "transform translate-x-0 bg-white border-[#e5e7eb]"
        )}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
        )}
      </div>
    </div>
  );
}

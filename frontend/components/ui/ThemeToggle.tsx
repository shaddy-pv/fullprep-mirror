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
        "flex items-center bg-white/[0.02] border border-white/[0.06] rounded-full p-1 cursor-pointer relative w-[72px] h-[40px] transition-colors duration-300 select-none",
        className
      )}
    >
      {/* Sun icon on left */}
      <Sun className={cn("w-4.5 h-4.5 absolute left-2.5 transition-opacity duration-350", isDark ? "text-[#9ca3af] opacity-100" : "text-white opacity-0")} />
      {/* Moon icon on right */}
      <Moon className={cn("w-4.5 h-4.5 absolute right-2.5 transition-opacity duration-350", isDark ? "text-white opacity-0" : "text-[#9ca3af] opacity-100")} />
      
      {/* Active slider thumb */}
      <div 
        className={cn(
          "w-[30px] h-[30px] rounded-full shadow-md border transition-all duration-300 ease-out flex items-center justify-center",
          isDark 
            ? "transform translate-x-[34px] bg-[#0b0f17] border-white/10" 
            : "transform translate-x-0 bg-white border-[#d1d5db]"
        )}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-brand-orange fill-brand-orange" />
        ) : (
          <Sun className="w-4 h-4 text-brand-orange fill-brand-orange" />
        )}
      </div>
    </div>
  );
}

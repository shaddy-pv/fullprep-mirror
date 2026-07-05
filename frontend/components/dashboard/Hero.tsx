"use client";

import React from "react";
import { ChevronRight, Trophy, Code2, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.name ? user.name.split(" ")[0] : "Coder";

  return (
    <div className="w-full bg-gradient-to-r from-[#fffbf8] via-[#fffefc] to-white dark:from-[#111827] dark:via-[#161f30] dark:to-[#111827] border border-border-card rounded-[24px] p-8 flex items-center justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] relative overflow-hidden h-[240px] shrink-0 transition-colors duration-300">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-gradient-to-br from-[#ffece0] via-[#f5edff] to-transparent dark:from-[#ff6a00]/8 dark:via-[#7c3aed]/5 opacity-60 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />

      {/* Left: Texts & Actions */}
      <div className="flex flex-col justify-center max-w-[500px] z-10">
        <h1 className="text-[28px] font-semibold text-text-primary leading-tight flex items-center gap-2 tracking-[-0.02em]">
          Welcome back, {firstName}! <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-[14px] text-text-secondary mt-2 font-medium leading-relaxed tracking-[-0.01em]">
          Let&apos;s continue your coding journey and build something amazing today.
        </p>

        <div className="flex items-center gap-4 mt-6">
          {/* Start Solving Button */}
          <Button 
            variant="primary" 
            className="py-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(255,106,0,0.55),_0_6px_16px_rgba(255,106,0,0.35)]"
            onClick={() => router.push("/problems")}
          >
            <span>Start Solving</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </Button>

          {/* Join Contest Button */}
          <Button 
            variant="secondary" 
            className="py-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-[2px] active:scale-[0.98] hover:border-brand-orange/40 hover:shadow-[0_0_15px_rgba(255,106,0,0.18)]"
            onClick={() => router.push("/contests")}
          >
            <span>Join Contest</span>
            <Trophy className="w-4 h-4 text-brand-orange" />
          </Button>
        </div>
      </div>

      {/* Right: State-of-the-Art Premium 3D-Style Illustration */}
      <div 
        className="relative w-[380px] h-[190px] flex items-center justify-center select-none z-10 mr-2"
        style={{ perspective: "1200px" }}
      >
        {/* Soft Radial Ambient Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-[#ffeedd]/70 via-[#f0e7ff]/30 to-transparent dark:from-[#ff6a00]/15 dark:via-[#7c3aed]/5 blur-[45px] pointer-events-none" />

        {/* Ambient Shadows underneath laptop base */}
        <div className="absolute bottom-[24px] left-[54px] w-[210px] h-[22px] bg-black/35 dark:bg-black/60 rounded-full blur-[14px] transform rotateX(85deg) skewX(-10deg) pointer-events-none" />
        <div className="absolute bottom-[22px] left-[40px] w-[240px] h-[26px] bg-[#ff6a00]/12 rounded-full blur-[18px] transform rotateX(85deg) skewX(-10deg) pointer-events-none" />

        {/* Floating Sparkles/Stars */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-20 top-2"
        >
          <svg className="w-4 h-4 text-[#ffb800]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </motion.div>
        
        <motion.div 
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-20 top-6"
        >
          <svg className="w-3.5 h-3.5 text-[#ffb800]/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </motion.div>

        {/* 3D Laptop Group */}
        <div 
          className="relative flex flex-col items-center transform-style-3d hover:scale-102 transition-transform duration-500"
          style={{ transform: "rotateY(-16deg) rotateX(10deg) rotateZ(-1deg)" }}
        >
          {/* Laptop Screen (Lid) - Angled backwards */}
          <div 
            className="w-[200px] h-[120px] bg-gradient-to-b from-[#3a3d4d] to-[#1e2029] rounded-[10px] border border-[#4d5166] p-[5px] relative shadow-2xl origin-bottom"
            style={{ 
              transform: "rotateX(-10deg)", 
              transformStyle: "preserve-3d",
              boxShadow: "0 -4px 10px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)"
            }}
          >
            {/* Camera dot & sensor */}
            <div className="w-1.5 h-1.5 bg-[#121316] rounded-full mx-auto mb-1 flex items-center justify-center">
              <div className="w-[3px] h-[3px] bg-[#0c4a6e] rounded-full" />
            </div>
            
            {/* Editor Screen Mockup */}
            <div className="w-full h-[98px] bg-[#0c0d12] rounded-md p-2 font-mono text-[6px] text-gray-500 overflow-hidden relative flex flex-col gap-[3.5px] border border-[#21232c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
              {/* Glossy Diagonal Glare across the screen */}
              <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none -translate-x-[50%] -translate-y-[50%] rotate-[20deg]" />

              {/* Editor Tabs bar */}
              <div className="flex gap-[4px] items-center mb-1 text-[5px] border-b border-[#1b1c24] pb-1 w-full">
                <div className="w-1.5 h-1.5 bg-[#ff5f56] rounded-full shadow-[0_0_2px_rgba(255,95,86,0.3)]" />
                <div className="w-1.5 h-1.5 bg-[#ffbd2e] rounded-full shadow-[0_0_2px_rgba(255,189,46,0.3)]" />
                <div className="w-1.5 h-1.5 bg-[#27c93f] rounded-full shadow-[0_0_2px_rgba(39,201,63,0.3)]" />
                <span className="text-[#a6adbb] ml-1 font-semibold tracking-wide">solution.cpp</span>
              </div>

              {/* Coding glowing lines */}
              <div className="flex gap-1"><span className="text-[#a78bfa] drop-shadow-[0_0_4px_rgba(167,139,250,0.2)]">#include</span> <span className="text-[#818cf8]">&lt;iostream&gt;</span></div>
              <div className="flex gap-1"><span className="text-[#fb7185] drop-shadow-[0_0_4px_rgba(251,113,133,0.2)]">using namespace</span> <span className="text-white">std;</span></div>
              <div className="flex gap-1 mt-0.5"><span className="text-[#60a5fa] drop-shadow-[0_0_4px_rgba(96,165,250,0.2)]">int</span> <span className="text-[#34d399] drop-shadow-[0_0_4px_rgba(52,211,153,0.2)]">findMaximum</span>(<span className="text-white">vector&lt;int&gt;&amp;</span> <span className="text-[#f472b6]">nums</span>) &#123;</div>
              <div className="pl-3 flex gap-1"><span className="text-[#f59e0b] drop-shadow-[0_0_4px_rgba(245,158,11,0.2)]">int</span> maxVal = nums[0];</div>
              <div className="pl-3 flex gap-1"><span className="text-[#fb923c] drop-shadow-[0_0_4px_rgba(251,146,60,0.2)]">for</span> (<span className="text-[#a78bfa]">int</span> i = 1; i &lt; nums.size(); i++) &#123;</div>
              <div className="pl-6 flex gap-1 text-[#f87171] drop-shadow-[0_0_4px_rgba(248,113,113,0.2)]">if (nums[i] &gt; maxVal) maxVal = nums[i];</div>
              <div className="pl-3">&#125;</div>
              <div className="pl-3 flex gap-1"><span className="text-[#a78bfa]">return</span> <span className="text-[#34d399] font-bold">maxVal</span>;</div>
              <div>&#125;</div>
            </div>
          </div>

          {/* Laptop Base (Keyboard & Trackpad) */}
          <div 
            className="w-[226px] h-[9px] bg-gradient-to-b from-[#e5e7eb] via-[#d1d5db] to-[#9ca3af] rounded-b-xl relative flex justify-center origin-top border-t border-white/60"
            style={{ 
              transform: "rotateX(75deg) translateY(-2px)", 
              transformStyle: "preserve-3d",
              boxShadow: "0 10px 20px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)"
            }}
          >
            {/* Keyboard matrix visual recess */}
            <div className="w-[180px] h-[5px] bg-[#1e2029] rounded-[2px] mt-1.5 flex flex-col justify-between p-[0.5px] border-b border-white/20">
              <div className="w-full h-[1px] bg-black/40" />
              <div className="w-full h-[1px] bg-black/40" />
            </div>

            {/* Trackpad recess */}
            <div className="w-18 h-[2.5px] bg-[#4b5563]/40 rounded-t-sm absolute bottom-0.5 shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.15)] border-t border-white/10" />
          </div>
          
          {/* Base bottom lip */}
          <div className="w-[208px] h-[3px] bg-[#6b7280] rounded-b-md shadow-md transform rotateX(75deg) translate-y-[-1px]" />
        </div>

        {/* Floating elements inside independent Framer Motion containers for rich depth layout */}
        {/* 1. Floating Orange Badges </> */}
        <motion.div 
          animate={{ y: [0, -7, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-8 top-12 z-30"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="w-[46px] h-[46px] bg-gradient-to-br from-[#ff8b3d] via-[#ff6a00] to-[#e04f00] rounded-2xl flex items-center justify-center text-white shadow-[0_12px_24px_-4px_rgba(255,106,0,0.4)] border border-white/20 relative">
            {/* Specification sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent rounded-2xl pointer-events-none" />
            <Code2 className="w-5 h-5 stroke-[2.5] drop-shadow-md" />
          </div>
        </motion.div>

        {/* 2. Floating Purple Braces Badge {} */}
        <motion.div 
          animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute right-6 top-[72px] z-30"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="w-[44px] h-[44px] bg-gradient-to-br from-brand-orange to-brand-orange/60 rounded-2xl flex items-center justify-center text-white font-mono font-bold text-xl shadow-[0_12px_24px_-4px_rgba(255,106,0,0.35)] border border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent rounded-2xl pointer-events-none" />
            <span className="drop-shadow-md">&#123;&#125;</span>
          </div>
        </motion.div>

        {/* 3. Floating Light Blue Sync/Reload Badge */}
        <motion.div 
          animate={{ y: [0, -5, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-14 bottom-[18px] z-30"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3730a3] rounded-xl flex items-center justify-center text-white shadow-[0_10px_20px_-3px_rgba(79,70,229,0.3)] border border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent rounded-xl pointer-events-none" />
            <RotateCw className="w-4 h-4 stroke-[2.5] drop-shadow-md" />
          </div>
        </motion.div>

        {/* 4. Realistic 3D Gold Championship Trophy */}
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="absolute right-[56px] bottom-[12px] z-40 flex flex-col items-center"
          style={{ transform: "translateZ(80px)" }}
        >
          {/* Trophy Stand / Pedestal - layered for 3D depth */}
          <div className="w-14 h-3.5 bg-gradient-to-b from-[#e5e7eb] via-[#d1d5db] to-[#9ca3af] rounded-[4px] border-t border-white/40 shadow-md flex items-center justify-center">
            <div className="w-12 h-[1px] bg-white/20 absolute top-[1px]" />
          </div>
          
          {/* Gold Trophy rendered as multiple layers */}
          <div className="relative w-14 h-14 flex items-center justify-center -mt-[38px]">
            {/* SVG Complex 3D Trophy Drawing */}
            <svg viewBox="0 0 100 100" className="w-[52px] h-[52px] drop-shadow-[0_12px_24px_rgba(230,120,0,0.5)]">
              <defs>
                {/* Gold specular metallic gradient */}
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff3bf" />
                  <stop offset="25%" stopColor="#fab005" />
                  <stop offset="50%" stopColor="#e8590c" />
                  <stop offset="75%" stopColor="#fab005" />
                  <stop offset="100%" stopColor="#d9480f" />
                </linearGradient>
                {/* Specular glare reflect */}
                <linearGradient id="glare" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="white" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Trophy handles */}
              <path d="M 22 26 C 8 26 8 50 25 50 Z" fill="url(#gold)" />
              <path d="M 24 30 C 14 30 14 46 25 46 Z" fill="#fff9db" opacity={0.3} />
              
              <path d="M 78 26 C 92 26 92 50 75 50 Z" fill="url(#gold)" />
              <path d="M 76 30 C 86 30 86 46 75 46 Z" fill="#fff9db" opacity={0.3} />

              {/* Pedestal connect neck */}
              <path d="M 42 66 L 58 66 L 54 84 L 46 84 Z" fill="url(#gold)" />
              
              {/* Cup bowl body */}
              <ellipse cx="50" cy="40" rx="28" ry="26" fill="url(#gold)" />
              
              {/* Specular highlights overlay for 3D glassy realism */}
              <path d="M 22 36 A 28 26 0 0 0 54 66 L 56 66 A 28 26 0 0 1 24 36 Z" fill="url(#glare)" />
              
              {/* Inner bowl shadow rim */}
              <ellipse cx="50" cy="20" rx="28" ry="6" fill="#f76707" />
              <ellipse cx="50" cy="20" rx="25" ry="4" fill="#862e01" />

              {/* Gold base flange */}
              <path d="M 32 84 L 68 84 L 72 94 L 28 94 Z" fill="url(#gold)" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

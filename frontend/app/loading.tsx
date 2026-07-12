"use client";

import React from "react";

export default function GlobalLoading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#06090f] text-brand-orange">
      <div className="flex flex-col items-center gap-4">
        {/* Glowing Logo */}
        <div className="animate-pulse flex items-center mb-4">
          <img src="/logo-horizontal-dark.png" alt="FullPrep" className="h-[96px] w-auto" />
        </div>
        <div className="w-8 h-8 border-4 border-white/[0.04] border-t-brand-orange rounded-full animate-spin" />
      </div>
    </div>
  );
}

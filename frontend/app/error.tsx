"use client";

import React from "react";
import Button from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#06090f] text-white p-6 select-none">
      <div className="max-w-md w-full text-center flex flex-col items-center p-8 bg-[#111217]/50 border border-white/[0.05] rounded-[24px] shadow-2xl backdrop-blur-xl">
        <div className="text-brand-orange text-3xl mb-4 font-mono">&lt;/&gt;</div>
        <h2 className="text-xl font-bold mb-2 tracking-tight">Something went wrong</h2>
        <p className="text-sm text-text-secondary mb-6 font-medium leading-relaxed">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

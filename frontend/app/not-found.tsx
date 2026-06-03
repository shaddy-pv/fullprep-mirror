"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#06090f] text-white p-6 select-none">
      <div className="max-w-md w-full text-center flex flex-col items-center p-8 bg-[#111217]/50 border border-white/[0.05] rounded-[24px] shadow-2xl backdrop-blur-xl">
        <div className="text-brand-orange text-4xl mb-4 font-mono font-bold">404</div>
        <h2 className="text-xl font-bold mb-2 tracking-tight">Page Not Found</h2>
        <p className="text-sm text-text-secondary mb-6 font-medium leading-relaxed">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button variant="primary">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

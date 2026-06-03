"use client";

import React from "react";
import Button from "@/components/ui/Button";

export default function SocialButtons() {
  return (
    <div className="w-full flex flex-col gap-4 mt-6">
      {/* Separator Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[1px] bg-border-card" />
        <span className="text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
          or continue with
        </span>
        <div className="flex-1 h-[1px] bg-border-card" />
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Google Login */}
        <Button
          type="button"
          variant="secondary"
          className="flex items-center justify-center gap-2 py-3.5 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors"
          onClick={() => {}}
        >
          {/* Google Color SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-[13px] font-semibold tracking-[-0.01em]">Google</span>
        </Button>

        {/* GitHub Login */}
        <Button
          type="button"
          variant="secondary"
          className="flex items-center justify-center gap-2 py-3.5 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors"
          onClick={() => {}}
        >
          {/* GitHub SVG */}
          <svg className="w-4 h-4 text-text-primary fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="text-[13px] font-semibold tracking-[-0.01em]">GitHub</span>
        </Button>
      </div>
    </div>
  );
}

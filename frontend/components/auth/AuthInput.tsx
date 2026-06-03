"use client";

import React, { ForwardedRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

const AuthInput = forwardRef(
  (
    { label, error, rightElement, className, type = "text", ...props }: AuthInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        <label className="text-[12.5px] font-semibold text-text-primary tracking-[-0.01em]">
          {label}
        </label>
        <div className="relative w-full">
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full bg-[#fcfcfa] dark:bg-[#0f1118]/60 border border-border-card text-text-primary placeholder-[#9ca3af]/70 focus:placeholder-[#9ca3af]/40 dark:placeholder-gray-600 dark:focus:placeholder-gray-700 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#ff6a00]/60 focus:ring-1 focus:ring-[#ff6a00]/30 transition-all duration-200",
              error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/20",
              rightElement ? "pr-11" : "pr-4",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-[11.5px] font-medium text-red-500/90 tracking-[-0.01em] mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;

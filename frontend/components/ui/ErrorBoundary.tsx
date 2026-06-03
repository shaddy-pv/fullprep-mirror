"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "./Button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-card-bg border border-border-card rounded-[24px] shadow-sm my-6 select-none transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mb-4 shrink-0 border border-red-100 dark:border-red-900/10">
            ⚠️
          </div>
          <h2 className="text-[16px] font-bold text-text-primary tracking-[-0.01em]">Something went wrong</h2>
          <p className="text-[13px] text-text-secondary mt-1 font-medium leading-relaxed max-w-[320px] mx-auto tracking-[-0.01em]">
            An unexpected visual rendering error occurred in this section.
          </p>
          <Button 
            variant="secondary" 
            className="mt-5 py-2.5 px-5"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

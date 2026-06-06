"use client";

import React, { useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revalidate session on boot
    AuthService.getCurrentUser().finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-page select-none">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
          <span className="text-[13px] font-semibold text-text-secondary">Verifying Session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

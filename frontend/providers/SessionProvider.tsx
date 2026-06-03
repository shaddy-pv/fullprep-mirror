"use client";

import React from "react";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <>{children}</>;
}

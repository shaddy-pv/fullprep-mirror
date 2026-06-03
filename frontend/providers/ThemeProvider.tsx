"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DashboardProvider } from "@/store/DashboardContext";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      {...props}
    >
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </NextThemesProvider>
  );
}

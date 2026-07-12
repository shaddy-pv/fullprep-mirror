"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useDashboard } from "@/store/DashboardContext";
import { useAuthStore } from "@/store/authStore";
import EmailVerificationOverlay from "../auth/EmailVerificationOverlay";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, sessionReady } = useAuthStore();
  const { 
    isSidebarCollapsed, 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen 
  } = useDashboard();

  useEffect(() => {
    // Only redirect AFTER the session check is complete.
    // If we redirect immediately (before sessionReady), we cause an infinite
    // loop because isAuthenticated starts as false on every page load.
    if (sessionReady && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, sessionReady, router]);

  // While session is being checked OR user is not authenticated, show nothing.
  // SessionProvider already shows a spinner during the check, so we just return null here.
  if (!sessionReady || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex w-full h-screen bg-bg-page text-text-primary overflow-hidden relative">
      <EmailVerificationOverlay />
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar (Standard on desktop, slide-over drawer on mobile) */}
      <div 
        className={`
          fixed md:relative z-50 md:z-auto h-full transition-all duration-300 ease-in-out shrink-0
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isSidebarCollapsed ? "w-[80px]" : "w-[270px]"}
        `}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-bg-page">
        {/* Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Body - Theme Adaptive Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 px-4 md:px-8 pt-6 pb-[120px] md:py-6 bg-bg-page text-text-primary transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

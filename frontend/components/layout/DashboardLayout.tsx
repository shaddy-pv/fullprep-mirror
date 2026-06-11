"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useDashboard } from "@/store/DashboardContext";
import EmailVerificationOverlay from "../auth/EmailVerificationOverlay";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { 
    isSidebarCollapsed, 
    setIsSidebarCollapsed, 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen 
  } = useDashboard();

  return (
    <div className="flex w-full h-screen bg-[#0b0f17] text-white overflow-hidden relative">
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
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#0b0f17]">
        {/* Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Body - Theme Adaptive Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-bg-page text-text-primary transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

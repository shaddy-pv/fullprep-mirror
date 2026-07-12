"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

export default function termsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Terms of Service" description="Please read these terms carefully before using FullPrep.">
          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">
            
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
        <p className="mb-6">By accessing and using FullPrep, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">2. Description of Service</h2>
        <p className="mb-6">FullPrep is a platform for interview preparation, competitive programming, and AI-assisted learning. We provide coding environments, problems, leaderboards, and AI hints.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">3. User Conduct</h2>
        <p className="mb-6">You agree not to use the service for any illegal purposes or to conduct any activity that would violate the rights of others. Plagiarism in contests or public submissions is strictly prohibited and will result in account termination.</p>
        
        <div className="bg-slate-100 dark:bg-white/[0.03] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] mt-8">
          <p className="text-sm font-medium">Last updated: July 2026. If you have any questions about these terms, please contact us at legal@fullprep.com.</p>
        </div>
      </div>
    
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

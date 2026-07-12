"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

export default function privacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Privacy Policy" description="How we collect, use, and protect your data.">
          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">
            
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">1. Information We Collect</h2>
        <p className="mb-6">We collect information you provide directly to us when you create an account, participate in contests, or submit code. This includes your name, email, GitHub profile, and code submissions.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">2. How We Use Your Data</h2>
        <p className="mb-6">We use the information we collect to provide, maintain, and improve our services, to personalize your experience (such as AI recommendations), and to maintain the integrity of our contest leaderboards.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">3. Data Security</h2>
        <p className="mb-6">We implement appropriate technical and organizational measures to protect the security of your personal information. Your code submissions are stored securely and evaluated in isolated sandboxes.</p>
        
        <div className="bg-slate-100 dark:bg-white/[0.03] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] mt-8">
          <p className="text-sm font-medium">We never sell your personal data to third parties. For privacy inquiries, email privacy@fullprep.com.</p>
        </div>
      </div>
    
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

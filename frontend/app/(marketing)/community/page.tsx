"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

export default function communityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Community Guidelines" description="Join thousands of developers leveling up together.">
          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">
            
      <div className="flex flex-col md:flex-row gap-8 items-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-8 rounded-3xl mb-12">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300 mb-4">Join our Discord Server</h2>
          <p className="text-indigo-700 dark:text-indigo-200/80 mb-6">Discuss problems, participate in mock interviews, and connect with other engineers.</p>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
            Connect to Discord
          </button>
        </div>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Code of Conduct</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Be Respectful:</strong> Treat everyone with kindness. Harassment or toxic behavior will not be tolerated.</li>
          <li><strong>No Cheating:</strong> Do not share solutions during active contests.</li>
          <li><strong>Constructive Feedback:</strong> When reviewing others&apos; code, be helpful and constructive.</li>
        </ul>
      </div>
    
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

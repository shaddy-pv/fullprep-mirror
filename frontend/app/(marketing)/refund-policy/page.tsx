"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

export default function refundpolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Refund Policy" description="Our fair and transparent refund guidelines.">
          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">
            
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 p-6 rounded-2xl mb-8">
          <h3 className="text-lg font-bold mb-2">14-Day Money-Back Guarantee</h3>
          <p>We stand behind the quality of FullPrep Premium. If you&apos;re not satisfied, we offer a full refund within 14 days of your initial purchase.</p>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Eligibility</h2>
        <p className="mb-6">To be eligible for a refund, you must request it within 14 days of your original purchase date. Refunds are not available for renewal payments unless explicitly requested within 48 hours of the renewal.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">How to Request</h2>
        <p className="mb-6">Please email billing@fullprep.com from the email address associated with your account. Include your receipt or transaction ID. Refunds typically process within 5-10 business days.</p>
      </div>
    
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

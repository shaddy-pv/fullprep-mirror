"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

export default function cookiepolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Cookie Policy" description="Understanding how we use cookies to improve your experience.">
          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">
            
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">What are cookies?</h2>
        <p className="mb-6">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">How we use cookies</h2>
        <p className="mb-6">We use cookies primarily for authentication (keeping you logged in) and storing your preferences (such as your chosen dark/light theme and IDE settings).</p>
        
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Essential Cookies:</strong> Required for the platform to function (e.g., session tokens).</li>
          <li><strong>Preference Cookies:</strong> Remember your settings and UI choices.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform.</li>
        </ul>
      </div>
    
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

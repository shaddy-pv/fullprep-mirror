"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

export default function helpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />
      <main className="flex-grow">
        <PremiumPageWrapper title="Help Center" description="How can we assist you today?">
          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">
            
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          { title: 'Account Settings', desc: 'Manage your profile, password, and email.' },
          { title: 'Billing & Subscriptions', desc: 'Upgrade, downgrade, or cancel your plan.' },
          { title: 'Contests', desc: 'Rules, ratings, and submission guidelines.' },
          { title: 'Technical Support', desc: 'Report bugs or IDE execution issues.' }
        ].map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] p-6 rounded-2xl hover:border-brand-orange/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/[0.06] p-8 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Still need help?</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Our support team is available 24/7 to assist you.</p>
        <a href="mailto:shivkush512@gmail.com" className="inline-flex items-center justify-center px-6 py-3 bg-brand-orange text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
          Contact Support
        </a>
      </div>
    
          </div>
        </PremiumPageWrapper>
      </main>
      <Footer />
    </div>
  );
}

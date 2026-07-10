const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'terms', title: 'Terms & Conditions' },
  { path: 'privacy', title: 'Privacy Policy' },
  { path: 'cookie-policy', title: 'Cookie Policy' },
  { path: 'refund-policy', title: 'Refund Policy' },
  { path: 'help', title: 'Help Center' },
  { path: 'faq', title: 'Frequently Asked Questions' },
  { path: 'community', title: 'Community' },
];

const template = (title) => `"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function StaticPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#050816]">
      <Navbar />

      <main className="flex-grow pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              ${title}
            </h1>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4">
              <p>This page is currently being updated. Please check back later for the full ${title}.</p>
              <p>If you have any urgent inquiries, please contact our support team.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
`;

pages.forEach(p => {
  const dir = path.join(__dirname, 'frontend', 'app', '(public)', p.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(p.title));
});
console.log('Static pages generated successfully!');

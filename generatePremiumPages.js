const fs = require('fs');
const path = require('path');

const MARKETING_DIR = path.join(__dirname, 'frontend', 'app', '(marketing)');

const pages = {
  'terms': {
    title: 'Terms of Service',
    description: 'Please read these terms carefully before using FullPrep.',
    content: `
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
    `
  },
  'privacy': {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your data.',
    content: `
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
    `
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    description: 'Understanding how we use cookies to improve your experience.',
    content: `
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
    `
  },
  'refund-policy': {
    title: 'Refund Policy',
    description: 'Our fair and transparent refund guidelines.',
    content: `
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 p-6 rounded-2xl mb-8">
          <h3 className="text-lg font-bold mb-2">14-Day Money-Back Guarantee</h3>
          <p>We stand behind the quality of FullPrep Premium. If you're not satisfied, we offer a full refund within 14 days of your initial purchase.</p>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Eligibility</h2>
        <p className="mb-6">To be eligible for a refund, you must request it within 14 days of your original purchase date. Refunds are not available for renewal payments unless explicitly requested within 48 hours of the renewal.</p>
        
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">How to Request</h2>
        <p className="mb-6">Please email billing@fullprep.com from the email address associated with your account. Include your receipt or transaction ID. Refunds typically process within 5-10 business days.</p>
      </div>
    `
  },
  'help': {
    title: 'Help Center',
    description: 'How can we assist you today?',
    content: `
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
        <a href="mailto:support@fullprep.com" className="inline-flex items-center justify-center px-6 py-3 bg-brand-orange text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
          Contact Support
        </a>
      </div>
    `
  },
  'community': {
    title: 'Community Guidelines',
    description: 'Join thousands of developers leveling up together.',
    content: `
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
          <li><strong>Constructive Feedback:</strong> When reviewing others' code, be helpful and constructive.</li>
        </ul>
      </div>
    `
  }
};

Object.entries(pages).forEach(([slug, data]) => {
  const pagePath = path.join(MARKETING_DIR, slug, 'page.tsx');
  
  const componentName = slug.replace(/-/g, '').replace(/^\\w/, c => c.toUpperCase());
  
  const content = '"use client";\n' +
    'import React from "react";\n' +
    'import Navbar from "@/components/landing/Navbar";\n' +
    'import Footer from "@/components/landing/Footer";\n' +
    'import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";\n\n' +
    'export default function ' + componentName + 'Page() {\n' +
    '  return (\n' +
    '    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">\n' +
    '      <Navbar />\n' +
    '      <main className="flex-grow pt-20">\n' +
    '        <PremiumPageWrapper title="' + data.title + '" description="' + data.description + '">\n' +
    '          <div className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 md:p-12 shadow-xl backdrop-blur-sm">\n' +
    '            ' + data.content + '\n' +
    '          </div>\n' +
    '        </PremiumPageWrapper>\n' +
    '      </main>\n' +
    '      <Footer />\n' +
    '    </div>\n' +
    '  );\n' +
    '}\n';

  if (fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, content);
    console.log('Updated ' + slug);
  }
});

const faqPath = path.join(MARKETING_DIR, 'faq', 'page.tsx');
const faqContent = '"use client";\n' +
  'import React, { useState } from "react";\n' +
  'import Navbar from "@/components/landing/Navbar";\n' +
  'import Footer from "@/components/landing/Footer";\n' +
  'import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";\n' +
  'import { motion, AnimatePresence } from "framer-motion";\n' +
  'import { ChevronDown } from "lucide-react";\n\n' +
  'const faqs = [\n' +
  '  { q: "Is FullPrep really free?", a: "Yes, our core problem set and basic contests are completely free. We offer a Premium plan that unlocks AI hints, video editorials, and unlimited submissions." },\n' +
  '  { q: "How does the AI Tutor work?", a: "Our AI Tutor analyzes your code in real-time. Instead of giving you the answer, it provides Socratic hints to guide you toward the solution, helping you actually learn the concepts." },\n' +
  '  { q: "What programming languages are supported?", a: "We currently support Python, JavaScript, TypeScript, C++, Java, and Go in our execution environment." },\n' +
  '  { q: "Can I use FullPrep to prepare for FAANG interviews?", a: "Absolutely! Our learning paths are specifically tailored around patterns (like Sliding Window, Two Pointers, DP) that are frequently asked at top tech companies." }\n' +
  '];\n\n' +
  'export default function FaqPage() {\n' +
  '  const [openIndex, setOpenIndex] = useState<number | null>(0);\n' +
  '  return (\n' +
  '    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">\n' +
  '      <Navbar />\n' +
  '      <main className="flex-grow pt-20">\n' +
  '        <PremiumPageWrapper title="Frequently Asked Questions" description="Everything you need to know about the product and billing.">\n' +
  '          <div className="max-w-3xl mx-auto space-y-4">\n' +
  '            {faqs.map((faq, index) => (\n' +
  '              <div key={index} className="bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-sm">\n' +
  '                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left">\n' +
  '                  <span className="text-lg font-medium text-slate-900 dark:text-white">{faq.q}</span>\n' +
  '                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}>\n' +
  '                    <ChevronDown className="w-5 h-5 text-slate-500" />\n' +
  '                  </motion.div>\n' +
  '                </button>\n' +
  '                <AnimatePresence>\n' +
  '                  {openIndex === index && (\n' +
  '                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>\n' +
  '                      <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">{faq.a}</div>\n' +
  '                    </motion.div>\n' +
  '                  )}\n' +
  '                </AnimatePresence>\n' +
  '              </div>\n' +
  '            ))}\n' +
  '          </div>\n' +
  '        </PremiumPageWrapper>\n' +
  '      </main>\n' +
  '      <Footer />\n' +
  '    </div>\n' +
  '  );\n' +
  '}\n';

if (fs.existsSync(faqPath)) {
  fs.writeFileSync(faqPath, faqContent);
  console.log('Updated faq');
}

console.log('Premium static pages generated.');

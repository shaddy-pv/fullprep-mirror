"use client";

import React from "react";
import Link from "next/link";
import { 
  Code2, 
  Trophy, 
  Sparkles, 
  Activity,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

// Premium Custom Brand SVG Icons (Zero dependency warnings)
const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
);

export default function Footer() {
  const features = [
    { label: "Practice Problems", icon: Code2 },
    { label: "Contests & Rankings", icon: Trophy },
    { label: "AI-Powered Hints", icon: Sparkles },
    { label: "Track & Improve", icon: Activity }
  ];

  const sections = [
    {
      title: "Platform",
      links: [
        { label: "Overview", href: "/" },
        { label: "Problems", href: "/problems" },
        { label: "Contests", href: "/contests" },
        { label: "AI Hints", href: "/ai-hints" },
        { label: "Learning Paths", href: "/learning-paths" },
        { label: "Submissions", href: "/submissions" },
        { label: "Leaderboard", href: "/leaderboard" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "#" },
        { label: "Documentation", href: "#" },
        { label: "Editorials", href: "#" },
        { label: "Roadmap", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "Status", href: "#" },
        { label: "Help Center", href: "#" }
      ]
    },
    {
      title: "Community",
      links: [
        { label: "Discussions", href: "#" },
        { label: "Discord Server", href: "#" },
        { label: "Top Contributors", href: "/leaderboard" },
        { label: "Hall of Fame", href: "#" },
        { label: "Community Rules", href: "#" },
        { label: "Events", href: "#" },
        { label: "Feedback", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Code of Conduct", href: "#" },
        { label: "Refund Policy", href: "#" },
        { label: "DMCA", href: "#" },
        { label: "Contact Us", href: "#" }
      ]
    }
  ];

  const socialLinks = [
    { icon: GithubIcon, href: "#", label: "GitHub" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: DiscordIcon, href: "#", label: "Discord" },
    { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Mail" }
  ];

  return (
    <footer className="w-full mt-10 mb-2 select-none">
      <div className="w-full bg-white dark:bg-[#050816] dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_55%)] border border-slate-200 dark:border-white/[0.06] rounded-[32px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] p-6 md:p-8 transition-all duration-300 relative overflow-hidden text-left">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 xl:gap-6 pb-8 border-b border-slate-200 dark:border-white/[0.06]">
          
          {/* Column 1: Brand & About */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-extrabold font-mono text-brand-orange">&lt;/&gt;</span>
              <span className="text-[16px] font-bold tracking-[-0.02em] text-[#111827] dark:text-white">
                FullPrep
              </span>
            </div>

            {/* Description */}
            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-white/60 font-medium">
              Master coding interviews, competitive programming, and AI-powered learning — all in one platform.
            </p>

            {/* Feature List */}
            <div className="flex flex-col gap-2 mt-1.5">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:bg-white/[0.03] dark:hover:bg-white/[0.03] hover:border-orange-500/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="text-[12.5px] font-semibold text-slate-500 dark:text-white/60 transition-colors duration-200">
                      {feat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columns 2-5: Nav sections */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:col-span-4 gap-8">
            {sections.map((sect, sIdx) => (
              <div key={sIdx} className="flex flex-col gap-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800 dark:text-white/85 leading-none select-none">
                  {sect.title}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {sect.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        href={link.href}
                        className="inline-block text-[13px] font-medium text-slate-500 dark:text-white/60 hover:text-brand-orange dark:hover:text-brand-orange hover:translate-x-1 transition-all duration-300 ease-out leading-none"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 text-[12px] font-medium text-slate-400 dark:text-white/40 leading-none select-none">
          {/* Copyright text */}
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left leading-relaxed">
            <span>© 2025 FullPrep. All rights reserved.</span>
            <span className="hidden md:inline text-slate-200 dark:text-white/[0.06]">|</span>
            <span className="italic text-slate-400 dark:text-white/40">“Made with passion for developers”</span>
          </div>

          {/* Social Icons list */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a 
                  key={idx} 
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/[0.04] bg-slate-100/50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-white/40 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:text-orange-400 hover:shadow-[0_0_18px_rgba(249,115,22,0.22)] shrink-0 shadow-sm"
                >
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

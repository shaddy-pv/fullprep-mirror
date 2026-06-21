"use client";

import React from "react";
import { MessageSquare, Heart } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

interface SocialLink {
  icon: React.ComponentType<IconProps>;
  href: string;
  label: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// ─── Inline SVG icon components (module-level, never re-created) ─────────────
const GithubIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <path d="m10 15 5-3-5-3v6z" />
  </svg>
);

const TwitterXIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={size} height={size} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ size, ...props }: IconProps) => (
  <MessageSquare size={size} {...props} />
);

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
// currentYear computed once at module load, not on every render
const CURRENT_YEAR = new Date().getFullYear();

const SOCIAL_LINKS: SocialLink[] = [
  { icon: GithubIcon,   href: "https://github.com/fullprep",            label: "GitHub" },
  { icon: LinkedinIcon, href: "https://linkedin.com/company/fullprep",  label: "LinkedIn" },
  { icon: DiscordIcon,  href: "https://discord.gg/fullprep",            label: "Discord" },
  { icon: YoutubeIcon,  href: "https://youtube.com/c/fullprep",         label: "YouTube" },
  { icon: TwitterXIcon, href: "https://x.com/fullprep",                 label: "X (Twitter)" },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About Us",    href: "#about" },
      { label: "Careers",     href: "#" },
      { label: "Our Team",    href: "#" },
      { label: "Contact Us",  href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Problems",       href: "#" },
      { label: "Contests",       href: "#" },
      { label: "Learning Paths", href: "#" },
      { label: "AI Hints",       href: "#" },
      { label: "Blog",           href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "#" },
      { label: "Privacy Policy",     href: "#" },
      { label: "Cookie Policy",      href: "#" },
      { label: "Refund Policy",      href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center",  href: "#" },
      { label: "FAQs",         href: "#" },
      { label: "Community",    href: "#" },
      { label: "Report a Bug", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] dark:bg-[#050816] text-[#0F172A] dark:text-gray-100 border-t border-slate-200/50 dark:border-[rgba(255,255,255,0.06)] pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.06)]">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4">
            <span className="flex items-center text-xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans cursor-default">
              <span className="mr-2 flex items-center justify-center font-mono text-[#FF6B00] font-bold text-2xl">
                &lt;/&gt;
              </span>
              FullPrep
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Empowering developers to become problem solvers and build exceptional careers.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap gap-1 pt-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#FF6B00] dark:hover:text-white transition-colors duration-200 truncate block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-500 dark:text-slate-500 gap-4 sm:gap-0">
          <div>
            &copy; {CURRENT_YEAR} FullPrep. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart size={12} className="text-[#FF6B00] fill-[#FF6B00]" />
            <span>for developers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

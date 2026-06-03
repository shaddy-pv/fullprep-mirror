"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface PublicLayoutProps {
  children: React.ReactNode;
}

function PublicNavbar() {
  return (
    <header className="h-[76px] bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/[0.06] px-8 flex items-center justify-between transition-colors duration-300 relative z-30 select-none text-text-primary w-full">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-[18px] font-extrabold font-mono text-brand-orange">&lt;/&gt;</span>
        <span className="text-[16px] font-bold tracking-[-0.02em] text-[#111827] dark:text-white">
          FullPrep
        </span>
      </Link>

      {/* Center: Public Links */}
      <nav className="hidden md:flex items-center gap-8">
        {[
          { label: "Overview", href: "/" },
          { label: "About", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "Documentation", href: "#" },
          { label: "Blog", href: "#" }
        ].map((link, idx) => (
          <Link 
            key={idx}
            href={link.href}
            className="text-[13px] font-semibold text-text-secondary hover:text-brand-orange transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right: Theme Toggle & Dashboard CTA */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link 
          href="/login"
          className="flex items-center justify-center bg-brand-orange hover:bg-[#e05d00] text-white rounded-xl px-4.5 py-2.5 text-[12px] font-bold shadow-md shadow-brand-orange/15 transition-all duration-200 cursor-pointer h-[36px] leading-none"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg-page text-text-primary transition-colors duration-300 select-none">
      <PublicNavbar />
      <main className="flex-1 w-full max-w-[1300px] mx-auto px-6 py-10">
        {children}
      </main>
      <div className="w-full max-w-[1300px] mx-auto px-6">
        <Footer />
      </div>
    </div>
  );
}

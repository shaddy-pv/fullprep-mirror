"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactLink {
  icon: React.ElementType;
  label: string;
  display: string;
  href: string;
}

interface Particle {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  maxOpacity: number;
}

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
const INITIAL_FORM: FormData = { name: "", email: "", subject: "", message: "" };

const CONTACT_LINKS: ContactLink[] = [
  {
    icon: Mail,
    label: "Email",
    display: "shivkush512@gmail.com",
    href: "mailto:shivkush512@gmail.com",
  },
  {
    icon: MessageSquare,
    label: "Discord Community",
    display: "discord.gg/fullprep",
    href: "https://discord.gg/fullprep",
  },
  {
    icon: MapPin,
    label: "Address",
    display: "Noida, Uttar Pradesh, India",
    href: "#",
  },
];

// Pre-computed particle positions (G2: no runtime math loops in render)
const PARTICLES: Particle[] = [
  { cx: 45,  cy: 170, r: 1.2, delay: 0,   maxOpacity: 0.15 },
  { cx: 275, cy: 195, r: 1.0, delay: 1,   maxOpacity: 0.12 },
  { cx: 70,  cy: 80,  r: 0.8, delay: 2,   maxOpacity: 0.18 },
  { cx: 285, cy: 110, r: 1.5, delay: 0.5, maxOpacity: 0.10 },
  { cx: 120, cy: 55,  r: 0.9, delay: 1.5, maxOpacity: 0.14 },
  { cx: 190, cy: 140, r: 1.1, delay: 2.5, maxOpacity: 0.16 },
];

// Framer Motion variants defined outside component (G2)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

export default function Contact() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      await fetch(`${baseUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error("Failed to send contact message", err);
    }

    setSubmitted(true);
    setFormData(INITIAL_FORM);
  }, [formData]);

  const resetForm = useCallback(() => setSubmitted(false), []);

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="py-24 bg-[#FAFAFA] dark:bg-[#050816] text-[#0F172A] dark:text-gray-100 scroll-mt-16 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h2 id="contact-title" className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] mb-2">
            CONTACT US
          </h2>
          <p className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.04em] leading-[1.05] text-[#0F172A] dark:text-white font-sans">
            Have questions? We&apos;re here to help.
          </p>
        </div>

        {/* 3-column layout: Form | Links | Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* ── Column 1: Form ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-5"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 space-y-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Send size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Message Sent!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-[1.8] font-normal">
                  Thank you for reaching out. Our support team will get back to you within 24 hours.
                </p>
                <button
                  onClick={resetForm}
                  className="text-xs font-semibold text-[#FF6B00] hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-start">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full rounded-lg border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent px-4 py-3.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all duration-200"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      className="w-full rounded-lg border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent px-4 py-3.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all duration-200"
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    className="w-full rounded-lg border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent px-4 py-3.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all duration-200"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    className="w-full rounded-lg border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent px-4 py-3.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all duration-200 resize-none"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-start">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#E56000] active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(255,107,0,0.25)] cursor-pointer"
                  >
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>

          {/* ── Column 2: Contact Links ── */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Get in Touch</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-[1.8] font-normal">
                We&apos;d love to hear from you. Reach out through any of the following.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {CONTACT_LINKS.map((link) => (
                <div key={link.label} className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.05)]">
                    <link.icon size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-[#0F172A] dark:text-white uppercase leading-none">
                      {link.label}
                    </span>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#FF6B00] transition-colors mt-1 block truncate"
                    >
                      {link.display}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Column 3: SVG Illustration ── */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] md:max-w-[420px] aspect-[4/3.2] flex items-center justify-center pt-12 pb-6">
              {/* Light mode aura */}
              <div className="absolute w-48 h-48 bg-gradient-to-tr from-orange-100/40 to-transparent blur-2xl rounded-full dark:hidden pointer-events-none" />

              <svg
                className="w-full h-full relative z-10 overflow-visible"
                viewBox="0 0 320 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-labelledby="contact-illustration-title"
              >
                <title id="contact-illustration-title">Interactive Paper Airplane and Coding Document Illustration</title>
                <defs>
                  <radialGradient id="localEnvelopeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="envelopeFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF8A1C" />
                    <stop offset="50%" stopColor="#FF6B00" />
                    <stop offset="100%" stopColor="#E85D00" />
                  </linearGradient>
                  <linearGradient id="envelopeSideGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7C1E" />
                    <stop offset="100%" stopColor="#E05300" />
                  </linearGradient>
                  <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--doc-stop-1)" />
                    <stop offset="100%" stopColor="var(--doc-stop-2)" />
                  </linearGradient>
                  <linearGradient id="glassBorderGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--doc-border-start)" />
                    <stop offset="100%" stopColor="var(--doc-border-end)" />
                  </linearGradient>
                  <filter id="shadowBlur8" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                  <filter id="foldShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" />
                  </filter>
                  <filter id="shadowBlur30" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" />
                  </filter>
                </defs>

                <style>{`
                  :root {
                    --doc-stop-1: #ffffff;
                    --doc-stop-2: #f8fafc;
                    --doc-border-start: #e2e8f0;
                    --doc-border-end: #cbd5e1;
                    --doc-top-highlight: #ffffff;
                    --doc-line: #64748b;
                    --envelope-shadow: drop-shadow(0 10px 20px rgba(0,0,0,0.15));
                    --plane-shadow: drop-shadow(0 6px 12px rgba(255,107,0,0.2));
                  }
                  .dark, :host-context(.dark), :global(.dark) {
                    --doc-stop-1: #ffffff;
                    --doc-stop-2: #f1f5f9;
                    --doc-border-start: #cbd5e1;
                    --doc-border-end: #94a3b8;
                    --doc-top-highlight: #ffffff;
                    --doc-line: #475569;
                    --envelope-shadow: drop-shadow(0 15px 30px rgba(0,0,0,0.55));
                    --plane-shadow: drop-shadow(0 8px 16px rgba(255,107,0,0.3));
                  }
                  @keyframes pathDraw { to { stroke-dashoffset: -20; } }
                  .animate-dashed-path { stroke-dasharray: 4, 6; animation: pathDraw 1.5s linear infinite; }
                `}</style>

                {/* Envelope glow */}
                <circle cx="160" cy="219" r="65" fill="url(#localEnvelopeGlow)" pointerEvents="none" />

                {/* Left swirl */}
                <path d="M 55 215 C 40 215, 30 200, 42 185 C 55 170, 70 185, 60 200" className="stroke-slate-300 dark:stroke-orange-500/20" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx="34" cy="195" r="1" fill="#FF6B00" fillOpacity="0.2" />

                {/* Right swirl */}
                <path d="M 265 220 C 280 220, 290 205, 278 190 C 265 175, 250 190, 260 205" className="stroke-slate-300 dark:stroke-orange-500/20" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx="282" cy="200" r="1" fill="#FF6B00" fillOpacity="0.2" />

                {/* Flight path */}
                <path d="M 180 175 C 220 185, 275 160, 275 120 C 275 80, 230 70, 220 95 C 210 120, 250 130, 260 100 C 270 65, 220 50, 175 60" className="animate-dashed-path stroke-slate-300 dark:stroke-white/20" strokeWidth="1.5" strokeLinecap="round" />

                {/* Envelope shadow */}
                <ellipse cx="160" cy="274" rx="66" ry="4" fill="black" fillOpacity="0.22" filter="url(#shadowBlur8)" />

                {/* Plane glow */}
                <ellipse cx="160" cy="60" rx="30" ry="25" fill="#FF6B00" fillOpacity="0.12" filter="url(#shadowBlur30)" pointerEvents="none" />

                {/* Envelope back */}
                <g transform="translate(78, 166)" style={{ filter: "var(--envelope-shadow)" }}>
                  <rect width="164" height="106" rx="8" fill="#803000" />
                </g>

                {/* Floating letter document */}
                <motion.g
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <g transform="translate(102, 102)">
                    <path d="M 5 0 L 55 0 L 62 7 L 111 7 C 113.8 7 116 9.2 116 12 L 116 134 C 116 136.8 113.8 139 111 139 L 5 139 C 2.2 139 0 136.8 0 134 L 0 5 C 0 2.2 2.2 0 5 0 Z" fill="url(#glassGrad)" stroke="url(#glassBorderGrad)" strokeWidth="1" />
                    <path d="M 0 12 L 0 5 C 0 2.2 2.2 0 5 0 L 55 0 L 62 7 L 111 7 C 113.8 7 116 9.2 116 12" stroke="var(--doc-top-highlight)" strokeWidth="1" fill="none" />
                    <line x1="20" y1="42" x2="70"  y2="42"  stroke="var(--doc-line)" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
                    <line x1="20" y1="58" x2="100" y2="58"  stroke="var(--doc-line)" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
                    <line x1="20" y1="74" x2="60"  y2="74"  stroke="var(--doc-line)" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
                  </g>
                </motion.g>

                {/* Envelope front flaps */}
                <g transform="translate(78, 166)" style={{ filter: "var(--envelope-shadow)" }}>
                  <path d="M 0 0 L 82 58 L 0 106 Z"   fill="url(#envelopeSideGrad)" />
                  <path d="M 164 0 L 82 58 L 164 106 Z" fill="url(#envelopeSideGrad)" />
                  <path d="M 0 0 L 82 58 L 164 0" stroke="black" strokeWidth="2" strokeOpacity="0.15" fill="none" filter="url(#foldShadowBlur)" />
                  <path d="M 0 0 L 82 58 L 164 0" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
                  <path d="M 0 106 L 64 68 Q 82 52 100 68 L 164 106" stroke="black" strokeWidth="3" strokeOpacity="0.25" fill="none" filter="url(#foldShadowBlur)" />
                  <path d="M 0 106 L 64 68 Q 82 52 100 68 L 164 106 Z" fill="url(#envelopeFrontGrad)" />
                  <path d="M 0 106 L 64 68 Q 82 52 100 68 L 164 106" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" fill="none" />
                </g>

                {/* Floating paper plane */}
                <g transform="translate(160, 50) rotate(-18) scale(1.65)">
                  <motion.g
                    animate={{ y: [0, -8, 0], x: [0, 4, 0], rotate: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    style={{ filter: "var(--plane-shadow)" }}
                  >
                    <path d="M 0 14 L 29 0 L 13 29 L 10 18 Z" fill="#FF6B00" />
                    <path d="M 29 0 L 10 18 L 13 29 Z"          fill="#D95B00" />
                    <path d="M 0 14 L 29 0 L 10 18 Z"           fill="#FF7B1A" />
                  </motion.g>
                </g>

                {/* Floating particles — deliberate Framer Motion loops (G2 compliant) */}
                {PARTICLES.map((p, idx) => (
                  <motion.circle
                    key={idx}
                    cx={p.cx}
                    cy={p.cy}
                    r={p.r}
                    fill="#FF6B00"
                    animate={{ y: [0, -10, 0], x: [0, 5, 0], opacity: [0.03, p.maxOpacity, 0.03] }}
                    transition={{ duration: 6 + idx * 1.5, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                    className="drop-shadow-[0_0_2px_rgba(255,107,0,0.3)]"
                  />
                ))}
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

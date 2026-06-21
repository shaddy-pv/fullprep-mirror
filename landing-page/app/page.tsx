import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import WhyFullPrep from "@/components/WhyFullPrep";
import Features from "@/components/Features";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { ArrowRight, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "FullPrep - Interactive Code Editor & DSA Preparation for Technical Interviews",
  description: "Master Data Structures and Algorithms with FullPrep. Learn with interactive code editors, get AI-powered hints, participate in weekly contests, and crack technical interviews at top tech companies.",
  keywords: [
    "DSA Preparation",
    "Crack Technical Interviews",
    "Interactive Code Editor",
    "Data Structures and Algorithms",
    "AI Hints Coding",
    "LeetCode Solutions",
    "Technical Placement Preparation",
    "Online Coding Judge"
  ],
  openGraph: {
    title: "FullPrep - Interactive Code Editor & DSA Preparation",
    description: "Learn, practice, and master Data Structures and Algorithms with AI-powered hints and real-time progress tracking.",
    url: "https://fullprep.dev",
    siteName: "FullPrep",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://fullprep.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "FullPrep Interactive Coding Platform and DSA Preparation Dashboard"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FullPrep - Interactive Code Editor & DSA Preparation",
    description: "Master Data Structures and Algorithms with AI-powered hints and weekly coding contests.",
    images: ["https://fullprep.dev/og-image.png"],
  },
  metadataBase: new URL("https://fullprep.dev"),
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <Stats />
        <WhyFullPrep />
        <Features />
        <About />
        <Contact />

        {/* Bottom CTA Banner (Ready to Level Up) */}
        <section aria-labelledby="cta-title" className="py-16 bg-[#FAFAFA] dark:bg-[#050816] border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white dark:bg-[#0B0F26] py-8 md:py-10 px-8 md:px-12 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl dark:shadow-none">
              
              {/* Left Group: Badge + Text */}
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 max-w-2xl">
                {/* Premium Graduation Cap Badge */}
                <div className="rounded-full h-14 w-14 flex items-center justify-center shrink-0 bg-orange-500/10 border border-orange-500/20 drop-shadow-[0_0_10px_rgba(255,107,0,0.25)]">
                  <GraduationCap className="h-6 w-6 text-[#FF6B00] stroke-[2]" />
                </div>
                
                {/* Text */}
                <div className="space-y-1">
                  <h2 id="cta-title" className="text-2xl font-extrabold tracking-[-0.04em] leading-[1.05] text-slate-900 dark:text-white sm:text-3xl font-sans">
                    Ready to level up your coding skills?
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Join thousands of learners and start your journey today.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 justify-center sm:justify-start lg:justify-end">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl bg-[#FF6B00] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#E56000] transition-all duration-200 shadow-lg shadow-orange-500/20 group cursor-pointer"
                >
                  Start Solving
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-6 py-3.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Create Free Account
                </a>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

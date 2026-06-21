"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  id: string;
}

// ─── Static data hoisted to module scope (G2: zero re-computation on render) ───
const NAV_ITEMS: NavItem[] = [
  { label: "Home",         href: "#home",         id: "home" },
  { label: "Why FullPrep", href: "#why-fullprep",  id: "why-fullprep" },
  { label: "About",        href: "#about",         id: "about" },
  { label: "Contact",      href: "#contact",       id: "contact" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  // G3: mounted guard prevents hydration mismatch on theme-dependent UI
  const [mounted, setMounted] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => { setMounted(true); }, []);

  // G3: useCallback prevents new function reference on every render,
  // allowing correct cleanup in the scroll listener effect.
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 100;
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(item.id);
          break;
        }
      }
    }
  }, []); // no dependencies — NAV_ITEMS is module-level constant

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = useCallback((id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (!element) return;
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const offsetPosition = elementRect - bodyRect - offset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    setActiveSection(id);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // G3: Render a static skeleton instead of null to prevent full layout shift
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full h-16 border-b border-gray-200/20 bg-[#FAFAFA]/80 dark:bg-[#050816]/80 backdrop-blur-md dark:border-white/8">
        <nav aria-label="Main navigation loading" className="h-full w-full" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-gray-200/20 bg-[#FAFAFA]/80 dark:bg-[#050816]/80 backdrop-blur-md dark:border-white/8">
      <nav aria-label="Main navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => scrollTo("home")}>
            <span className="flex items-center text-xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans">
              <span className="mr-2 flex items-center justify-center font-mono text-[#FF6B00] font-bold text-2xl">
                &lt;/&gt;
              </span>
              FullPrep
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-stretch space-x-8 h-16">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`relative flex items-center text-sm font-medium transition-colors duration-200 cursor-pointer h-full ${
                  activeSection === item.id
                    ? "text-[#FF6B00]"
                    : "text-[#0F172A]/70 dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="text-sm font-medium text-[#0F172A]/80 dark:text-white/80 hover:text-[#0F172A] dark:hover:text-white px-4 py-2 cursor-pointer transition-colors">
              Log In
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E56000] active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(255,107,0,0.3)] cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200/20 bg-[#FAFAFA] dark:bg-[#050816] dark:border-white/8 overflow-hidden"
          >
            <div className="space-y-1 px-4 py-4 sm:px-6">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full text-left py-3 px-4 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                      : "text-[#0F172A]/70 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-4 border-t border-gray-200/20 dark:border-white/8 flex flex-col space-y-3 px-4">
                <button className="w-full text-center py-2.5 text-base font-medium text-[#0F172A]/80 dark:text-white/80 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer">
                  Log In
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  className="w-full text-center py-2.5 rounded-lg bg-[#FF6B00] text-base font-semibold text-white hover:bg-[#E56000] active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(255,107,0,0.3)] cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

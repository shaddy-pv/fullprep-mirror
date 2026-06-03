"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CheckCircle2, TrendingUp, Trophy, Compass, Lock, Shield, Award, Activity, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useNotificationStore } from "@/store/notificationStore";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const { toast, hideToast } = useNotificationStore();

  // Helper to determine active content state
  const getPageConfig = () => {
    if (pathname.includes("/signup")) {
      return {
        badge: "Create Account",
        title: "Start your coding journey",
        subtitle: "Join thousands of developers and start improving your coding skills today.",
        type: "signup",
        features: [
          { title: "Personalized learning", desc: "Get paths tailored to your level", icon: Compass, color: "text-[#ff6a00]" },
          { title: "Track & Achieve", desc: "Set goals and track your progress", icon: Activity, color: "text-[#10b981]" },
          { title: "Community & Contests", desc: "Compete and grow together", icon: Trophy, color: "text-[#8b5cf6]" },
        ],
      };
    } else if (pathname.includes("/forgot-password")) {
      return {
        badge: "Reset Password",
        title: "Don't worry, it happens!",
        subtitle: "Enter your email and we'll send you a link to reset your password.",
        type: "forgot",
        features: [
          { title: "Secure", desc: "Your data is completely safe", icon: Shield, color: "text-[#3b82f6]" },
          { title: "Fast", desc: "Quick self-service recovery link", icon: Activity, color: "text-[#10b981]" },
          { title: "Reliable", desc: "Always here to help you solve", icon: CheckCircle2, color: "text-[#ff6a00]" },
        ],
      };
    } else if (pathname.includes("/reset-password")) {
      return {
        badge: "New Password",
        title: "Set a new password",
        subtitle: "Create a strong password to secure your account.",
        type: "reset",
        features: [
          { title: "Use 8+ characters", desc: "Minimum length requirement", icon: Shield, color: "text-[#ff6a00]" },
          { title: "Include numbers", desc: "Adds numeric security depth", icon: CheckCircle2, color: "text-[#10b981]" },
          { title: "Add special chars", desc: "Requires symbols like @, #, $", icon: Shield, color: "text-[#8b5cf6]" },
        ],
      };
    } else {
      // Default to login
      return {
        badge: "Welcome Back!",
        title: "Continue your coding journey",
        subtitle: "Sign in to access your personalized dashboard, track progress and solve more problems.",
        type: "login",
        features: [
          { title: "Track your progress", desc: "Monitor your coding journey", icon: Compass, color: "text-[#ff6a00]" },
          { title: "Solve and compete", desc: "Solve problems and compete in contests", icon: Trophy, color: "text-[#8b5cf6]" },
          { title: "Learn and grow", desc: "Structured paths to master DSA", icon: Compass, color: "text-[#10b981]" },
        ],
      };
    }
  };

  const config = getPageConfig();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f4] dark:bg-[#0b0f17] transition-colors duration-300 relative overflow-x-hidden font-sans">
      
      {/* Dynamic Animated Toast Notifications Visual Overlay */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full bg-white dark:bg-[#11131c] border border-border-card shadow-xl shadow-black/10 dark:shadow-black/30 max-w-[90vw]"
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-orange" />
              )}
              <span className="text-[13.5px] font-semibold text-text-primary tracking-[-0.01em]">
                {toast.message}
              </span>
              <button 
                onClick={hideToast}
                className="text-text-secondary hover:text-text-primary ml-2 text-[11px] font-bold uppercase cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Floating Branding & Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 h-20 px-6 md:px-12 flex items-center justify-between z-40 pointer-events-none">
        {/* Logo Branding */}
        <div className="pointer-events-auto">
          <Link href="/" className="text-brand-orange flex items-center font-bold text-2xl tracking-[-0.03em]">
            <span className="text-2.5xl font-black font-mono">&lt;/&gt;</span>
            <span className="ml-2 font-bold text-[#111827] dark:text-white transition-colors duration-200">FullPrep</span>
          </Link>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <ThemeToggle className="scale-90" />
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[14px] font-semibold text-text-secondary hover:text-text-primary dark:text-[#9ca3af] dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Left Side: Premium Illustration Area */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#fffbf8] via-[#fffefc] to-white dark:from-[#111827] dark:via-[#131d2c] dark:to-[#0f1522] border-r border-border-card p-12 md:p-16 flex-col justify-between relative overflow-hidden transition-colors duration-300">
          
          {/* Ambient Glow Backdrops */}
          <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-[#ffece0]/40 via-[#f5edff]/30 to-transparent dark:from-[#ff6a00]/5 dark:via-[#7c3aed]/3 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-150px] w-[400px] h-[400px] bg-gradient-to-tr from-[#e3f2fd]/30 via-transparent to-transparent dark:from-[#3b82f6]/4 dark:to-transparent rounded-full blur-[85px] pointer-events-none" />

          {/* Spacer to push branding down to match header */}
          <div className="h-12" />

          {/* Middle: Content Section */}
          <div className="max-w-[480px] z-10 my-auto flex flex-col justify-center">
            
            {/* Dynamic Badge */}
            <motion.div
              key={`${config.type}-badge`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex self-start px-3.5 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase bg-[#ffece0] text-[#ff6a00] dark:bg-[#ff6a00]/10 dark:text-[#ff6a00] mb-5 border border-[#ff6a00]/10 shadow-[0_2px_8px_rgba(255,106,0,0.06)]"
            >
              {config.badge}
            </motion.div>

            {/* Dynamic Title */}
            <motion.h2
              key={`${config.type}-title`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-[34px] font-bold text-text-primary tracking-[-0.02em] leading-tight"
            >
              {config.title}
            </motion.h2>

            {/* Dynamic Subtitle */}
            <motion.p
              key={`${config.type}-subtitle`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[14.5px] text-text-secondary mt-3 font-medium leading-relaxed tracking-[-0.01em]"
            >
              {config.subtitle}
            </motion.p>

            {/* Feature Checklist */}
            <div className="mt-8 space-y-5">
              {config.features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={`${config.type}-feature-${idx}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.02] border border-border-card flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] group-hover:border-[#ff6a00]/30 dark:group-hover:border-[#ff6a00]/20 transition-all duration-300 shrink-0">
                      <Icon className={`w-5 h-5 ${item.color} stroke-[2]`} />
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="text-[14px] font-semibold text-text-primary tracking-[-0.01em]">
                        {item.title}
                      </span>
                      <span className="text-[12.5px] text-text-secondary mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust Metrics / Quote Overlays */}
            <div className="mt-12 pt-8 border-t border-border-card">
              <AnimatePresence mode="wait">
                {config.type === "signup" ? (
                  <motion.div
                    key="signup-metrics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-3 gap-6"
                  >
                    <div>
                      <div className="text-2xl font-bold text-text-primary tracking-tight">50K+</div>
                      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-text-secondary mt-0.5">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text-primary tracking-tight">10K+</div>
                      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-text-secondary mt-0.5">Problems</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text-primary tracking-tight">500+</div>
                      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-text-secondary mt-0.5">Contests</div>
                    </div>
                  </motion.div>
                ) : config.type === "forgot" ? (
                  <motion.div
                    key="forgot-metrics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#3b82f6]" />
                      <span className="text-[12.5px] font-semibold text-text-primary">Fully Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#10b981]" />
                      <span className="text-[12.5px] font-semibold text-text-primary">Instant Reset</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login-quote"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-2 pl-4 border-l-2 border-[#ff6a00]/30"
                  >
                    <p className="text-[13.5px] font-medium text-text-secondary italic leading-relaxed">
                      &ldquo;The best way to predict the future is to create it.&rdquo;
                    </p>
                    <span className="text-[12px] font-bold text-text-primary tracking-wide">
                      — Alan Kay
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom branding detail */}
          <div className="text-[11px] font-semibold tracking-wider text-text-secondary uppercase select-none z-10">
            Trusted by developers worldwide
          </div>

        </div>

        {/* Right Side: Auth Card Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
          
          {/* Subtle Radial Glows for Light/Dark Contexts on the right side */}
          <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-gradient-to-br from-[#ffece0]/10 to-transparent dark:from-[#ff6a00]/4 dark:to-transparent rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-gradient-to-tr from-[#f5edff]/10 to-transparent dark:from-[#7c3aed]/2 dark:to-transparent rounded-full blur-[70px] pointer-events-none" />

          {/* Child Card Content */}
          <div className="w-full max-w-[460px] flex flex-col justify-center">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}

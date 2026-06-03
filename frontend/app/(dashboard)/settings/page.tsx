"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Settings,
  Sliders,
  Bell,
  Lock,
  Link2,
  Palette,
  CreditCard,
  Download,
  AlertTriangle,
  Upload,
  Globe,
  Shield,
  Smartphone,
  Check,
  Zap,
  Code2,
  ChevronRight,
  Sparkles,
  MapPin,
  ChevronDown,
  Trophy,
  Award,
  Activity,
  Crown,
  Laptop,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";
import { DESIGN_SYSTEM_TOKENS } from "@/constants/design-system";

/* ─────────────────────────────────────────────
   Premium social handle SVG icons
   ───────────────────────────────────────────── */

const GithubIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function SettingsPage() {
  const showToast = useNotificationStore((state) => state.showToast);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const isScrollingRef = useRef(false);

  // Profile Form States
  const [displayName, setDisplayName] = useState("Khushi");
  const [username, setUsername] = useState("khushi.dev");
  const [bio, setBio] = useState("Passionate about solving problems and building cool things.");
  const [location, setLocation] = useState("India");
  const [website, setWebsite] = useState("https://khushi.dev");

  // Appearance & Theme Configuration
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [selectedAccent, setSelectedAccent] = useState("orange");
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uiAnimations, setUiAnimations] = useState(true);

  // Profile Toggles
  const [visibility, setVisibility] = useState({
    profile: true,
    achievements: true,
    activity: true,
    statistics: true,
    ratings: true,
    heatmap: true,
  });

  // Notifications Toggles
  const [notifs, setNotifs] = useState({
    reminders: true,
    alerts: true,
    requests: false,
    reports: true,
    unlocks: true,
  });

  // Security Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string>("profile");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Scrollspy tracking using IntersectionObserver
  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      root: null,
      rootMargin: "-12% 0px -70% 0px", // Trigger when section occupies upper-middle portion
      threshold: 0.05
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return; // Ignore observer updates when clicking left navigation items

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ["profile", "account", "preferences", "notifications", "privacy", "connected", "appearance", "billing", "data", "danger"];
    
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#060816]" />;
  }

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    isScrollingRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 700);
    }
  };

  const handleSaveChanges = () => {
    showToast("Changes saved successfully to your FullPrep profile!", "success");
  };

  const tabsList = [
    { id: "profile", name: "Profile Settings", icon: User },
    { id: "account", name: "Account Settings", icon: Settings },
    { id: "preferences", name: "Preferences", icon: Sliders },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Privacy & Security", icon: Shield },
    { id: "connected", name: "Connected Accounts", icon: Link2 },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "billing", name: "Billing & Subscription", icon: CreditCard },
    { id: "data", name: "Data & Export", icon: Download },
    { id: "danger", name: "Danger Zone", icon: AlertTriangle },
  ];

  const accentsList = [
    { id: "orange", name: "Orange Glow", color: "bg-[#ff6a00]", focusGlow: "focus:border-[#ff6a00]/40 focus:ring-[#ff6a00]/20" },
    { id: "purple", name: "Purple Neon", color: "bg-[#8b5cf6]", focusGlow: "focus:border-[#8b5cf6]/40 focus:ring-[#8b5cf6]/20" },
    { id: "blue", name: "Cyber Blue", color: "bg-[#3b82f6]", focusGlow: "focus:border-[#3b82f6]/40 focus:ring-[#3b82f6]/20" },
    { id: "green", name: "Emerald", color: "bg-[#10b981]", focusGlow: "focus:border-[#10b981]/40 focus:ring-[#10b981]/20" },
    { id: "pink", name: "Hot Pink", color: "bg-[#ec4899]", focusGlow: "focus:border-[#ec4899]/40 focus:ring-[#ec4899]/20" },
  ];

  const activeAccent = accentsList.find(a => a.id === selectedAccent) || accentsList[0];

  const handleSectionToggle = (id: string) => {
    if (expandedSection === id) {
      setExpandedSection("");
    } else {
      setExpandedSection(id);
      setTimeout(() => {
        scrollToSection(id);
      }, 50);
    }
  };

  const handleSectionClick = (id: string) => {
    setExpandedSection(id);
    setTimeout(() => {
      scrollToSection(id);
    }, 50);
  };

  const cardBase = cn(DESIGN_SYSTEM_TOKENS.surfaces.card, DESIGN_SYSTEM_TOKENS.surfaces.cardHover, "p-6 flex flex-col w-full text-left gap-6 rounded-[20px]");
  const inputStyle = cn(DESIGN_SYSTEM_TOKENS.forms.input, activeAccent.focusGlow);
  const textareaStyle = cn(DESIGN_SYSTEM_TOKENS.forms.textarea, activeAccent.focusGlow);
  const labelStyle = DESIGN_SYSTEM_TOKENS.typography.label;

  return (
    <ContentContainer className="pb-16 min-h-screen text-text-primary font-sans antialiased select-none max-w-[1600px] mx-auto px-6 xl:px-8 relative overflow-x-hidden">
      {/* Decorative Radial Glows for Premium Aesthetic in both Light and Dark modes */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 dark:bg-brand-orange/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-8 text-left border-b border-slate-900/[0.06] dark:border-white/[0.04] pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-brand-orange" />
            <span>Profile Settings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/60 font-medium leading-none">
            Manage your personal information, public profile, workspace display and system preferences.
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          className="flex items-center justify-center bg-brand-orange hover:bg-[#e05d00] text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-md shadow-[#ff6a00]/15 hover:shadow-[0_0_12px_rgba(255,106,0,0.3)] cursor-pointer self-start sm:self-center transition-all duration-200 leading-none h-[38px] hover:scale-[1.01]"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-[28px] w-full items-start">
        
        {/* LEFT COLUMN: Premium Sticky Settings Navigation Panel */}
        <div className="w-full lg:w-[320px] bg-white dark:bg-[#0a0c14]/88 border border-slate-900/[0.08] dark:border-white/[0.05] backdrop-blur-[16px] rounded-[28px] p-6 shadow-lg flex flex-col gap-[20px] text-left shrink-0 lg:sticky lg:top-[96px] h-fit self-start z-30 pb-8">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-white/45 font-bold tracking-[0.22em] uppercase block mb-[18px] leading-none select-none">
              SETTINGS PANEL
            </span>
            <div className="flex flex-col gap-[4px] w-full">
              {tabsList.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSectionClick(tab.id)}
                    className={cn(
                      "w-full h-[46px] flex items-center justify-between rounded-[14px] px-[14px] text-left transition-all duration-200 cursor-pointer relative group border",
                      isActive
                        ? "bg-brand-orange/[0.10] text-brand-orange border-brand-orange/[0.24] shadow-[inset_0_0_0_1px_rgba(255,106,0,0.05)] font-semibold"
                        : "text-[#6b7280] dark:text-white/80 hover:text-[#111827] dark:hover:text-white hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03] border-transparent font-medium hover:-translate-y-[0.5px]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon className={cn("w-[17px] h-[17px] shrink-0 transition-colors duration-200 opacity-[0.82]", isActive ? "text-brand-orange" : "text-slate-400 dark:text-[#9ca3af] group-hover:text-[#111827] dark:group-hover:text-white")} />
                      <span className="text-[14px] tracking-tight leading-none">{tab.name}</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-40 transition-all duration-200 shrink-0", isActive ? "opacity-90 text-brand-orange" : "text-slate-400 dark:text-[#9ca3af]")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium "Upgrade to Pro" Card */}
          <div className="rounded-[22px] p-[16px] border border-[#ff8c28]/20 dark:border-[#ff8c28]/16 shadow-[0_8px_24px_rgba(255,106,0,0.05)] relative overflow-hidden group transition-all duration-300 flex flex-col gap-[10px] self-stretch mt-[6px] bg-gradient-to-b from-brand-orange/[0.08] to-brand-orange/[0.02] dark:from-brand-orange/[0.10] dark:to-brand-orange/[0.04]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 blur-2xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full bg-brand-orange/15 border border-brand-orange/20 text-brand-orange text-[9px] font-bold uppercase tracking-widest leading-none select-none">
                <Sparkles className="w-3 h-3 fill-brand-orange shrink-0" />
                <span>Pro Tier</span>
              </div>
              <h4 className="text-[14px] font-bold text-[#111827] dark:text-white tracking-tight leading-snug">
                Unlock FullPrep Unlimited
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-white/50 font-medium leading-relaxed max-w-[90%]">
                Get full AI hints, unlimited Monaco diagnostics, premium glowing themes, and priority cloud analytics.
              </p>
            </div>
            <button
              onClick={() => showToast("Redirecting to Stripe premium portal...", "info")}
              className="w-full h-[36px] bg-gradient-to-r from-brand-orange to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-bold rounded-[12px] text-[11.5px] flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(255,106,0,0.15)] hover:shadow-[0_0_12px_rgba(255,106,0,0.3)] transition-all duration-200 cursor-pointer leading-none border-none shrink-0"
            >
              <span>Upgrade Now</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Scrollable Unified Settings Content */}
        <div className="flex-1 flex flex-col gap-6 w-full min-w-0 text-left">
          
          {/* ──────────────────────────────────────────
              PROFILE SETTINGS SECTION
              ────────────────────────────────────────── */}
          <section id="profile" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("profile")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Profile Settings</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "profile" ? "Manage your name, biography, locations, and social portfolios." : `Khushi (${username}) • ${location}`}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "profile" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "profile" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  {/* Card 1: Profile Information */}
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <User className="w-4 h-4 text-brand-orange" />
                <span>Profile Information</span>
              </h3>
              <div className="flex flex-col md:flex-row gap-8 items-center w-full">
                {/* Avatar Picker & Indicator */}
                <div className="flex flex-col items-center gap-3.5 shrink-0 mx-auto md:mx-0">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c084fc] via-[#8b5cf6] to-[#6366f1] flex items-center justify-center font-bold text-[36px] text-white border border-slate-900/[0.08] dark:border-white/[0.08] shadow-lg shadow-purple-500/10 shrink-0 select-none relative overflow-hidden">
                      <span className="group-hover:scale-95 transition-transform duration-300">K</span>
                    </div>
                    <span className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white dark:border-[#0d0e19] absolute bottom-1 right-1 shadow-md shadow-[#10b981]/30 animate-pulse" />
                  </div>
                  <button
                    onClick={() => showToast("Opening file avatar uploader...", "info")}
                    className="flex items-center justify-center gap-1.5 border border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/5 dark:bg-white/[0.04] hover:bg-slate-900/10 dark:hover:bg-white/[0.08] text-[#111827] dark:text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer h-[28px] leading-none"
                  >
                    <Upload className="w-3 h-3 text-slate-400 dark:text-[#9ca3af]" />
                    <span>Change Avatar</span>
                  </button>
                </div>

                {/* Form fields */}
                <div className="flex-1 flex flex-col gap-5 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Full Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={inputStyle}
                        placeholder="Khushi"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputStyle}
                        placeholder="@khushi.dev"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex justify-between items-center w-full">
                      <label className={labelStyle}>Bio</label>
                      <span className="text-[10px] text-slate-400 dark:text-text-secondary/40 font-bold font-mono">{bio.length}/160</span>
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 160))}
                      className={textareaStyle}
                      placeholder="Write a brief profile description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Location</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-[23px] text-slate-400 dark:text-[#9ca3af]/40" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={cn(inputStyle, "pl-9")}
                          placeholder="e.g., India"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Website</label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 absolute left-3 top-[23px] text-slate-400 dark:text-[#9ca3af]/40" />
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className={cn(inputStyle, "pl-9")}
                          placeholder="e.g., https://khushi.dev"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Social Links */}
            <div className={cardBase}>
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-brand-orange" />
                  <span>Social Links</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 font-medium mt-1">
                  Configure primary developer handles shown on your public portfolio page.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  { name: "GitHub", label: "github.com/", val: "khushi-dev", icon: GithubIcon, borderClass: "hover:border-slate-900/10 dark:hover:border-[#ffffff]/15 hover:shadow-[0_4px_12px_rgba(255,255,255,0.02)]" },
                  { name: "LinkedIn", label: "linkedin.com/in/", val: "khushi-dev", icon: LinkedinIcon, borderClass: "hover:border-[#0a66c2]/10 dark:hover:border-[#0a66c2]/15 hover:shadow-[0_4px_12px_rgba(10,102,194,0.02)]" },
                  { name: "Twitter/X", label: "twitter.com/", val: "khushi_dev", icon: TwitterIcon, borderClass: "hover:border-slate-900/10 dark:hover:border-[#ffffff]/10 hover:shadow-[0_4px_12px_rgba(255,255,255,0.01)]" },
                  { name: "LeetCode", label: "leetcode.com/", val: "khushi_dev", icon: Code2, borderClass: "hover:border-brand-orange/10 dark:hover:border-brand-orange/15 hover:shadow-[0_4px_12px_rgba(255,106,0,0.02)]" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className={cn("border border-slate-900/[0.06] dark:border-white/[0.04] bg-slate-900/[0.01] dark:bg-[#0d0f1a]/40 rounded-[14px] p-3.5 flex flex-col gap-2.5 transition-all duration-300 h-[98px] justify-between", item.borderClass)}>
                      <div className="flex items-center gap-2 text-left">
                        <div className="w-7 h-7 rounded-lg bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-text-secondary" />
                        </div>
                        <span className="text-[12px] font-bold text-[#111827] dark:text-white tracking-tight leading-none">{item.name}</span>
                      </div>
                      <div className="flex items-center border border-slate-900/[0.08] dark:border-white/[0.06] rounded-[8px] overflow-hidden bg-white dark:bg-[#07080e]/40 px-2.5 py-1.5 h-8">
                        <span className="text-[9.5px] text-slate-400 dark:text-text-secondary/40 font-bold shrink-0">{item.label}</span>
                        <input type="text" defaultValue={item.val} className="w-full bg-transparent text-[11px] font-medium text-[#111827] dark:text-white border-none focus:outline-none focus:ring-0 p-0 ml-1 leading-none" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              ACCOUNT SETTINGS SECTION
              ────────────────────────────────────────── */}
          <section id="account" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("account")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Account Settings</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "account" ? "Configure your primary contacts, security emails, and secure passwords." : "Primary: khushi@fullprep.dev • Password: Set"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "account" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "account" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-orange" />
                <span>Account Credentials</span>
              </h3>
              <div className="flex flex-col gap-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col text-left">
                    <label className={labelStyle}>Primary Contact Email</label>
                    <input type="email" defaultValue="khushi@fullprep.dev" className={cn(inputStyle, "opacity-65 select-none")} disabled />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className={labelStyle}>Backup Recovery Email</label>
                    <input type="email" placeholder="backup-recovery@email.com" className={inputStyle} />
                  </div>
                </div>

                <div className="border border-white/[0.04] rounded-xl p-4 bg-slate-900/[0.02] dark:bg-[#111217]/15 flex flex-col gap-4">
                  <h4 className="text-[12.5px] font-bold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Change Secure Password</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-1.5">
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Current Password</label>
                      <input type="password" placeholder="••••••••" className={inputStyle} />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>New Secure Password</label>
                      <input type="password" placeholder="••••••••" className={inputStyle} />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className={inputStyle} />
                    </div>
                  </div>
                  <button
                    onClick={() => showToast("Password updated successfully!", "success")}
                    className="bg-brand-orange/10 hover:bg-brand-orange/15 dark:bg-brand-orange/15 dark:hover:bg-brand-orange/20 border border-brand-orange/20 dark:border-brand-orange/30 text-brand-orange text-[11px] font-bold rounded-lg px-4 py-2 self-end transition-all duration-200 cursor-pointer h-[32px] leading-none"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              PREFERENCES SECTION
              ────────────────────────────────────────── */}
          <section id="preferences" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("preferences")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Preferences</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "preferences" ? "Adjust default Monaco editor languages, themes, diagnostics, and indent spacings." : "Default Language: Python • Indent: 2 Spaces"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "preferences" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "preferences" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-orange" />
                <span>Practice Workspace Preferences</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                {[
                  { label: "Default Programming Language", opt: ["Python", "C++", "Java", "TypeScript", "Go"] },
                  { label: "Practice Workspace Theme", opt: ["Monaco Dark Space", "Monaco Midnight Velvet", "Monaco Cyberpunk"] },
                  { label: "Editor Tab Indent Spacing", opt: ["2 Spaces", "4 Spaces", "Tabs (Standard)"] },
                  { label: "Diagnostics & Autocomplete", opt: ["Enabled (Full Diagnostic)", "Disabled"] },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col text-left">
                    <label className={labelStyle}>{item.label}</label>
                    <div className="relative mt-2">
                      <select className={cn(
                        "w-full border border-slate-900/[0.08] dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#0a0b12]/60 px-3.5 text-sm font-medium text-[#111827] dark:text-white focus:outline-none appearance-none h-10 leading-none cursor-pointer",
                        activeAccent.focusGlow
                      )}>
                        {item.opt.map((o) => (
                          <option key={o} value={o} className="bg-white text-[#111827] dark:bg-[#111217] dark:text-white">{o}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-[12px] text-slate-400 dark:text-text-secondary/50 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              NOTIFICATIONS SECTION
              ────────────────────────────────────────── */}
          <section id="notifications" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("notifications")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Notifications</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "notifications" ? "Configure triggers for contests, coding streaks, badge achievements, and syncing reports." : "Contest Alerts: On • Streak Reminders: On"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "notifications" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "notifications" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  <div className={cardBase}>
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-orange" />
                  <span>Notification Preferences</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 font-medium">
                  Configure delivery channels for practice triggers, streak alerts and milestones.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 w-full mt-5">
                {[
                  { id: "reminders", label: "Contest Reminders", desc: "Receive alert notifications before enrolled coding contests begin.", icon: Trophy },
                  { id: "alerts", label: "Daily Streak Alerts", desc: "Help maintain daily coding streaks with friendly alert ping notifications.", icon: Zap },
                  { id: "requests", label: "Friend Requests", desc: "Notify when other developers request to sync connections with you.", icon: User },
                  { id: "reports", label: "Weekly Performance Reports", desc: "Receive summary reports showing solved difficulty ratings ratios.", icon: Activity },
                  { id: "unlocks", label: "Milestone Badge Unlocks", desc: "Get notifications upon unlocking glowing hexagon showcase badges.", icon: Award },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = notifs[item.id as keyof typeof notifs];
                  return (
                    <div key={item.id} className="border border-slate-900/[0.06] dark:border-white/[0.04] bg-slate-900/[0.02] dark:bg-[#111217]/15 rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-300 hover:border-slate-900/10 dark:hover:border-white/[0.08]">
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-9 h-9 rounded-lg bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5 text-slate-400 dark:text-[#9ca3af]" />
                        </div>
                        <div className="flex flex-col leading-none text-left">
                          <span className="text-[13px] font-bold text-[#111827] dark:text-white tracking-tight leading-none">{item.label}</span>
                          <span className="text-[11px] text-slate-500 dark:text-text-secondary/70 font-medium leading-none mt-2">{item.desc}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNotifs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifs] }));
                          showToast(`${item.label} setting updated.`, "info");
                        }}
                        className={cn(
                          "w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center shrink-0 cursor-pointer",
                          isChecked ? "bg-brand-orange shadow-[0_0_6px_rgba(255,106,0,0.2)]" : "bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]"
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 absolute",
                          isChecked ? "left-[18px]" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              PRIVACY & SECURITY SECTION
              ────────────────────────────────────────── */}
          <section id="privacy" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("privacy")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Privacy & Security</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "privacy" ? "Set profile visibility toggles, monitor connected active sessions, and configure two-factor authentication." : `Two-Factor: ${twoFactor ? "Enabled" : "Disabled"} • Active Sessions: 2`}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "privacy" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "privacy" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  {/* Card 1: Two-Factor Auth */}
                  <div className={cardBase}>
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-start gap-4.5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[14px] font-bold text-[#111827] dark:text-white tracking-tight leading-none">Two-Factor Authentication (2FA)</span>
                    <span className="text-[11.5px] text-slate-500 dark:text-[#9ca3af]/60 mt-2 leading-relaxed">
                      Reinforce account security using a dynamic hardware token or mobile authenticator.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTwoFactor(!twoFactor);
                    showToast(`Two-factor auth turned ${!twoFactor ? "ON" : "OFF"}.`, !twoFactor ? "success" : "info");
                  }}
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center shrink-0 cursor-pointer",
                    twoFactor ? "bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.2)]" : "bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 absolute",
                    twoFactor ? "left-[18px]" : "left-0.5"
                  )} />
                </button>
              </div>
            </div>

            {/* Card 2: Connected Devices Sessions */}
            <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Laptop className="w-4 h-4 text-brand-orange" />
                <span>Connected Sessions & Activity</span>
              </h3>
              <div className="flex flex-col gap-4 w-full">
                {[
                  { browser: "Google Chrome (Windows 11)", ip: "192.168.1.18", active: true, location: "Delhi, India" },
                  { browser: "Safari Mobile (iPhone 15 Pro)", ip: "172.24.112.98", active: false, location: "Mumbai, India" },
                ].map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-900/[0.06] dark:border-white/[0.04] last:border-0 pb-3.5 last:pb-0">
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="w-9 h-9 rounded-lg bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0">
                        <Smartphone className="w-4.5 h-4.5 text-slate-400 dark:text-text-secondary" />
                      </div>
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[13px] font-semibold text-[#111827] dark:text-white leading-none">{session.browser}</span>
                        <span className="text-[10.5px] text-slate-500 dark:text-text-secondary/70 mt-2 leading-none">{session.ip} • {session.location}</span>
                      </div>
                    </div>
                    {session.active ? (
                      <span className="px-2.5 py-1 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/10 text-[9px] font-extrabold uppercase tracking-wide leading-none">Current</span>
                    ) : (
                      <button onClick={() => showToast("Revoking connection session...", "info")} className="border border-[#f43f5e]/20 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 text-[10.5px] font-bold rounded-lg px-3 py-1.5 transition-all cursor-pointer leading-none">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Profile Visibility Controls */}
            <div className={cardBase}>
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                  <Crown className="w-4 h-4 text-brand-orange" />
                  <span>Profile Visibility</span>
                </h3>
                <p className="text-sm opacity-60 text-text-secondary">
                  Control which statistics and widgets appear on your public coder portfolio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-5">
                {[
                  { id: "profile", label: "Show Public Profile", desc: "Allow other coders to search & view your profile card.", icon: User },
                  { id: "achievements", label: "Show Achievements", desc: "Display your unlocked custom hexagon badges publicly.", icon: Award },
                  { id: "activity", label: "Show Activity Timeline", desc: "Display solved submissions activity feed logs stream.", icon: Activity },
                  { id: "statistics", label: "Public Statistics", desc: "Display numerical easy/medium/hard progress counts.", icon: Sliders },
                  { id: "ratings", label: "Show Contest Ratings", desc: "Allow profile visitors to view your contest rating charts.", icon: Trophy },
                  { id: "heatmap", label: "Show Activity Heatmap", desc: "Make your full year submission contribution grid visible.", icon: Crown },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = visibility[item.id as keyof typeof visibility];
                  return (
                    <div key={item.id} className="border border-slate-900/[0.06] dark:border-white/[0.04] bg-slate-900/[0.02] dark:bg-[#111217]/15 rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-300 hover:border-slate-900/10 dark:hover:border-white/[0.08]">
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-9 h-9 rounded-lg bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5 text-slate-400 dark:text-[#9ca3af]" />
                        </div>
                        <div className="flex flex-col leading-none text-left">
                          <span className="text-[13px] font-bold text-[#111827] dark:text-white tracking-tight leading-none">{item.label}</span>
                          <span className="text-[11px] text-slate-500 dark:text-text-secondary/70 font-medium leading-none mt-2">{item.desc}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setVisibility(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof visibility] }));
                          showToast(`${item.label} visibility toggled.`, "info");
                        }}
                        className={cn(
                          "w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center shrink-0 cursor-pointer",
                          isChecked ? "bg-brand-orange shadow-[0_0_6px_rgba(255,106,0,0.2)]" : "bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]"
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 absolute",
                          isChecked ? "left-[18px]" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              CONNECTED ACCOUNTS SECTION
              ────────────────────────────────────────── */}
          <section id="connected" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("connected")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Connected Accounts</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "connected" ? "Synchronize automatic integrations with LeetCode APIs, Codeforces, and GitHub repositories." : "LeetCode & Codeforces API Sync Active"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "connected" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "connected" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Link2 className="w-4 h-4 text-brand-orange" />
                <span>Linked Integrations</span>
              </h3>
              <div className="flex flex-col gap-4 w-full">
                {[
                  { label: "LeetCode Auto-Sync API", active: true, desc: "Automatically import solved LeetCode counts history daily." },
                  { label: "Codeforces Rating Checker", active: true, desc: "Periodically fetch active competitive contest ratings." },
                  { label: "GitHub Code Solutions Hub", active: false, desc: "Push accepted source codes directly into your GitHub repository." },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-900/[0.06] dark:border-white/[0.04] last:border-0 pb-3.5 last:pb-0">
                    <div className="flex flex-col text-left leading-none gap-2">
                      <span className="text-[13px] font-bold text-[#111827] dark:text-white leading-none">{item.label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-[#9ca3af]/60 leading-none">{item.desc}</span>
                    </div>
                    <button
                      onClick={() => showToast(`Linked integration updated.`, "info")}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center shrink-0 cursor-pointer",
                        item.active ? "bg-brand-orange shadow-[0_0_6px_rgba(255,106,0,0.2)]" : "bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]"
                      )}
                    >
                      <span className={cn(
                        "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 absolute",
                        item.active ? "left-[18px]" : "left-0.5"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              APPEARANCE SECTION
              ────────────────────────────────────────── */}
          <section id="appearance" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("appearance")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Appearance</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "appearance" ? "Pick futuristic high-contrast platform themes, colors, and compact workspace displays." : `Theme: ${selectedTheme} • Accent: ${selectedAccent}`}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "appearance" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "appearance" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  {/* Card 1: Theme Select Grid */}
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-orange" />
                <span>Customize Platform Theme</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {[
                  { id: "dark", label: "Dark Space", desc: "Futuristic dark blue space vibe", style: "bg-gradient-to-br from-[#0c0d16] to-[#060816] border-[#1d1f30]" },
                  { id: "midnight", label: "Midnight Velvet", desc: "Pitch absolute matte black layout", style: "bg-[#05060b] border-white/[0.04]" },
                  { id: "neon", label: "Neon Cyberpunk", desc: "Vibrant high-contrast neon tints", style: "bg-gradient-to-br from-[#0b0c16] via-[#120822] to-[#07050d] border-purple-500/20" },
                ].map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      showToast(`Dashboard theme set to ${theme.label}!`, "success");
                    }}
                    className={cn(
                      "border-2 rounded-xl p-4 flex flex-col justify-between h-[155px] cursor-pointer select-none transition-all duration-300 hover:scale-[1.01]",
                      selectedTheme === theme.id ? "border-brand-orange shadow-[0_0_15px_rgba(255,106,0,0.15)]" : "border-white/[0.05] hover:border-white/[0.12]",
                      theme.style
                    )}
                  >
                    {/* Live Preview Layout Thumbnail */}
                    <div className="w-full h-12 rounded-lg bg-black/40 border border-white/[0.05] p-1.5 flex gap-1 mb-2">
                      <div className={cn("w-3.5 h-full rounded-sm shrink-0", theme.id === "dark" ? "bg-[#181a24]" : theme.id === "midnight" ? "bg-[#0b0c10]" : "bg-[#1d0b30]")} />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className={cn("h-1.5 rounded-sm w-3/5", theme.id === "dark" ? "bg-[#1f2235]" : theme.id === "midnight" ? "bg-[#15161d]" : "bg-[#331454]")} />
                        <div className="flex-1 grid grid-cols-2 gap-1.5">
                          <div className={cn("rounded-sm border", theme.id === "dark" ? "bg-[#11131c]/60 border-[#1d2030]/60" : theme.id === "midnight" ? "bg-[#0c0d12]/60 border-white/[0.02]" : "bg-[#120720]/60 border-purple-500/10")} />
                          <div className={cn("rounded-sm border", theme.id === "dark" ? "bg-[#11131c]/60 border-[#1d2030]/60" : theme.id === "midnight" ? "bg-[#0c0d12]/60 border-white/[0.02]" : "bg-[#120720]/60 border-purple-500/10")} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col text-left gap-1">
                      <span className="text-[12.5px] font-bold text-white leading-none">{theme.label}</span>
                      <span className="text-[9.5px] text-text-secondary/70 font-semibold leading-none mt-1">{theme.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Accent & Scaling Controls */}
            <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-orange" />
                <span>Accent Highlight Highlights</span>
              </h3>
              <div className="flex flex-col gap-5 w-full">
                
                {/* Accent selector */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-[10px] text-slate-500 dark:text-text-secondary/50 font-bold uppercase tracking-widest leading-none">System Highlight Color</span>
                  <div className="flex items-center gap-3 mt-1">
                    {accentsList.map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => {
                          setSelectedAccent(accent.id);
                          showToast(`Accent color set to ${accent.name}!`, "success");
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                          selectedAccent === accent.id ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                        )}
                      >
                        <div className={cn("w-6 h-6 rounded-full", accent.color)} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.04] pt-5 flex flex-col gap-4">
                  {[
                    { id: "compactMode", state: compactMode, set: setCompactMode, label: "Compact Workspace Layout", desc: "Compacts margins and row padding to maximize coding grid details." },
                    { id: "sidebarCollapsed", state: sidebarCollapsed, set: setSidebarCollapsed, label: "Sidebar Collapsed Default", desc: "Folds the navigation sidebar panel by default on load." },
                    { id: "uiAnimations", state: uiAnimations, set: setUiAnimations, label: "Framer Motion Page Transitions", desc: "Renders smooth scale and glide transitions when changing dashboards." },
                  ].map((pref) => (
                    <div key={pref.id} className="border border-slate-900/[0.06] dark:border-white/[0.04] bg-slate-900/[0.02] dark:bg-[#111217]/15 rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-300">
                      <div className="flex flex-col text-left leading-none gap-2">
                        <span className="text-[13px] font-bold text-[#111827] dark:text-white leading-none">{pref.label}</span>
                        <span className="text-[10.5px] text-slate-500 dark:text-text-secondary/70 leading-none">{pref.desc}</span>
                      </div>
                      <button
                        onClick={() => {
                          pref.set(!pref.state);
                          showToast(`Layout preference updated.`, "info");
                        }}
                        className={cn(
                          "w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center shrink-0 cursor-pointer",
                          pref.state ? "bg-brand-orange shadow-[0_0_6px_rgba(255,106,0,0.2)]" : "bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]"
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 absolute",
                          pref.state ? "left-[18px]" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              BILLING & SUBSCRIPTION SECTION
              ────────────────────────────────────────── */}
          <section id="billing" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("billing")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Billing & Subscription</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "billing" ? "View current Free tiers, cloud database sizes, Monaco APIs, and upgrade plans." : "Free Tier • AI Hints: 15/30 • Storage: 12.8MB"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "billing" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "billing" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  {/* Card 1: Current Plan Details */}
                  <div className={cardBase}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-start gap-4 text-left leading-none">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div className="flex flex-col justify-center leading-none">
                    <div className="flex items-center gap-2">
                      <span className="text-[15.5px] font-bold text-[#111827] dark:text-white leading-none">FullPrep Free Plan</span>
                      <span className="px-2.5 py-1 rounded bg-white/[0.06] text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-widest leading-none">Current</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-white/60 font-medium mt-2.5 leading-relaxed">
                      Enjoy unlimited practice problems, competitive leaderboards, and weekly performance insights.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => showToast("Redirecting to premium plans portal...", "info")}
                  className="bg-brand-orange hover:bg-[#e05d00] text-white text-[12.5px] font-bold rounded-xl px-5 py-2.5 transition-all duration-200 cursor-pointer shadow-md shadow-[#ff6a00]/15 hover:shadow-[0_0_12px_rgba(255,106,0,0.3)] h-[38px] leading-none shrink-0"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Card 2: Usage statistics progress bars */}
            <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-orange" />
                <span>Resource Allocation & Billing Usage</span>
              </h3>
              <div className="flex flex-col gap-5 w-full">
                {[
                  { label: "Monthly AI Diagnosis Hints Used", current: 15, max: 30, pct: 50, color: "from-[#ff6a00] to-[#ff8c3a]" },
                  { label: "Cloud Backup Storage Used", current: 12.8, max: 100, pct: 12.8, unit: "MB", color: "from-[#8b5cf6] to-[#a78bfa]" },
                  { label: "API Solved Solutions Check Requests", current: 420, max: 1000, pct: 42, color: "from-[#3b82f6] to-[#60a5fa]" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2.5 py-0.5">
                    <div className="flex items-center justify-between text-[12.5px] font-bold text-[#111827] dark:text-white leading-none">
                      <span>{item.label}</span>
                      <span className="text-brand-orange font-semibold">{item.current} / {item.max} {item.unit || ""}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900/5 dark:bg-[#111219] border border-slate-900/[0.08] dark:border-white/[0.04] rounded-full overflow-hidden">
                      <div className={cn("h-full bg-gradient-to-r rounded-full shadow-[0_0_8px_rgba(255,106,0,0.2)]", item.color)} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              DATA & EXPORT SECTION
              ────────────────────────────────────────── */}
          <section id="data" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("data")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-[#111827] dark:text-white tracking-tight">Data & Export</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "data" ? "Download your competitive stats, custom settings, and streak histories as portable JSON." : "Export all practice data histories as JSON package"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 dark:text-text-secondary transition-transform duration-300 shrink-0", expandedSection === "data" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "data" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-orange" />
                <span>Export Practice Data package</span>
              </h3>
              <div className="flex flex-col gap-4 text-left w-full">
                <p className="text-sm text-slate-500 dark:text-white/60 font-medium leading-relaxed">
                  Download a secure, highly-portable, standardized JSON backup archive containing your solved streaks, competitive rankings, custom Monaco configs, bookmarks, and solved submissions history logs.
                </p>
                <button
                  onClick={() => showToast("Preparing secure backup package... download starting shortly.", "success")}
                  className="flex items-center justify-center gap-1.5 border border-slate-900/[0.08] dark:border-white/[0.08] hover:bg-slate-900/5 dark:hover:bg-white/[0.04] bg-slate-900/5 dark:bg-[#111217]/50 text-[#111827] dark:text-[#f3f4f6] text-[12px] font-bold rounded-xl px-5 py-2.5 transition-all cursor-pointer self-start h-[38px] leading-none"
                >
                  <Download className="w-4 h-4 text-[#9ca3af]" />
                  <span>Download Backup Package (JSON)</span>
                </button>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──────────────────────────────────────────
              DANGER ZONE SECTION
              ────────────────────────────────────────── */}
          <section id="danger" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
            {/* Header Accordion Card */}
            <div
              onClick={() => handleSectionToggle("danger")}
              className="bg-card-bg border border-border-card rounded-[20px] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-slate-900/15 dark:hover:border-white/[0.12] p-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
            >
              <div className="flex items-center gap-4.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[14.5px] font-bold text-red-500 tracking-tight">Danger Zone</span>
                  <span className="text-[11.5px] text-slate-500 dark:text-white/50 font-medium mt-1.5 leading-none">
                    {expandedSection === "danger" ? "Irreversible and destructive account removals and permanent streak wipes." : "Permanently delete FullPrep coding account"}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-red-500 transition-transform duration-300 shrink-0", expandedSection === "danger" && "rotate-180")} />
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === "danger" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  <div className="rounded-[20px] border border-red-500/20 bg-red-500/[0.02] shadow-[0_8px_32px_rgba(239,68,68,0.08)] p-6 pt-5 flex flex-col gap-5 w-full text-left">
              <div className="flex items-start gap-4.5 text-left leading-none">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-500">
                  <AlertTriangle className="w-6.5 h-6.5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[15.5px] font-bold text-red-500 tracking-tight leading-none">Destructive Account Actions</span>
                  <p className="text-sm text-slate-500 dark:text-white/60 font-medium mt-2.5 leading-relaxed max-w-[550px]">
                    Actions in this section are irreversible. Terminating your FullPrep account will wipe solved metrics, streak levels, unlocked badges, and historical submission files permanently.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-900/[0.06] dark:border-white/[0.05] pt-4.5 flex items-center justify-between gap-6">
                <div className="flex flex-col text-left leading-none gap-2">
                  <span className="text-[13.5px] font-bold text-[#111827] dark:text-white leading-none">Delete FullPrep Coding Account</span>
                  <span className="text-[11px] text-slate-500 dark:text-text-secondary/50 leading-none font-medium">Wipe your profile and solutions repository permanently.</span>
                </div>
                <button
                  onClick={() => showToast("Account deletion requires primary password confirmation.", "info")}
                  className="bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[11px] font-bold rounded-lg px-4.5 py-2.5 transition-all cursor-pointer h-[32px] leading-none shrink-0 self-center"
                >
                  Delete Account
                </button>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>

      </div>

    </ContentContainer>
  );
}

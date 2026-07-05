"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Settings,
  Bell,
  Lock,
  Link2,
  Palette,
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
  Info,
  Trophy,
  Award,
  Activity,
  CreditCard,
  Sliders,
  Crown,
  Laptop,
  Key,
  Star,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentContainer from "@/components/layout/ContentContainer";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { useAppearanceStore } from "@/store/appearanceStore";
import { AuthService } from "@/services/auth.service";
import { PaymentService } from "@/services/payment.service";
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

const parseUserAgent = (ua: string) => {
  if (!ua || ua.includes("Unknown")) return "Unknown Device";
  if (ua.toLowerCase().includes("node") || ua.toLowerCase().includes("postman")) return "System/API Client";
  
  let browser = "Unknown Browser";
  if (ua.includes("Firefox") || ua.includes("FxiOS")) browser = "Mozilla Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
  else if (ua.includes("Edge") || ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome") || ua.includes("CriOS")) browser = "Google Chrome";
  else if (ua.includes("Safari")) browser = "Apple Safari";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X") && !ua.includes("iPhone") && !ua.includes("iPad")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone")) os = "iPhone";
  else if (ua.includes("iPad")) os = "iPad";

  if (browser === "Unknown Browser" && os === "Unknown OS") return ua;
  return `${browser} on ${os}`;
};

export default function SettingsPage() {
  const showToast = useNotificationStore((state) => state.showToast);
  const { user, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const isScrollingRef = useRef(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const compressImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context."));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed Base64 data URL
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast("Compressing and uploading avatar...", "info");
      // Compress to maximum 200x200 pixels at 75% JPEG quality
      const compressedBase64 = await compressImage(file, 200, 200, 0.75);
      
      await AuthService.updateProfile({ avatar: compressedBase64 });
      showToast("Avatar updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update avatar.", "info");
    }
  };

  // Profile Form States
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [backupEmail, setBackupEmail] = useState("");

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences States
  const [defaultLanguage, setDefaultLanguage] = useState("Python");
  const [tabSpacingSetting, setTabSpacingSetting] = useState("2 Spaces");


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

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setUsername(user.email ? user.email.split("@")[0] : "coder");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setWebsite(user.socialLinks?.website || "");
      setGithub(user.socialLinks?.github || "");
      setLinkedin(user.socialLinks?.linkedin || "");
      setTwitter(user.socialLinks?.twitter || "");
      setLeetcode(user.socialLinks?.leetcode || "");
      setBackupEmail(user.backupEmail || "");

      if (user.notifs) {
        setNotifs((n) => ({ ...n, ...user.notifs }));
      }
      if (user.twoFactor !== undefined) {
        setTwoFactor(user.twoFactor);
      }
    }
  }, [user]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("fullprep_default_language");
      if (savedLang) {
        const langMap: Record<string, string> = { "python": "Python", "cpp": "C++", "java": "Java", "javascript": "TypeScript", "go": "Go" };
        setDefaultLanguage(langMap[savedLang] || "Python");
      }
      
      const rawSettings = localStorage.getItem("fullprep_editor_settings");
      if (rawSettings) {
        try {
          const parsed = JSON.parse(rawSettings);
          if (parsed.tabSize === 2) setTabSpacingSetting("2 Spaces");
          else if (parsed.tabSize === 4) setTabSpacingSetting("4 Spaces");
        } catch {}
      }
    }
  }, []);

  // Appearance & Theme Configuration
  const {
    theme: selectedTheme,
    accent: selectedAccent,
    compactMode,
    sidebarCollapsedDefault: sidebarCollapsed,
    uiAnimations,
    setTheme: setSelectedTheme,
    setAccent: setSelectedAccent,
    setCompactMode,
    setSidebarCollapsedDefault: setSidebarCollapsed,
    setUiAnimations
  } = useAppearanceStore();

  // Connected Sessions
  const [sessions, setSessions] = useState<any[]>([]);

  const fetchSessions = async () => {
    try {
      const data = await AuthService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchSessions();
    }
  }, [mounted]);

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
    const sections = ["profile", "account", "preferences", "privacy", "connected", "appearance", "billing", "data", "danger"];
    
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mounted]);


  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    isScrollingRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      // Use manual offset instead of scrollIntoView to keep the navbar visible.
      // Navbar is 76px tall; add 20px breathing room = 96px total offset.
      const NAVBAR_OFFSET = 96;
      const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 700);
    }
  };

  const handleSaveChanges = async () => {
    showToast("Saving changes...", "info");
    try {
      await AuthService.updateProfile({
        name: displayName,
        bio,
        socialLinks: {
          github,
          linkedin,
          twitter,
          website,
          leetcode
        },
        location,
        backupEmail,
        notifs,
        twoFactor
      });

      // Save preferences to localStorage
      if (typeof window !== "undefined") {
        const langMap: Record<string, string> = { "Python": "python", "C++": "cpp", "Java": "java", "TypeScript": "javascript", "Go": "go" };
        localStorage.setItem("fullprep_default_language", langMap[defaultLanguage] || "python");

        const settingsToSave = {
          tabSize: tabSpacingSetting === "2 Spaces" ? 2 : 4
        };
        localStorage.setItem("fullprep_editor_settings", JSON.stringify(settingsToSave));
      }

      showToast("Changes saved successfully to your FullPrep profile!", "success");
      // Dispatch location event so the LocationToast hides when location is set
      if (location && location.trim()) {
        window.dispatchEvent(new Event("fp-location-set"));
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save profile changes.", "info");
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "info");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "info");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "info");
      return;
    }
    showToast("Updating password...", "info");
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      showToast("Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update password.", "info");
    }
  };

  // For OAuth-only users: set password for the first time (no old password needed)
  const handleCreatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast("Please fill in both password fields.", "info");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "info");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters long.", "info");
      return;
    }
    showToast("Creating password...", "info");
    try {
      await AuthService.createPassword(newPassword, confirmPassword);
      showToast("Password created! You can now log in with email.", "success");
      setNewPassword("");
      setConfirmPassword("");
      if (user) setUser({ ...user, isOAuthUser: false });
    } catch (err: any) {
      showToast(err.message || "Failed to create password.", "info");
    }
  };

  // Razorpay payment handler
  const handleUpgradeToPremium = useCallback(async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);
    try {
      const { order, key, user: userInfo } = await PaymentService.createOrder();
      // Load Razorpay SDK dynamically
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }
      const rzp = new (window as any).Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "FullPrep Premium",
        description: "Premium Subscription — 1 Month",
        image: "/logo.png",
        prefill: { name: userInfo.name, email: userInfo.email },
        theme: { color: "var(--brand-accent, #ff6a00)" },
        handler: async (response: any) => {
          try {
            const result = await PaymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Update auth store with the new premium user data
            if (result.user) setUser(result.user);
            showToast("Welcome to FullPrep Premium! ", "success");
          } catch (err: any) {
            showToast(err.message || "Payment verification failed.", "info");
          }
        },
        modal: { ondismiss: () => setPaymentLoading(false) },
      });
      rzp.open();
    } catch (err: any) {
      showToast(err.message || "Could not start payment. Try again.", "info");
      setPaymentLoading(false);
    }
  }, [paymentLoading, setUser, showToast]);

  // Load payment history when billing tab is active
  useEffect(() => {
    if (activeTab === "billing" && user) {
      PaymentService.getPaymentHistory().then(setPaymentHistory);
    }
  }, [activeTab, user]);

  const tabsList = [
    { id: "profile", name: "Profile Settings", icon: User },
    { id: "account", name: "Account Settings", icon: Settings },
    { id: "preferences", name: "Preferences", icon: Sliders },
    { id: "privacy", name: "Privacy & Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "billing", name: "Billing & Subscription", icon: CreditCard },
    { id: "data", name: "Data & Export", icon: Download },
    { id: "danger", name: "Danger Zone", icon: AlertTriangle },
  ];

  const accentsList = [
    { id: "orange", name: "Orange Glow", color: "bg-brand-orange", focusGlow: "focus:border-brand-orange/40 focus:ring-brand-orange/20" },
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

  if (!mounted) {
    return <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#060816]" />;
  }

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
          className="flex items-center justify-center bg-brand-orange hover:bg-[#e05d00] text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-md shadow-brand-orange/15 hover:shadow-[0_0_12px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.3)] cursor-pointer self-start sm:self-center transition-all duration-200 leading-none h-[38px] hover:scale-[1.01]"
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
                        ? "bg-brand-orange/[0.10] text-brand-orange border-brand-orange/[0.24] shadow-[inset_0_0_0_1px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.05)] font-semibold"
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
          {!user?.isPremiumActive && (
          <div className="rounded-[22px] p-[16px] border border-[#ff8c28]/20 dark:border-[#ff8c28]/16 shadow-[0_8px_24px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.05)] relative overflow-hidden group transition-all duration-300 flex flex-col gap-[10px] self-stretch mt-[6px] bg-gradient-to-b from-brand-orange/[0.08] to-brand-orange/[0.02] dark:from-brand-orange/[0.10] dark:to-brand-orange/[0.04]">
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
              onClick={handleUpgradeToPremium}
              className="w-full h-[36px] bg-gradient-to-r from-brand-orange to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-bold rounded-[12px] text-[11.5px] flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.15)] hover:shadow-[0_0_12px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.3)] transition-all duration-200 cursor-pointer leading-none border-none shrink-0"
            >
              <span>Upgrade Now</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          )}
        </div>

        {/* RIGHT COLUMN: Scrollable Unified Settings Content */}
        <div className="flex-1 flex flex-col gap-6 w-full min-w-0 text-left">
          
          {/* ──────────────────────────────────────────
              PROFILE SETTINGS SECTION
              ────────────────────────────────────────── */}
          {activeTab === "profile" && (
          <section id="profile" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
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
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="relative group">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user?.name || "User"} className="w-24 h-24 rounded-full object-cover shadow-lg shrink-0 border border-slate-900/[0.08] dark:border-white/[0.08]" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange/60 flex items-center justify-center font-bold text-[36px] text-white border border-slate-900/[0.08] dark:border-white/[0.08] shadow-lg shadow-brand-orange/10 shrink-0 select-none relative overflow-hidden">
                        <span className="group-hover:scale-95 transition-transform duration-300">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white dark:border-[#0d0e19] absolute bottom-1 right-1 shadow-md shadow-[#10b981]/30 animate-pulse" />
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
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
                        placeholder="Your name"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputStyle}
                        placeholder="your_username"
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
                          placeholder="e.g., https://yourwebsite.dev"
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
                  { name: "GitHub", label: "github.com/", val: github, setVal: setGithub, icon: GithubIcon, borderClass: "hover:border-slate-900/10 dark:hover:border-[#ffffff]/15 hover:shadow-[0_4px_12px_rgba(255,255,255,0.02)]" },
                  { name: "LinkedIn", label: "linkedin.com/in/", val: linkedin, setVal: setLinkedin, icon: LinkedinIcon, borderClass: "hover:border-[#0a66c2]/10 dark:hover:border-[#0a66c2]/15 hover:shadow-[0_4px_12px_rgba(10,102,194,0.02)]" },
                  { name: "Twitter/X", label: "twitter.com/", val: twitter, setVal: setTwitter, icon: TwitterIcon, borderClass: "hover:border-slate-900/10 dark:hover:border-[#ffffff]/10 hover:shadow-[0_4px_12px_rgba(255,255,255,0.01)]" },
                  { name: "LeetCode", label: "leetcode.com/", val: leetcode, setVal: setLeetcode, icon: Code2, borderClass: "hover:border-brand-orange/10 dark:hover:border-brand-orange/15 hover:shadow-[0_4px_12px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.02)]" },
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
                        <input 
                          type="text" 
                          value={item.val} 
                          onChange={(e) => item.setVal(e.target.value)}
                          className="w-full bg-transparent text-[11px] font-medium text-[#111827] dark:text-white border-none focus:outline-none focus:ring-0 p-0 ml-1 leading-none" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
                </motion.div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              ACCOUNT SETTINGS SECTION
              ────────────────────────────────────────── */}
          {activeTab === "account" && (
          <section id="account" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
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
                    <input type="email" value={user?.email || ""} className={cn(inputStyle, "opacity-65 select-none")} disabled />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className={labelStyle}>Backup Recovery Email</label>
                    <input 
                      type="email" 
                      placeholder="backup-recovery@email.com" 
                      value={backupEmail}
                      onChange={(e) => setBackupEmail(e.target.value)}
                      className={inputStyle} 
                    />
                  </div>
                </div>

                <div className="border border-white/[0.04] rounded-xl p-4 bg-slate-900/[0.02] dark:bg-[#111217]/15 flex flex-col gap-4">
                  <h4 className="text-[12.5px] font-bold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{user?.isOAuthUser ? "Set Account Password" : "Change Secure Password"}</span>
                    {user?.isOAuthUser && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-wider ml-1">Google Account</span>
                    )}
                  </h4>
                  {user?.isOAuthUser ? (
                    // OAuth-only users: no current password needed
                    <>
                      <p className="text-[11.5px] text-slate-500 dark:text-white/50 leading-relaxed -mt-1">
                        You signed up with Google. Set a password to enable email + password login as an additional option.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col text-left">
                          <label className={labelStyle}>New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <label className={labelStyle}>Confirm Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleCreatePassword}
                        className="bg-brand-orange/10 hover:bg-brand-orange/15 dark:bg-brand-orange/15 dark:hover:bg-brand-orange/20 border border-brand-orange/20 dark:border-brand-orange/30 text-brand-orange text-[11px] font-bold rounded-lg px-4 py-2 self-end transition-all duration-200 cursor-pointer h-[32px] leading-none"
                      >
                        Set Password
                      </button>
                    </>
                  ) : (
                    // Regular users: need current password
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-1.5">
                        <div className="flex flex-col text-left">
                          <label className={labelStyle}>Current Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <label className={labelStyle}>New Secure Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <label className={labelStyle}>Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleUpdatePassword}
                        className="bg-brand-orange/10 hover:bg-brand-orange/15 dark:bg-brand-orange/15 dark:hover:bg-brand-orange/20 border border-brand-orange/20 dark:border-brand-orange/30 text-brand-orange text-[11px] font-bold rounded-lg px-4 py-2 self-end transition-all duration-200 cursor-pointer h-[32px] leading-none"
                      >
                        Change Password
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
                </motion.div>
          </section>
          )}

          {/* ──────────────────────────────────────────
          <section id="account" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
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
                    <input type="email" value={user?.email || ""} className={cn(inputStyle, "opacity-65 select-none")} disabled />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className={labelStyle}>Backup Recovery Email</label>
                    <input 
                      type="email" 
                      placeholder="backup-recovery@email.com" 
                      value={backupEmail}
                      onChange={(e) => setBackupEmail(e.target.value)}
                      className={inputStyle} 
                    />
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
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputStyle} 
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>New Secure Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputStyle} 
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className={labelStyle}>Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputStyle} 
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpdatePassword}
                    className="bg-brand-orange/10 hover:bg-brand-orange/15 dark:bg-brand-orange/15 dark:hover:bg-brand-orange/20 border border-brand-orange/20 dark:border-brand-orange/30 text-brand-orange text-[11px] font-bold rounded-lg px-4 py-2 self-end transition-all duration-200 cursor-pointer h-[32px] leading-none"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
                </motion.div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              PREFERENCES SECTION
              ────────────────────────────────────────── */}
          {activeTab === "preferences" && (
          <section id="preferences" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
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
                  { label: "Default Programming Language", opt: ["Python", "C++", "Java", "TypeScript", "Go"], val: defaultLanguage, setVal: setDefaultLanguage },
                  { label: "Editor Tab Indent Spacing", opt: ["2 Spaces", "4 Spaces"], val: tabSpacingSetting, setVal: setTabSpacingSetting },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col text-left">
                    <label className={labelStyle}>{item.label}</label>
                    <div className="relative mt-2">
                      <select 
                        value={item.val}
                        onChange={(e) => item.setVal(e.target.value)}
                        className={cn(
                          "w-full border border-slate-900/[0.08] dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#0a0b12]/60 px-3.5 text-sm font-medium text-[#111827] dark:text-white focus:outline-none appearance-none h-10 leading-none cursor-pointer",
                          activeAccent.focusGlow
                        )}
                      >
                        {item.opt.map((o) => (
                          <option key={o} value={o} className="bg-white text-[#111827] dark:bg-[#111217] dark:text-white">{o}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-[12px] pointer-events-none text-slate-400 dark:text-text-secondary/50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
                </motion.div>
          </section>
          )}



          {/* ──────────────────────────────────────────
              PRIVACY & SECURITY SECTION
              ────────────────────────────────────────── */}
          {activeTab === "privacy" && (
          <section id="privacy" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >


            {/* Card 2: Connected Devices Sessions */}
            <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Laptop className="w-4 h-4 text-brand-orange" />
                <span>Connected Sessions & Activity</span>
              </h3>
              <div className="flex flex-col gap-4 w-full">
                {sessions.map((session, idx) => (
                  <div key={session._id || idx} className="flex items-center justify-between py-2 border-b border-slate-900/[0.06] dark:border-white/[0.04] last:border-0 pb-3.5 last:pb-0">
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="w-9 h-9 rounded-lg bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0">
                        <Smartphone className="w-4.5 h-4.5 text-slate-400 dark:text-text-secondary" />
                      </div>
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[13px] font-semibold text-[#111827] dark:text-white leading-none">{parseUserAgent(session.deviceInfo)}</span>
                        <span className="text-[10.5px] text-slate-500 dark:text-text-secondary/70 mt-2 leading-none">{session.ipAddress} • Last active: {new Date(session.lastActive).toLocaleString()}</span>
                      </div>
                    </div>
                    {session.isCurrent ? (
                      <span className="px-2.5 py-1 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/10 text-[9px] font-extrabold uppercase tracking-wide leading-none">Current</span>
                    ) : (
                      <button 
                        onClick={async () => {
                          showToast("Revoking connection session...", "info");
                          try {
                            await AuthService.revokeSession(session._id);
                            fetchSessions();
                            showToast("Session revoked.", "success");
                          } catch (err) {
                            showToast("Failed to revoke session.", "info");
                          }
                        }} 
                        className="border border-[#f43f5e]/20 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 text-[10.5px] font-bold rounded-lg px-3 py-1.5 transition-all cursor-pointer leading-none"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-[12px] text-text-secondary font-medium text-center py-4">No active sessions found.</div>
                )}
              </div>
            </div>

                </motion.div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              APPEARANCE SECTION
              ────────────────────────────────────────── */}
          {activeTab === "appearance" && (
          <section id="appearance" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("overflow-hidden flex flex-col gap-4 w-full relative group", !user?.isPremiumActive && "pointer-events-none select-none")}
                  >
                    {!user?.isPremiumActive && (
                      <div className="absolute inset-0 bg-[#060816]/60 backdrop-blur-[4px] z-50 flex flex-col items-center justify-center gap-3 opacity-100 transition-opacity duration-300 rounded-2xl">
                        <Crown className="w-8 h-8 text-brand-orange" />
                        <span className="px-3 py-1.5 rounded-lg bg-card-bg border border-border-card text-[12px] font-bold text-brand-orange shadow-lg">Premium Feature</span>
                        <p className="text-[11px] text-white/50 text-center max-w-[200px]">Upgrade to Premium to unlock custom themes and accents.</p>
                        <button
                          onClick={() => scrollToSection("billing")}
                          className="pointer-events-auto px-4 py-2 rounded-lg bg-brand-orange text-white text-[11px] font-bold cursor-pointer hover:bg-[#e05d00] transition-all"
                        >
                          Go to Billing
                        </button>
                      </div>
                    )}
                    {/* Card 1: Theme Select Grid */}
                  <div className={cardBase}>
              <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-orange" />
                <span>Customize Platform Theme</span>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-brand-orange/10 to-brand-orange/20 border border-brand-orange/20 text-[9px] font-bold text-brand-orange tracking-wider uppercase ml-1">
                  Pro Tier
                </span>
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
                      selectedTheme === theme.id ? "border-brand-orange shadow-[0_0_15px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.15)]" : "border-white/[0.05] hover:border-white/[0.12]",
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
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-brand-orange/10 to-brand-orange/20 border border-brand-orange/20 text-[9px] font-bold text-brand-orange tracking-wider uppercase ml-1">
                  Pro Tier
                </span>
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
                          pref.state ? "bg-brand-orange shadow-[0_0_6px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.2)]" : "bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]"
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
          </section>
          )}

          {/* ──────────────────────────────────────────
              BILLING & SUBSCRIPTION SECTION
              ────────────────────────────────────────── */}
          {activeTab === "billing" && (
          <section id="billing" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden flex flex-col gap-4 w-full"
                >
                  {/* Card 1: Current Plan */}
                  <div className={cardBase}>
                    <div className="flex items-center justify-between w-full flex-wrap gap-4">
                      <div className="flex items-start gap-4 text-left leading-none">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          user?.isPremiumActive
                            ? "bg-gradient-to-br from-brand-orange/20 to-[#8b5cf6]/20 border border-brand-orange/30"
                            : "bg-brand-orange/10 border border-brand-orange/20"
                        )}>
                          {user?.isPremiumActive ? (
                            <Star className="w-6 h-6 text-brand-orange" />
                          ) : (
                            <Crown className="w-6 h-6 text-brand-orange" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center leading-none gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15.5px] font-bold text-[#111827] dark:text-white leading-none">
                              {user?.isPremiumActive ? "FullPrep Premium" : "FullPrep Free Plan"}
                            </span>
                            <span className={cn(
                              "px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest leading-none",
                              user?.isPremiumActive
                                ? "bg-gradient-to-r from-brand-orange/20 to-[#8b5cf6]/20 border border-brand-orange/30 text-brand-orange"
                                : "bg-white/[0.06] text-[#9ca3af] border border-white/[0.06]"
                            )}>
                              {user?.isPremiumActive ? "Active" : "Free"}
                            </span>
                          </div>
                          {user?.isPremiumActive && user.proExpiresAt ? (
                            <div className="flex items-center gap-1.5 text-[11.5px] text-white/55 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Active until {new Date(user.proExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-white/60 font-medium leading-relaxed">
                              Enjoy unlimited practice problems, competitive leaderboards, and weekly performance insights.
                            </p>
                          )}
                        </div>
                      </div>
                      {!user?.isPremiumActive && (
                        <button
                          onClick={handleUpgradeToPremium}
                          disabled={paymentLoading}
                          className="bg-gradient-to-r from-brand-orange to-[#e05d00] hover:from-[#e05d00] hover:to-[#cc5200] disabled:opacity-60 text-white text-[12.5px] font-bold rounded-xl px-5 py-2.5 transition-all duration-200 cursor-pointer shadow-md shadow-brand-orange/20 hover:shadow-[0_0_16px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.35)] h-[40px] leading-none shrink-0 flex items-center gap-2"
                        >
                          {paymentLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                          Upgrade to Premium — ₹399/mo
                        </button>
                      )}
                      {user?.isPremiumActive && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] font-bold text-emerald-400">Premium Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: What you get with Premium */}
                  {!user?.isPremiumActive && (
                    <div className={cardBase}>
                      <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-orange" />
                        <span>What&apos;s included in Premium</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                        {[
                          { icon: Zap, label: "Unlimited AI Hints", desc: "No daily limits on Gemini AI hints" },
                          { icon: Palette, label: "Custom Themes & Accents", desc: "Unlock all appearance customizations" },
                          { icon: Activity, label: "Advanced Analytics", desc: "Detailed performance insights and trends" },
                          { icon: Crown, label: "Priority Support", desc: "Faster response from the FullPrep team" },
                        ].map((feat) => {
                          const Icon = feat.icon;
                          return (
                            <div key={feat.label} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-brand-orange" />
                              </div>
                              <div>
                                <div className="text-[12.5px] font-bold text-white leading-none">{feat.label}</div>
                                <div className="text-[11px] text-white/50 mt-1 leading-none">{feat.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={handleUpgradeToPremium}
                        disabled={paymentLoading}
                        className="w-full mt-2 bg-gradient-to-r from-brand-orange to-[#e05d00] hover:from-[#e05d00] hover:to-[#cc5200] disabled:opacity-60 text-white text-[13px] font-bold rounded-xl py-3.5 transition-all duration-200 cursor-pointer shadow-md shadow-brand-orange/20 hover:shadow-[0_0_20px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.3)] flex items-center justify-center gap-2"
                      >
                        {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                        Upgrade to Premium — ₹399 / month
                      </button>
                    </div>
                  )}

                  {/* Card 3: Usage stats */}
                  <div className={cn(cardBase)}>
                    <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-orange" />
                      <span>Resource Allocation &amp; Billing Usage</span>
                    </h3>
                    <div className="flex flex-col gap-5 w-full">
                      {[
                        { label: "Daily AI Hints Used", current: user?.isPremiumActive ? 0 : 5, max: user?.isPremiumActive ? 100 : 5, pct: user?.isPremiumActive ? 0 : 100, color: "from-brand-orange to-[#ff8c3a]" },
                        { label: "Cloud Backup Storage", current: 12.8, max: 100, pct: 12.8, unit: "MB", color: "from-[#8b5cf6] to-[#a78bfa]" },
                      ].filter(item => !user?.isPremiumActive || item.label !== "Daily AI Hints Used").map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2.5 py-0.5">
                          <div className="flex items-center justify-between text-[12.5px] font-bold text-[#111827] dark:text-white leading-none">
                            <span>{item.label}</span>
                            <span className="text-brand-orange font-semibold">{item.current} / {item.max} {item.unit || ""}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900/5 dark:bg-[#111219] border border-slate-900/[0.08] dark:border-white/[0.04] rounded-full overflow-hidden">
                            <div className={cn("h-full bg-gradient-to-r rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 4: Payment History */}
                  {paymentHistory.length > 0 && (
                    <div className={cardBase}>
                      <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-orange" />
                        <span>Payment History</span>
                      </h3>
                      <div className="flex flex-col gap-2">
                        {paymentHistory.map((payment: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div>
                                <div className="text-[12px] font-bold text-white leading-none">Premium Subscription</div>
                                <div className="text-[10px] text-white/40 mt-1 font-mono">{payment.razorpayPaymentId}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[12px] font-bold text-emerald-400">₹{(payment.amount / 100).toFixed(0)}</div>
                              <div className="text-[10px] text-white/40 mt-0.5">
                                {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              DATA & EXPORT SECTION
              ────────────────────────────────────────── */}
          {activeTab === "data" && (
          <section id="data" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
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
                  onClick={async () => {
                    showToast("Preparing secure backup package... download starting shortly.", "info");
                    try {
                      const data = await AuthService.exportData();
                      if (data) {
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `fullprep-export-${new Date().toISOString().split("T")[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        showToast("Backup package downloaded successfully.", "success");
                      } else {
                        showToast("Failed to generate backup package.", "info");
                      }
                    } catch (err) {
                      showToast("Error during data export.", "info");
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 border border-slate-900/[0.08] dark:border-white/[0.08] hover:bg-slate-900/5 dark:hover:bg-white/[0.04] bg-slate-900/5 dark:bg-[#111217]/50 text-[#111827] dark:text-[#f3f4f6] text-[12px] font-bold rounded-xl px-5 py-2.5 transition-all cursor-pointer self-start h-[38px] leading-none"
                >
                  <Download className="w-4 h-4 text-[#9ca3af]" />
                  <span>Download Backup Package (JSON)</span>
                </button>
              </div>
            </div>
                </motion.div>
          </section>
          )}

          {/* ──────────────────────────────────────────
              DANGER ZONE SECTION
              ────────────────────────────────────────── */}
          {activeTab === "danger" && (
          <section id="danger" className="scroll-mt-[100px] flex flex-col gap-4 w-full min-w-0">
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
                <a
                  href={`mailto:support@fullprep.com?subject=Account Deletion Request - ${user?.email}&body=Hi Support Team,%0D%0A%0D%0AI would like to request the deletion of my FullPrep account. %0D%0A%0D%0AReason for deletion:%0D%0A[Please type your reason here]%0D%0A%0D%0AAccount Details:%0D%0AEmail: ${user?.email}%0D%0AName: ${user?.name}%0D%0A`}
                  className="bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[11px] font-bold rounded-lg px-4.5 py-2.5 transition-all cursor-pointer h-[32px] leading-none shrink-0 self-center flex items-center justify-center"
                >
                  Request Deletion
                </a>
              </div>
            </div>
                </motion.div>
          </section>
          )}

        </div>

      </div>

    </ContentContainer>
  );
}

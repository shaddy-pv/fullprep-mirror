"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "@/components/ui/Badge";
import { SIDEBAR_MENU_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/store/DashboardContext";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore, getCurrentStreak } from "@/store/authStore";
import { AuthService } from "@/services/auth.service";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);
  const { isSidebarCollapsed, setIsMobileSidebarOpen } = useDashboard();
  const user = useAuthStore((state) => state.user);
  const currentStreak = getCurrentStreak(user);

  const [showMiniPanel, setShowMiniPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowMiniPanel(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMiniPanel(false);
      }
    };
    if (showMiniPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMiniPanel]);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMiniPanel(false);
    showToast("Signed out successfully.", "success");
    // Clear session cookies and storage synchronously to trigger un-auth state
    if (typeof window !== "undefined") {
      localStorage.removeItem("fp_token");
      document.cookie = "fp_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
    }
    // Navigate immediately to login page
    window.location.href = "/login";
    // Trigger background API logout request
    AuthService.logout().catch(() => {});
  };

  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    AuthService.getStats().then((stats) => {
      setUserStats(stats);
    }).catch(() => {});
  }, [user?.streak]); // Refresh if user streak updates via submission

  // Calculate dynamic 7-day streak representation based on real activity data
  const dynamicStreakDays = React.useMemo(() => {
    const activityDots = (userStats?.dailyActivity || []).map((d: any) => ({
      label: (d.label || "?").charAt(0),
      status: d.accepted > 0 ? "completed" : d.total > 0 ? "partial" : "empty",
    }));

    // Pad to 7 days if not enough data
    while (activityDots.length < 7) {
      activityDots.unshift({ label: "?", status: "empty" });
    }
    
    return activityDots;
  }, [userStats]);

  return (
    <aside 
      className={cn(
        "bg-[#fafafa] dark:bg-[#06090f] text-text-primary dark:text-white h-full flex flex-col select-none shrink-0 border-r border-black/[0.04] dark:border-white/[0.04] transition-all duration-300 ease-in-out relative z-40 overflow-hidden",
        isSidebarCollapsed ? "w-[80px]" : "w-[270px]"
      )}
    >
      {/* Top Section: Logo & Mobile Close Button */}
      <div className={cn("flex-1 min-h-0 flex flex-col overflow-y-auto transition-all duration-300", isSidebarCollapsed ? "p-4" : "p-6")}>
        <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between")}>
          <Link href="/" className="text-brand-orange flex items-center font-bold tracking-[-0.02em] mx-auto md:mx-0">
            <span className="text-[18px] font-extrabold font-mono">&lt;/&gt;</span>
            <span 
              className={cn(
                "transition-all duration-300 overflow-hidden whitespace-nowrap text-[16px] font-bold ml-1.5",
                isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
              )}
            >
              FullPrep
            </span>
          </Link>

          {/* Close Drawer Button for Mobile Screens */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-text-secondary hover:text-text-primary dark:text-[#9ca3af] dark:hover:text-white p-1 rounded-lg cursor-pointer ml-auto"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 space-y-[6px]">
          {SIDEBAR_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            
            // Check active state dynamically based on pathname routing
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : item.href !== "#" && pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  setIsMobileSidebarOpen(false); // Close drawer on mobile item tap
                }}
                className={cn(
                  "w-full flex items-center rounded-xl text-[14px] font-medium tracking-[-0.01em] transition-all duration-200 cursor-pointer relative",
                  isSidebarCollapsed ? "justify-center h-11 w-11 mx-auto px-0" : "justify-between px-4 py-2.5",
                  isActive
                    ? cn(
                        "text-text-primary dark:text-white border border-brand-orange/20 shadow-[0_0_14px_rgba(255,106,0,0.12)] bg-brand-orange/6",
                        isSidebarCollapsed 
                          ? "before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[3px] before:bg-brand-orange before:rounded-r-md"
                          : "before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[3px] before:bg-brand-orange before:rounded-r-md"
                      )
                    : "text-text-secondary hover:text-text-primary dark:text-[#9ca3af] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border border-transparent"
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <div className="flex items-center">
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] transition-colors shrink-0",
                      isActive ? "text-brand-orange" : "text-text-muted dark:text-[#9ca3af]"
                    )}
                  />
                  <span 
                    className={cn(
                      "transition-all duration-300 whitespace-nowrap overflow-hidden",
                      isSidebarCollapsed 
                        ? "w-0 opacity-0 pointer-events-none absolute" 
                        : "w-auto opacity-100 ml-3.5"
                    )}
                  >
                    {item.name}
                  </span>
                </div>

                {/* Badge layout based on expanded/collapsed state */}
                {item.badge && (
                  <>
                    {!isSidebarCollapsed ? (
                      <Badge variant="ai">
                        {item.badge}
                      </Badge>
                    ) : (
                      /* Glowing Purple Dot for Collapsed State with reduced glow intensity */
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8b5cf6] rounded-full ring-2 ring-[#111217] dark:ring-[#06090f] shadow-[0_0_4px_rgba(139,92,246,0.45)] transition-all duration-300" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div 
        ref={panelRef}
        className={cn("flex-none transition-all duration-300 space-y-4 relative", isSidebarCollapsed ? "px-3 pb-4" : "px-6 pb-6")}
      >
        {/* Streak Glassmorphism Card (Collapses smoothly) - Hidden on AI Hints page to prevent sidebar vertical overflow */}
        {pathname !== "/ai-hints" && (
          <div 
            className={cn(
              "bg-gradient-to-b from-[#f3f4f6] to-[#f9fafb] dark:from-[#11131c] dark:to-[#090a10] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl shadow-sm transition-all duration-300 ease-in-out origin-bottom",
              isSidebarCollapsed 
                ? "opacity-0 h-0 scale-95 overflow-hidden p-0 border-0 my-0 pointer-events-none" 
                : "opacity-100 h-auto p-4 my-4"
            )}
          >
            <div className="text-[10px] text-text-secondary dark:text-[#9ca3af] font-semibold tracking-widest uppercase mb-1">
              Current Streak
            </div>
            <div className="text-2xl font-bold text-brand-orange flex items-baseline gap-1.5 mb-1.5 tracking-[-0.02em]">
              {currentStreak} Days
            </div>
            <p className="text-[11px] text-text-secondary/90 dark:text-[#9ca3af]/90 font-normal leading-normal mb-4 tracking-[-0.01em]">
              Keep solving to maintain your coding streak.
            </p>
            <div className="flex justify-between items-center px-1">
              {dynamicStreakDays.map((day: { label: string; status: string }, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  {day.status === "completed" ? (
                    <div className="w-[10px] h-[10px] rounded-full bg-brand-orange shadow-[0_0_8px_rgba(255,106,0,0.6)]" />
                  ) : day.status === "partial" ? (
                    <div className="w-[10px] h-[10px] rounded-full relative overflow-hidden bg-black/5 dark:bg-[#2d2e38] border border-black/5 dark:border-white/[0.1]">
                      <div className="absolute top-0 left-0 w-1/2 h-full bg-brand-orange" />
                    </div>
                  ) : (
                    <div className="w-[10px] h-[10px] rounded-full bg-black/5 dark:bg-[#2d2e38] border border-black/5 dark:border-white/[0.1]" />
                  )}
                  <span className="text-[9px] text-text-secondary dark:text-[#6b7280] font-semibold">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade to Premium Card (Only visible on /ai-hints path when sidebar is expanded, swaps with Streak Card) */}
        {!isSidebarCollapsed && pathname === "/ai-hints" && !user?.isPremiumActive && (
          <div className="bg-[#f1f5f9] dark:bg-[#11131c] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-4.5 text-left shadow-lg relative overflow-hidden select-none my-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#ff6a00]/10 to-transparent blur-xl rounded-full" />
            <div className="flex items-center gap-1.5 text-[10px] text-brand-orange font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
              <span>Upgrade to Premium</span>
            </div>
            <p className="text-[11px] text-text-secondary/90 dark:text-[#9ca3af]/90 font-medium leading-normal mb-3.5">
              Unlock unlimited AI hints, advanced explanations and more.
            </p>
            <button 
              onClick={() => router.push("/settings#billing")}
              className="w-full py-2 bg-brand-orange hover:bg-[#e05d00] text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(255,106,0,0.2)] transition-all duration-300 cursor-pointer"
            >
              <span>Upgrade Now</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}

        {/* Stateful Quick Profile Launcher Floating Popover above/beside Bottom Profile Card */}
        <AnimatePresence>
          {showMiniPanel && (
            <motion.div
              initial={isSidebarCollapsed ? { opacity: 0, scale: 0.95, x: -10 } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={isSidebarCollapsed ? { opacity: 1, scale: 1, x: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isSidebarCollapsed ? { opacity: 0, scale: 0.95, x: -10 } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "bg-white/95 dark:bg-[#06090f]/95 backdrop-blur-xl border border-brand-orange/15 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),_0_0_15px_rgba(255,106,0,0.08)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),_0_0_15px_rgba(255,106,0,0.08)] z-50 text-left p-4 select-none absolute",
                isSidebarCollapsed ? "bottom-4 left-[86px] w-[230px]" : "bottom-[72px] left-4 right-4"
              )}
            >
              {/* Profile Card Header details */}
              <div className="flex items-center gap-3 select-none leading-none mb-3.5">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user?.name || "User"} 
                    className="w-10 h-10 rounded-full object-cover border border-white/[0.1] shadow-md shadow-black/5 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-[#8b5cf6] flex items-center justify-center font-bold text-base text-white border border-white/[0.1] shadow-md shadow-black/5 shrink-0 font-mono">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex flex-col text-left leading-none min-w-0">
                  <span className="text-[13.5px] font-extrabold text-text-primary dark:text-white truncate leading-none">{user?.name || "User"}</span>
                  <span className="text-[10px] text-text-secondary/70 dark:text-[#9ca3af]/70 font-bold mt-1.5 select-text font-sans truncate leading-none">@{user?.name?.toLowerCase() || "user"}</span>
                </div>
              </div>

              {/* Solved Streak Rating Statistics Grid */}
              <div className="grid grid-cols-3 gap-1 border-y border-black/[0.04] dark:border-white/[0.04] py-3 my-3 text-center leading-none">
                <div className="flex flex-col gap-1 items-center justify-center leading-none">
                  <span className="text-[9px] text-text-secondary/80 dark:text-[#9ca3af]/80 font-bold leading-none select-none uppercase tracking-wider">Streak</span>
                  <span className="text-[13px] font-extrabold text-brand-orange leading-none mt-1.5 font-sans select-none">{currentStreak}d</span>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center leading-none border-x border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[9px] text-text-secondary/80 dark:text-[#9ca3af]/80 font-bold leading-none select-none uppercase tracking-wider">Level</span>
                  <span className="text-[13px] font-extrabold text-[#10b981] leading-none mt-1.5 font-sans select-none">{user?.level || 1}</span>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center leading-none">
                  <span className="text-[9px] text-text-secondary/80 dark:text-[#9ca3af]/80 font-bold leading-none select-none uppercase tracking-wider">XP</span>
                  <span className="text-[13px] font-extrabold text-[#8b5cf6] leading-none mt-1.5 font-sans select-none">{user?.xp || 0}</span>
                </div>
              </div>

              {/* Premium micro buttons link tray */}
              <div className="flex items-center gap-2 w-full leading-none">
                <Link 
                  href="/profile" 
                  onClick={() => setShowMiniPanel(false)}
                  className="flex-1 py-2 border border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-brand-orange/10 hover:border-brand-orange/30 hover:text-brand-orange text-[10.5px] font-bold text-text-primary dark:text-white rounded-lg text-center transition-all duration-200 cursor-pointer select-none leading-none font-sans hover:shadow-[0_0_10px_rgba(255,106,0,0.1)]"
                >
                  Profile
                </Link>
                <Link 
                  href="/profile?tab=settings" 
                  onClick={() => setShowMiniPanel(false)}
                  className="flex-1 py-2 border border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-brand-orange/10 hover:border-brand-orange/30 hover:text-brand-orange text-[10.5px] font-bold text-text-primary dark:text-white rounded-lg text-center transition-all duration-200 cursor-pointer select-none leading-none font-sans hover:shadow-[0_0_10px_rgba(255,106,0,0.1)]"
                >
                  Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex-1 py-2 bg-[#f43f5e]/10 border border-[#f43f5e]/20 hover:bg-[#f43f5e]/20 text-[10.5px] font-bold text-[#f43f5e] rounded-lg text-center transition-all duration-200 cursor-pointer select-none leading-none font-sans hover:shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Profile Card (Toggles quick-profile mini popover launcher on tap) */}
        <div 
          onClick={() => setShowMiniPanel(!showMiniPanel)}
          className={cn(
            "flex items-center bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl cursor-pointer shadow-sm transition-all duration-300 transform active:scale-[0.98]",
            isSidebarCollapsed ? "p-1 justify-center w-11 h-11 mx-auto" : "p-3 justify-between",
            showMiniPanel 
              ? "border-brand-orange/40 bg-black/[0.05] dark:bg-white/[0.05] shadow-[0_0_12px_rgba(255,106,0,0.12)]" 
              : "hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-brand-orange/20 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.name || "User"} 
                className={cn("w-9 h-9 rounded-full object-cover shadow-inner shrink-0 select-none transition-all duration-300", user?.isPremiumActive ? "ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-[#11131c]" : "border border-white/[0.1]")} 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={cn("w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-[#8b5cf6] flex items-center justify-center font-bold text-sm text-white shadow-inner shrink-0 select-none font-mono transition-all duration-300", user?.isPremiumActive ? "ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-[#11131c]" : "border border-white/[0.1]")}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div 
              className={cn(
                "flex flex-col text-left transition-all duration-300 min-w-0 overflow-hidden",
                isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none absolute" : "w-auto opacity-100"
              )}
            >
              <span className="text-[13px] font-semibold text-text-primary dark:text-white leading-tight truncate">{user?.name || "User"}</span>
              <span className="text-[10px] text-text-secondary dark:text-[#9ca3af] font-normal truncate">@{user?.name?.toLowerCase() || "user"}</span>
            </div>
          </div>
          <ChevronRight 
            className={cn(
              "w-4 h-4 text-text-muted dark:text-[#9ca3af] transition-all duration-300 shrink-0",
              isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none absolute" : "w-auto opacity-100",
              showMiniPanel && "rotate-90 text-brand-orange"
            )}
          />
        </div>
      </div>
    </aside>
  );
}

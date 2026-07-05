"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useDashboard } from "@/store/DashboardContext";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { AuthService } from "@/services/auth.service";

function NavbarSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [val, setVal] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  // Sync search input with URL on page-specific pages
  useEffect(() => {
    if (pathname === "/problems" || pathname === "/learning-paths") {
      setVal(searchParams.get("search") || "");
    } else {
      setVal("");
    }
  }, [pathname, searchParams]);

  // Keyboard shortcut: press "/" to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    if (!val.trim() || val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // If we are on /problems page, we still want to search users globally via the dropdown.
    // So we don't automatically redirect input to /problems query params anymore.

    // On other pages, show dropdown with API results
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const usersRes = await fetch(`/api/users-search?q=${encodeURIComponent(val)}`);

        let newResults: any[] = [];
        if (usersRes.ok) {
          const users = await usersRes.json();
          newResults = users.slice(0, 7).map((u: any) => ({ ...u, _type: 'user' }));
        }

        setResults(newResults);
        setIsOpen(newResults.length > 0);
      } catch {
        // fallback: just route to problems page on submit
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val, pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    setSelectedIdx(-1);
  };

  const handleSubmit = () => {
    if (!val.trim()) return;
    setIsOpen(false);
    inputRef.current?.blur();
    if (results.length > 0) {
      router.push(`/user/${results[0].name}`);
    } else {
      router.push(`/user/${val.trim()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setVal("");
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      if (selectedIdx >= 0 && results[selectedIdx]) {
        const item = results[selectedIdx];
        if (item._type === 'user') {
          router.push(`/user/${item.name}`);
        } else {
          router.push(`/problems/${item.id}`);
        }
        setIsOpen(false);
        setVal("");
      } else {
        handleSubmit();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, -1));
    }
  };

  const difficultyColor = (d: string) =>
    d === "Easy" ? "text-emerald-500" : d === "Medium" ? "text-yellow-500" : "text-red-500";

  const placeholder = "Search for users...";

  return (
    <div className="relative w-[380px] hidden sm:block">
      {/* Input */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-4.5 w-4.5 text-white/40" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={val}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        className="w-full h-10 pl-11 pr-10 bg-[#0d0f1a]/82 border border-white/[0.06] rounded-xl text-[13px] text-white placeholder-white/40 outline-none shadow-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/40 transition-all duration-300 tracking-[-0.01em]"
      />
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-brand-orange rounded-full animate-spin" />
        ) : (
          <span className="text-[10px] text-white/40 font-bold bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.08] font-mono leading-none">
            /
          </span>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#06090f]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
        >
          {results.map((item, idx) => (
            <button
              key={item._type === 'user' ? item._id : item.id}
              onClick={() => {
                if (item._type === 'user') {
                  router.push(`/user/${item.name}`);
                } else {
                  router.push(`/problems/${item.id}`);
                }
                setIsOpen(false);
                setVal("");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150 border-b border-white/[0.04] last:border-0 ${
                idx === selectedIdx ? "bg-brand-orange/10" : "hover:bg-white/[0.04]"
              }`}
            >
              {item._type === 'user' ? (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0 border border-brand-orange/30 overflow-hidden">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-brand-orange font-bold text-[14px]">{(item.name || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[13px] font-semibold text-white truncate">{item.name}</span>
                      <span className="text-[10px] text-white/40 truncate">Lvl {item.level || 1} • Rank #{item.globalRank || '-'}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold shrink-0 ml-3 text-white/60">
                    User
                  </span>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[13px] font-semibold text-white truncate">{item.title}</span>
                    {item.cfTags?.length > 0 && (
                      <span className="text-[10px] text-white/40 truncate">{item.cfTags.slice(0, 3).join(" · ")}</span>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold shrink-0 ml-3 ${difficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                </>
              )}
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-brand-orange font-bold hover:bg-brand-orange/10 transition-colors duration-150"
          >
            <Search className="w-3.5 h-3.5" />
            <span>See all results for &quot;{val}&quot;</span>
          </button>
        </div>
      )}
    </div>
  );
}

import { NotificationsService } from "@/services/notifications.service";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const { 
    isSidebarCollapsed, 
    setIsSidebarCollapsed, 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen,
  } = useDashboard();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      NotificationsService.getNotifications().then(data => {
        setUnreadCount(data.filter(n => !n.isRead).length);
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const isProblemsIdePage = pathname.startsWith("/problems/") && pathname.split("/").filter(Boolean).length > 1;

  const getIdeBreadcrumbTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts[1];
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    showToast("Signed out successfully.", "success");
    await AuthService.logout();
    router.push("/login");
  };

  const menuItems = [
    { label: "My Profile", icon: User, href: "/profile" },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Billing", icon: CreditCard, href: "/settings?tab=billing" },
    { label: "Logout", icon: LogOut, action: handleSignOut, isDestructive: true }
  ];

  return (
    <header className="h-[76px] bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/[0.06] px-8 flex items-center justify-between shrink-0 transition-colors duration-300 relative z-30 select-none text-text-primary">
      {/* Left side: Menu Toggle Button + Search Bar */}
      <div className="flex items-center gap-4">
        {/* Clean Menu Toggle Button */}
        <button
          onClick={handleMenuClick}
          className="w-10 h-10 rounded-xl border border-border-card bg-card-bg flex items-center justify-center text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-300 shadow-sm cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-[18px] h-[18px] stroke-[1.8]" />
        </button>

        {/* Search Bar or IDE Breadcrumbs */}
        {isProblemsIdePage ? (
          <div className="flex items-center gap-2.5 text-[13px] font-semibold select-none tracking-[-0.01em]">
            <span className="text-text-secondary">Problems</span>
            <span className="text-text-secondary/50 font-normal">/</span>
            <span className="text-text-primary">{getIdeBreadcrumbTitle()}</span>
          </div>
        ) : (
          <Suspense fallback={<div className="w-[380px] h-10 bg-[#0d0f1a]/82 border border-white/[0.06] rounded-xl animate-pulse hidden sm:block" />}>
            <NavbarSearch />
          </Suspense>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle Switch */}
        <ThemeToggle />

        {/* Bell Icon with badge */}
        <button 
          onClick={() => {
            router.push("/notifications");
          }}
          className="relative w-10 h-10 rounded-full border border-border-card bg-card-bg flex items-center justify-center text-text-primary hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-300 shadow-sm cursor-pointer"
        >
          <Bell className="w-[18px] h-[18px] fill-transparent stroke-[1.8]" />
          {unreadCount > 0 && (
            <span className="absolute top-[9px] right-[10px] w-2 h-2 bg-brand-orange rounded-full ring-2 ring-white dark:ring-[#0b0f17] shadow-[0_0_6px_rgba(255,106,0,0.5)]" />
          )}
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center gap-2.5 cursor-pointer group select-none py-1.5 px-2 rounded-xl border border-transparent hover:bg-white/[0.04] hover:border-white/[0.05] transition-all duration-300 shadow-sm"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.name || "User"} 
                className={cn("w-9 h-9 rounded-full object-cover shadow-md shadow-black/5 select-none shrink-0 transition-all duration-300", user?.isPremiumActive ? "ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-[#0b0f17]" : "border border-white/[0.1]")} 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={cn("w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange/60 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-black/5 select-none font-mono transition-all duration-300", user?.isPremiumActive ? "ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-[#0b0f17]" : "border border-white/[0.1]")}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <ChevronDown className={cn("w-4 h-4 text-text-secondary group-hover:text-text-primary transition-all duration-300 shrink-0", isDropdownOpen && "rotate-180")} />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-56 bg-card-bg backdrop-blur-xl border border-border-card dark:border-brand-orange/15 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),_0_0_15px_rgba(255,106,0,0.08)] z-50 text-left p-1.5 select-none text-text-primary"
              >
                {/* Profile Items */}
                <div className="flex flex-col gap-0.5">
                  {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isDestructive = item.isDestructive;
                    const isActive = item.href ? pathname === item.href : false;

                    const content = (
                      <>
                        <Icon className={cn("w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-105", isDestructive ? "text-[#f43f5e]" : isActive ? "text-brand-orange" : "text-text-secondary group-hover:text-brand-orange")} />
                        <span className="text-[12.5px] font-bold select-none leading-none tracking-tight">{item.label}</span>
                      </>
                    );

                    const baseClass = cn(
                      "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 group leading-none font-sans cursor-pointer border border-transparent select-none",
                      isDestructive 
                        ? "text-[#f43f5e] hover:bg-[#f43f5e]/10 hover:border-[#f43f5e]/25 hover:shadow-[0_0_10px_rgba(244,63,94,0.15)]" 
                        : isActive
                          ? "text-brand-orange bg-brand-orange/10 border-brand-orange/20 shadow-[0_0_12px_rgba(255,106,0,0.15)]"
                          : "text-text-primary hover:text-brand-orange hover:bg-brand-orange/8 hover:border-brand-orange/15 hover:shadow-[0_0_12px_rgba(255,106,0,0.15)]"
                    );

                    if (item.href) {
                      return (
                        <Link 
                          key={idx}
                          href={item.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className={baseClass}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <button 
                        key={idx}
                        onClick={(e) => {
                          if (item.action) item.action(e);
                          setIsDropdownOpen(false);
                        }}
                        className={baseClass}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom User Card Section */}
                <div className="h-px bg-slate-900/[0.06] dark:bg-white/[0.04] my-2 mx-1" />
                <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 select-none">
                  <div className="flex flex-col text-left leading-none min-w-0">
                    <span className="text-[12px] font-bold text-text-primary truncate">{user?.email || "user@example.com"}</span>
                    <span className="text-[10px] text-text-secondary/70 font-bold mt-1 select-text font-sans">@{user?.name || "user"}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md border border-brand-orange/30 bg-brand-orange/10 text-[9px] font-black text-brand-orange uppercase tracking-wider select-none leading-none shrink-0 font-sans shadow-[0_0_8px_rgba(255,106,0,0.15)]">
                    {user?.role || "Coder"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

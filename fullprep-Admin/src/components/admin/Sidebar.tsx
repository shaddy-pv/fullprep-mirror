import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Code,
  BarChart3,
  RefreshCcw,
  Settings,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar, useAuth } from "@/store/admin";
import { Avatar } from "./Avatar";
const NAV: Array<{
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  badge?: string;
  badgeTone?: string;
}> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/users",
    label: "Users",
    icon: Users,
  },
  {
    to: "/problems",
    label: "Problems",
    icon: BookOpen,
  },
  {
    to: "/submissions",
    label: "Submissions",
    icon: Code,
  },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/problems/sync", label: "Sync Tool", icon: RefreshCcw },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const collapsed = useSidebar((s) => s.collapsed);
  const toggle = useSidebar((s) => s.toggle);
  const mobileOpen = useSidebar((s) => s.mobileOpen);
  const setMobileOpen = useSidebar((s) => s.setMobileOpen);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuth((s) => s.user);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border-card bg-sidebar transition-all duration-200 lg:sticky lg:top-0 lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ height: "100vh" }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border-card px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-emerald text-primary-foreground shadow-[0_4px_12px_-2px_oklch(0.78_0.18_152/0.4)]">
              <Shield className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text-primary">FullPrep</p>
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Admin</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1 text-text-muted hover:text-text-primary lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-surface-hover text-text-primary"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-primary"
                      />
                    )}
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              item.badgeTone === "amber"
                                ? "bg-brand-amber/15 text-brand-amber"
                                : "bg-surface text-text-muted",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User card + collapse */}
        <div className="border-t border-border-card p-3 space-y-2">
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 rounded-lg border border-border-card bg-background/40 p-2.5">
              <Avatar name={user.name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
                <p className="truncate text-[11px] text-text-muted">{user.email}</p>
              </div>
              <span className="rounded-full bg-brand-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-secondary">
                ADMIN
              </span>
            </div>
          )}
          <button
            onClick={toggle}
            className="hidden w-full items-center justify-center gap-2 rounded-lg border border-border-card py-2 text-xs font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary lg:flex"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" /> Collapse
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Plus, RefreshCcw, Search, Sun, LogOut } from "lucide-react";
import { useSidebar, useTheme, useAuth } from "@/store/admin";
import { api } from "@/lib/api";
import { Avatar } from "./Avatar";
import { useState } from "react";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/users": "Users",
  "/problems": "Problems",
  "/problems/create": "Create Problem",
  "/problems/sync": "Sync Tool",
  "/submissions": "Submissions",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function Topbar() {
  const setMobileOpen = useSidebar((s) => s.setMobileOpen);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const title = TITLES[pathname] || (segments[segments.length - 1] ?? "Dashboard");

  function handleLogout() {
    api.logout();
    logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-card bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-md p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb / title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-text-muted">Admin</span>
          {segments.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-text-muted">/</span>
              <span
                className={
                  i === segments.length - 1
                    ? "font-medium text-text-primary capitalize"
                    : "text-text-muted capitalize"
                }
              >
                {s.replace(/_/g, " ").replace(/-/g, " ")}
              </span>
            </span>
          ))}
          {segments.length === 0 && <span className="font-medium text-text-primary">{title}</span>}
        </nav>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search…"
          className="w-64 rounded-lg border border-border-card bg-surface py-1.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
        />
      </div>

      <Link
        to="/problems/sync"
        className="hidden items-center gap-1.5 rounded-lg border border-border-card bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand-primary/40 hover:text-text-primary sm:inline-flex"
      >
        <RefreshCcw className="h-3.5 w-3.5" /> Sync
      </Link>
      <Link
        to="/problems/create"
        search={{ edit: undefined, clone: undefined }}
        className="hidden items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110 sm:inline-flex"
      >
        <Plus className="h-3.5 w-3.5" /> New Problem
      </Link>

      <div className="ml-auto flex items-center gap-2 lg:gap-4">
        <button
          onClick={toggleTheme}
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-border-card bg-surface py-1 pl-1 pr-2.5 hover:bg-surface-hover"
          >
            <Avatar name={user?.name || "Admin"} size={26} />
            <span className="hidden text-xs font-medium text-text-primary sm:inline">
              {user?.name || "Admin"}
            </span>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-border-card bg-surface shadow-xl"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              >
                Profile & Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border-t border-border-card px-3 py-2 text-left text-sm text-brand-rose hover:bg-surface-hover"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

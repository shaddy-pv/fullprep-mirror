import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Moon, Plus, RefreshCcw, Search, Sun, LogOut } from "lucide-react";
import { useSidebar, useTheme, useAuth } from "@/store/admin";
import { api } from "@/lib/api";
import { Avatar } from "./Avatar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";

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
  const [notifsOpen, setNotifsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => api.getNotifications(),
    refetchInterval: 10000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => api.markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        className="hidden items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110 sm:inline-flex"
      >
        <Plus className="h-3.5 w-3.5" /> New Problem
      </Link>

      {/* Notifications dropdown */}
      <div className="relative">
        <button 
          className="relative rounded-md p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          onClick={() => {
            setNotifsOpen(!notifsOpen);
            setMenuOpen(false);
          }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-rose" />
          )}
        </button>

        {notifsOpen && (
          <div 
            className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border-card bg-surface shadow-xl flex flex-col max-h-[28rem]"
            onMouseLeave={() => setNotifsOpen(false)}
          >
            <div className="flex items-center justify-between p-3 border-b border-border-card">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className="text-xs text-brand-primary hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-muted">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n._id} 
                    className={`p-3 border-b border-border-card last:border-0 hover:bg-surface-hover transition-colors ${!n.isRead ? 'bg-brand-primary/5' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className={`text-sm ${!n.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                          {n.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-text-muted mt-1 opacity-70">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead.mutate(n._id)}
                          className="text-brand-primary p-1 hover:bg-brand-primary/10 rounded-full flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

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
    </header>
  );
}

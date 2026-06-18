"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Trash2,
  AlertTriangle,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationsService, NotificationItem as APINotificationItem } from "@/services/notifications.service";

export default function NotificationsPage() {
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);
  const [notifications, setNotifications] = useState<APINotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await NotificationsService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllRead = async () => {
    const success = await NotificationsService.markAllAsRead();
    if (success) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      showToast("All notifications marked as read.", "success");
    } else {
      showToast("Failed to mark notifications as read.", "info");
    }
  };

  const clearAll = async () => {
    const success = await NotificationsService.clearAll();
    if (success) {
      setNotifications([]);
      showToast("Notifications cleared successfully.", "info");
    } else {
      showToast("Failed to clear notifications.", "info");
    }
  };

  const toggleRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return; // Only unread to read supported by backend typically, but let's just mark read
    
    const success = await NotificationsService.markAsRead(id);
    if (success) {
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "ERROR":
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case "INFO":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Notifications"
        description="Stay updated with your achievements, submissions, and platform events."
        right={
          <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary hover:text-text-primary px-3 py-1.5">
            ✕ Close
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-6 max-w-4xl select-none">
        {/* Controls block */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e5df] dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-text-secondary">
              {notifications.filter(n => !n.isRead).length} Unread
            </span>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-[12.5px] font-bold hover:text-brand-orange text-text-secondary"
                onClick={markAllRead}
              >
                Mark all as read
              </Button>
              <button 
                className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#f43f5e] hover:bg-[#f43f5e]/10 px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer"
                onClick={clearAll}
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* List block */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-brand-orange/30 border-t-brand-orange animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card-bg border border-border-card rounded-[24px] shadow-sm">
            <Bell className="w-12 h-12 text-text-secondary/40 mb-3.5 animate-bounce-slow" />
            <h3 className="text-base font-bold text-text-primary mb-1">All caught up!</h3>
            <p className="text-[13px] text-text-secondary max-w-xs">
              You have no new notifications at the moment. We will notify you when something happens.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((item) => (
              <DashboardCard 
                key={item._id}
                onClick={() => toggleRead(item._id, item.isRead)}
                className={`p-5 flex items-start gap-4.5 transition-all duration-300 hover:scale-[1.01] hover:border-brand-orange/20 cursor-pointer ${
                  item.isRead ? "opacity-75" : "border-l-2 border-l-brand-orange shadow-[0_0_15px_rgba(255,106,0,0.04)]"
                }`}
              >
                {/* Type Icon indicator */}
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-border-card flex items-center justify-center shrink-0">
                  {getIcon(item.type)}
                </div>

                {/* Content details */}
                <div className="flex-1 min-w-0 flex flex-col text-left">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[14px] font-extrabold text-text-primary leading-tight truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-semibold text-text-secondary whitespace-nowrap">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-secondary mt-1.5 font-medium leading-relaxed leading-none">
                    {item.message}
                  </p>
                </div>

                {/* Read indicator */}
                {!item.isRead && (
                  <span className="w-2.5 h-2.5 bg-brand-orange rounded-full mt-1.5 shadow-[0_0_8px_rgba(255,106,0,0.6)]" />
                )}
              </DashboardCard>
            ))}
          </div>
        )}
      </div>
    </ContentContainer>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Award, 
  Zap, 
  CheckCircle2, 
  MessageSquare,
  Trash2,
  Sparkles
} from "lucide-react";
import ContentContainer from "@/components/layout/ContentContainer";
import PageHeader from "@/components/layout/PageHeader";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useNotificationStore } from "@/store/notificationStore";

interface NotificationItem {
  id: string;
  type: "achievement" | "contest" | "submission" | "system" | "ai";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "achievement",
    title: "New Badge Unlocked: DSA Pioneer",
    description: "Congratulations! You have completed 50 easy and medium problems in the Data Structures category.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "submission",
    title: "Two Sum Submission Accepted",
    description: "Your solution beat 98.4% of C++ submissions in runtime speed and 91.2% in memory efficiency.",
    time: "4 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "contest",
    title: "Weekly Contest #24 Starting Soon",
    description: "The contest begins in exactly 3 hours. Register now to secure your spot and gain rating points.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "ai",
    title: "New Smart Hints Available",
    description: "AI tutor has generated new conceptual deep-dives for Dynamic Programming problems. Check your AI Hints dashboard.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "Pro Account Activated Successfully",
    description: "Welcome to FullPrep Pro! You now have unlimited AI suggestions, premium templates, and priority queue submissions.",
    time: "3 days ago",
    read: true,
  },
];

export default function NotificationsPage() {
  const showToast = useNotificationStore((state) => state.showToast);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "success");
  };

  const clearAll = () => {
    setNotifications([]);
    showToast("Notifications cleared successfully.", "info");
  };

  const toggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "achievement":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "contest":
        return <Zap className="w-5 h-5 text-brand-orange" />;
      case "submission":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "ai":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Notifications"
        description="Stay updated with your achievements, submissions, and platform events."
      />

      <div className="mt-6 flex flex-col gap-6 max-w-4xl select-none">
        {/* Controls block */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e5df] dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-text-secondary">
              {notifications.filter(n => !n.read).length} Unread
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
        {notifications.length === 0 ? (
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
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-5 flex items-start gap-4.5 transition-all duration-300 hover:scale-[1.01] hover:border-brand-orange/20 cursor-pointer ${
                  item.read ? "opacity-75" : "border-l-2 border-l-brand-orange shadow-[0_0_15px_rgba(255,106,0,0.04)]"
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
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-secondary mt-1.5 font-medium leading-relaxed leading-none">
                    {item.description}
                  </p>
                </div>

                {/* Read indicator */}
                {!item.read && (
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

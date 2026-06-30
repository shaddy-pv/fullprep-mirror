"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Crown,
  Code2,
  Zap,
  Trophy,
  Award,
  Activity,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import ContentContainer from "@/components/layout/ContentContainer";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { AuthService } from "@/services/auth.service";
import { FriendsService } from "@/services/friends.service";
import { cn } from "@/lib/utils";


// Inline icons
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

interface HexBadgeProps {
  color: "gold" | "orange" | "red" | "teal" | "green" | "purple" | "blue" | "slate";
  title: string;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const HexagonBadge: React.FC<HexBadgeProps> = ({ color, title, subtitle, icon: IconComponent }) => {
  const colorMap: Record<string, { stroke: string; glow: string }> = {
    gold:   { stroke: "#eab308", glow: "rgba(234,179,8,0.22)" },
    orange: { stroke: "#ff6a00", glow: "rgba(255,106,0,0.22)" },
    red:    { stroke: "#f43f5e", glow: "rgba(244,63,94,0.22)" },
    teal:   { stroke: "#14b8a6", glow: "rgba(20,184,166,0.22)" },
    green:  { stroke: "#10b981", glow: "rgba(16,185,129,0.22)" },
    purple: { stroke: "#8b5cf6", glow: "rgba(139,92,246,0.22)" },
    blue:   { stroke: "#3b82f6", glow: "rgba(59,130,246,0.22)" },
    slate:  { stroke: "#64748b", glow: "rgba(100,116,139,0.1)" },
  };

  const { stroke: strokeColor, glow: glowColor } = colorMap[color];
  const gradientId = `grad-${color}`;
  const innerGradientId = `inner-${color}`;

  return (
    <div className="flex flex-col items-center justify-start select-none group cursor-pointer w-full text-center">
      <div
        className="w-[56px] h-[64px] flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105 shrink-0"
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 106" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="metallicDark" x1="50" y1="0" x2="50" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e2230" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#12141c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0a0b10" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor={strokeColor} />
              <stop offset="70%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id={innerGradientId} x1="50" y1="11" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M 50 3 L 93.3 28 L 93.3 78 L 50 103 L 6.7 78 L 6.7 28 Z" fill="url(#metallicDark)" stroke={`url(#${gradientId})`} strokeWidth="3" />
          <path d="M 50 11 L 86.4 32 L 86.4 74 L 50 95 L 13.6 74 L 13.6 32 Z" stroke={`url(#${innerGradientId})`} strokeWidth="1.2" fill="none" />
          <path d="M 6.7 28 C 20 16, 80 16, 93.3 28 L 93.3 28 L 50 3 L 6.7 28 Z" fill="#ffffff" fillOpacity="0.04" />
        </svg>
        <div className="relative z-10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 drop-shadow-sm animate-pulse-slow" style={{ color: strokeColor }} />
        </div>
      </div>
      <div className="flex flex-col items-center mt-3 w-full gap-1">
        <span className="text-[11px] font-semibold text-text-primary leading-none tracking-tight truncate max-w-[90px] group-hover:text-brand-orange transition-colors">{title}</span>
        <span className="text-[9px] text-text-secondary/60 font-medium uppercase tracking-wider leading-none">{subtitle}</span>
      </div>
    </div>
  );
};

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);

  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Friend system states
  const [friendStatus, setFriendStatus] = useState<"none" | "pending_sent" | "pending_received" | "friends">("none");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await AuthService.getPublicProfile(username);
        if (data) {
          setProfile(data);
        } else {
          showToast("User not found", "error");
          router.push("/leaderboard");
        }
      } catch {
        showToast("Error loading profile", "error");
        router.push("/leaderboard");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username, router, showToast]);

  useEffect(() => {
    // Check friend status if user is logged in and not viewing their own profile
    async function checkFriendStatus() {
      if (!user || !profile || user._id === profile._id) return;
      
      try {
        const statusRes = await FriendsService.getStatus(profile._id);
        if (statusRes.success) {
          setFriendStatus(statusRes.data as any);
        }
      } catch (err) {
        console.error("Error checking friend status", err);
      }
    }
    
    checkFriendStatus();
  }, [user, profile]);

  const handleFriendAction = async () => {
    if (!user || !profile) return;
    setIsProcessing(true);
    
    try {
      if (friendStatus === "none") {
        const res = await FriendsService.sendRequest(profile._id);
        if (res.success) {
          showToast("Friend request sent!", "success");
          setFriendStatus("pending_sent");
        }
      } else if (friendStatus === "pending_received") {
        const res = await FriendsService.acceptRequest(profile._id);
        if (res.success) {
          showToast("Friend request accepted!", "success");
          setFriendStatus("friends");
        }
      }
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || "Failed to process friend request.";
      showToast(msg, "error");
      if (msg.includes("pending")) setFriendStatus("pending_sent");
      if (msg.includes("already friends")) setFriendStatus("friends");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <ContentContainer>
        <div className="w-full flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ContentContainer>
    );
  }

  if (!profile) return null;

  // Process activity data for heatmap
  const rawActivityMap = profile.activityMap || {};
  const today = new Date();
  const yearData: { date: string; count: number }[] = [];
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    yearData.push({
      date: dateStr,
      count: rawActivityMap[dateStr] || 0
    });
  }

  const easySolved = profile.difficultyBreakdown?.Easy || 0;
  const mediumSolved = profile.difficultyBreakdown?.Medium || 0;
  const hardSolved = profile.difficultyBreakdown?.Hard || 0;
  const totalSolved = easySolved + mediumSolved + hardSolved;
  
  const easyTotal = profile.totalProblemsByDifficulty?.Easy || 0;
  const mediumTotal = profile.totalProblemsByDifficulty?.Medium || 0;
  const hardTotal = profile.totalProblemsByDifficulty?.Hard || 0;
  const totalProblemsCount = easyTotal + mediumTotal + hardTotal;

  // Generate dynamic badges
  const badges: any[] = [];
  if (totalSolved >= 1) badges.push({ color: "purple", title: "First Blood", subtitle: "FIRST SOLVE", icon: Trophy });
  if (totalSolved >= 100) badges.push({ color: "gold", title: "Problem Solver", subtitle: "SOLVED 100", icon: Code2 });
  if ((profile.contestsParticipated || 0) >= 10) badges.push({ color: "orange", title: "Contest Warrior", subtitle: "10 CONTESTS", icon: Zap });
  if ((profile.streak || 0) >= 7) badges.push({ color: "red", title: "Week Streak", subtitle: "7 DAYS", icon: Calendar });
  if ((profile.contestRating || 0) >= 1600) badges.push({ color: "teal", title: "Top 10%", subtitle: "RATING 1600+", icon: Award });
  if ((profile.streak || 0) >= 90) badges.push({ color: "green", title: "Consistency Master", subtitle: "90 DAYS", icon: Activity });
  if (totalSolved >= 50) badges.push({ color: "blue", title: "Quick Solver", subtitle: "DEDICATED", icon: Zap });
  
  const displayBadge = badges.length > 0 ? badges[0] : null;

  const pieData = totalSolved === 0 
    ? [{ name: 'Empty', value: 1, color: '#2c2e33' }]
    : [
        { name: 'Easy', value: easySolved, color: '#10b981' }, // green
        { name: 'Medium', value: mediumSolved, color: '#ff6a00' }, // brand-orange
        { name: 'Hard', value: hardSolved, color: '#f43f5e' }, // red
      ];

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-[#ebedf0] dark:bg-[#161b22]";
    if (count < 3) return "bg-[#9be9a8] dark:bg-[#0e4429]";
    if (count < 6) return "bg-[#40c463] dark:bg-[#006d32]";
    if (count < 10) return "bg-[#30a14e] dark:bg-[#26a641]";
    return "bg-[#216e39] dark:bg-[#39d353]";
  };

  const getAvatarFallback = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <ContentContainer>
      <div className="w-full flex flex-col gap-6 select-none max-w-[1200px] mx-auto pb-8">
        {/* Profile Header Card */}
        <div className="bg-card-bg border border-border-card rounded-[24px] overflow-hidden shadow-sm relative">
          <div className="h-32 w-full bg-gradient-to-r from-[#ff6a00]/20 via-[#8b5cf6]/20 to-[#10b981]/20 absolute top-0 left-0 z-0" />
          <div className="p-6 lg:p-8 flex flex-col md:flex-row gap-8 relative z-10 mt-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6 md:w-1/3">
            <div className="relative">
              {profile.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-card-bg shadow-lg" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold shadow-lg">
                  {getAvatarFallback(profile.name)}
                </div>
              )}
              {profile.level >= 10 && (
                <div className="absolute -bottom-2 -right-2 bg-[#ffc107] text-[#5c4000] p-2 rounded-full shadow-md border-2 border-card-bg">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-[28px] lg:text-[32px] font-bold text-text-primary leading-tight tracking-[-0.02em]">
                {profile.name}
              </h1>
              <p className="text-[14px] text-text-secondary mt-1 max-w-[280px]">
                {profile.bio || "No bio provided."}
              </p>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-text-secondary text-[13px]">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.joinedAt).getFullYear()}</span>
                </div>
              </div>
              
              {/* Friend Request Button */}
              {user && user._id !== profile._id && (
                <div className="mt-5">
                  <button 
                    onClick={handleFriendAction}
                    disabled={isProcessing || friendStatus === "pending_sent" || friendStatus === "friends"}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                      friendStatus === "none" ? "bg-brand-orange text-white hover:bg-[#ff802b]" :
                      friendStatus === "pending_received" ? "bg-green-500 text-white hover:bg-green-600" :
                      friendStatus === "friends" ? "bg-[#11131c]/50 text-green-500 border border-green-500/20" :
                      "bg-[#11131c]/50 text-text-secondary border border-border-card"
                    )}
                  >
                    {isProcessing ? "Processing..." :
                     friendStatus === "none" ? "Add Friend" :
                     friendStatus === "pending_sent" ? "Request Pending" :
                     friendStatus === "pending_received" ? "Accept Request" :
                     "Friends"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 md:border-l border-border-card md:pl-8">
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-[#11131c]/50">
              <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                <Code2 className="w-4 h-4 text-brand-orange" />
                <span className="text-[12px] font-semibold uppercase tracking-wider">Solved</span>
              </div>
              <span className="text-[28px] font-bold text-text-primary">{profile.solvedCount}</span>
            </div>
            
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-[#11131c]/50">
              <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                <Zap className="w-4 h-4 text-[#ffc107]" />
                <span className="text-[12px] font-semibold uppercase tracking-wider">Streak</span>
              </div>
              <span className="text-[28px] font-bold text-text-primary">{profile.streak} <span className="text-[16px] text-text-secondary font-medium">days</span></span>
            </div>
            
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-[#11131c]/50">
              <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                <Trophy className="w-4 h-4 text-[#10b981]" />
                <span className="text-[12px] font-semibold uppercase tracking-wider">Contest Rating</span>
              </div>
              <span className="text-[28px] font-bold text-text-primary">{profile.contestRating ?? 0}</span>
            </div>
            
            <div className="flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-[#11131c]/50">
              <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                <Award className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-[12px] font-semibold uppercase tracking-wider">Level</span>
              </div>
              <span className="text-[28px] font-bold text-text-primary">{profile.level || 1}</span>
            </div>
          </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Activity & Charts */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Activity Heatmap */}
            <div className="bg-card-bg border border-border-card rounded-[24px] p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6 min-w-[600px]">
                <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-orange" />
                  Submission Activity
                </h2>
                <span className="text-[13px] font-medium text-text-secondary">Past 6 Months</span>
              </div>
              
              <div className="min-w-[600px]">
                {/* Year Heatmap Grid */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(yearData.length / 7) }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      {yearData.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day, dayIdx) => (
                        <div 
                          key={dayIdx}
                          className={cn("w-3 h-3 rounded-sm transition-colors cursor-pointer", getHeatmapColor(day.count))}
                          title={`${day.date}: ${day.count} submissions`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-[12px] text-text-secondary font-medium">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22]" />
                    <div className="w-3 h-3 rounded-sm bg-[#9be9a8] dark:bg-[#0e4429]" />
                    <div className="w-3 h-3 rounded-sm bg-[#40c463] dark:bg-[#006d32]" />
                    <div className="w-3 h-3 rounded-sm bg-[#30a14e] dark:bg-[#26a641]" />
                    <div className="w-3 h-3 rounded-sm bg-[#216e39] dark:bg-[#39d353]" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Solved Problems and Badges Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Solved Problems Donut Chart (LeetCode style) */}
              <div className="bg-card-bg border border-border-card rounded-[24px] p-6 shadow-sm flex items-center justify-between">
                <div className="relative w-[120px] h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={45}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-text-primary leading-tight">{totalSolved}</span>
                    <span className="text-[10px] text-text-secondary border-t border-border-card pt-0.5 mt-0.5">Solved</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 ml-6">
                  <div className="flex items-center justify-between text-[13px] bg-gray-50 dark:bg-[#11131c]/50 p-2 rounded-lg">
                    <span className="text-[#00b8a3] font-medium">Easy</span>
                    <span className="text-text-primary font-bold">{easySolved}<span className="text-text-secondary font-normal text-[11px] ml-1">/ {easyTotal}</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] bg-gray-50 dark:bg-[#11131c]/50 p-2 rounded-lg">
                    <span className="text-[#ffc01e] font-medium">Medium</span>
                    <span className="text-text-primary font-bold">{mediumSolved}<span className="text-text-secondary font-normal text-[11px] ml-1">/ {mediumTotal}</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] bg-gray-50 dark:bg-[#11131c]/50 p-2 rounded-lg">
                    <span className="text-[#ff375f] font-medium">Hard</span>
                    <span className="text-text-primary font-bold">{hardSolved}<span className="text-text-secondary font-normal text-[11px] ml-1">/ {hardTotal}</span></span>
                  </div>
                </div>
              </div>

              {/* Badges Box */}
              <div className="bg-card-bg border border-border-card rounded-[24px] p-6 shadow-sm flex flex-col items-center">
                <div className="flex items-center justify-between mb-4 w-full">
                  <span className="text-[14px] text-text-secondary font-medium">Badges</span>
                  <span className="text-[16px] text-text-primary font-bold">{badges.length}</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {displayBadge ? (
                    <HexagonBadge 
                      color={displayBadge.color} 
                      title={displayBadge.title} 
                      subtitle={displayBadge.subtitle} 
                      icon={displayBadge.icon} 
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                        <Award className="w-8 h-8 text-text-secondary/50" />
                      </div>
                      <span className="text-[13px] text-text-secondary">No badges yet</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
            
          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            
            {/* Social Links */}
            {(profile.socialLinks?.github || profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.website) && (
              <div className="bg-card-bg border border-border-card rounded-[24px] p-6 shadow-sm">
                <h2 className="text-[15px] font-bold text-text-primary mb-4">Connect</h2>
                <div className="flex flex-col gap-3">
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github.startsWith('http') ? profile.socialLinks.github : `https://${profile.socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-border-card transition-all group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-[#24292e]/10 dark:bg-white/10 flex items-center justify-center group-hover:bg-[#24292e] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                        <GithubIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[14px] font-medium text-text-primary">GitHub</span>
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://${profile.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-border-card transition-all group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-[#0077b5]/10 flex items-center justify-center group-hover:bg-[#0077b5] group-hover:text-white transition-colors">
                        <LinkedinIcon className="w-4 h-4 text-[#0077b5] group-hover:text-white" />
                      </div>
                      <span className="text-[14px] font-medium text-text-primary">LinkedIn</span>
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter.startsWith('http') ? profile.socialLinks.twitter : `https://${profile.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-border-card transition-all group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-[#1da1f2]/10 flex items-center justify-center group-hover:bg-[#1da1f2] group-hover:text-white transition-colors">
                        <TwitterIcon className="w-4 h-4 text-[#1da1f2] group-hover:text-white" />
                      </div>
                      <span className="text-[14px] font-medium text-text-primary">Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
        
      </div>
    </ContentContainer>
  );
}

"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  ChevronDown,
  Trophy,
  Award,
  Zap,
  Code2,
  Activity,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import ContentContainer from "@/components/layout/ContentContainer";
import { useNotificationStore } from "@/store/notificationStore";
import { AuthService } from "@/services/auth.service";
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

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

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
      } catch (err) {
        showToast("Error loading profile", "error");
        router.push("/leaderboard");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username, router, showToast]);

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
  const yearData = [];
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    yearData.push({
      date: dateStr,
      count: rawActivityMap[dateStr] || 0
    });
  }

  const chartData = yearData.slice(-30).map(d => ({
    name: d.date.split("-").slice(1).join("/"),
    problems: d.count
  }));

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
        <div className="bg-card-bg border border-border-card rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6 md:w-1/3">
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-card-bg shadow-lg" />
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
              <span className="text-[28px] font-bold text-text-primary">{profile.contestRating || 1200}</span>
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

            {/* Recent Activity Line Chart */}
            <div className="bg-card-bg border border-border-card rounded-[24px] p-6 shadow-sm h-[320px]">
              <h2 className="text-[16px] font-bold text-text-primary mb-6">Recent Trends (30 Days)</h2>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border-card opacity-50" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 19, 28, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                    itemStyle={{ color: '#ff6a00', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="problems" stroke="#ff6a00" strokeWidth={3} fillOpacity={1} fill="url(#colorProblems)" />
                </AreaChart>
              </ResponsiveContainer>
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

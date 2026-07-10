"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";
import { Loader2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

// Inline SVGs for social icons
const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  role?: string;
}

const getRole = (name: string) => {
  if (name.toLowerCase().includes("khushi")) return "Frontend Developer and Tester";
  if (name.toLowerCase().includes("shadan")) return "Full Stack Developer and DevOps";
  if (name.toLowerCase().includes("shivam")) return "Full Stack Developer";
  return "Software Engineer";
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/team`);
        if (res.ok) {
          const data = await res.json();
          setTeam(data);
        }
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816]">
      <Navbar />

      <main className="flex-grow pt-20">
        <PremiumPageWrapper 
          title="Meet Our Team" 
          description="We are a passionate group of developers dedicated to building the best platform for your technical interview preparation."
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#FF6B00]" />
              <p>Loading team members...</p>
            </div>
          ) : team.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            >
              {team.map((member) => (
                <motion.div 
                  key={member._id}
                  variants={itemVariants}
                  className="group relative bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] p-8 text-center backdrop-blur-sm hover:border-orange-500/30 transition-colors overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-purple-500/0 group-hover:from-orange-500/5 group-hover:to-purple-500/5 transition-colors duration-500" />
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FF6B00] to-orange-400 rounded-full mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                    <p className="text-sm font-medium text-orange-500 dark:text-orange-400 mb-6">{getRole(member.name)}</p>
                    
                    <div className="flex items-center justify-center gap-4">
                      {member.socialLinks?.github && (
                        <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {member.socialLinks?.linkedin && (
                        <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#0077B5] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                          <LinkedinIcon className="w-4 h-4" />
                        </a>
                      )}
                      {member.socialLinks?.twitter && (
                        <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#1DA1F2] hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all">
                          <TwitterIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400">Team members not found.</p>
            </div>
          )}
        </PremiumPageWrapper>
      </main>

      <Footer />
    </div>
  );
}

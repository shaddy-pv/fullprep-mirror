"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Briefcase, ChevronRight, Loader2, ChevronDown, X, UploadCloud, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumPageWrapper from "@/components/ui/PremiumPageWrapper";

interface Job {
  _id: string;
  title: string;
  role: string;
  country: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

const CustomDropdown = ({ 
  value, 
  options, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  options: string[]; 
  onChange: (v: string) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[180px] z-20" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white hover:border-[#FF6B00]/50 transition-colors focus:outline-none"
      >
        <span className="truncate">{value === "All" ? placeholder : value}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${
                    value === opt 
                      ? "bg-[#FF6B00]/10 text-[#FF6B00] font-medium" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {opt === "All" ? placeholder : opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Apply Modal state
  const [applyForm, setApplyForm] = useState({ name: "", email: "", desc: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/jobs`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "All" && job.role !== filterRole) return false;
    if (filterLocation !== "All" && job.country !== filterLocation) return false;
    return true;
  });

  const uniqueRoles = ["All", ...Array.from(new Set(jobs.map((j) => j.role)))];
  const uniqueLocations = ["All", ...Array.from(new Set(jobs.map((j) => j.country)))];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      const formData = new FormData();
      formData.append("name", applyForm.name);
      formData.append("email", applyForm.email);
      formData.append("subject", `Application for ${selectedJob.title}`);
      formData.append("message", applyForm.desc);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      await fetch(`${baseUrl}/contact`, {
        method: "POST",
        body: formData,
      });

      setApplySuccess(true);
      setTimeout(() => {
        setSelectedJob(null);
        setApplySuccess(false);
        setApplyForm({ name: "", email: "", desc: "" });
        setResumeFile(null);
      }, 2000);
    } catch (error) {
      console.error("Apply error", error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#050816]">
      <Navbar />

      <main className="flex-grow pt-20">
        <PremiumPageWrapper 
          title="Join Our Team" 
          description="Help us build the next generation of problem solvers and developers. We're looking for passionate individuals to join our mission."
        >
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 relative z-20">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search open positions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]/50 transition-colors shadow-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <CustomDropdown 
                value={filterRole} 
                options={uniqueRoles} 
                onChange={setFilterRole} 
                placeholder="All Job Types"
              />
              <CustomDropdown 
                value={filterLocation} 
                options={uniqueLocations} 
                onChange={setFilterLocation} 
                placeholder="All Locations"
              />
            </div>
          </div>

          {/* Job List */}
          <div className="relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#FF6B00]" />
                <p>Loading open positions...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {filteredJobs.map((job) => (
                  <motion.div 
                    variants={itemVariants}
                    key={job._id} 
                    className="group relative bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[24px] p-6 hover:border-[#FF6B00]/30 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/0 via-transparent to-[#FF6B00]/0 group-hover:from-[#FF6B00]/5 group-hover:to-transparent transition-colors duration-500" />
                    
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                            <Briefcase className="w-4 h-4 text-[#FF6B00]" />
                            {job.role}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                            <MapPin className="w-4 h-4 text-[#FF6B00]" />
                            {job.country}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-[#FF6B00] hover:text-white transition-all duration-300 shadow-sm hover:shadow-[#FF6B00]/20 hover:shadow-lg"
                      >
                        Apply Now
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-[32px] backdrop-blur-sm"
              >
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No open positions found</h3>
                <p className="text-slate-500 dark:text-slate-400">Check back later or try adjusting your filters.</p>
              </motion.div>
            )}
          </div>
        </PremiumPageWrapper>
      </main>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Apply for {selectedJob.title}
                </h2>
                <p className="text-sm text-slate-500 mb-6">Fill out the details below to submit your application.</p>

                {applySuccess ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Application Sent!</h3>
                    <p className="text-slate-500">We&apos;ve received your application and will be in touch soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                        <input 
                          type="text" required 
                          value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF6B00] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input 
                          type="email" required 
                          value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF6B00] transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter / Description</label>
                      <textarea 
                        required rows={4}
                        value={applyForm.desc} onChange={e => setApplyForm({...applyForm, desc: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#FF6B00] transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resume</label>
                      <label className="flex items-center justify-center w-full bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-xl px-4 py-6 hover:border-[#FF6B00]/50 transition-colors cursor-pointer group">
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {resumeFile ? resumeFile.name : "Click to upload resume (PDF, DOCX)"}
                          </span>
                        </div>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx" 
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          className="hidden" 
                        />
                      </label>
                    </div>

                    <button 
                      type="submit" disabled={applying}
                      className="w-full bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl py-3.5 font-bold transition-all mt-2 disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      {applying && <Loader2 className="w-5 h-5 animate-spin" />}
                      {applying ? "Sending..." : "Submit Application"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

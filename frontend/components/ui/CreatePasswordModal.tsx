"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

/**
 * CreatePasswordModal
 * Mandatory modal shown to new OAuth users (Google/GitHub sign-up) so they can
 * set a password for their account. Cannot be dismissed — must complete.
 *
 * Triggered by: localStorage key "fp_new_oauth_user" = "1"
 * On success: removes the flag, updates the auth store's isOAuthUser flag.
 */
export default function CreatePasswordModal() {
  const { user, setUser } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = localStorage.getItem("fp_new_oauth_user");
    if (flag === "1" && user?.isOAuthUser) {
      setVisible(true);
    }
  }, [user?._id, user?.isOAuthUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.createPassword(newPassword, confirmPassword);
      setDone(true);
      // Remove the flag and close after 1.5s
      localStorage.removeItem("fp_new_oauth_user");
      // Update the store so isOAuthUser becomes false
      if (user) {
        setUser({ ...user, isOAuthUser: false });
      }
      setTimeout(() => setVisible(false), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][strength] || "";
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] || "";

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — NOT clickable to close (mandatory) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c0d16] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6a00]/40 to-transparent" />
              <div className="absolute top-0 left-1/4 w-1/2 h-[80px] bg-[#ff6a00]/[0.06] blur-2xl rounded-full" />

              <div className="relative p-7">
                {done ? (
                  // Success state
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white">Password Set!</h3>
                      <p className="text-sm text-white/60 mt-1">
                        You can now sign in with your email and password.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-11 h-11 rounded-xl bg-[#ff6a00]/15 border border-[#ff6a00]/20 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-[#ff6a00]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[17px] font-bold text-white leading-tight">
                            Secure Your Account
                          </h2>
                          <span className="px-2 py-0.5 rounded-md bg-[#ff6a00]/15 border border-[#ff6a00]/20 text-[10px] font-bold text-[#ff6a00] uppercase tracking-wider">
                            Required
                          </span>
                        </div>
                        <p className="text-[12.5px] text-white/55 mt-1 leading-relaxed">
                          You signed up with Google. Set a password to also enable email login and secure your account.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      {/* New Password */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#ff6a00]/40 focus:ring-1 focus:ring-[#ff6a00]/20 pr-10 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                          >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Strength bar */}
                        {newPassword && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-1 flex-1">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                    i <= strength ? strengthColor : "bg-white/[0.06]"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              strength === 4 ? "text-emerald-400" :
                              strength === 3 ? "text-yellow-400" :
                              strength === 2 ? "text-orange-400" : "text-red-400"
                            }`}>
                              {strengthLabel}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#ff6a00]/40 focus:ring-1 focus:ring-[#ff6a00]/20 pr-10 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <span className="text-[11px] text-red-400 font-medium">Passwords do not match</span>
                        )}
                        {confirmPassword && confirmPassword === newPassword && (
                          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Passwords match
                          </span>
                        )}
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[12px] text-red-400 font-medium">
                          {error}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        className="mt-1 w-full bg-[#ff6a00] hover:bg-[#e05d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,106,0,0.2)] hover:shadow-[0_0_28px_rgba(255,106,0,0.35)] cursor-pointer text-sm"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Set Password & Continue
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-white/35 leading-relaxed">
                        You can still sign in with Google anytime. This adds email login as an option.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

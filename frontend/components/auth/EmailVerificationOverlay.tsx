"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Mail, Loader2, ArrowRight, LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function EmailVerificationOverlay() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const showToast = useNotificationStore((state) => state.showToast);
  const router = useRouter();

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/resend-verification`,
        {}
      );
      if (res && res.success) {
        showToast("Verification email sent! Check your inbox.", "success");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to send verification email.", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post<{ success: boolean; isVerified: boolean; message: string }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/sync-verification`,
        {}
      );
      if (res && res.isVerified) {
        // Refresh the local user profile
        await AuthService.getCurrentUser();
        showToast("Email successfully verified! Welcome to the dashboard.", "success");
      } else {
        showToast("Email not verified yet. Please check your inbox.", "info");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to sync verification status.", "info");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-page/95 backdrop-blur-sm px-4">
      <div className="max-w-md w-full bg-bg-card border border-border-card rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
          Verify your email
        </h2>
        
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          We've sent a verification link to <strong className="text-text-primary">{user.email}</strong>. 
          Please verify your email address to unlock your FullPrep dashboard.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button 
            onClick={handleSync} 
            disabled={syncing}
            className="w-full py-3.5 justify-center flex items-center gap-2"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : "I've clicked the link"}
            {!syncing && <ArrowRight className="w-4 h-4" />}
          </Button>

          <Button 
            onClick={handleResend} 
            disabled={loading}
            variant="secondary"
            className="w-full py-3.5 justify-center flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resend Email"}
          </Button>

          <button 
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}

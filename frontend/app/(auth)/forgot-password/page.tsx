"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import Button from "@/components/ui/Button";
import { useNotificationStore } from "@/store/notificationStore";
import { AuthService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const showToast = useNotificationStore((state) => state.showToast);

  // State
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please enter a valid email", "info");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.forgotPassword(email);
      if (response && response.success) {
        setSuccess(true);
        showToast(response.message || "Reset link sent! Please check your inbox.", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to send reset link. Please try again.", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Title Header */}
      <div className="text-left flex flex-col gap-1.5 mb-8">
        <h1 className="text-[24px] font-bold text-text-primary tracking-[-0.02em] leading-tight">
          Forgot your password?
        </h1>
        <p className="text-[13.5px] text-text-secondary leading-normal font-medium tracking-[-0.01em]">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {/* Email Field */}
        <AuthInput
          label="Email"
          type="email"
          placeholder="enter@yourmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          error={error}
          disabled={success || loading}
          required
        />

        {/* Send Reset Link Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 mt-2 justify-center"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Sending reset link...</span>
            </>
          ) : success ? (
            <span>Link Sent!</span>
          ) : (
            <span>Send Reset Link</span>
          )}
        </Button>
      </form>

      {/* Success Notification Box (Fades/slides in beautifully) */}
      {success && (
        <div className="mt-6 p-4 rounded-xl bg-[#fffaf5] dark:bg-[#201614] border border-[#ff6a00]/25 flex items-start gap-3.5 text-left transition-all duration-300 animate-fadeIn">
          <Mail className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-text-primary">
              Check your inbox
            </span>
            <p className="text-[12.5px] text-text-secondary font-medium leading-relaxed">
              We&apos;ve sent a password reset link to <span className="text-text-primary font-bold">{email}</span>. Please check your inbox and spam folder.
            </p>
          </div>
        </div>
      )}

      {/* Footer Back link */}
      <div className="text-center text-[13.5px] font-semibold text-text-secondary tracking-[-0.01em] mt-8">
        Remember password?{" "}
        <Link
          href="/login"
          className="text-brand-orange hover:text-[#e05d00] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}

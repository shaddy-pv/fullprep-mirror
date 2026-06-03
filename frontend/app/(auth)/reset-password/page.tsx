"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import Button from "@/components/ui/Button";
import { useNotificationStore } from "@/store/notificationStore";

export default function ResetPasswordPage() {
  const showToast = useNotificationStore((state) => state.showToast);

  // Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fix the validation errors", "info");
      return;
    }

    setLoading(true);

    // Simulate password update
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      showToast("Password updated successfully!", "success");
    }, 1500);
  };

  return (
    <AuthCard>
      {/* Title Header */}
      <div className="text-left flex flex-col gap-1.5 mb-8">
        <h1 className="text-[24px] font-bold text-text-primary tracking-[-0.02em] leading-tight">
          Reset your password
        </h1>
        <p className="text-[13.5px] text-text-secondary leading-normal font-medium tracking-[-0.01em]">
          Enter your new password below.
        </p>
      </div>

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {/* New Password */}
        <div className="flex flex-col w-full">
          <AuthInput
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
            disabled={success || loading}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#9ca3af] hover:text-text-primary transition-colors focus:outline-none p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {/* Live password strength meter */}
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <AuthInput
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
          }}
          error={errors.confirmPassword}
          disabled={success || loading}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#9ca3af] hover:text-text-primary transition-colors focus:outline-none p-1 cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Reset Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 mt-2 justify-center"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : success ? (
            <span>Password Updated!</span>
          ) : (
            <span>Reset Password</span>
          )}
        </Button>
      </form>

      {/* Success Notification Box (Green outline and dark-green/emerald tint) */}
      {success && (
        <div className="mt-6 p-4 rounded-xl bg-[#eafaf1] dark:bg-[#0f1d18] border border-[#10b981]/25 flex items-start gap-3.5 text-left transition-all duration-300 animate-fadeIn animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-text-primary">
              Password updated successfully!
            </span>
            <p className="text-[12.5px] text-text-secondary font-medium leading-relaxed">
              You can now sign in with your new password. Go back to the sign in page below.
            </p>
          </div>
        </div>
      )}

      {/* Footer link to login */}
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

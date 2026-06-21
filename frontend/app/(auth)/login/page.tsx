"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import SocialButtons from "@/components/auth/SocialButtons";
import Button from "@/components/ui/Button";
import { useNotificationStore } from "@/store/notificationStore";
import { AuthService } from "@/services/auth.service";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useNotificationStore((state) => state.showToast);

  // Where to redirect after successful login (set by middleware)
  const redirectTo = searchParams.get("redirect") || "/";

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please check the form for errors", "info");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.login(email, password);
      showToast(response.message || "Welcome back! Signed in successfully.", "success");
      
      // Redirect to the page the user was trying to visit (or home)
      router.replace(redirectTo);
    } catch (err: any) {
      showToast(err.message || "Invalid email or password", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Title Header */}
      <div className="text-left flex flex-col gap-1.5 mb-8">
        <h1 className="text-[24px] font-bold text-text-primary tracking-[-0.02em] leading-tight">
          Sign in to FullPrep
        </h1>
        <p className="text-[13.5px] text-text-secondary leading-normal font-medium tracking-[-0.01em]">
          Welcome back! Please enter your details.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {/* Email Input */}
        <AuthInput
          label="Email"
          type="email"
          name="email"
          id="email-input"
          placeholder="enter@yourmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          error={errors.email}
          required
          autoComplete="email"
        />

        {/* Password Input */}
        <AuthInput
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          id="password-input"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          error={errors.password}
          required
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#9ca3af] hover:text-text-primary transition-colors focus:outline-none p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        {/* Remember me & Forgot Password Row */}
        <div className="flex items-center justify-between text-[13px] font-semibold tracking-[-0.01em] mt-1 select-none">
          <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-border-card text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-[#ff6a00]"
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-brand-orange hover:text-[#e05d00] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 mt-2 justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>

      {/* Social Login Section */}
      <SocialButtons />

      {/* Footer Signup Link */}
      <div className="text-center text-[13.5px] font-semibold text-text-secondary tracking-[-0.01em] mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-brand-orange hover:text-[#e05d00] transition-colors"
        >
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-40 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

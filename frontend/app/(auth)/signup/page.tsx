"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import SocialButtons from "@/components/auth/SocialButtons";
import Button from "@/components/ui/Button";
import { useNotificationStore } from "@/store/notificationStore";

export default function SignupPage() {
  const router = useRouter();
  const showToast = useNotificationStore((state) => state.showToast);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Terms and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      if (!agreeTerms) {
        showToast("You must agree to the Terms of Service & Privacy Policy", "info");
      } else {
        showToast("Please fix the validation errors before submitting", "info");
      }
      return;
    }

    setLoading(true);

    // Simulate account registration
    setTimeout(() => {
      setLoading(false);
      showToast("Account created successfully! Welcome to FullPrep.", "success");
      
      // Redirect to login
      router.push("/login");
    }, 1500);
  };

  return (
    <AuthCard>
      {/* Title Header */}
      <div className="text-left flex flex-col gap-1.5 mb-6">
        <h1 className="text-[24px] font-bold text-text-primary tracking-[-0.02em] leading-tight">
          Create your account
        </h1>
        <p className="text-[13.5px] text-text-secondary leading-normal font-medium tracking-[-0.01em]">
          Let&apos;s get you started with FullPrep.
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* Username Field */}
        <AuthInput
          label="Username"
          type="text"
          placeholder="yourusername"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) setErrors({ ...errors, username: "" });
          }}
          error={errors.username}
          required
        />

        {/* Email Field */}
        <AuthInput
          label="Email"
          type="email"
          placeholder="enter@yourmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          error={errors.email}
          required
        />

        {/* Password Field */}
        <div className="flex flex-col w-full">
          <AuthInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
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
          {/* Real-time Password Strength Indicator */}
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password Field */}
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

        {/* Terms and Privacy Checkbox */}
        <div className="flex flex-col mt-1 text-left select-none">
          <label className="flex items-start gap-2.5 cursor-pointer text-[12.5px] font-semibold text-text-secondary hover:text-text-primary transition-colors leading-relaxed">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" });
              }}
              className="w-4.5 h-4.5 rounded border-border-card text-brand-orange focus:ring-brand-orange/20 cursor-pointer mt-0.5 accent-[#ff6a00]"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="text-brand-orange hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-brand-orange hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeTerms && (
            <span className="text-[11.5px] font-medium text-red-500/90 tracking-[-0.01em] mt-1 pl-7">
              {errors.agreeTerms}
            </span>
          )}
        </div>

        {/* Create Account Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 mt-2 justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </Button>
      </form>

      {/* Social Login */}
      <SocialButtons />

      {/* Footer login link */}
      <div className="text-center text-[13.5px] font-semibold text-text-secondary tracking-[-0.01em] mt-6">
        Already have an account?{" "}
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

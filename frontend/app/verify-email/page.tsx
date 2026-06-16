"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

    fetch(`${BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => router.push("/login?verified=true"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f1a",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "90%",
          padding: "48px 40px",
          background: "#1a1a2e",
          borderRadius: 16,
          border: "1px solid #2d2d4a",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 24 }}>⏳</div>
            <h1 style={{ color: "#e2e8f0", marginBottom: 12 }}>Verifying your email…</h1>
            <p style={{ color: "#94a3b8" }}>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 24 }}>✅</div>
            <h1 style={{ color: "#6366f1", marginBottom: 12 }}>Email Verified!</h1>
            <p style={{ color: "#94a3b8", marginBottom: 24 }}>{message}</p>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Redirecting you to login…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 24 }}>❌</div>
            <h1 style={{ color: "#f87171", marginBottom: 12 }}>Verification Failed</h1>
            <p style={{ color: "#94a3b8", marginBottom: 32 }}>{message}</p>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "12px 28px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Guarantee the production API URL is always set correctly.
    // Vercel env var takes priority; falls back to the Render URL.
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://fullprep-backend.onrender.com/api",
  },
};

export default nextConfig;

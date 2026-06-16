import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  env: {
    // In production, always use the Render backend.
    // In development, use localhost.
    NEXT_PUBLIC_API_BASE_URL: isProd
      ? "https://fullprep-backend.onrender.com/api"
      : "http://localhost:5000/api",
  },
};

export default nextConfig;

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile?tab=stats");
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#06090f] text-[#9ca3af]">
      <div className="animate-pulse">Loading Statistics...</div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile?tab=activity");
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#06090f] text-[#9ca3af]">
      <div className="animate-pulse">Loading Activity...</div>
    </div>
  );
}

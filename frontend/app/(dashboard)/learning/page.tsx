"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearningPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/learning-paths");
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#06090f] text-[#9ca3af]">
      <div className="animate-pulse">Loading Learning Paths...</div>
    </div>
  );
}

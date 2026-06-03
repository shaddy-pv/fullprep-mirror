import React from "react";
import { cn } from "@/lib/utils";

export default function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("w-5 h-5 rounded-full border-[2.5px] border-brand-orange border-t-transparent animate-spin shrink-0", className)} />
  );
}

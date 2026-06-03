"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Escape key listener to close modals safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop clickable */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className={cn("relative w-full max-w-md bg-card-bg border border-border-card rounded-[24px] shadow-2xl p-6 overflow-hidden z-10 transition-transform duration-300 animate-in zoom-in-95", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-[#e7e5df]/40 dark:border-white/[0.03] pb-3 select-none">
          <h3 id="modal-title" className="text-[16px] font-bold text-text-primary leading-none">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

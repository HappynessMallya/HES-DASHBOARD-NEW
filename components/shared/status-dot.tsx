"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  online: boolean;
  className?: string;
}

export function StatusDot({ online, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        online ? "bg-[#16a34a] animate-pulse-dot" : "bg-[#dc2626]",
        className
      )}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}

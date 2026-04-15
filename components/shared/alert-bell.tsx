"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useAlertCount } from "@/lib/alert-context";

export function AlertBell() {
  const { active } = useAlertCount();

  return (
    <Link
      href="/alerts"
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#166534] hover:bg-[#dcfce7] transition-colors"
      aria-label={`Alerts${active > 0 ? ` (${active} active)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {active > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {active > 99 ? "99+" : active}
        </span>
      )}
    </Link>
  );
}

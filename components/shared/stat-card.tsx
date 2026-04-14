"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  accent?: "green" | "red" | "amber" | "sky";
  className?: string;
}

const accentColors = {
  green: "text-[#16a34a]",
  red: "text-[#dc2626]",
  amber: "text-[#f59e0b]",
  sky: "text-[#0ea5e9]",
};

const accentBg = {
  green: "bg-[#dcfce7]",
  red: "bg-red-50",
  amber: "bg-amber-50",
  sky: "bg-sky-50",
};

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accent = "green",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-[#bbf7d0]", className)}>
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", accentBg[accent])} />
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("rounded-lg p-2.5", accentBg[accent])}>
          <Icon className={cn("h-5 w-5", accentColors[accent])} />
        </div>
        <div>
          <p className="text-sm text-[#6b7280]">{label}</p>
          <p className="text-2xl font-bold text-[#14532d]">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-[#6b7280]">{unit}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

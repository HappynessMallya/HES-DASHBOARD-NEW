"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  const handlePreset = (days: number) => {
    const now = new Date();
    onTo(format(now, "yyyy-MM-dd"));
    if (days === 0) {
      onFrom(format(now, "yyyy-MM-dd"));
    } else {
      onFrom(format(subDays(now, days), "yyyy-MM-dd"));
    }
  };

  const onFrom = onFromChange;
  const onTo = onToChange;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-[#6b7280]">From</Label>
        <Input
          type="date"
          value={from}
          onChange={(e) => onFrom(e.target.value)}
          className="w-40 border-[#bbf7d0]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-[#6b7280]">To</Label>
        <Input
          type="date"
          value={to}
          onChange={(e) => onTo(e.target.value)}
          className="w-40 border-[#bbf7d0]"
        />
      </div>
      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => handlePreset(p.days)}
            className="text-xs"
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

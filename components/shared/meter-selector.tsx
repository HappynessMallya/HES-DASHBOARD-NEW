"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusDot } from "./status-dot";
import type { MeterOut } from "@/lib/types";

interface MeterSelectorProps {
  meters: MeterOut[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function MeterSelector({
  meters,
  value,
  onValueChange,
  placeholder = "Select a meter",
}: MeterSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => v !== null && onValueChange(v)}>
      <SelectTrigger className="w-[280px]" aria-label="Select meter">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {meters.map((meter) => (
          <SelectItem key={meter.id} value={meter.id}>
            <span className="flex items-center gap-2">
              <StatusDot online={meter.is_online} />
              {meter.serial_number}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

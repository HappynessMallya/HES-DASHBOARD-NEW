"use client";

import { Input } from "@/components/ui/input";
import { formatToken, stripTokenDashes } from "@/lib/utils";
import { useCallback } from "react";

interface TokenInputProps {
  value: string;
  onChange: (raw: string) => void;
  disabled?: boolean;
}

export function TokenInput({ value, onChange, disabled }: TokenInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 20);
      onChange(raw);
    },
    [onChange]
  );

  const digits = stripTokenDashes(value);
  const display = formatToken(digits);
  const isValid = digits.length >= 20;

  return (
    <div>
      <Input
        value={display}
        onChange={handleChange}
        placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
        maxLength={23}
        disabled={disabled}
        aria-label="STS Token"
        className={
          digits.length > 0 && !isValid ? "border-[#f59e0b] focus-visible:ring-[#f59e0b]" : ""
        }
      />
      <p className="mt-1 text-xs text-[#6b7280]">
        {digits.length}/20 digits
      </p>
    </div>
  );
}

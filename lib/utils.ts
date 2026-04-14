import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function fullDateTime(iso: string | null): string {
  if (!iso) return "N/A";
  try {
    return format(new Date(iso), "yyyy-MM-dd HH:mm:ss");
  } catch {
    return "N/A";
  }
}

export function formatNumber(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatToken(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 20);
  const parts = digits.match(/.{1,5}/g) || [];
  return parts.join("-");
}

export function stripTokenDashes(formatted: string): string {
  return formatted.replace(/-/g, "");
}

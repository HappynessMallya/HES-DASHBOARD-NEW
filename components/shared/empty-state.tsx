import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#dcfce7]">
        <Icon className="h-6 w-6 text-[#16a34a]" />
      </div>
      <h3 className="text-sm font-semibold text-[#14532d]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[#6b7280]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

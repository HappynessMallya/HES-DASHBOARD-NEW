import type { Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const ROLE_CONFIG: Record<Role, { label: string; className: string }> = {
  data_access: {
    label: "Data Access",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  operations: {
    label: "Operations",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  device_management: {
    label: "Device Management",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  user_admin: {
    label: "User Admin",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

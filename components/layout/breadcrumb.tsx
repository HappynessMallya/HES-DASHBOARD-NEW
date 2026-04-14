"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  meters: "Meters",
  live: "Live Readings",
  health: "Health Status",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [
    { label: "Dashboard", href: "/" },
    ...segments.map((seg, i) => ({
      label: routeLabels[seg] || seg,
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-[#6b7280]">
      {crumbs.map((crumb, i) => (
        <Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-[#14532d]">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-[#16a34a] transition-colors">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

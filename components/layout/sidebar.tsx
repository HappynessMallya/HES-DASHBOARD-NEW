"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Gauge,
  Radio,
  Bell,
  HeartPulse,
  Menu,
  Zap,
  BarChart3,
  Upload,
  FolderTree,
  HardDrive,
  MapPin,
  FileBarChart,
  Network,
  Users,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { AlertBell } from "@/components/shared/alert-bell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredRole?: Role;
  badge?: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/performance", label: "Performance", icon: BarChart3 },
    ],
  },
  {
    label: "Devices",
    items: [
      { href: "/meters", label: "Meters", icon: Gauge },
      {
        href: "/meters/import",
        label: "Batch Import",
        icon: Upload,
        requiredRole: "device_management",
      },
      { href: "/groups", label: "Device Groups", icon: FolderTree },
      {
        href: "/firmware",
        label: "Firmware",
        icon: HardDrive,
        requiredRole: "device_management",
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { href: "/live", label: "Live Readings", icon: Radio },
      { href: "/alerts", label: "Alerts", icon: Bell },
      { href: "/map", label: "GIS Map", icon: MapPin },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/reports", label: "Reports", icon: FileBarChart },
      { href: "/mdms", label: "MDMS Interface", icon: Network },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/admin/users",
        label: "User Management",
        icon: Users,
        requiredRole: "user_admin",
      },
      { href: "/health", label: "Health Status", icon: HeartPulse },
    ],
  },
];

function NavContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const { user, logout, hasRole } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16a34a]">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#14532d]">HES-SWA</h1>
          <p className="text-xs text-[#6b7280]">Energy Dashboard</p>
        </div>
      </div>

      <Separator className="bg-[#bbf7d0]" />

      {/* Navigation groups */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Main navigation"
      >
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.requiredRole || hasRole(item.requiredRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-3">
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                {group.label}
              </p>
              {visibleItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#15803d] text-white"
                        : "text-[#166534] hover:bg-[#dcfce7]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <>
          <Separator className="bg-[#bbf7d0]" />
          <div className="px-3 py-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcfce7]">
                <User className="h-4 w-4 text-[#16a34a]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#14532d]">
                  {user.full_name}
                </p>
                <p className="truncate text-xs text-[#6b7280]">
                  {user.username}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  onClose?.();
                  logout();
                }}
                className="text-[#6b7280] hover:text-red-600"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b border-[#bbf7d0] bg-white px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#f0fdf4] p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent pathname={pathname} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#16a34a]" />
            <span className="font-bold text-[#14532d]">HES-SWA</span>
          </div>
          <AlertBell />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col border-r border-[#bbf7d0] bg-[#f0fdf4]">
        <NavContent pathname={pathname} />
      </aside>
    </>
  );
}

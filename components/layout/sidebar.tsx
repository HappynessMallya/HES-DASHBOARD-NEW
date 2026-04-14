"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Gauge,
  Radio,
  CreditCard,
  Bell,
  Calendar,
  Power,
  HeartPulse,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meters", label: "Meters", icon: Gauge },
  { href: "/live", label: "Live Readings", icon: Radio },
];

const systemItems = [
  { href: "/health", label: "Health Status", icon: HeartPulse },
];

function NavContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
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

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#15803d] text-white"
                  : "text-[#166534] hover:bg-[#dcfce7]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <Separator className="my-3 bg-[#bbf7d0]" />
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          System
        </p>

        {systemItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#15803d] text-white"
                  : "text-[#166534] hover:bg-[#dcfce7]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
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
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#f0fdf4] p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent pathname={pathname} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#16a34a]" />
          <span className="font-bold text-[#14532d]">HES-SWA</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col border-r border-[#bbf7d0] bg-[#f0fdf4]">
        <NavContent pathname={pathname} />
      </aside>
    </>
  );
}

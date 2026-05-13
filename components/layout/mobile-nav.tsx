"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  ClipboardList,
  LineChart,
  Compass,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  clipboard: ClipboardList,
  chart: LineChart,
  compass: Compass,
  settings: SettingsIcon,
};

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t bg-background/95 px-2 py-1.5 backdrop-blur lg:hidden"
      aria-label="Primary navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon] ?? Gauge;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

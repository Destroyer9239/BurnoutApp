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
import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  clipboard: ClipboardList,
  chart: LineChart,
  compass: Compass,
  settings: SettingsIcon,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card/40 px-3 py-5 lg:flex"
      aria-label="Primary navigation"
    >
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon] ?? Gauge;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border bg-background/60 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Need support?</p>
        <p className="mt-1">
          {`If you're in crisis, please reach out to a local helpline or trusted professional.`}
        </p>
      </div>
    </aside>
  );
}

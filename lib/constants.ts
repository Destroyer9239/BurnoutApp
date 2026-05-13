// Single source of truth for shared, app-wide constants.

import type { BurnoutBand } from "@/types/domain";

export const APP_NAME = "Lumen";
export const APP_TAGLINE = "A calmer way to monitor and recover from burnout.";

export const BAND_DEFINITIONS: Record<
  BurnoutBand,
  { label: string; description: string; color: string; min: number; max: number }
> = {
  thriving: {
    label: "Thriving",
    description: "Energy is steady. Keep doing what's working.",
    color: "hsl(142 72% 45%)",
    min: 0,
    max: 25,
  },
  stable: {
    label: "Stable",
    description: "Mostly okay. Watch for early warning signs.",
    color: "hsl(180 62% 45%)",
    min: 26,
    max: 50,
  },
  strained: {
    label: "Strained",
    description: "Recovery is lagging. Time to lighten the load.",
    color: "hsl(38 92% 55%)",
    min: 51,
    max: 75,
  },
  at_risk: {
    label: "At risk",
    description: "Burnout signs are clear. Be deliberate about rest.",
    color: "hsl(0 72% 55%)",
    min: 76,
    max: 100,
  },
};

export const SCORE_BAND_THRESHOLDS: Array<{ max: number; band: BurnoutBand }> = [
  { max: 25, band: "thriving" },
  { max: 50, band: "stable" },
  { max: 75, band: "strained" },
  { max: 100, band: "at_risk" },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "gauge" as const },
  { href: "/check-in", label: "Check-in", icon: "clipboard" as const },
  { href: "/analytics", label: "Analytics", icon: "chart" as const },
  { href: "/resources", label: "Resources", icon: "compass" as const },
  { href: "/settings", label: "Settings", icon: "settings" as const },
];

export const SLIDER_LABELS: Record<string, [string, string]> = {
  mood: ["Low", "Bright"],
  energy: ["Drained", "Energised"],
  stress: ["Calm", "Stressed"],
  workload: ["Light", "Crushing"],
};

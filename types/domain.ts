// Domain-level types used across the app. Built on top of the Supabase row
// shapes in ./database.ts to keep server/client/component contracts aligned.

import type { CheckInRowDB, JournalRowDB, NicheConfigRowDB, ProfileRowDB } from "./database";

export type ProfileRow = ProfileRowDB;
export type CheckInRow = CheckInRowDB;
export type JournalRow = JournalRowDB;
export type NicheConfigRow = NicheConfigRowDB;

export type NicheSlug =
  | "software_engineer"
  | "healthcare"
  | "teacher"
  | "student"
  | "creative"
  | "entrepreneur"
  | "custom";

export interface Goal {
  id: string;
  label: string;
  cadence: "daily" | "weekly";
}

export interface NotificationPrefs {
  daily_reminder: boolean;
  weekly_summary: boolean;
}

export interface BurnoutScore {
  composite: number;
  band: BurnoutBand;
  ee: number;
  dp: number;
  pa: number;
  asOf: string;
  trend: TrendPoint[];
  delta7d: number;
}

export type BurnoutBand = "thriving" | "stable" | "strained" | "at_risk";

export interface TrendPoint {
  date: string;
  score: number;
  mood: number;
  energy: number;
  stress: number;
}

export interface HeatmapCell {
  date: string;
  intensity: number;
  checkedIn: boolean;
}

export interface ResourceItem {
  title: string;
  kind: "article" | "exercise" | "template";
  url?: string;
  body?: string;
}

export interface RecoveryPlanStep {
  title: string;
  description: string;
  cadence: "today" | "this_week" | "ongoing";
}

export interface WeeklyInsight {
  summary: string;
  highlights: string[];
  caution: string | null;
  source: "claude" | "rules";
}

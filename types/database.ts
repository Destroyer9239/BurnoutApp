// Generated-style typings that mirror supabase/migrations/0001_init.sql.
// Hand-maintained — keep in sync with the SQL migration when columns change.

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface ProfileRowDB {
  id: string;
  display_name: string | null;
  niche: string | null;
  custom_niche_label: string | null;
  goals: Json;
  notification_prefs: Json;
  baseline_ee: number | null;
  baseline_dp: number | null;
  baseline_pa: number | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckInRowDB {
  id: string;
  user_id: string;
  entry_date: string;
  checked_in_at: string;
  mood: number;
  energy: number;
  stress: number;
  workload: number;
  sleep_hours: number | null;
  ee_score: number | null;
  dp_score: number | null;
  pa_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalRowDB {
  id: string;
  user_id: string;
  check_in_id: string | null;
  content: string;
  mood_tag: string | null;
  created_at: string;
}

export interface NicheConfigRowDB {
  slug: string;
  label: string;
  description: string;
  indicators: Json;
  prompts: Json;
  community_avg_ee: number;
  community_avg_dp: number;
  community_avg_pa: number;
  resources: Json;
  created_at: string;
}

interface Relationship {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}

interface TableDef<Row> {
  Row: Row;
  Insert: { [K in keyof Row]?: Row[K] };
  Update: { [K in keyof Row]?: Row[K] };
  Relationships: Relationship[];
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: TableDef<ProfileRowDB>;
      check_ins: TableDef<CheckInRowDB>;
      journal_entries: TableDef<JournalRowDB>;
      niche_configs: TableDef<NicheConfigRowDB>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

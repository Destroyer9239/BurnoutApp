// Server-side Supabase client for React Server Components and Route Handlers.
// Reads/writes cookies via Next.js `cookies()` so the auth session is preserved.

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CheckInRowDB,
  Database,
  JournalRowDB,
  NicheConfigRowDB,
  ProfileRowDB,
} from "@/types/database";

// We deliberately type as `SupabaseClient<any>` and provide a typed query
// helper that re-asserts the row shapes at use sites. The library's strict
// schema inference has trouble with our hand-maintained Database type under
// `strictNullChecks`; the casts below preserve type safety where it matters
// (row shapes) without fighting library internals.
export type AppSupabase = SupabaseClient<Database>;

export function createSupabaseServerClient(): AppSupabase {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — set() is a no-op there. Middleware
            // and Route Handlers handle the write path.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // See note above.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}

// -----------------------------------------------------------------------------
// Typed accessors. We keep these centralised so route handlers and pages don't
// need to repeat the same casts. Each function returns the data with the row
// shape we know matches the migration in supabase/migrations/0001_init.sql.
// -----------------------------------------------------------------------------

export async function fetchProfile(supabase: AppSupabase, userId: string): Promise<ProfileRowDB | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return (data ?? null) as ProfileRowDB | null;
}

export async function fetchCheckIns(
  supabase: AppSupabase,
  userId: string,
  limit = 90,
): Promise<CheckInRowDB[]> {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: true })
    .limit(limit);
  return (data ?? []) as CheckInRowDB[];
}

export async function fetchCheckInsDesc(
  supabase: AppSupabase,
  userId: string,
  limit = 60,
): Promise<CheckInRowDB[]> {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit);
  return (data ?? []) as CheckInRowDB[];
}

export async function fetchTodayCheckIn(
  supabase: AppSupabase,
  userId: string,
  date: string,
): Promise<CheckInRowDB | null> {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .maybeSingle();
  return (data ?? null) as CheckInRowDB | null;
}

export async function fetchJournal(supabase: AppSupabase, userId: string): Promise<JournalRowDB[]> {
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as JournalRowDB[];
}

export async function fetchNicheConfig(
  supabase: AppSupabase,
  slug: string,
): Promise<NicheConfigRowDB | null> {
  const { data } = await supabase
    .from("niche_configs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? null) as NicheConfigRowDB | null;
}

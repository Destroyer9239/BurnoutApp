// /check-in — the daily check-in flow. Loads today's existing entry (if any)
// for editing, plus the niche-specific prompt suggestions.

import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CheckInForm } from "@/components/check-in/check-in-form";
import { StreakBadge } from "@/components/check-in/streak-badge";
import {
  createSupabaseServerClient,
  fetchCheckInsDesc,
  fetchProfile,
  fetchTodayCheckIn,
  requireUser,
} from "@/lib/supabase/server";
import { streakFromHistory } from "@/lib/scoring/burnout";
import { getNiche } from "@/lib/niches/configs";
import { todayISO, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Daily check-in" };
export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();

  const [profile, history, today] = await Promise.all([
    fetchProfile(supabase, user.id),
    fetchCheckInsDesc(supabase, user.id, 60),
    fetchTodayCheckIn(supabase, user.id, todayISO()),
  ]);

  const streak = streakFromHistory(history);
  const niche = getNiche(profile?.niche);

  return (
    <div className="space-y-6">
      <PageHeader
        title={today ? "Edit today's check-in" : "Daily check-in"}
        description={formatDate(todayISO(), "EEEE, MMMM d")}
        actions={<StreakBadge streak={streak} />}
      />
      <CheckInForm initial={today} prompts={niche.prompts} />
    </div>
  );
}

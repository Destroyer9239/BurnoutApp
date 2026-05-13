// /analytics — deeper view: weekly/monthly trend tabs, 12-week heatmap,
// niche community comparison, and the weekly insight.

import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendLine } from "@/components/charts/trend-line";
import { HeatmapCalendar } from "@/components/charts/heatmap-calendar";
import { CommunityCompare } from "@/components/charts/community-compare";
import { InsightCard } from "@/components/analytics/insight-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  createSupabaseServerClient,
  fetchCheckIns,
  fetchNicheConfig,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import { computeBurnoutScore, scoreCheckIn } from "@/lib/scoring/burnout";
import type { HeatmapCell } from "@/types/domain";
import type { CheckInRowDB, ProfileRowDB } from "@/types/database";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();

  const [history, profile] = await Promise.all([
    fetchCheckIns(supabase, user.id, 180),
    fetchProfile(supabase, user.id),
  ]);

  const score = computeBurnoutScore(history, profile);

  let community: { label: string; ee: number; dp: number; pa: number } | null = null;
  if (profile?.niche) {
    const niche = await fetchNicheConfig(supabase, profile.niche);
    if (niche) {
      community = {
        label: niche.label,
        ee: niche.community_avg_ee,
        dp: niche.community_avg_dp,
        pa: niche.community_avg_pa,
      };
    }
  }

  const heatmap = buildHeatmap(history, profile);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Trends, patterns, and comparisons across your check-ins."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>30-day score</CardTitle>
            <CardDescription>Composite burnout score over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendLine data={score.trend} />
          </CardContent>
        </Card>
        <InsightCard />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>12-week heatmap</CardTitle>
          <CardDescription>One square per day — color tracks composite intensity.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState title="No data yet" description="Save a check-in to start seeing patterns." />
          ) : (
            <HeatmapCalendar cells={heatmap} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compared to community</CardTitle>
          <CardDescription>
            Anonymised averages for your niche. Lower is better for EE/DP; higher is better for PA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityCompare user={{ ee: score.ee, dp: score.dp, pa: score.pa }} community={community} />
        </CardContent>
      </Card>
    </div>
  );
}

function buildHeatmap(rows: CheckInRowDB[], profile: ProfileRowDB | null): HeatmapCell[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.entry_date, scoreCheckIn(r, profile).composite);
  }
  const cells: HeatmapCell[] = [];
  const today = new Date();
  for (let i = 12 * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const value = map.get(key);
    cells.push({ date: key, intensity: value ?? 0, checkedIn: value !== undefined });
  }
  return cells;
}

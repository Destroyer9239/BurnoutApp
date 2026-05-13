// /dashboard — flagship view: gauge, sub-scores, trend, recent check-ins.
// All data is fetched server-side and rendered without client waterfalls.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { BurnoutGauge } from "@/components/charts/burnout-gauge";
import { SubScores } from "@/components/charts/sub-scores";
import { TrendLine } from "@/components/charts/trend-line";
import { RecentCheckIns } from "@/components/dashboard/recent-check-ins";
import { QuickStats } from "@/components/dashboard/quick-stats";
import {
  createSupabaseServerClient,
  fetchCheckIns,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import { computeBurnoutScore, streakFromHistory } from "@/lib/scoring/burnout";
import { BAND_DEFINITIONS } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();

  const [history, profile] = await Promise.all([
    fetchCheckIns(supabase, user.id, 90),
    fetchProfile(supabase, user.id),
  ]);

  const score = computeBurnoutScore(history, profile);
  const streak = streakFromHistory(history);
  const todaysCheckIn = history.find((r) => r.entry_date === todayISO());
  const recent = history.slice().reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={BAND_DEFINITIONS[score.band].description}
        actions={
          <Button asChild>
            <Link href="/check-in">
              {todaysCheckIn ? "Edit today's check-in" : "Check in for today"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="flex flex-col items-center justify-center p-6">
          <CardTitle className="self-start text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Burnout score
          </CardTitle>
          <BurnoutGauge score={score.composite} band={score.band} />
          <p className="mt-3 max-w-xs text-balance text-center text-sm text-muted-foreground">
            {`Composite of Emotional Exhaustion, Depersonalisation, and Personal Accomplishment over your last 7 check-ins.`}
          </p>
        </Card>

        <div className="space-y-6">
          <QuickStats streak={streak} delta7d={score.delta7d} entries={history.length} />
          <SubScores ee={score.ee} dp={score.dp} pa={score.pa} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
          <CardDescription>Composite score over your last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <TrendLine data={score.trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent check-ins</CardTitle>
            <CardDescription>The last week at a glance.</CardDescription>
          </div>
          <Button variant="ghost" asChild size="sm">
            <Link href="/analytics">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RecentCheckIns rows={recent} />
        </CardContent>
      </Card>
    </div>
  );
}

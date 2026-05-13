// /resources — niche-specific articles, breathing, boundary templates,
// and a personalised recovery plan.

import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ArticleCard } from "@/components/resources/article-card";
import { BreathingExercise } from "@/components/resources/breathing-exercise";
import { BoundaryTemplates } from "@/components/resources/boundary-templates";
import { RecoveryPlanGenerator } from "@/components/resources/recovery-plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSupabaseServerClient,
  fetchCheckIns,
  fetchNicheConfig,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import { getNiche } from "@/lib/niches/configs";
import { computeBurnoutScore } from "@/lib/scoring/burnout";
import type { ResourceItem } from "@/types/domain";

export const metadata: Metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();

  const [profile, history] = await Promise.all([
    fetchProfile(supabase, user.id),
    fetchCheckIns(supabase, user.id, 60),
  ]);

  const niche = getNiche(profile?.niche);
  const score = computeBurnoutScore(history, profile);

  let articles: ResourceItem[] = [];
  if (profile?.niche) {
    const cfg = await fetchNicheConfig(supabase, profile.niche);
    if (cfg && Array.isArray(cfg.resources)) {
      articles = cfg.resources as unknown as ResourceItem[];
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description={`Curated for ${niche.label.toLowerCase()}s.`}
      />

      <RecoveryPlanGenerator niche={niche} band={score.band} />

      <Card>
        <CardHeader>
          <CardTitle>Quick reads & exercises</CardTitle>
          <CardDescription>Short pieces and tools to dip into.</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No curated resources for this niche yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.title} article={a} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <BreathingExercise />
        <Card>
          <CardHeader>
            <CardTitle>Boundary templates</CardTitle>
            <CardDescription>Edit before sending — your voice still matters.</CardDescription>
          </CardHeader>
          <CardContent>
            <BoundaryTemplates niche={niche} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

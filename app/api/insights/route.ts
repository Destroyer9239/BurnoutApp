// GET /api/insights — weekly insight summary. Uses Claude if an
// ANTHROPIC_API_KEY is configured, otherwise falls back to the rule-based
// generator. Both code paths return the same WeeklyInsight shape.

import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  fetchCheckIns,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import { computeBurnoutScore } from "@/lib/scoring/burnout";
import { generateClaudeInsight } from "@/lib/insights/claude";
import { generateRuleBasedInsight } from "@/lib/insights/generator";
import { handleUnknown } from "@/lib/api/handlers";
import type { NicheSlug } from "@/types/domain";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();

    const [history, profile] = await Promise.all([
      fetchCheckIns(supabase, user.id, 60),
      fetchProfile(supabase, user.id),
    ]);

    const score = computeBurnoutScore(history, profile);

    const input = {
      history,
      score,
      niche: (profile?.niche ?? null) as NicheSlug | null,
      displayName: profile?.display_name ?? null,
    };

    const insight = process.env.ANTHROPIC_API_KEY
      ? await generateClaudeInsight(input)
      : generateRuleBasedInsight(input);

    return NextResponse.json({ insight });
  } catch (e) {
    return handleUnknown(e);
  }
}

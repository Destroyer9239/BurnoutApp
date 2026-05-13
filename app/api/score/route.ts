// GET /api/score — composite burnout score derived from recent check-ins.

import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  fetchCheckIns,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import { computeBurnoutScore, streakFromHistory } from "@/lib/scoring/burnout";
import { handleUnknown } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const [history, profile] = await Promise.all([
      fetchCheckIns(supabase, user.id, 90),
      fetchProfile(supabase, user.id),
    ]);
    const score = computeBurnoutScore(history, profile);
    const streak = streakFromHistory(history);
    return NextResponse.json({ score, streak });
  } catch (e) {
    return handleUnknown(e);
  }
}

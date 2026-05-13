// GET /api/check-ins — recent check-ins (default 90 days)
// POST /api/check-ins — upsert today's check-in. Recomputes sub-scores
// server-side so the row always reflects the canonical algorithm.

import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerClient,
  fetchCheckInsDesc,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import type { CheckInRowDB } from "@/types/database";
import { checkInSchema } from "@/lib/validation/schemas";
import { handleUnknown, jsonError } from "@/lib/api/handlers";
import { scoreCheckIn } from "@/lib/scoring/burnout";
import { todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 90), 365);
    const check_ins = await fetchCheckInsDesc(supabase, user.id, limit);
    return NextResponse.json({ check_ins });
  } catch (e) {
    return handleUnknown(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const body = checkInSchema.parse(await req.json());
    const profile = await fetchProfile(supabase, user.id);

    const draft: CheckInRowDB = {
      id: "",
      user_id: user.id,
      entry_date: todayISO(),
      checked_in_at: new Date().toISOString(),
      mood: body.mood,
      energy: body.energy,
      stress: body.stress,
      workload: body.workload,
      sleep_hours: body.sleep_hours ?? null,
      ee_score: null,
      dp_score: null,
      pa_score: null,
      notes: body.notes ?? null,
      created_at: "",
      updated_at: "",
    };

    const computed = scoreCheckIn(draft, profile);

    const payload = {
      user_id: user.id,
      entry_date: todayISO(),
      mood: body.mood,
      energy: body.energy,
      stress: body.stress,
      workload: body.workload,
      sleep_hours: body.sleep_hours ?? null,
      notes: body.notes ?? null,
      ee_score: computed.ee,
      dp_score: computed.dp,
      pa_score: computed.pa,
      checked_in_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("check_ins")
      .upsert(payload as never, { onConflict: "user_id,entry_date" })
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ check_in: data });
  } catch (e) {
    return handleUnknown(e);
  }
}

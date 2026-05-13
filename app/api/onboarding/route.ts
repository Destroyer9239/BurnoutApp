// POST /api/onboarding — finalises onboarding by writing the niche, name,
// baseline scores, and goals to public.profiles, and stamping onboarded_at.

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/schemas";
import { handleUnknown, jsonError } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const body = onboardingSchema.parse(await req.json());

    const update = {
      display_name: body.display_name,
      niche: body.niche,
      custom_niche_label: body.custom_niche_label ?? null,
      baseline_ee: body.assessment.ee,
      baseline_dp: body.assessment.dp,
      baseline_pa: body.assessment.pa,
      goals: body.goals,
      onboarded_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(update as never)
      .eq("id", user.id);

    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleUnknown(e);
  }
}

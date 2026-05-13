// GET /api/profile — current user profile
// PATCH /api/profile — partial update (settings page uses this)

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, fetchProfile, requireUser } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { handleUnknown, jsonError } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const profile = await fetchProfile(supabase, user.id);
    return NextResponse.json({ profile, email: user.email });
  } catch (e) {
    return handleUnknown(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const body = profileUpdateSchema.parse(await req.json());
    const { error } = await supabase
      .from("profiles")
      .update(body as never)
      .eq("id", user.id);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleUnknown(e);
  }
}

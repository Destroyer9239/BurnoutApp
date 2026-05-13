// GET /api/journal — list journal entries
// POST /api/journal — create one

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, fetchJournal, requireUser } from "@/lib/supabase/server";
import { journalSchema } from "@/lib/validation/schemas";
import { handleUnknown, jsonError } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const entries = await fetchJournal(supabase, user.id);
    return NextResponse.json({ entries });
  } catch (e) {
    return handleUnknown(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const body = journalSchema.parse(await req.json());
    const payload = {
      user_id: user.id,
      content: body.content,
      mood_tag: body.mood_tag ?? null,
      check_in_id: body.check_in_id ?? null,
    };
    const { data, error } = await supabase
      .from("journal_entries")
      .insert(payload as never)
      .select()
      .single();
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ entry: data });
  } catch (e) {
    return handleUnknown(e);
  }
}

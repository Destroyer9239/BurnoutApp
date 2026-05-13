// GET /api/export/pdf — generates a printable PDF report.

import { createSupabaseServerClient, fetchCheckIns, fetchProfile, requireUser } from "@/lib/supabase/server";
import { buildPDFReport } from "@/lib/export/pdf";
import { computeBurnoutScore } from "@/lib/scoring/burnout";
import { handleUnknown, jsonError } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const [history, profile] = await Promise.all([
      fetchCheckIns(supabase, user.id, 10000),
      fetchProfile(supabase, user.id),
    ]);
    if (!profile) return jsonError("Profile not found", 404);

    const score = computeBurnoutScore(history, profile);
    const pdf = buildPDFReport({ profile, score, history });

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="burnout-report-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return handleUnknown(e);
  }
}

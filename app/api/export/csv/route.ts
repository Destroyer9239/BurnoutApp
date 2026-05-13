// GET /api/export/csv — streams the user's full check-in history as CSV.

import { createSupabaseServerClient, fetchCheckIns, requireUser } from "@/lib/supabase/server";
import { checkInsToCSV } from "@/lib/export/csv";
import { handleUnknown } from "@/lib/api/handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const data = await fetchCheckIns(supabase, user.id, 10000);
    const csv = checkInsToCSV(data);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="burnout-checkins-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return handleUnknown(e);
  }
}

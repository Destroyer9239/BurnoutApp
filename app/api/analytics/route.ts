// GET /api/analytics — aggregate trend data and the niche community benchmark
// for the analytics page.

import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerClient,
  fetchCheckIns,
  fetchNicheConfig,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";
import { computeBurnoutScore, scoreCheckIn } from "@/lib/scoring/burnout";
import { handleUnknown } from "@/lib/api/handlers";
import { todayISO } from "@/lib/utils";
import type { HeatmapCell } from "@/types/domain";
import type { CheckInRowDB, ProfileRowDB } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const window = req.nextUrl.searchParams.get("window") ?? "month";

    const [history, profile] = await Promise.all([
      fetchCheckIns(supabase, user.id, 120),
      fetchProfile(supabase, user.id),
    ]);

    const score = computeBurnoutScore(history, profile);

    let community: { label: string; ee: number; dp: number; pa: number } | null = null;
    if (profile?.niche) {
      const niche = await fetchNicheConfig(supabase, profile.niche);
      if (niche) {
        community = {
          label: niche.label,
          ee: niche.community_avg_ee,
          dp: niche.community_avg_dp,
          pa: niche.community_avg_pa,
        };
      }
    }

    const heatmap = buildHeatmap(history, profile);

    return NextResponse.json({
      window,
      score,
      heatmap,
      community,
      totals: {
        entries: history.length,
        today: history.find((c) => c.entry_date === todayISO()) ?? null,
      },
    });
  } catch (e) {
    return handleUnknown(e);
  }
}

function buildHeatmap(rows: CheckInRowDB[], profile: ProfileRowDB | null): HeatmapCell[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.entry_date, scoreCheckIn(r, profile).composite);
  }
  const cells: HeatmapCell[] = [];
  const today = new Date();
  for (let i = 12 * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const value = map.get(key);
    cells.push({ date: key, intensity: value ?? 0, checkedIn: value !== undefined });
  }
  return cells;
}

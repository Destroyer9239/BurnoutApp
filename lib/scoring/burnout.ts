// Composite burnout score derived from a rolling window of check-ins. The
// algorithm intentionally mixes daily signals (mood/energy/stress/workload)
// with the baseline MBI snapshot captured during onboarding, so the score
// keeps reflecting accumulated load even on days the user doesn't journal.

import type { BurnoutBand, BurnoutScore, CheckInRow, ProfileRow, TrendPoint } from "@/types/domain";
import { SCORE_BAND_THRESHOLDS } from "@/lib/constants";
import { clamp, round } from "@/lib/utils";

const EE_WEIGHT = 0.45;
const DP_WEIGHT = 0.25;
const PA_WEIGHT = 0.3;

function bandFor(score: number): BurnoutBand {
  for (const t of SCORE_BAND_THRESHOLDS) {
    if (score <= t.max) return t.band;
  }
  return "at_risk";
}

function dailyEE(c: CheckInRow): number {
  // Higher stress + workload and lower energy push EE up. 0-100 scale.
  return clamp(
    ((c.stress - 1) * 0.5 + (c.workload - 1) * 0.3 + (10 - c.energy) * 0.2) * (100 / 9),
  );
}

function dailyDP(c: CheckInRow): number {
  // Daily proxy: lower mood + higher stress nudges depersonalisation.
  return clamp(((10 - c.mood) * 0.6 + (c.stress - 1) * 0.4) * (100 / 9));
}

function dailyPA(c: CheckInRow): number {
  // Higher mood + energy with sane workload suggests personal accomplishment.
  return clamp(
    ((c.mood - 1) * 0.5 + (c.energy - 1) * 0.4 + Math.max(0, 8 - c.workload) * 0.1) * (100 / 9),
  );
}

function blend(daily: number, baseline: number | null, weight = 0.7): number {
  if (baseline === null) return round(daily);
  return round(daily * weight + baseline * (1 - weight));
}

export function scoreCheckIn(
  c: CheckInRow,
  profile: ProfileRow | null,
): { ee: number; dp: number; pa: number; composite: number; band: BurnoutBand } {
  const ee = blend(dailyEE(c), profile?.baseline_ee ?? null);
  const dp = blend(dailyDP(c), profile?.baseline_dp ?? null);
  const pa = blend(dailyPA(c), profile?.baseline_pa ?? null);
  const composite = round(clamp(EE_WEIGHT * ee + DP_WEIGHT * dp + PA_WEIGHT * (100 - pa)));
  return { ee, dp, pa, composite, band: bandFor(composite) };
}

export function computeBurnoutScore(
  history: CheckInRow[],
  profile: ProfileRow | null,
): BurnoutScore {
  if (history.length === 0) {
    return {
      composite: 0,
      band: "thriving",
      ee: profile?.baseline_ee ?? 0,
      dp: profile?.baseline_dp ?? 0,
      pa: profile?.baseline_pa ?? 0,
      asOf: new Date().toISOString(),
      trend: [],
      delta7d: 0,
    };
  }

  const sorted = [...history].sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  const last7 = sorted.slice(-7);
  const last14 = sorted.slice(-14, -7);

  const ee = round(last7.reduce((acc, c) => acc + dailyEE(c), 0) / last7.length);
  const dp = round(last7.reduce((acc, c) => acc + dailyDP(c), 0) / last7.length);
  const pa = round(last7.reduce((acc, c) => acc + dailyPA(c), 0) / last7.length);

  const eeFinal = blend(ee, profile?.baseline_ee ?? null);
  const dpFinal = blend(dp, profile?.baseline_dp ?? null);
  const paFinal = blend(pa, profile?.baseline_pa ?? null);

  const composite = round(
    clamp(EE_WEIGHT * eeFinal + DP_WEIGHT * dpFinal + PA_WEIGHT * (100 - paFinal)),
  );

  const trend: TrendPoint[] = sorted.slice(-30).map((c) => {
    const daily = scoreCheckIn(c, profile);
    return {
      date: c.entry_date,
      score: daily.composite,
      mood: c.mood,
      energy: c.energy,
      stress: c.stress,
    };
  });

  let delta7d = 0;
  if (last14.length > 0) {
    const prevAvg =
      last14.reduce((acc, c) => acc + scoreCheckIn(c, profile).composite, 0) / last14.length;
    const curAvg = last7.reduce((acc, c) => acc + scoreCheckIn(c, profile).composite, 0) / last7.length;
    delta7d = round(curAvg - prevAvg);
  }

  return {
    composite,
    band: bandFor(composite),
    ee: eeFinal,
    dp: dpFinal,
    pa: paFinal,
    asOf: sorted[sorted.length - 1]!.entry_date,
    trend,
    delta7d,
  };
}

export function streakFromHistory(history: CheckInRow[]): number {
  if (history.length === 0) return 0;
  const dates = new Set(history.map((c) => c.entry_date));
  let count = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) {
      count += 1;
      d.setDate(d.getDate() - 1);
    } else {
      // Tolerate today not yet being checked in.
      if (count === 0) {
        d.setDate(d.getDate() - 1);
        const next = d.toISOString().slice(0, 10);
        if (dates.has(next)) {
          count += 1;
          d.setDate(d.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return count;
}

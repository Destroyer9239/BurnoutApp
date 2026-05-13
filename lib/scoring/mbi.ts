// MBI-style sub-score calculation. Likert 0-6 responses are aggregated per
// dimension and normalised to a 0-100 scale. PA is *reverse* — a high score
// means high personal accomplishment, which subtracts from burnout.

import type { MBIResponse } from "@/lib/niches/configs";
import { MBI_QUESTIONS } from "@/lib/niches/configs";
import { clamp, round } from "@/lib/utils";

export interface MBIScores {
  ee: number;
  dp: number;
  pa: number;
}

export function computeMBIScores(responses: MBIResponse): MBIScores {
  const buckets: Record<"ee" | "dp" | "pa", number[]> = { ee: [], dp: [], pa: [] };

  for (const q of MBI_QUESTIONS) {
    const raw = responses[q.id];
    if (typeof raw === "number") {
      buckets[q.sub].push(clamp(raw, 0, 6));
    }
  }

  const avg = (xs: number[]) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);

  return {
    ee: round(clamp((avg(buckets.ee) / 6) * 100)),
    dp: round(clamp((avg(buckets.dp) / 6) * 100)),
    pa: round(clamp((avg(buckets.pa) / 6) * 100)),
  };
}

// Rule-based weekly insight generator. Used directly when ANTHROPIC_API_KEY
// is not set, and as the fallback / cache key generator when Claude is used.

import type { BurnoutScore, CheckInRow, NicheSlug, WeeklyInsight } from "@/types/domain";
import { getNiche } from "@/lib/niches/configs";

interface GeneratorInput {
  history: CheckInRow[];
  score: BurnoutScore;
  niche: NicheSlug | null;
  displayName: string | null;
}

export function generateRuleBasedInsight({
  history,
  score,
  niche,
  displayName,
}: GeneratorInput): WeeklyInsight {
  const name = displayName ?? "there";
  const last7 = history.slice(-7);

  if (last7.length === 0) {
    return {
      summary: `Hi ${name} — no check-ins yet this week. Drop one in to start your trend line.`,
      highlights: [],
      caution: null,
      source: "rules",
    };
  }

  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
  const moodAvg = avg(last7.map((c) => c.mood));
  const stressAvg = avg(last7.map((c) => c.stress));
  const energyAvg = avg(last7.map((c) => c.energy));
  const workloadAvg = avg(last7.map((c) => c.workload));
  const sleepAvg = avg(last7.map((c) => c.sleep_hours ?? 7));

  const highlights: string[] = [];

  if (moodAvg >= 7) highlights.push(`Mood ran high (avg ${moodAvg.toFixed(1)}/10).`);
  else if (moodAvg <= 4) highlights.push(`Mood was low (avg ${moodAvg.toFixed(1)}/10).`);

  if (energyAvg <= 4) highlights.push(`Energy dipped (avg ${energyAvg.toFixed(1)}/10).`);
  if (stressAvg >= 7) highlights.push(`Stress stayed elevated (avg ${stressAvg.toFixed(1)}/10).`);
  if (workloadAvg >= 7) highlights.push(`Workload was heavy (avg ${workloadAvg.toFixed(1)}/10).`);
  if (sleepAvg && sleepAvg < 6.5)
    highlights.push(`Sleep averaged ${sleepAvg.toFixed(1)}h — short of 7h.`);

  if (score.delta7d <= -5) highlights.push(`Score improved ${Math.abs(score.delta7d)} pts vs the prior week.`);
  if (score.delta7d >= 5) highlights.push(`Score worsened by ${score.delta7d} pts vs the prior week.`);

  const def = getNiche(niche);
  const summary = buildSummary({
    name,
    band: score.band,
    score: score.composite,
    nicheBlurb: def.label,
  });

  const caution =
    score.band === "at_risk"
      ? "Score is in the at-risk band — consider reducing scope this week and protecting recovery."
      : score.band === "strained"
        ? "You're in the strained band — pick one recovery strategy from the resource hub this week."
        : null;

  return { summary, highlights, caution, source: "rules" };
}

function buildSummary(args: {
  name: string;
  band: string;
  score: number;
  nicheBlurb: string;
}): string {
  const verb = ({
    thriving: "you're holding steady",
    stable: "you're mostly stable",
    strained: "things are stretched thin",
    at_risk: "burnout signs are clear",
  } as const)[args.band as "thriving"];

  return `Hi ${args.name} — over the last 7 days ${verb} (score ${args.score}/100 as a ${args.nicheBlurb.toLowerCase()}).`;
}

"use client";

import * as React from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NicheDefinition } from "@/lib/niches/configs";
import type { BurnoutBand, RecoveryPlanStep } from "@/types/domain";
import { BAND_DEFINITIONS } from "@/lib/constants";

interface Props {
  niche: NicheDefinition;
  band: BurnoutBand;
}

function planFor(niche: NicheDefinition, band: BurnoutBand): RecoveryPlanStep[] {
  const base: RecoveryPlanStep[] = [];
  if (band === "at_risk") {
    base.push({
      title: "Block a real recovery day this week",
      description: "Pick the soonest day with no meetings and no email. Treat it as non-negotiable.",
      cadence: "today",
    });
  }
  if (band === "strained" || band === "at_risk") {
    base.push({
      title: "Drop one optional commitment",
      description: "Look at this week's calendar. Cancel or defer one thing that isn't essential.",
      cadence: "today",
    });
  }
  base.push(
    {
      title: niche.recoveryStrategies[0] ?? "Make one small recovery commitment",
      description: "Pick the first strategy and try it once this week.",
      cadence: "this_week",
    },
    {
      title: niche.recoveryStrategies[1] ?? "Notice when you feel restored",
      description: "Write down what helped, so you can repeat it.",
      cadence: "this_week",
    },
    {
      title: niche.recoveryStrategies[2] ?? "Build a sustainable rhythm",
      description: "Repeat the helpful things until they're habits.",
      cadence: "ongoing",
    },
  );
  return base;
}

export function RecoveryPlanGenerator({ niche, band }: Props) {
  const [seed, setSeed] = React.useState(0);
  const [done, setDone] = React.useState<Record<number, boolean>>({});
  // `seed` is intentionally in the deps so "Regenerate" rebuilds the plan even
  // if niche/band haven't changed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = React.useMemo(() => planFor(niche, band), [niche, band, seed]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Personal recovery plan
          </CardTitle>
          <CardDescription>
            Tailored to your current band:{" "}
            <Badge variant="outline">{BAND_DEFINITIONS[band].label}</Badge>
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
          Regenerate
        </Button>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {plan.map((step, i) => {
            const checked = !!done[i];
            return (
              <li key={`${seed}-${i}`} className="flex gap-3 rounded-lg border bg-card p-3">
                <button
                  type="button"
                  onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                  aria-label={checked ? "Mark incomplete" : "Mark complete"}
                  className="mt-0.5"
                >
                  {checked ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div>
                  <p className={`text-sm font-medium ${checked ? "line-through text-muted-foreground" : ""}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] uppercase">
                    {step.cadence.replace("_", " ")}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

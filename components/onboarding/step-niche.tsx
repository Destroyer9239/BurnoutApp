"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NICHE_DEFINITIONS } from "@/lib/niches/configs";
import { cn } from "@/lib/utils";
import type { OnboardingState } from "./wizard";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

export function StepNiche({ state, setState }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NICHE_DEFINITIONS.map((n) => {
          const active = state.niche === n.slug;
          return (
            <button
              key={n.slug}
              type="button"
              onClick={() => setState((s) => ({ ...s, niche: n.slug }))}
              className={cn(
                "flex flex-col gap-1 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary/60 hover:shadow-sm",
                active && "border-primary ring-2 ring-primary/20",
              )}
              aria-pressed={active}
            >
              <span className="text-2xl" aria-hidden>
                {n.emoji}
              </span>
              <span className="font-medium">{n.label}</span>
              <span className="text-xs text-muted-foreground">{n.blurb}</span>
            </button>
          );
        })}
      </div>
      {state.niche === "custom" ? (
        <div className="space-y-1.5">
          <Label htmlFor="custom-niche">What should we call it?</Label>
          <Input
            id="custom-niche"
            placeholder="e.g. Postdoc researcher"
            value={state.customNicheLabel}
            onChange={(e) => setState((s) => ({ ...s, customNicheLabel: e.target.value }))}
          />
        </div>
      ) : null}
    </div>
  );
}

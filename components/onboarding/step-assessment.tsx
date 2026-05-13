"use client";

import { Slider } from "@/components/ui/slider";
import { MBI_QUESTIONS } from "@/lib/niches/configs";
import type { OnboardingState } from "./wizard";

const LIKERT_LABELS = ["Never", "Rarely", "Sometimes", "Half", "Often", "Usually", "Always"];

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

export function StepAssessment({ state, setState }: Props) {
  return (
    <div className="space-y-6">
      {MBI_QUESTIONS.map((q) => {
        const value = state.mbi[q.id] ?? 3;
        return (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-medium">{q.text}</p>
            <Slider
              min={0}
              max={6}
              step={1}
              value={[value]}
              onValueChange={(v) =>
                setState((s) => ({ ...s, mbi: { ...s.mbi, [q.id]: v[0] ?? 3 } }))
              }
              aria-label={q.text}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{LIKERT_LABELS[0]}</span>
              <span className="font-medium text-foreground">{LIKERT_LABELS[value]}</span>
              <span>{LIKERT_LABELS[6]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingState } from "./wizard";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

export function StepProfile({ state, setState }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="display-name">What should we call you?</Label>
        <Input
          id="display-name"
          autoFocus
          placeholder="First name"
          value={state.displayName}
          onChange={(e) => setState((s) => ({ ...s, displayName: e.target.value }))}
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground">
          Only used for greetings and the exportable report. You can change it later.
        </p>
      </div>
    </div>
  );
}

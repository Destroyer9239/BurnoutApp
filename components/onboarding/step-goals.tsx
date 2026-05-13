"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingState } from "./wizard";
import type { Goal } from "@/types/domain";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

export function StepGoals({ state, setState }: Props) {
  function update(id: string, patch: Partial<Goal>) {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }
  function remove(id: string) {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }
  function add() {
    setState((s) => ({
      ...s,
      goals: [...s.goals, { id: crypto.randomUUID(), label: "", cadence: "daily" }],
    }));
  }

  return (
    <div className="space-y-4">
      {state.goals.map((g, i) => (
        <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grow space-y-1.5">
            <Label htmlFor={`goal-${i}`} className="text-xs uppercase tracking-wide text-muted-foreground">
              Goal {i + 1}
            </Label>
            <Input
              id={`goal-${i}`}
              value={g.label}
              maxLength={120}
              placeholder="e.g. Walk for 20 minutes"
              onChange={(e) => update(g.id, { label: e.target.value })}
            />
          </div>
          <Select value={g.cadence} onValueChange={(v) => update(g.id, { cadence: v as Goal["cadence"] })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(g.id)}
            aria-label={`Remove goal ${i + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {state.goals.length < 8 ? (
        <Button type="button" variant="outline" onClick={add} className="w-full">
          <Plus className="h-4 w-4" /> Add another goal
        </Button>
      ) : null}
    </div>
  );
}

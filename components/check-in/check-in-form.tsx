"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SLIDER_LABELS } from "@/lib/constants";
import type { CheckInRow } from "@/types/domain";

interface Props {
  initial: Partial<CheckInRow> | null;
  prompts: string[];
}

interface FormState {
  mood: number;
  energy: number;
  stress: number;
  workload: number;
  sleep_hours: number | "";
  notes: string;
}

export function CheckInForm({ initial, prompts }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    mood: initial?.mood ?? 6,
    energy: initial?.energy ?? 6,
    stress: initial?.stress ?? 5,
    workload: initial?.workload ?? 5,
    sleep_hours: initial?.sleep_hours ?? "",
    notes: initial?.notes ?? "",
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: form.mood,
          energy: form.energy,
          stress: form.stress,
          workload: form.workload,
          sleep_hours: form.sleep_hours === "" ? null : Number(form.sleep_hours),
          notes: form.notes.trim() ? form.notes.trim() : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not save");
      toast.success(initial ? "Check-in updated" : "Check-in saved", {
        description: "Your trend is being recalculated.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>How are you today?</CardTitle>
          <CardDescription>Slide each scale — be honest, not aspirational. It takes about 90 seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-7">
          <SliderField
            id="mood"
            label="Mood"
            value={form.mood}
            onChange={(v) => set("mood", v)}
          />
          <SliderField
            id="energy"
            label="Energy"
            value={form.energy}
            onChange={(v) => set("energy", v)}
          />
          <SliderField
            id="stress"
            label="Stress"
            value={form.stress}
            onChange={(v) => set("stress", v)}
          />
          <SliderField
            id="workload"
            label="Workload"
            value={form.workload}
            onChange={(v) => set("workload", v)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sleep">Hours of sleep last night</Label>
              <Input
                id="sleep"
                type="number"
                inputMode="decimal"
                min={0}
                max={24}
                step={0.25}
                value={form.sleep_hours}
                onChange={(e) =>
                  set("sleep_hours", e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="7.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reflect (optional)</CardTitle>
          <CardDescription>One or two sentences is enough.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="What's on your mind today?"
            rows={5}
            maxLength={2000}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            aria-label="Journal note for today"
          />
          {prompts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {prompts.map((p, i) => (
                <motion.button
                  key={p}
                  type="button"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() =>
                    set("notes", form.notes ? `${form.notes}\n\n${p}` : p)
                  }
                  className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initial ? "Save changes" : "Save check-in"}
        </Button>
      </div>
    </form>
  );
}

function SliderField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [low, high] = SLIDER_LABELS[id.toLowerCase()] ?? ["Low", "High"];
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <span className="text-sm font-medium tabular-nums">{value}/10</span>
      </div>
      <Slider
        id={id}
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? value)}
        aria-label={label}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

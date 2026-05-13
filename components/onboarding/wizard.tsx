"use client";

// 4-step onboarding wizard. State lives in this client component until the
// last step posts to /api/onboarding. AnimatePresence handles the step
// transitions; progress bar reflects current step.

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StepNiche } from "./step-niche";
import { StepProfile } from "./step-profile";
import { StepAssessment } from "./step-assessment";
import { StepGoals } from "./step-goals";
import type { NicheSlug, Goal } from "@/types/domain";
import { MBI_QUESTIONS, type MBIResponse } from "@/lib/niches/configs";
import { computeMBIScores } from "@/lib/scoring/mbi";

const STEPS = ["Your work", "About you", "Baseline", "Goals"] as const;

export interface OnboardingState {
  niche: NicheSlug | null;
  customNicheLabel: string;
  displayName: string;
  mbi: MBIResponse;
  goals: Goal[];
}

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [state, setState] = React.useState<OnboardingState>({
    niche: null,
    customNicheLabel: "",
    displayName: initialName,
    mbi: Object.fromEntries(MBI_QUESTIONS.map((q) => [q.id, 3])),
    goals: [
      { id: crypto.randomUUID(), label: "Sleep at least 7 hours", cadence: "daily" },
      { id: crypto.randomUUID(), label: "One restorative activity weekly", cadence: "weekly" },
    ],
  });

  const canAdvance =
    (step === 0 && !!state.niche) ||
    (step === 1 && state.displayName.trim().length > 0) ||
    step === 2 ||
    step === 3;

  function next() {
    if (!canAdvance) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    if (!state.niche) return;
    setSubmitting(true);
    const scores = computeMBIScores(state.mbi);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: state.displayName.trim(),
          niche: state.niche,
          custom_niche_label: state.niche === "custom" ? state.customNicheLabel || null : null,
          assessment: scores,
          goals: state.goals,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not save");
      toast.success("You're all set");
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="relative isolate min-h-screen px-4 py-10">
      <div aria-hidden className="gradient-mesh absolute inset-0 -z-10" />
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length} · <span className="text-foreground">{STEPS[step]}</span>
          </p>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mb-8" />

        <Card>
          <CardHeader>
            <CardTitle>{titleFor(step)}</CardTitle>
            <CardDescription>{descriptionFor(step)}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 ? (
                  <StepNiche state={state} setState={setState} />
                ) : step === 1 ? (
                  <StepProfile state={state} setState={setState} />
                ) : step === 2 ? (
                  <StepAssessment state={state} setState={setState} />
                ) : (
                  <StepGoals state={state} setState={setState} />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={!canAdvance}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Finish
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function titleFor(step: number) {
  return ["What kind of work do you do?", "Tell us a little about you", "How are you arriving?", "Set a couple of intentions"][step] ?? "";
}
function descriptionFor(step: number) {
  return [
    "We'll use this to personalise prompts, benchmarks, and recovery ideas.",
    "We only use your name for greetings and the report you export.",
    "Quick baseline — 8 short questions on a 0–6 scale. Be honest, not aspirational.",
    "Pick a couple of small, recoverable goals. You can change them anytime.",
  ][step] ?? "";
}

"use client";

import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Phase {
  label: string;
  duration: number;
}

const PHASES: Phase[] = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 7 },
  { label: "Exhale", duration: 8 },
];

function phaseAt(index: number): Phase {
  return PHASES[index] ?? PHASES[0]!;
}

export function BreathingExercise() {
  const [running, setRunning] = React.useState(false);
  const [phaseIndex, setPhaseIndex] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState<number>(phaseAt(0).duration);
  const controls = useAnimationControls();

  React.useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      const next = (phaseIndex + 1) % PHASES.length;
      setPhaseIndex(next);
      setSecondsLeft(phaseAt(next).duration);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secondsLeft, phaseIndex]);

  React.useEffect(() => {
    if (!running) return;
    const phase = phaseAt(phaseIndex);
    if (phase.label === "Inhale") {
      controls.start({ scale: 1.6, transition: { duration: phase.duration, ease: "easeInOut" } });
    } else if (phase.label === "Exhale") {
      controls.start({ scale: 1, transition: { duration: phase.duration, ease: "easeInOut" } });
    }
  }, [phaseIndex, running, controls]);

  function reset() {
    setRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(phaseAt(0).duration);
    controls.start({ scale: 1, transition: { duration: 0.4 } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>4-7-8 breathing</CardTitle>
        <CardDescription>Inhale 4s · Hold 7s · Exhale 8s · Repeat.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative flex h-48 w-48 items-center justify-center">
            <motion.div
              animate={controls}
              initial={{ scale: 1 }}
              className="absolute inset-0 rounded-full bg-primary/15"
            />
            <motion.div
              animate={controls}
              initial={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-4 rounded-full border-2 border-primary/50"
            />
            <div className="z-10 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {phaseAt(phaseIndex).label}
              </p>
              <p className="text-3xl font-semibold tabular-nums">{secondsLeft}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setRunning((r) => !r)} aria-label={running ? "Pause" : "Start"}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" onClick={reset} aria-label="Reset">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

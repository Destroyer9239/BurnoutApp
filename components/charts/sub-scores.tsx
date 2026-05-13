"use client";

import { motion } from "framer-motion";

interface Score {
  label: string;
  description: string;
  value: number;
  invert?: boolean;
}

export function SubScores({ ee, dp, pa }: { ee: number; dp: number; pa: number }) {
  const items: Score[] = [
    { label: "Emotional exhaustion", description: "How drained you feel.", value: ee },
    { label: "Depersonalisation", description: "Cynicism or detachment.", value: dp },
    {
      label: "Personal accomplishment",
      description: "Sense of effectiveness.",
      value: pa,
      invert: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{it.label}</p>
            <span className="text-lg font-semibold tabular-nums">{it.value}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${it.value}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: it.invert
                  ? "linear-gradient(to right, hsl(var(--success)), hsl(var(--primary)))"
                  : "linear-gradient(to right, hsl(var(--primary)), hsl(var(--destructive)))",
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{it.description}</p>
        </div>
      ))}
    </div>
  );
}

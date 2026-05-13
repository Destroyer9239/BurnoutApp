"use client";

import { motion } from "framer-motion";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { BAND_DEFINITIONS } from "@/lib/constants";
import type { BurnoutBand } from "@/types/domain";

interface Props {
  score: number;
  band: BurnoutBand;
}

export function BurnoutGauge({ score, band }: Props) {
  const def = BAND_DEFINITIONS[band];
  const data = [{ name: "score", value: score, fill: def.color }];

  return (
    <div className="relative aspect-square w-full max-w-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="78%"
          outerRadius="100%"
          barSize={18}
          data={data}
          startAngle={210}
          endAngle={-30}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={12} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-5xl font-semibold tabular-nums"
        >
          {score}
        </motion.span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">/ 100</span>
        <span className="mt-2 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: def.color }}>
          {def.label}
        </span>
      </div>
    </div>
  );
}

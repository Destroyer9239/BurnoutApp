"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { TrendPoint } from "@/types/domain";
import { EmptyState } from "@/components/shared/empty-state";

export function TrendLine({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return <EmptyState title="No trend yet" description="Two or more check-ins create a trend line." />;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => format(parseISO(d), "MMM d")}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "hsl(var(--border))", strokeDasharray: 3 }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
            labelFormatter={(d) => format(parseISO(String(d)), "EEE, MMM d")}
            formatter={(v: number) => [`${v}/100`, "Score"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#trend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

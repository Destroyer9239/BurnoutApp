"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  user: { ee: number; dp: number; pa: number };
  community: { label: string; ee: number; dp: number; pa: number } | null;
}

export function CommunityCompare({ user, community }: Props) {
  if (!community) {
    return (
      <p className="text-sm text-muted-foreground">
        No community benchmark available — set your niche in settings to enable this.
      </p>
    );
  }
  const data = [
    { metric: "EE", you: user.ee, community: community.ee },
    { metric: "DP", you: user.dp, community: community.dp },
    { metric: "PA", you: user.pa, community: community.pa },
  ];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="you" name="You" fill="hsl(var(--primary))" radius={6} />
          <Bar dataKey="community" name={`${community.label} avg`} fill="hsl(var(--muted-foreground))" opacity={0.6} radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

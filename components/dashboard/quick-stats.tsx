import { ArrowDownRight, ArrowUpRight, Flame, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  streak: number;
  delta7d: number;
  entries: number;
}

export function QuickStats({ streak, delta7d, entries }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat
        label="Current streak"
        value={`${streak} ${streak === 1 ? "day" : "days"}`}
        icon={<Flame className="h-4 w-4 text-warning" />}
      />
      <Stat
        label="vs prior 7 days"
        value={`${delta7d > 0 ? "+" : ""}${delta7d} pts`}
        icon={
          delta7d > 0 ? (
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          ) : delta7d < 0 ? (
            <ArrowDownRight className="h-4 w-4 text-success" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )
        }
        tone={delta7d > 0 ? "warn" : delta7d < 0 ? "good" : "neutral"}
      />
      <Stat label="Total entries" value={`${entries}`} icon={null} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "good" | "warn" | "neutral";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-4",
        tone === "good" && "border-success/20",
        tone === "warn" && "border-warning/20",
      )}
    >
      {icon ? <div>{icon}</div> : null}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

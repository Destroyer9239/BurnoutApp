import { formatDate } from "@/lib/utils";
import type { CheckInRow } from "@/types/domain";
import { EmptyState } from "@/components/shared/empty-state";

export function RecentCheckIns({ rows }: { rows: CheckInRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No check-ins yet"
        description="Your first daily check-in unlocks the trend line and weekly summary."
      />
    );
  }
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {rows.slice(0, 6).map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{formatDate(r.entry_date, "EEE, MMM d")}</p>
            {r.notes ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.notes}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
            <Stat label="Mood" value={r.mood} />
            <Stat label="Energy" value={r.energy} />
            <Stat label="Stress" value={r.stress} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}/10</p>
    </div>
  );
}

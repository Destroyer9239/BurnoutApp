import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakBadge({ streak }: { streak: number }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium",
        streak > 0 && "border-warning/30 bg-warning/5 text-warning-foreground",
      )}
    >
      <Flame className={cn("h-4 w-4", streak > 0 ? "text-warning" : "text-muted-foreground")} />
      {streak > 0 ? `${streak}-day streak` : "Start your streak today"}
    </div>
  );
}

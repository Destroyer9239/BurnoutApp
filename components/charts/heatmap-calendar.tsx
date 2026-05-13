"use client";

import { format, parseISO } from "date-fns";
import type { HeatmapCell } from "@/types/domain";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const WEEKS = 12;
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function HeatmapCalendar({ cells }: { cells: HeatmapCell[] }) {
  const grid: HeatmapCell[][] = Array.from({ length: WEEKS }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7),
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2">
        <div className="grid grid-rows-7 gap-1 pr-1 pt-3 text-[10px] text-muted-foreground">
          {DAYS.map((d, i) => (
            <span key={i} className="h-3.5">
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-rows-7 gap-1">
              {week.map((cell) => (
                <Tooltip key={cell.date}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${cell.date} score ${cell.intensity}`}
                      className={cn(
                        "h-3.5 w-3.5 rounded-sm transition-transform hover:scale-110",
                        intensityClass(cell),
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">{format(parseISO(cell.date), "EEE, MMM d")}</p>
                    <p className="text-xs text-muted-foreground">
                      {cell.checkedIn ? `Score ${cell.intensity}/100` : "No check-in"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Lower</span>
        {[12, 30, 50, 70, 90].map((v) => (
          <span key={v} className={cn("h-3 w-5 rounded-sm", intensityClass({ intensity: v, date: "", checkedIn: true }))} />
        ))}
        <span>Higher</span>
      </div>
    </div>
  );
}

function intensityClass(cell: HeatmapCell): string {
  if (!cell.checkedIn) return "bg-muted/40";
  if (cell.intensity <= 20) return "bg-success/40";
  if (cell.intensity <= 40) return "bg-success/70";
  if (cell.intensity <= 60) return "bg-warning/60";
  if (cell.intensity <= 80) return "bg-warning";
  return "bg-destructive";
}

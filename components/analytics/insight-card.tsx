"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import type { WeeklyInsight } from "@/types/domain";

export function InsightCard() {
  const [state, setState] = React.useState<
    { status: "loading" } | { status: "ready"; insight: WeeklyInsight } | { status: "error" }
  >({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insights", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const json = (await res.json()) as { insight: WeeklyInsight };
        if (!cancelled) setState({ status: "ready", insight: json.insight });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Weekly insight
          </CardTitle>
          <CardDescription>A summary based on your last seven days.</CardDescription>
        </div>
        {state.status === "ready" ? (
          <Badge variant={state.insight.source === "claude" ? "default" : "secondary"}>
            {state.insight.source === "claude" ? "AI-assisted" : "Heuristic"}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {state.status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating your summary…
          </div>
        ) : state.status === "error" ? (
          <ErrorState description="Couldn't generate this week's insight. Try refreshing." />
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{state.insight.summary}</p>
            {state.insight.highlights.length > 0 ? (
              <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                {state.insight.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            {state.insight.caution ? (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
                {state.insight.caution}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

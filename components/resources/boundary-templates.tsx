"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NicheDefinition } from "@/lib/niches/configs";

export function BoundaryTemplates({ niche }: { niche: NicheDefinition }) {
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't access clipboard");
    }
  }

  return (
    <div className="space-y-4">
      {niche.boundaryTemplates.map((t) => (
        <Card key={t.title}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{t.title}</CardTitle>
              <CardDescription>Edit before sending — your voice matters.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => copy(t.body)} aria-label={`Copy ${t.title}`}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line rounded-lg bg-muted/60 p-3 text-sm">{t.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

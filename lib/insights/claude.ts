// Optional Claude API-backed insight generator. The system prompt is large and
// stable, so we mark it with cache_control to get prompt-cache hits on
// subsequent weekly summaries. Falls back to the rule-based generator if
// ANTHROPIC_API_KEY is missing or the API call fails.

import Anthropic from "@anthropic-ai/sdk";
import type { BurnoutScore, CheckInRow, NicheSlug, WeeklyInsight } from "@/types/domain";
import { getNiche } from "@/lib/niches/configs";
import { generateRuleBasedInsight } from "./generator";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-7";

interface GenInput {
  history: CheckInRow[];
  score: BurnoutScore;
  niche: NicheSlug | null;
  displayName: string | null;
}

function systemPromptFor(niche: NicheSlug | null): string {
  const def = getNiche(niche);
  return [
    "You are a calm, evidence-informed burnout coach.",
    "You write a concise weekly summary for one user, based on their daily check-ins and a burnout score.",
    "Tone: warm, non-judgemental, specific. Never diagnose. Never use 'just' or 'simply'.",
    "Style: max 2 short paragraphs. Then 2-4 bullet highlights. Then one optional caution.",
    `Audience niche: ${def.label} — ${def.blurb}`,
    "Honour the user's autonomy. Suggest exactly one concrete experiment for the next week, no more.",
  ].join("\n");
}

export async function generateClaudeInsight(input: GenInput): Promise<WeeklyInsight> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateRuleBasedInsight(input);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const last14 = input.history.slice(-14);

    const userPayload = {
      score: input.score,
      check_ins: last14.map((c) => ({
        date: c.entry_date,
        mood: c.mood,
        energy: c.energy,
        stress: c.stress,
        workload: c.workload,
        sleep: c.sleep_hours,
        notes: c.notes ? c.notes.slice(0, 280) : null,
      })),
      name: input.displayName,
    };

    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: systemPromptFor(input.niche),
          // Enable Anthropic prompt caching on the stable system prompt.
          // The SDK's TS types don't currently surface this field; cast to
          // satisfy the typechecker while keeping the wire-level behavior.
          cache_control: { type: "ephemeral" },
        },
      ] as unknown as Anthropic.TextBlockParam[],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Write the weekly summary. Return JSON with shape {"summary": string, "highlights": string[], "caution": string | null}. Data:\n${JSON.stringify(
                userPayload,
              )}`,
            },
          ],
        },
      ],
    });

    const text = response.content
      .filter((block): block is { type: "text"; text: string } => block.type === "text")
      .map((block) => block.text)
      .join("");

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("Claude returned no JSON");

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
      summary?: unknown;
      highlights?: unknown;
      caution?: unknown;
    };

    if (typeof parsed.summary !== "string") throw new Error("missing summary");

    return {
      summary: parsed.summary,
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.filter((h): h is string => typeof h === "string").slice(0, 6)
        : [],
      caution: typeof parsed.caution === "string" ? parsed.caution : null,
      source: "claude",
    };
  } catch {
    return generateRuleBasedInsight(input);
  }
}

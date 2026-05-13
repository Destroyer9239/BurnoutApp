// CSV export helpers. Uses papaparse to keep escaping correct for commas,
// quotes, and newlines inside journal entries.

import Papa from "papaparse";
import type { CheckInRow, JournalRow } from "@/types/domain";

export function checkInsToCSV(rows: CheckInRow[]): string {
  return Papa.unparse(
    rows.map((c) => ({
      date: c.entry_date,
      mood: c.mood,
      energy: c.energy,
      stress: c.stress,
      workload: c.workload,
      sleep_hours: c.sleep_hours ?? "",
      ee_score: c.ee_score ?? "",
      dp_score: c.dp_score ?? "",
      pa_score: c.pa_score ?? "",
      notes: (c.notes ?? "").replace(/\s+/g, " ").trim(),
    })),
  );
}

export function journalToCSV(rows: JournalRow[]): string {
  return Papa.unparse(
    rows.map((j) => ({
      created_at: j.created_at,
      mood_tag: j.mood_tag ?? "",
      content: j.content.replace(/\s+/g, " ").trim(),
    })),
  );
}

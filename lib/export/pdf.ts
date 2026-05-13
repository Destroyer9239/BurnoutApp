// PDF export. Server-rendered with jspdf + autotable so the user gets a
// clean printable report without spinning up a headless browser.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BurnoutScore, CheckInRow, ProfileRow } from "@/types/domain";
import { BAND_DEFINITIONS } from "@/lib/constants";

export function buildPDFReport(args: {
  profile: ProfileRow;
  score: BurnoutScore;
  history: CheckInRow[];
}): ArrayBuffer {
  const { profile, score, history } = args;
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Burnout report", 48, 64);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120);
  doc.text(
    `Prepared for ${profile.display_name ?? "you"} • ${new Date().toLocaleDateString()}`,
    48,
    82,
  );

  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text(`Composite score: ${score.composite}/100 (${BAND_DEFINITIONS[score.band].label})`, 48, 116);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(BAND_DEFINITIONS[score.band].description, 48, 134);

  doc.setFontSize(11);
  doc.text(`Emotional exhaustion: ${score.ee}/100`, 48, 162);
  doc.text(`Depersonalisation: ${score.dp}/100`, 48, 178);
  doc.text(`Personal accomplishment: ${score.pa}/100`, 48, 194);

  autoTable(doc, {
    startY: 220,
    head: [["Date", "Mood", "Energy", "Stress", "Workload", "Sleep", "Notes"]],
    body: history.slice(-30).map((c) => [
      c.entry_date,
      c.mood,
      c.energy,
      c.stress,
      c.workload,
      c.sleep_hours ?? "—",
      (c.notes ?? "").slice(0, 60),
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  return doc.output("arraybuffer");
}

// Niche definitions used client-side (selector copy, assessment questions,
// resource hub). The same identifiers also exist in the niche_configs table
// — DB acts as the source of truth for benchmarks, this file as the source
// of truth for static copy.

import type { NicheSlug } from "@/types/domain";

export interface NicheDefinition {
  slug: NicheSlug;
  label: string;
  blurb: string;
  emoji: string;
  prompts: string[];
  boundaryTemplates: { title: string; body: string }[];
  recoveryStrategies: string[];
}

export const NICHE_DEFINITIONS: NicheDefinition[] = [
  {
    slug: "software_engineer",
    label: "Software Engineer",
    blurb: "Long focus sessions, on-call rotations, shifting priorities.",
    emoji: "💻",
    prompts: [
      "Did you protect any deep-work time today?",
      "How often were you interrupted?",
      "Are you on call this week?",
    ],
    boundaryTemplates: [
      {
        title: "Decline an out-of-hours page",
        body: "Hey — I'm off rotation tonight. Can you check the runbook or page <name>? Happy to debrief in the morning.",
      },
      {
        title: "Push back on scope",
        body: "Want to make sure we ship this well — given current scope I can deliver A and B by Friday, but C will slip to next sprint. Okay to drop C from this cycle?",
      },
    ],
    recoveryStrategies: [
      "Protect 90 minutes of meeting-free focus each morning.",
      "Wind down with non-screen activity 60 minutes before bed.",
      "After on-call: schedule a no-meeting recovery day.",
    ],
  },
  {
    slug: "healthcare",
    label: "Healthcare Worker",
    blurb: "Emotional load, shift work, exposure to suffering.",
    emoji: "🩺",
    prompts: [
      "Did you take micro-breaks between patients?",
      "Is a case weighing on you?",
      "How was your sleep between shifts?",
    ],
    boundaryTemplates: [
      {
        title: "Decline an extra shift",
        body: "I can't pick this one up — I need a full recovery day after my last set. I'll let you know when I have capacity again.",
      },
    ],
    recoveryStrategies: [
      "Use a 60-second grounding breath between patients.",
      "Schedule one debrief conversation per week with a trusted peer.",
      "Block your first hour off-shift as quiet decompression.",
    ],
  },
  {
    slug: "teacher",
    label: "Teacher",
    blurb: "Unrelenting demands from students, parents, admin.",
    emoji: "📚",
    prompts: [
      "Did you have uninterrupted planning time?",
      "How are your parent boundaries holding?",
      "Did a student moment energise you?",
    ],
    boundaryTemplates: [
      {
        title: "After-hours parent email",
        body: "Thanks for reaching out. I respond to non-urgent emails on school days between 3 and 5 pm — I'll get back to you then. For urgent matters, please contact the office.",
      },
    ],
    recoveryStrategies: [
      "Hard stop on grading by 7 pm; carry-over goes to a future block.",
      "Pre-schedule one fully off-screen evening per week.",
      "Reserve Friday afternoons for closing the week intentionally.",
    ],
  },
  {
    slug: "student",
    label: "Student",
    blurb: "Academic pressure, sleep debt, future uncertainty.",
    emoji: "🎓",
    prompts: [
      "What's your biggest deadline this week?",
      "Did you sleep more than 7 hours?",
      "Did you do anything just for fun today?",
    ],
    boundaryTemplates: [
      {
        title: "Decline a study group",
        body: "Can't make it tonight — I'm protecting recovery time. Let's reconnect later in the week once I've caught up on sleep.",
      },
    ],
    recoveryStrategies: [
      "Two 25-minute Pomodoros, then a real break.",
      "One full evening per week with zero academic input.",
      "Stop screens 45 minutes before sleep, especially before exams.",
    ],
  },
  {
    slug: "creative",
    label: "Creative Professional",
    blurb: "Output expectations and public visibility of work.",
    emoji: "🎨",
    prompts: [
      "Did you make anything just for yourself?",
      "How is your relationship with feedback?",
      "What's your input-to-output ratio been like?",
    ],
    boundaryTemplates: [
      {
        title: "Decline scope creep",
        body: "Happy to revisit this once the current round of revisions ships. To keep quality high I'll need to handle this as a separate brief — want me to scope it?",
      },
    ],
    recoveryStrategies: [
      "Block one weekly session for inputs only — no output expected.",
      "Limit critique-reading to a single window per day.",
      "End each work block by writing one thing you noticed working.",
    ],
  },
  {
    slug: "entrepreneur",
    label: "Entrepreneur",
    blurb: "Always-on responsibility, financial stress, identity fusion.",
    emoji: "🚀",
    prompts: [
      "When did you last fully unplug?",
      "Did you talk to anyone about non-work things?",
      "What's the biggest unknown weighing on you?",
    ],
    boundaryTemplates: [
      {
        title: "Set a weekend boundary",
        body: "I batch non-urgent things Mon–Thu. Anything that lands after Thursday lunchtime gets handled Monday morning. If it's truly urgent, call.",
      },
    ],
    recoveryStrategies: [
      "Choose one weekly window that is sacred (no work, no phone).",
      "Have one founder/peer conversation per week that isn't about work.",
      "Write down the worst-case scenario weekly — most fears shrink on paper.",
    ],
  },
  {
    slug: "custom",
    label: "Custom / Other",
    blurb: "Define your own — we'll personalise prompts and resources.",
    emoji: "✨",
    prompts: [
      "How is your energy today?",
      "What's one thing you want less of this week?",
      "What gave you a moment of relief recently?",
    ],
    boundaryTemplates: [
      {
        title: "General decline",
        body: "Thanks for thinking of me — I'm not able to take this on right now while I protect my recovery. I'll circle back when I have room.",
      },
    ],
    recoveryStrategies: [
      "Identify your top 3 personal drainers and pick one to limit this week.",
      "Schedule one recovery activity weekly.",
      "Talk to one supportive person about non-work things.",
    ],
  },
];

export function getNiche(slug: string | null | undefined): NicheDefinition {
  return (
    NICHE_DEFINITIONS.find((n) => n.slug === slug) ?? NICHE_DEFINITIONS[NICHE_DEFINITIONS.length - 1]!
  );
}

export const MBI_QUESTIONS = [
  {
    id: "ee1",
    sub: "ee" as const,
    text: "I feel emotionally drained from my work / studies.",
  },
  {
    id: "ee2",
    sub: "ee" as const,
    text: "I feel used up at the end of a typical day.",
  },
  {
    id: "ee3",
    sub: "ee" as const,
    text: "I feel fatigued when I think about facing another day.",
  },
  {
    id: "dp1",
    sub: "dp" as const,
    text: "I've become less interested in my work / studies since I started.",
  },
  {
    id: "dp2",
    sub: "dp" as const,
    text: "I've become more cynical about whether my work contributes anything.",
  },
  {
    id: "pa1",
    sub: "pa" as const,
    text: "I can effectively solve the problems that arise in my work / studies.",
  },
  {
    id: "pa2",
    sub: "pa" as const,
    text: "I feel I'm making an effective contribution.",
  },
  {
    id: "pa3",
    sub: "pa" as const,
    text: "In my opinion, I am good at my work / studies.",
  },
];

export type MBIResponse = Record<string, number>; // 0–6 Likert

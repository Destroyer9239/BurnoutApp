// Centralised zod schemas shared by client forms, route handlers, and
// onboarding state. Keep validation rules co-located so server and client
// can't drift.

import { z } from "zod";

const score = z.number().int().min(1).max(10);

export const checkInSchema = z.object({
  mood: score,
  energy: score,
  stress: score,
  workload: score,
  sleep_hours: z.number().min(0).max(24).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const journalSchema = z.object({
  content: z.string().min(1).max(5000),
  mood_tag: z.string().max(40).optional().nullable(),
  check_in_id: z.string().uuid().optional().nullable(),
});

export type JournalInput = z.infer<typeof journalSchema>;

export const onboardingSchema = z.object({
  display_name: z.string().min(1).max(80),
  niche: z.enum([
    "software_engineer",
    "healthcare",
    "teacher",
    "student",
    "creative",
    "entrepreneur",
    "custom",
  ]),
  custom_niche_label: z.string().max(80).optional().nullable(),
  assessment: z.object({
    ee: z.number().int().min(0).max(100),
    dp: z.number().int().min(0).max(100),
    pa: z.number().int().min(0).max(100),
  }),
  goals: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(120),
        cadence: z.enum(["daily", "weekly"]),
      }),
    )
    .max(8),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(80).optional(),
  niche: z
    .enum([
      "software_engineer",
      "healthcare",
      "teacher",
      "student",
      "creative",
      "entrepreneur",
      "custom",
    ])
    .optional(),
  custom_niche_label: z.string().max(80).nullable().optional(),
  notification_prefs: z
    .object({
      daily_reminder: z.boolean(),
      weekly_summary: z.boolean(),
    })
    .optional(),
  goals: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(120),
        cadence: z.enum(["daily", "weekly"]),
      }),
    )
    .max(8)
    .optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

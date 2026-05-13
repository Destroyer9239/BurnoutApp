// Shared utilities used across the app. Keep tiny and dependency-light.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function formatDate(value: string | Date, pattern = "MMM d, yyyy"): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern);
}

export function relativeFromNow(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return `${formatDistanceToNowStrict(date)} ago`;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function pluralize(n: number, single: string, plural = `${single}s`): string {
  return n === 1 ? single : plural;
}

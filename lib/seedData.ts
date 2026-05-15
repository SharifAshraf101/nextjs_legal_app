import type {
  Client,
  Case,
  CalendarEvent,
  Finance,
  TimelineItem,
} from '@/types';

// DATA_VERSION constant from the source (line 3019). When this changes,
// loadData() in lib/storage.ts will reset to defaults. Keep in sync with the
// source if it advances in a future vNNN.
export const DATA_VERSION = '2026-05-08-clean-empty-data-v1';

// Defaults are intentionally empty arrays in the source (lines 3020-3025).
// The app starts blank and pulls real data from Supabase / localStorage /
// disk backup on first boot.
export const defaultClients: Client[] = [];
export const defaultCases: Case[] = [];
export const defaultEvents: CalendarEvent[] = [];
export const defaultFinances: Finance[] = [];
export const defaultTimeline: TimelineItem[] = [];

// Helper used in the source's future() function (line 3022) — kept here so
// any seed-data injection in the future has the same date semantics.
export function future(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9 + (days % 6), 0, 0, 0);
  return d.toISOString();
}

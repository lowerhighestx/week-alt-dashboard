import { DEFAULT_PRIORITY, DEFAULT_TREND, STORAGE_KEYS } from '../constants';
import { isPriority, isTrend } from './priorityTrend';
import type { RowNote, RowTag } from '../types';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadWatchlist(fallback: string[]): string[] {
  const parsed = safeParse<unknown>(localStorage.getItem(STORAGE_KEYS.watchlist), fallback);
  if (!Array.isArray(parsed)) {
    return fallback;
  }

  return parsed.filter((coin): coin is string => typeof coin === 'string' && coin.length > 0);
}

export function saveWatchlist(coins: string[]): void {
  localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(coins));
}

export function loadNotes(): Record<string, RowNote> {
  const parsed = safeParse<Record<string, RowNote>>(localStorage.getItem(STORAGE_KEYS.notes), {});
  const output: Record<string, RowNote> = {};

  for (const [coin, value] of Object.entries(parsed)) {
    output[coin] = {
      comment: typeof value.comment === 'string' ? value.comment : '',
      thought: typeof value.thought === 'string' ? value.thought : ''
    };
  }

  return output;
}

export function saveNotes(notes: Record<string, RowNote>): void {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
}

export function loadTags(): Record<string, RowTag> {
  const parsed = safeParse<Record<string, RowTag>>(localStorage.getItem(STORAGE_KEYS.tags), {});
  const output: Record<string, RowTag> = {};

  for (const [coin, value] of Object.entries(parsed)) {
    const priority = isPriority(value.priority) ? value.priority : DEFAULT_PRIORITY;
    const trend = isTrend(value.trend) ? value.trend : DEFAULT_TREND;
    output[coin] = { priority, trend };
  }

  return output;
}

export function saveTags(tags: Record<string, RowTag>): void {
  localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
}

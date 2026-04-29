import { PRIORITY_OPTIONS, TREND_OPTIONS } from '../constants';
import type { Priority, Trend } from '../types';

export function isPriority(value: string): value is Priority {
  return PRIORITY_OPTIONS.includes(value as Priority);
}

export function isTrend(value: string): value is Trend {
  return TREND_OPTIONS.includes(value as Trend);
}

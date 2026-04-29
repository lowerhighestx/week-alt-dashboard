import { describe, expect, it } from 'vitest';
import { isPriority, isTrend } from '../lib/priorityTrend';

describe('priority/trend validators', () => {
  it('accepts valid priority', () => {
    expect(isPriority('🥇')).toBe(true);
    expect(isPriority('🆓')).toBe(true);
  });

  it('rejects invalid priority', () => {
    expect(isPriority('HIGH')).toBe(false);
  });

  it('accepts valid trend', () => {
    expect(isTrend('UP')).toBe(true);
    expect(isTrend('TOO YOUNG')).toBe(true);
  });

  it('rejects invalid trend', () => {
    expect(isTrend('SIDE')).toBe(false);
  });
});

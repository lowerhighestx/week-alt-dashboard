import { beforeEach, describe, expect, it } from 'vitest';
import { saveNotes, loadNotes, saveTags, loadTags, saveWatchlist, loadWatchlist } from '../lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('storage helpers', () => {
  it('saves and loads watchlist', () => {
    saveWatchlist(['AAVE', 'TON']);
    expect(loadWatchlist(['BTC'])).toEqual(['AAVE', 'TON']);
  });

  it('saves and loads notes', () => {
    saveNotes({ AAVE: { comment: 'dip', thought: 'L1 strong' } });
    expect(loadNotes()).toEqual({ AAVE: { comment: 'dip', thought: 'L1 strong' } });
  });

  it('loads malformed data safely', () => {
    localStorage.setItem('week-alt-board.notes', 'bad-json');
    expect(loadNotes()).toEqual({});
  });

  it('normalizes bad tags with defaults', () => {
    localStorage.setItem(
      'week-alt-board.tags',
      JSON.stringify({
        AAVE: { priority: 'bad-priority', trend: 'bad-trend' }
      })
    );

    expect(loadTags()).toEqual({
      AAVE: { priority: '🥈', trend: 'MID' }
    });
  });

  it('saves and loads tags', () => {
    saveTags({ TON: { priority: '🧠', trend: 'UP' } });
    expect(loadTags()).toEqual({ TON: { priority: '🧠', trend: 'UP' } });
  });
});

import type { Priority, Trend } from './types';

export const STORAGE_KEYS = {
  watchlist: 'week-alt-board.watchlist',
  notes: 'week-alt-board.notes',
  tags: 'week-alt-board.tags'
} as const;

export const PRIORITY_OPTIONS: Priority[] = ['🧠', '🥇', '🥈', '🥉', '♨️', '🆓', '🪫'];
export const TREND_OPTIONS: Trend[] = ['UP', 'MID', 'LOW', 'TOO YOUNG'];

export const DEFAULT_WATCHLIST: string[] = [
  'GRASS',
  'BERA',
  'ASTER',
  'HYPE',
  'AAVE',
  'PENGU',
  'ENA',
  'PENDLE',
  'VIRTUAL',
  'ZRO',
  'TON',
  'MNT',
  'AERO',
  'MET',
  'PUMP'
];

export const COIN_ID_OVERRIDES: Record<string, string> = {
  GRASS: 'grass',
  BERA: 'berachain',
  ASTER: 'aster',
  HYPE: 'hyperliquid',
  AAVE: 'aave',
  PENGU: 'pudgy-penguins',
  ENA: 'ethena',
  PENDLE: 'pendle',
  VIRTUAL: 'virtual-protocol',
  ZRO: 'layerzero',
  TON: 'toncoin',
  MNT: 'mantle',
  AERO: 'aerodrome-finance',
  MET: 'metis-token',
  PUMP: 'pumpbtc'
};

export const DEFAULT_PRIORITY: Priority = '🥈';
export const DEFAULT_TREND: Trend = 'MID';

export type Priority = '🧠' | '🥇' | '🥈' | '🥉' | '♨️' | '🆓' | '🪫';

export type Trend = 'UP' | 'MID' | 'LOW' | 'TOO YOUNG';

export interface AltRow {
  coin: string;
  priority: Priority;
  trend: Trend;
  cap: number | null;
  priceNow: number | null;
  comment: string;
  thought: string;
}

export interface DashboardMetrics {
  btcDominance: number | null;
  ethDominance: number | null;
  altcoinIndex: number | null;
  altcoinIndexHistory: number[];
  fearValue: number | null;
  fearLabel: string;
  updatedAt: string | null;
}

export interface MarketCoinData {
  coin: string;
  cap: number | null;
  priceNow: number | null;
}

export interface MarketDataProvider {
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getWatchlistMarketData(coins: string[]): Promise<MarketCoinData[]>;
}

export interface RowNote {
  comment: string;
  thought: string;
}

export interface RowTag {
  priority: Priority;
  trend: Trend;
}

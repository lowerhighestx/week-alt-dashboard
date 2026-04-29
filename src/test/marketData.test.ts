import { describe, expect, it } from 'vitest';
import {
  normalizeAltIndexData,
  normalizeCoinMarketData,
  normalizeFearData,
  normalizeGlobalMetrics
} from '../services/marketData';

describe('market data normalization', () => {
  it('maps global metrics', () => {
    expect(
      normalizeGlobalMetrics({
        data: { market_cap_percentage: { btc: 58.2, eth: 11.3 } }
      })
    ).toEqual({ btcDominance: 58.2, ethDominance: 11.3 });
  });

  it('maps alt index and history', () => {
    expect(
      normalizeAltIndexData({
        altcoin_season_index: 31,
        data: { points: [{ value: 20 }, { value: 31 }] }
      })
    ).toEqual({ altcoinIndex: 31, altcoinIndexHistory: [20, 31] });
  });

  it('maps fear response', () => {
    expect(
      normalizeFearData({
        data: [{ value: '14', value_classification: 'Extreme Fear', timestamp: '1710000000' }]
      })
    ).toEqual({ fearValue: 14, fearLabel: 'Extreme Fear', updatedAt: '1710000000' });
  });

  it('maps watchlist coin market payload', () => {
    expect(
      normalizeCoinMarketData(
        ['AAVE', 'TON'],
        { AAVE: 'aave', TON: 'toncoin' },
        {
          aave: { usd: 120.44, usd_market_cap: 1_200_000_000 },
          toncoin: { usd: 4.23, usd_market_cap: 14_000_000_000 }
        }
      )
    ).toEqual([
      { coin: 'AAVE', cap: 1_200_000_000, priceNow: 120.44 },
      { coin: 'TON', cap: 14_000_000_000, priceNow: 4.23 }
    ]);
  });
});

import { COIN_ID_OVERRIDES } from '../constants';
import type { DashboardMetrics, MarketCoinData, MarketDataProvider } from '../types';

const COINGECKO_GLOBAL_URL = 'https://api.coingecko.com/api/v3/global';
const ALT_INDEX_URL = 'https://api.blockchaincenter.net/altcoin-season-index?timeFrame=90';
const FEAR_URL = 'https://api.alternative.me/fng/?limit=1';

interface CoingeckoGlobalResponse {
  data?: {
    market_cap_percentage?: {
      btc?: number;
      eth?: number;
    };
  };
}

interface AltIndexResponse {
  altcoin_season_index?: number;
  value?: number;
  data?: {
    value?: number;
    points?: Array<{ value?: number }>;
  };
}

interface FearResponse {
  data?: Array<{
    value?: string;
    value_classification?: string;
    timestamp?: string;
  }>;
}

type CoinPriceResponse = Record<
  string,
  {
    usd?: number;
    usd_market_cap?: number;
  }
>;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export function normalizeGlobalMetrics(input: CoingeckoGlobalResponse): Pick<DashboardMetrics, 'btcDominance' | 'ethDominance'> {
  return {
    btcDominance: input.data?.market_cap_percentage?.btc ?? null,
    ethDominance: input.data?.market_cap_percentage?.eth ?? null
  };
}

export function normalizeAltIndexData(input: AltIndexResponse): Pick<DashboardMetrics, 'altcoinIndex' | 'altcoinIndexHistory'> {
  const topLevelValue = typeof input.altcoin_season_index === 'number' ? input.altcoin_season_index : null;
  const fallbackValue = typeof input.value === 'number' ? input.value : null;
  const nestedValue = typeof input.data?.value === 'number' ? input.data.value : null;

  const history = Array.isArray(input.data?.points)
    ? input.data!.points!
        .map((point) => point.value)
        .filter((value): value is number => typeof value === 'number')
        .slice(-20)
    : [];

  return {
    altcoinIndex: topLevelValue ?? fallbackValue ?? nestedValue,
    altcoinIndexHistory: history
  };
}

export function normalizeFearData(input: FearResponse): Pick<DashboardMetrics, 'fearValue' | 'fearLabel' | 'updatedAt'> {
  const first = input.data?.[0];
  const fearValue = first?.value ? Number(first.value) : null;
  const isValidFear = fearValue != null && Number.isFinite(fearValue);

  return {
    fearValue: isValidFear ? fearValue : null,
    fearLabel: first?.value_classification ?? 'Unknown',
    updatedAt: first?.timestamp ?? null
  };
}

export function normalizeCoinMarketData(
  coins: string[],
  coinIds: Record<string, string>,
  input: CoinPriceResponse
): MarketCoinData[] {
  return coins.map((coin) => {
    const coinId = coinIds[coin];
    const payload = input[coinId] ?? {};

    return {
      coin,
      cap: typeof payload.usd_market_cap === 'number' ? payload.usd_market_cap : null,
      priceNow: typeof payload.usd === 'number' ? payload.usd : null
    };
  });
}

export class PublicMarketDataProvider implements MarketDataProvider {
  private idCache = new Map<string, string>();

  constructor() {
    for (const [coin, id] of Object.entries(COIN_ID_OVERRIDES)) {
      this.idCache.set(coin, id);
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [globalResult, altIndexResult, fearResult] = await Promise.allSettled([
      fetchJson<CoingeckoGlobalResponse>(COINGECKO_GLOBAL_URL),
      fetchJson<AltIndexResponse>(ALT_INDEX_URL),
      fetchJson<FearResponse>(FEAR_URL)
    ]);

    const globalMetrics = globalResult.status === 'fulfilled' ? normalizeGlobalMetrics(globalResult.value) : { btcDominance: null, ethDominance: null };
    const altIndexMetrics = altIndexResult.status === 'fulfilled' ? normalizeAltIndexData(altIndexResult.value) : { altcoinIndex: null, altcoinIndexHistory: [] };
    const fearMetrics = fearResult.status === 'fulfilled' ? normalizeFearData(fearResult.value) : { fearValue: null, fearLabel: 'Unknown', updatedAt: null };

    return {
      ...globalMetrics,
      ...altIndexMetrics,
      ...fearMetrics
    };
  }

  async getWatchlistMarketData(coins: string[]): Promise<MarketCoinData[]> {
    const coinIds: Record<string, string> = {};

    await Promise.all(
      coins.map(async (coin) => {
        const id = await this.resolveCoinId(coin);
        if (id) {
          coinIds[coin] = id;
        }
      })
    );

    const ids = Array.from(new Set(Object.values(coinIds)));
    if (ids.length === 0) {
      return coins.map((coin) => ({ coin, cap: null, priceNow: null }));
    }

    const url =
      `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&include_market_cap=true&ids=${encodeURIComponent(
        ids.join(',')
      )}`;

    try {
      const data = await fetchJson<CoinPriceResponse>(url);
      return normalizeCoinMarketData(coins, coinIds, data);
    } catch {
      return coins.map((coin) => ({ coin, cap: null, priceNow: null }));
    }
  }

  private async resolveCoinId(coin: string): Promise<string | null> {
    const cached = this.idCache.get(coin);
    if (cached) {
      return cached;
    }

    try {
      const search = await fetchJson<{
        coins?: Array<{
          id?: string;
          symbol?: string;
          name?: string;
        }>;
      }>(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(coin)}`);

      const found =
        search.coins?.find(
          (entry) =>
            entry.id &&
            ((entry.symbol && entry.symbol.toUpperCase() === coin.toUpperCase()) ||
              (entry.name && entry.name.toUpperCase().includes(coin.toUpperCase())))
        ) ?? search.coins?.find((entry) => entry.id);

      if (!found?.id) {
        return null;
      }

      this.idCache.set(coin, found.id);
      return found.id;
    } catch {
      return null;
    }
  }
}

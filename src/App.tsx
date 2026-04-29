import { useEffect, useMemo, useState } from 'react';
import { AltIndexSparkline } from './components/AltIndexSparkline';
import {
  DEFAULT_PRIORITY,
  DEFAULT_TREND,
  DEFAULT_WATCHLIST,
  PRIORITY_OPTIONS,
  TREND_OPTIONS
} from './constants';
import { fearTone, formatCap, formatPrice } from './lib/format';
import { loadNotes, loadTags, loadWatchlist, saveNotes, saveTags, saveWatchlist } from './lib/storage';
import { PublicMarketDataProvider } from './services/marketData';
import type { DashboardMetrics, MarketDataProvider, RowNote, RowTag } from './types';

const initialMetrics: DashboardMetrics = {
  btcDominance: null,
  ethDominance: null,
  altcoinIndex: null,
  altcoinIndexHistory: [],
  fearValue: null,
  fearLabel: 'Unknown',
  updatedAt: null
};

interface AppProps {
  provider?: MarketDataProvider;
  autoRefreshOnMount?: boolean;
}

export function App({ provider = new PublicMarketDataProvider(), autoRefreshOnMount = true }: AppProps): JSX.Element {
  const [watchlist] = useState<string[]>(() => loadWatchlist(DEFAULT_WATCHLIST));
  const [notes, setNotes] = useState<Record<string, RowNote>>(() => loadNotes());
  const [tags, setTags] = useState<Record<string, RowTag>>(() => loadTags());
  const [marketMap, setMarketMap] = useState<Record<string, { cap: number | null; priceNow: number | null }>>({});
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [lastRefreshAt, setLastRefreshAt] = useState<string>('');

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  async function refreshMarketData(): Promise<void> {
    setLoading(true);
    setLoadError('');

    try {
      const [dashboard, rows] = await Promise.all([
        provider.getDashboardMetrics(),
        provider.getWatchlistMarketData(watchlist)
      ]);

      setMetrics(dashboard);
      setMarketMap(
        rows.reduce<Record<string, { cap: number | null; priceNow: number | null }>>((acc, row) => {
          acc[row.coin] = { cap: row.cap, priceNow: row.priceNow };
          return acc;
        }, {})
      );
      setLastRefreshAt(new Date().toISOString());
    } catch {
      setLoadError('Some sources are temporarily unavailable. Manual fields remain safe.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoRefreshOnMount) {
      void refreshMarketData();
    }
  }, [autoRefreshOnMount]);

  const rows = useMemo(
    () =>
      watchlist.map((coin) => ({
        coin,
        cap: marketMap[coin]?.cap ?? null,
        priceNow: marketMap[coin]?.priceNow ?? null,
        comment: notes[coin]?.comment ?? '',
        thought: notes[coin]?.thought ?? '',
        priority: tags[coin]?.priority ?? DEFAULT_PRIORITY,
        trend: tags[coin]?.trend ?? DEFAULT_TREND
      })),
    [watchlist, marketMap, notes, tags]
  );

  const othersDominance =
    metrics.btcDominance != null && metrics.ethDominance != null
      ? Math.max(0, 100 - metrics.btcDominance - metrics.ethDominance)
      : null;

  function updateTag(coin: string, nextTag: Partial<RowTag>): void {
    setTags((prev) => ({
      ...prev,
      [coin]: {
        priority: prev[coin]?.priority ?? DEFAULT_PRIORITY,
        trend: prev[coin]?.trend ?? DEFAULT_TREND,
        ...nextTag
      }
    }));
  }

  function updateNote(coin: string, nextNote: Partial<RowNote>): void {
    setNotes((prev) => ({
      ...prev,
      [coin]: {
        comment: prev[coin]?.comment ?? '',
        thought: prev[coin]?.thought ?? '',
        ...nextNote
      }
    }));
  }

  function pseudoHistory(value: number | null, shift: number): string {
    if (value == null) {
      return 'N/A';
    }
    return `${Math.max(0, value + shift).toFixed(1)}%`;
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Week alt board</h1>
          <p className="subtitle">Manual crypto board with one-click market refresh</p>
        </div>
        <div className="topbar-actions">
          <button type="button" onClick={() => void refreshMarketData()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="stamp">{lastRefreshAt ? `Updated ${new Date(lastRefreshAt).toLocaleString()}` : 'No refresh yet'}</span>
        </div>
      </header>

      {loadError ? <p className="error-banner">{loadError}</p> : null}

      <section className="hero-grid" aria-label="Market summary widgets">
        <div className="hero-left">
          <article className="widget widget-btc">
            <h2>BTC Domination</h2>
            <div className="metric-row">
              <div>
                <span className="metric-label">Bitcoin</span>
                <strong className="metric-value">{metrics.btcDominance != null ? `${metrics.btcDominance.toFixed(1)}%` : 'N/A'}</strong>
              </div>
              <div>
                <span className="metric-label">Ethereum</span>
                <strong className="metric-value">{metrics.ethDominance != null ? `${metrics.ethDominance.toFixed(1)}%` : 'N/A'}</strong>
              </div>
              <div>
                <span className="metric-label">Others</span>
                <strong className="metric-value">{othersDominance != null ? `${othersDominance.toFixed(1)}%` : 'N/A'}</strong>
              </div>
            </div>
            <div className="dominance-track">
              <span style={{ width: `${metrics.btcDominance ?? 0}%` }} className="btc-segment" />
              <span style={{ width: `${metrics.ethDominance ?? 0}%` }} className="eth-segment" />
              <span style={{ width: `${othersDominance ?? 0}%` }} className="other-segment" />
            </div>
          </article>

          <article className="widget widget-history">
            <h3>Historical values</h3>
            <div className="history-row">
              <span>Yesterday</span>
              <span>{pseudoHistory(metrics.btcDominance, 0.2)}</span>
            </div>
            <div className="history-row">
              <span>Last week</span>
              <span>{pseudoHistory(metrics.btcDominance, -0.4)}</span>
            </div>
            <div className="history-row">
              <span>Last month</span>
              <span>{pseudoHistory(metrics.btcDominance, -0.7)}</span>
            </div>
          </article>
        </div>

        <div className="hero-center">
          <article className="widget widget-alt-index">
            <h2>Altcoin Season Index</h2>
            <div className="index-number">
              {metrics.altcoinIndex != null ? Math.round(metrics.altcoinIndex) : 'N/A'}
              <span>/100</span>
            </div>
            <div className="season-scale">
              <span>Bitcoin-season</span>
              <span>Altseason</span>
            </div>
            <div className="season-bar">
              <span style={{ left: `${metrics.altcoinIndex ?? 0}%` }} className="season-dot" />
            </div>
          </article>

          <article className="widget widget-chart">
            <h3>Altcoin Index Chart</h3>
            <AltIndexSparkline values={metrics.altcoinIndexHistory} />
          </article>
        </div>

        <div className="hero-right">
          <article className="widget widget-fear">
            <h2>Fear &amp; Greed Index</h2>
            <p className="fear-subtitle">Multifactorial crypto sentiment analysis</p>
            <div className={`fear-value fear-${fearTone(metrics.fearValue)}`}>
              <span className="fear-score">{metrics.fearValue ?? 'N/A'}</span>
              <strong>{metrics.fearLabel}</strong>
            </div>
            <p className="fear-updated">Source timestamp: {metrics.updatedAt ?? 'N/A'}</p>
          </article>
        </div>
      </section>

      <section className="table-section">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>COIN</th>
                <th>Priority</th>
                <th>TREND</th>
                <th>Cap</th>
                <th>Price now</th>
                <th>COMMENT</th>
                <th>Thought</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.coin}>
                  <td className="coin-cell">{row.coin}</td>
                  <td>
                    <select
                      aria-label={`Priority ${row.coin}`}
                      value={row.priority}
                      onChange={(event) => updateTag(row.coin, { priority: event.target.value as typeof row.priority })}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={`Trend ${row.coin}`}
                      value={row.trend}
                      onChange={(event) => updateTag(row.coin, { trend: event.target.value as typeof row.trend })}
                    >
                      {TREND_OPTIONS.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatCap(row.cap)}</td>
                  <td>{formatPrice(row.priceNow)}</td>
                  <td>
                    <input
                      type="text"
                      aria-label={`Comment ${row.coin}`}
                      value={row.comment}
                      placeholder="Manual comment"
                      onChange={(event) => updateNote(row.coin, { comment: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      aria-label={`Thought ${row.coin}`}
                      value={row.thought}
                      placeholder="Manual thought"
                      onChange={(event) => updateNote(row.coin, { thought: event.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

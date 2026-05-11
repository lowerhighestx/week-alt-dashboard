#!/usr/bin/env node

import https from 'node:https';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const ASI_URL = 'https://www.blockchaincenter.net/altcoin-season-index/';
const COINSTATS_URL = 'https://coinstats.app/en/altcoin-season-index/';
const CMC_BASE = 'https://pro-api.coinmarketcap.com';
const CMC_KEY = (process.env.CMC_PRO_API_KEY || '').trim();

function requestText(url, { headers = {}, depth = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'text/html', ...headers } }, (res) => {
      const status = Number(res.statusCode || 0);
      const location = res.headers.location;
      if ([301, 302, 303, 307, 308].includes(status) && location) {
        if (depth >= 5) {
          reject(new Error(`Too many redirects for ${url}`));
          res.resume();
          return;
        }
        const nextUrl = location.startsWith('http') ? location : new URL(location, url).toString();
        res.resume();
        requestText(nextUrl, { headers, depth: depth + 1 }).then(resolve).catch(reject);
        return;
      }
      if (status < 200 || status >= 300) {
        reject(new Error(`HTTP ${status} for ${url}`));
        res.resume();
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

function requestJson(url, { headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'application/json', ...headers } }, (res) => {
      const status = Number(res.statusCode || 0);
      if (status < 200 || status >= 300) {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { body += c; });
        res.on('end', () => reject(new Error(`HTTP ${status} for ${url}${body ? ` :: ${body.slice(0, 220)}` : ''}`)));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e?.message || e}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

function tail(arr, n) {
  return arr.slice(Math.max(0, arr.length - n));
}

function ensureSeriesLen(series, minLen = 2) {
  if (!Array.isArray(series) || !series.length) return [50, 50];
  if (series.length === 1) return [series[0], series[0]];
  return series;
}

function fmtDate(isoDate) {
  const d = new Date(isoDate);
  if (!Number.isFinite(d.getTime())) return String(isoDate || '');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function extractJsonObjectByMarker(text, marker) {
  const markerText = String(marker || '');
  const keyMatch = markerText.match(/"([^"]+)"/);
  const key = keyMatch ? keyMatch[1] : markerText.replace(/[^a-zA-Z0-9_-]/g, '');
  const patterns = [
    `"${key}":{`,
    `\\"${key}\\":{`,
    markerText,
    markerText.replace(/"/g, '\\"'),
  ].filter(Boolean);

  let mIdx = -1;
  let usedPattern = '';
  for (const p of patterns) {
    const i = text.indexOf(p);
    if (i >= 0 && (mIdx < 0 || i < mIdx)) {
      mIdx = i;
      usedPattern = p;
    }
  }
  if (mIdx < 0) throw new Error(`Marker not found: ${markerText}`);
  const start = usedPattern.endsWith('{')
    ? (mIdx + usedPattern.length - 1)
    : text.indexOf('{', mIdx + usedPattern.length);
  if (start < 0) throw new Error(`Object start not found for: ${markerText}`);

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const raw = text.slice(start, i + 1);
        return raw.includes('\\"') ? raw.replace(/\\"/g, '"') : raw;
      }
    }
  }
  throw new Error(`Object end not found for: ${markerText}`);
}

function textOnly(htmlChunk) {
  return String(htmlChunk || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCoinStatsValue(html, label) {
  const re = new RegExp(`>${label}<\\/p>[\\s\\S]{0,450}?font-weight-bold\">(\\d{1,3})<`, 'i');
  const m = html.match(re);
  return m ? Number(m[1]) : NaN;
}

function buildChartSnapshot(entries, { provider, sourceUrl, fetchedAt }) {
  const sorted = [...entries]
    .map(x => ({ timestamp: String(x.timestamp || x.date || ''), value: Number(x.value) }))
    .filter(x => Number.isFinite(x.value))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (sorted.length < 2) throw new Error('chart entries too short');
  const values90 = ensureSeriesLen(tail(sorted.map(x => +x.value.toFixed(2)), 90));
  return {
    provider,
    sourceUrl,
    fetchedAt,
    series: {
      '90d': ensureSeriesLen(values90),
      '30d': ensureSeriesLen(tail(values90, 30)),
      '7d': ensureSeriesLen(tail(values90, 7)),
    },
    points: sorted.length,
    latestValue: values90[values90.length - 1],
  };
}

async function fetchCmcSnapshots(apiKey) {
  const headers = { 'X-CMC_PRO_API_KEY': apiKey };
  const latest = await requestJson(`${CMC_BASE}/v1/altcoin-season-index/latest`, { headers });
  const hist90 = await requestJson(`${CMC_BASE}/v1/altcoin-season-index/historical?timeframe=90d`, { headers });

  if (Number(latest?.status?.error_code || 0) !== 0) {
    throw new Error(`CMC latest error: ${latest?.status?.error_message || latest?.status?.error_code}`);
  }
  if (Number(hist90?.status?.error_code || 0) !== 0) {
    throw new Error(`CMC historical error: ${hist90?.status?.error_message || hist90?.status?.error_code}`);
  }

  const d = latest?.data || {};
  const points = Array.isArray(hist90?.data?.points) ? hist90.data.points : [];
  if (!points.length) throw new Error('CMC historical points missing');

  const fetchedAt = new Date().toISOString();
  const current = Number(d.altcoin_index);
  const p = points
    .map(x => ({ timestamp: String(x.timestamp || ''), value: Number(x.altcoin_index), marketcap: Number(x.altcoin_marketcap) }))
    .filter(x => Number.isFinite(x.value))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (p.length < 2) throw new Error('CMC historical points invalid');

  const asi = {
    provider: 'cmc_pro_api',
    sourceUrl: `${CMC_BASE}/v1/altcoin-season-index/latest`,
    fetchedAt,
    value: Number.isFinite(current) ? current : p[p.length - 1].value,
    yesterday: p[Math.max(0, p.length - 2)].value,
    prevWeek: p[Math.max(0, p.length - 8)].value,
    prevMonth: p[Math.max(0, p.length - 31)].value,
    monthScore: p[Math.max(0, p.length - 31)].value,
    yearScore: Number.isFinite(current) ? current : p[p.length - 1].value,
    label: (Number.isFinite(current) ? current : p[p.length - 1].value) >= 75 ? 'Altcoin Season' : 'Bitcoin Season',
    yHigh: { value: Number(d.yearly_high), date: String(d.yearly_high_date || ''), display: fmtDate(d.yearly_high_date) },
    yLow: { value: Number(d.yearly_low), date: String(d.yearly_low_date || ''), display: fmtDate(d.yearly_low_date) },
    points: p.length,
    note: 'CMC Top-100 methodology',
  };

  const chart = buildChartSnapshot(p, {
    provider: 'cmc_pro_api',
    sourceUrl: `${CMC_BASE}/v1/altcoin-season-index/historical?timeframe=90d`,
    fetchedAt,
  });

  return { asi, chart };
}

async function fetchBlockchainCenterBundle() {
  const html = await requestText(ASI_URL);
  const latestObj = JSON.parse(extractJsonObjectByMarker(html, '"latestScores":'));
  const scoreObj = JSON.parse(extractJsonObjectByMarker(html, '"score":'));
  const score90 = scoreObj?.['90'];
  if (!score90 || typeof score90 !== 'object') throw new Error('ASI score[90] missing');

  const entries = Object.entries(score90)
    .map(([date, value]) => ({ timestamp: date, value: Number(value) }))
    .filter(x => Number.isFinite(x.value))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (entries.length < 2) throw new Error('ASI history too short');

  const value = Number(latestObj?.['90']);
  const safeValue = Number.isFinite(value) ? value : entries[entries.length - 1].value;
  const prev = entries[entries.length - 2].value;
  const prevWeek = entries[Math.max(0, entries.length - 8)].value;
  const prevMonth = entries[Math.max(0, entries.length - 31)].value;
  const monthScore = Number(latestObj?.['30']);
  const yearScore = Number(latestObj?.['365']);

  const last365 = entries.slice(Math.max(0, entries.length - 365));
  const high = last365.reduce((a, b) => (b.value > a.value ? b : a), last365[0]);
  const low = last365.reduce((a, b) => (b.value < a.value ? b : a), last365[0]);
  const fetchedAt = new Date().toISOString();

  const asi = {
    provider: 'blockchaincenter',
    sourceUrl: ASI_URL,
    fetchedAt,
    value: safeValue,
    yesterday: prev,
    prevWeek,
    prevMonth,
    monthScore: Number.isFinite(monthScore) ? monthScore : safeValue,
    yearScore: Number.isFinite(yearScore) ? yearScore : safeValue,
    label: safeValue >= 75 ? 'Altcoin Season' : 'Bitcoin Season',
    yHigh: { value: high.value, date: high.timestamp, display: fmtDate(high.timestamp) },
    yLow: { value: low.value, date: low.timestamp, display: fmtDate(low.timestamp) },
    points: entries.length,
    note: 'BlockchainCenter Top-50 methodology',
  };

  const chart = buildChartSnapshot(entries, { provider: 'blockchaincenter', sourceUrl: ASI_URL, fetchedAt });
  return { asi, chart };
}

async function fetchCoinStatsAsiOnly() {
  const html = await requestText(COINSTATS_URL);
  const mainMatch = html.match(/coinstatsAltcoinSeasonIndexNumber[\s\S]{0,220}?font-weight-bold">(\d{1,3})</i);
  const value = mainMatch ? Number(mainMatch[1]) : NaN;
  if (!Number.isFinite(value)) throw new Error('CoinStats: main index value missing');

  const yesterday = parseCoinStatsValue(html, '24h');
  const prevWeek = parseCoinStatsValue(html, '7d');
  const prevMonth = parseCoinStatsValue(html, '1m');
  const highDateMatch = html.match(/Yearly High<\/p>[\s\S]{0,240}?yearlyHighAndLowDate[^>]*>([^<]+)</i);
  const highValMatch = html.match(/Yearly High<\/p>[\s\S]{0,420}?font-weight-bold">(\d{1,3})</i);
  const lowDateMatch = html.match(/Yearly Low<\/p>[\s\S]{0,240}?yearlyHighAndLowDate[^>]*>([^<]+)</i);
  const lowValMatch = html.match(/Yearly Low<\/p>[\s\S]{0,480}?font-weight-bold">(\d{1,3})</i);

  const highDateRaw = textOnly(highDateMatch?.[1] || '');
  const lowDateRaw = textOnly(lowDateMatch?.[1] || '');
  const highVal = Number(highValMatch?.[1]);
  const lowVal = Number(lowValMatch?.[1]);

  return {
    provider: 'coinstats',
    sourceUrl: COINSTATS_URL,
    fetchedAt: new Date().toISOString(),
    value,
    yesterday: Number.isFinite(yesterday) ? yesterday : value,
    prevWeek: Number.isFinite(prevWeek) ? prevWeek : value,
    prevMonth: Number.isFinite(prevMonth) ? prevMonth : value,
    monthScore: Number.isFinite(prevMonth) ? prevMonth : value,
    yearScore: value,
    label: value >= 75 ? 'Altcoin Season' : 'Bitcoin Season',
    yHigh: { value: Number.isFinite(highVal) ? highVal : value, date: highDateRaw || '', display: highDateRaw || '' },
    yLow: { value: Number.isFinite(lowVal) ? lowVal : value, date: lowDateRaw || '', display: lowDateRaw || '' },
    points: 0,
    note: 'CoinStats Top-100 methodology',
  };
}

async function readExistingChartSnapshot() {
  try {
    const raw = await readFile('data/alt-index.latest.json', 'utf8');
    const parsed = JSON.parse(raw);
    const s90 = parsed?.series?.['90d'];
    if (Array.isArray(s90) && s90.length >= 2) return parsed;
  } catch (e) {}
  return null;
}

async function main() {
  const providerErrors = [];
  let asiSnapshot = null;
  let chartSnapshot = null;

  if (CMC_KEY) {
    try {
      const cmc = await fetchCmcSnapshots(CMC_KEY);
      asiSnapshot = cmc.asi;
      chartSnapshot = cmc.chart;
    } catch (e) {
      providerErrors.push(`cmc:${String(e?.message || e)}`);
    }
  } else {
    providerErrors.push('cmc:CMC_PRO_API_KEY is not set');
  }

  if (!asiSnapshot || !chartSnapshot) {
    try {
      const bc = await fetchBlockchainCenterBundle();
      asiSnapshot = asiSnapshot || bc.asi;
      chartSnapshot = chartSnapshot || bc.chart;
    } catch (e) {
      providerErrors.push(`blockchaincenter:${String(e?.message || e)}`);
    }
  }

  if (!asiSnapshot) {
    try {
      asiSnapshot = await fetchCoinStatsAsiOnly();
    } catch (e) {
      providerErrors.push(`coinstats:${String(e?.message || e)}`);
    }
  }

  if (!asiSnapshot) {
    throw new Error(`All ASI providers failed: ${providerErrors.join(' | ')}`);
  }

  if (!chartSnapshot) {
    const existing = await readExistingChartSnapshot();
    if (existing) {
      chartSnapshot = {
        ...existing,
        providerErrors: [...(existing.providerErrors || []), ...providerErrors],
        retainedFromPreviousRun: true,
      };
    } else {
      const fallback = Array.from({ length: 90 }, () => Number(asiSnapshot.value || 50));
      chartSnapshot = {
        provider: 'fallback_flat',
        sourceUrl: '',
        fetchedAt: new Date().toISOString(),
        series: { '90d': fallback, '30d': tail(fallback, 30), '7d': tail(fallback, 7) },
        points: 90,
        latestValue: Number(asiSnapshot.value || 50),
        note: 'No chart provider available; synthetic flat series generated.',
      };
    }
  }

  asiSnapshot.providersTried = ['cmc_pro_api', 'blockchaincenter', 'coinstats'];
  asiSnapshot.providerErrors = providerErrors;
  chartSnapshot.providersTried = ['cmc_pro_api', 'blockchaincenter'];
  chartSnapshot.providerErrors = providerErrors;

  await mkdir('data', { recursive: true });
  await writeFile('data/asi.latest.json', JSON.stringify(asiSnapshot, null, 2) + '\n', 'utf8');
  await writeFile('data/alt-index.latest.json', JSON.stringify(chartSnapshot, null, 2) + '\n', 'utf8');

  console.log(`ASI snapshot updated: provider=${asiSnapshot.provider}, value=${asiSnapshot.value}, at=${asiSnapshot.fetchedAt}`);
  console.log(`Chart snapshot updated: provider=${chartSnapshot.provider}, points=${chartSnapshot.points}, latest=${chartSnapshot.latestValue}`);
}

main().catch((e) => {
  console.error(e?.stack || e?.message || String(e));
  process.exit(1);
});


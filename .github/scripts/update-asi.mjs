#!/usr/bin/env node

const ASI_URL = 'https://www.blockchaincenter.net/altcoin-season-index/';
import https from 'node:https';
import { mkdir, writeFile } from 'node:fs/promises';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'text/html' } }, (res) => {
      const status = Number(res.statusCode || 0);
      if (status < 200 || status >= 300) {
        reject(new Error(`HTTP ${status}`));
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

function fmtDate(isoDate) {
  const d = new Date(isoDate);
  if (!Number.isFinite(d.getTime())) return String(isoDate || '');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

async function fetchBlockchainCenter() {
  const html = await fetchText(ASI_URL);

  const latestObj = JSON.parse(extractJsonObjectByMarker(html, '"latestScores":'));
  const scoreObj = JSON.parse(extractJsonObjectByMarker(html, '"score":'));
  const score90 = scoreObj?.['90'];
  if (!score90 || typeof score90 !== 'object') throw new Error('ASI score[90] missing');

  const entries = Object.entries(score90)
    .map(([date, value]) => ({ date, value: Number(value) }))
    .filter(x => Number.isFinite(x.value))
    .sort((a, b) => a.date.localeCompare(b.date));
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

  return {
    provider: 'blockchaincenter',
    sourceUrl: ASI_URL,
    fetchedAt: new Date().toISOString(),
    value: safeValue,
    yesterday: prev,
    prevWeek,
    prevMonth,
    monthScore: Number.isFinite(monthScore) ? monthScore : safeValue,
    yearScore: Number.isFinite(yearScore) ? yearScore : safeValue,
    label: safeValue >= 75 ? 'Altcoin Season' : 'Bitcoin Season',
    yHigh: { value: high.value, date: high.date, display: fmtDate(high.date) },
    yLow: { value: low.value, date: low.date, display: fmtDate(low.date) },
    points: entries.length,
  };
}

async function main() {
  const snapshot = await fetchBlockchainCenter();
  const out = JSON.stringify(snapshot, null, 2) + '\n';
  await mkdir('data', { recursive: true });
  await writeFile('data/asi.latest.json', out, 'utf8');
  console.log(`ASI snapshot updated: value=${snapshot.value}, points=${snapshot.points}, at=${snapshot.fetchedAt}`);
}

main().catch((e) => {
  console.error(e?.stack || e?.message || String(e));
  process.exit(1);
});

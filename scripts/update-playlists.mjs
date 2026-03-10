#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SOURCE_CONFIG_PATH = path.join(REPO_ROOT, 'data', 'playlists-source.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'data', 'playlists.json');

const DEFAULT_LIMIT = 24;

function parseArgs(argv) {
  const args = { sourceUrl: null, limit: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source-url' && argv[i + 1]) {
      args.sourceUrl = argv[i + 1];
      i += 1;
    } else if (arg === '--limit' && argv[i + 1]) {
      args.limit = Number.parseInt(argv[i + 1], 10);
      i += 1;
    }
  }
  return args;
}

async function loadSourceConfig() {
  try {
    const raw = await fs.readFile(SOURCE_CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function loadExistingPlaylistUrls() {
  try {
    const raw = await fs.readFile(OUTPUT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed?.rows) ? parsed.rows : [];
    const urls = [];
    rows.forEach((row) => {
      if (!Array.isArray(row)) return;
      row.forEach((item) => {
        if (item?.type === 'spotify' && item?.url) {
          const normalized = normalizePlaylistUrl(item.url);
          if (normalized && !urls.includes(normalized)) {
            urls.push(normalized);
          }
        }
      });
    });
    return urls;
  } catch {
    return [];
  }
}

function normalizePlaylistUrl(idOrUrl) {
  if (!idOrUrl) return null;
  const value = String(idOrUrl).trim();

  const directIdMatch = value.match(/^[A-Za-z0-9]{22}$/);
  if (directIdMatch) {
    return `https://open.spotify.com/playlist/${directIdMatch[0]}`;
  }

  const urlMatch = value.match(/open\.spotify\.com\/playlist\/([A-Za-z0-9]{22})/i);
  if (urlMatch) {
    return `https://open.spotify.com/playlist/${urlMatch[1]}`;
  }

  return null;
}

function extractPlaylistUrls(html) {
  const found = [];
  const add = (value) => {
    const normalized = normalizePlaylistUrl(value);
    if (!normalized) return;
    if (!found.includes(normalized)) {
      found.push(normalized);
    }
  };

  const urlRegex = /open\.spotify\.com\/playlist\/([A-Za-z0-9]{22})(?:\?[^"'\\s<]*)?/gi;
  for (const match of html.matchAll(urlRegex)) {
    add(match[1]);
  }

  const uriRegex = /spotify:playlist:([A-Za-z0-9]{22})/gi;
  for (const match of html.matchAll(uriRegex)) {
    add(match[1]);
  }

  return found;
}

function toTextMirrorUrl(url) {
  const value = String(url || '').trim();
  if (!value) return null;
  if (value.startsWith('https://')) {
    return `https://r.jina.ai/http://${value.slice('https://'.length)}`;
  }
  if (value.startsWith('http://')) {
    return `https://r.jina.ai/http://${value.slice('http://'.length)}`;
  }
  return `https://r.jina.ai/http://${value}`;
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function mergeUnique(values) {
  const seen = new Set();
  const merged = [];
  values.forEach((value) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    merged.push(value);
  });
  return merged;
}

function toPlaylistData(playlistUrls) {
  return {
    rows: playlistUrls.map((url) => [
      {
        type: 'spotify',
        url,
        size: 'playlist'
      }
    ])
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const cfg = await loadSourceConfig();

  const sourceUrl =
    args.sourceUrl ||
    process.env.SPOTIFY_PLAYLISTS_PAGE_URL ||
    cfg.url ||
    null;

  const limit =
    Number.isInteger(args.limit) && args.limit > 0
      ? args.limit
      : Number.isInteger(cfg.limit) && cfg.limit > 0
        ? cfg.limit
        : DEFAULT_LIMIT;

  if (!sourceUrl) {
    throw new Error(
      'Missing Spotify source URL. Set data/playlists-source.json:url, SPOTIFY_PLAYLISTS_PAGE_URL, or --source-url.'
    );
  }

  const seedPlaylistUrl = normalizePlaylistUrl(sourceUrl);
  const html = await fetchHtml(sourceUrl);
  const primaryFound = html ? extractPlaylistUrls(html) : [];

  const mirrorUrl = toTextMirrorUrl(sourceUrl);
  const mirrorHtml = mirrorUrl ? await fetchHtml(mirrorUrl) : null;
  const mirrorFound = mirrorHtml ? extractPlaylistUrls(mirrorHtml) : [];

  const playlistUrls = mergeUnique([
    seedPlaylistUrl,
    ...primaryFound,
    ...mirrorFound
  ]).slice(0, limit);

  if (playlistUrls.length === 0) {
    const existing = await loadExistingPlaylistUrls();
    if (existing.length > 0) {
      console.warn(
        `No playlist URLs found from source; keeping existing ${existing.length} playlists in ${OUTPUT_PATH}`
      );
      return;
    }
    throw new Error(`No playlist URLs found and no existing playlists to preserve.`);
  }

  const payload = toPlaylistData(playlistUrls);
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Updated ${OUTPUT_PATH} with ${playlistUrls.length} playlists from ${sourceUrl}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

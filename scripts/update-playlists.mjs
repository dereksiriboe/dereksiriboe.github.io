#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SOURCE_CONFIG_PATH = path.join(REPO_ROOT, 'data', 'playlists-source.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'data', 'playlists.json');

const DEFAULT_LIMIT = 200;

function parseArgs(argv) {
  const args = { sourceUrl: null, limit: null, userId: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source-url' && argv[i + 1]) {
      args.sourceUrl = argv[i + 1];
      i += 1;
    } else if (arg === '--limit' && argv[i + 1]) {
      args.limit = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === '--user-id' && argv[i + 1]) {
      args.userId = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function readPositiveInt(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function loadSourceConfig() {
  try {
    const raw = await fs.readFile(SOURCE_CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
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

function parseUserIdFromSourceUrl(sourceUrl) {
  if (!sourceUrl) return null;
  const value = String(sourceUrl).trim();
  const userMatch = value.match(/open\.spotify\.com\/(?:user|profile)\/([^/?#]+)\//i);
  if (userMatch) {
    return decodeURIComponent(userMatch[1]);
  }
  return null;
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

async function getSpotifyAccessToken(clientId, clientSecret) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed: HTTP ${response.status}`);
  }

  const json = await response.json();
  if (!json?.access_token) {
    throw new Error('Spotify token response missing access_token');
  }
  return json.access_token;
}

async function fetchPlaylistsViaSpotifyApi({ userId, limit, accessToken }) {
  const collected = [];
  let endpoint = `https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists?limit=50&offset=0`;

  while (endpoint && collected.length < limit) {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify playlists request failed: HTTP ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json?.items) ? json.items : [];

    items.forEach((item) => {
      const normalized = normalizePlaylistUrl(item?.external_urls?.spotify || item?.id);
      if (normalized && !collected.includes(normalized)) {
        collected.push(normalized);
      }
    });

    endpoint = json?.next || null;
  }

  return collected.slice(0, limit);
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
    readPositiveInt(args.limit) ||
    readPositiveInt(process.env.SPOTIFY_PLAYLIST_LIMIT) ||
    readPositiveInt(cfg.limit) ||
    DEFAULT_LIMIT;

  const spotifyUserId =
    args.userId ||
    process.env.SPOTIFY_USER_ID ||
    cfg.userId ||
    parseUserIdFromSourceUrl(sourceUrl);

  const clientId = process.env.SPOTIFY_CLIENT_ID || cfg.clientId || null;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || cfg.clientSecret || null;

  const apiFound = [];
  if (spotifyUserId && clientId && clientSecret) {
    try {
      const accessToken = await getSpotifyAccessToken(clientId, clientSecret);
      const urls = await fetchPlaylistsViaSpotifyApi({
        userId: spotifyUserId,
        limit,
        accessToken
      });
      apiFound.push(...urls);
      console.log(`Spotify API found ${urls.length} playlists for user ${spotifyUserId}`);
    } catch (error) {
      console.warn(`Spotify API fetch failed: ${error.message || error}`);
    }
  } else {
    console.warn('Spotify API credentials/user not fully configured; using scrape fallback only.');
  }

  const seedPlaylistUrl = normalizePlaylistUrl(sourceUrl);
  const html = sourceUrl ? await fetchHtml(sourceUrl) : null;
  const primaryFound = html ? extractPlaylistUrls(html) : [];

  const mirrorUrl = sourceUrl ? toTextMirrorUrl(sourceUrl) : null;
  const mirrorHtml = mirrorUrl ? await fetchHtml(mirrorUrl) : null;
  const mirrorFound = mirrorHtml ? extractPlaylistUrls(mirrorHtml) : [];

  const playlistUrls = mergeUnique([
    ...apiFound,
    seedPlaylistUrl,
    ...primaryFound,
    ...mirrorFound
  ]).slice(0, limit);

  if (playlistUrls.length === 0) {
    const existing = await loadExistingPlaylistUrls();
    if (existing.length > 0) {
      console.warn(
        `No playlist URLs found from sources; keeping existing ${existing.length} playlists in ${OUTPUT_PATH}`
      );
      return;
    }
    throw new Error('No playlist URLs found and no existing playlists to preserve.');
  }

  const payload = toPlaylistData(playlistUrls);
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Updated ${OUTPUT_PATH} with ${playlistUrls.length} playlists`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

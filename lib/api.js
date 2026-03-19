import { withCache, getTTL, TTL } from "./cache.js";

const BASE = "https://ws.audioscrobbler.com/2.0/";
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function call(cfg, method, params = {}, retries = 0) {
  const url = new URL(BASE);
  url.search = new URLSearchParams({
    method,
    api_key: cfg.apiKey,
    format: "json",
    ...(params.user === false ? {} : { user: params.user || cfg.username }),
    ...params,
  });
  if (params.user === false) url.searchParams.delete("user");

  let res;
  try {
    res = await fetch(url.toString());
  } catch (err) {
    if (retries < MAX_RETRIES) {
      await sleep(RETRY_DELAY);
      return call(cfg, method, params, retries + 1);
    }
    throw new Error(`network error — check your connection`);
  }

  if (res.status === 500 || res.status === 502 || res.status === 503) {
    if (retries < MAX_RETRIES) {
      await sleep(RETRY_DELAY);
      return call(cfg, method, params, retries + 1);
    }
    throw new Error(`Last.fm is down (HTTP ${res.status}) — check https://status.last.fm`);
  }

  if (res.status === 401) throw new Error(`invalid API key — run: scrobblr config -k <apikey>`);
  if (res.status === 403) throw new Error(`access forbidden — check your API key`);
  if (res.status === 400) throw new Error(`bad request — check your username or parameters`);
  if (!res.ok) throw new Error(`HTTP ${res.status} — unexpected error`);

  const data = await res.json();
  if (data.error === 6) throw new Error(`user not found: ${cfg.username}`);
  if (data.error === 10) throw new Error(`invalid API key — run: scrobblr config -k <apikey>`);
  if (data.error) throw new Error(`Last.fm error ${data.error}: ${data.message}`);
  return data;
}

export async function getUserInfo(cfg, username) {
  const key = `userinfo_${username || cfg.username}`;
  return withCache(key, () => call(cfg, "user.getinfo", { user: username || cfg.username }), TTL.LONG);
}

export async function getTopArtists(cfg, period, limit, username) {
  const key = `topartists_${username || cfg.username}_${period}_${limit}`;
  return withCache(key, () => call(cfg, "user.gettopartists", { period, limit, user: username || cfg.username }), getTTL());
}

export async function getTopTracks(cfg, period, limit, username) {
  const key = `toptracks_${username || cfg.username}_${period}_${limit}`;
  return withCache(key, () => call(cfg, "user.gettoptracks", { period, limit, user: username || cfg.username }), getTTL());
}

export async function getTopAlbums(cfg, period, limit, username) {
  const key = `topalbums_${username || cfg.username}_${period}_${limit}`;
  return withCache(key, () => call(cfg, "user.gettopalbums", { period, limit, user: username || cfg.username }), getTTL());
}

export async function getRecentTracks(cfg, limit, username) {
  const key = `recenttracks_${username || cfg.username}_${limit}`;
  return withCache(key, () => call(cfg, "user.getrecenttracks", { limit, user: username || cfg.username }), TTL.SHORT);
}

export async function getRecentTracksPage(cfg, limit, page, username) {
  const key = `recenttracks_${username || cfg.username}_${limit}_p${page}`;
  return withCache(key, () => call(cfg, "user.getrecenttracks", { limit, page, user: username || cfg.username }), TTL.SHORT);
}

export async function getLovedTracks(cfg, limit) {
  const key = `lovedtracks_${cfg.username}_${limit}`;
  return withCache(key, () => call(cfg, "user.getlovedtracks", { limit }), getTTL());
}

export async function getFriends(cfg, limit) {
  const key = `friends_${cfg.username}`;
  return withCache(key, () => call(cfg, "user.getfriends", { limit: limit || 20 }), TTL.LONG);
}

export async function getArtistInfo(cfg, artist) {
  const key = `artistinfo_${artist}`;
  return withCache(key, () => call(cfg, "artist.getinfo", { artist, user: false, username: cfg.username }), TTL.LONG);
}

export async function getSimilarArtists(cfg, artist, limit) {
  const key = `similarartists_${artist}_${limit}`;
  return withCache(key, () => call(cfg, "artist.getsimilar", { artist, limit, user: false }), TTL.LONG);
}

export async function getTopTagArtists(cfg, tag, limit) {
  const key = `toptagartists_${tag}_${limit}`;
  return withCache(key, () => call(cfg, "tag.gettopartists", { tag, limit, user: false }), TTL.LONG);
}

export async function getArtistTags(cfg, artist) {
  const key = `artisttags_${artist}`;
  return withCache(key, () => call(cfg, "artist.gettoptags", { artist, user: false }), TTL.LONG);
}

export async function getTrackInfo(cfg, track, artist) {
  return call(cfg, "track.getinfo", { track, artist, username: cfg.username, user: false });
}

export async function getWeeklyArtistChart(cfg, from, to) {
  const key = `weeklychart_${cfg.username}_${from}_${to}`;
  return withCache(key, () => {
    const params = { user: cfg.username };
    if (from) params.from = from;
    if (to) params.to = to;
    return call(cfg, "user.getweeklyartistchart", params);
  }, TTL.LONG);
}

export async function getWeeklyChartList(cfg) {
  const key = `weeklychartlist_${cfg.username}`;
  return withCache(key, () => call(cfg, "user.getweeklychartlist", {}), TTL.LONG);
}

export async function getPersonalTags(cfg, tag, taggingtype, limit) {
  const key = `personaltags_${cfg.username}_${tag}_${taggingtype}`;
  return withCache(key, () => call(cfg, "user.getpersonaltags", { tag, taggingtype, limit }), getTTL());
}
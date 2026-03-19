import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CACHE_DIR = join(homedir(), ".cache", "scrobblr");
const CFG_FILE = join(homedir(), ".config", "scrobblr", "config.json");

export const TTL = {
  NOW:     0,
  SHORT:   30 * 1000,
  DEFAULT: 5 * 60 * 1000,
  LONG:    10 * 60 * 1000,
};

function cacheFile(key) {
  return join(CACHE_DIR, key.replace(/[^a-z0-9_-]/gi, "_") + ".json");
}

export function getTTL() {
  try {
    const cfg = JSON.parse(readFileSync(CFG_FILE, "utf8"));
    const profile = cfg.default || cfg;
    if (profile.cacheTTL) return profile.cacheTTL * 60 * 1000;
  } catch {}
  return TTL.DEFAULT;
}

export function cacheGet(key) {
  const file = cacheFile(key);
  if (!existsSync(file)) return null;
  try {
    const { data, expires } = JSON.parse(readFileSync(file, "utf8"));
    if (Date.now() > expires) return null;
    return data;
  } catch {
    return null;
  }
}

export function cacheSet(key, data, ttl) {
  if (!ttl || ttl === TTL.NOW) return;
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cacheFile(key), JSON.stringify({ data, expires: Date.now() + ttl }));
}

export function cacheClear() {
  if (!existsSync(CACHE_DIR)) return 0;
  const files = readdirSync(CACHE_DIR);
  files.forEach(f => { try { unlinkSync(join(CACHE_DIR, f)); } catch {} });
  return files.length;
}

export function cacheStatus() {
  if (!existsSync(CACHE_DIR)) return { files: 0, size: 0, dir: CACHE_DIR };
  const files = readdirSync(CACHE_DIR);
  const size = files.reduce((acc, f) => {
    try { return acc + statSync(join(CACHE_DIR, f)).size; } catch { return acc; }
  }, 0);
  return { files: files.length, size, dir: CACHE_DIR };
}

export function withCache(key, fn, ttl) {
  if (!ttl || ttl === TTL.NOW) return fn();
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  return fn().then(data => {
    cacheSet(key, data, ttl);
    return data;
  });
}
import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import * as api from "../api.js";
import { c, header, num } from "../display.js";

const CACHE_DIR = join(homedir(), ".cache", "scrobblr");

// ── export ───────────────────────────────────────────────────────────────────

export async function cmdExport(cfg, opts) {
    const format = opts.format || "json";
    const output = opts.output || `scrobblr-export-${Date.now()}.${format}`;
    const maxPages = opts.full ? 50 : 10; // 200 * 50 = 10k scrobbles max for --full

    process.stdout.write(`${c.gray}fetching scrobbles (this may take a while)...${c.reset}`);

    const allTracks = [];
    let page = 1;

    while (page <= maxPages) {
        const data = await api.getRecentTracksPage(cfg, 200, page);
        const tracks = data.recenttracks.track.filter(t => !t["@attr"]?.nowplaying && t.date);
        allTracks.push(...tracks);

        const total = parseInt(data.recenttracks["@attr"].totalPages);
        process.stdout.write(`\r${c.gray}fetched page ${page}/${Math.min(total, maxPages)}...${c.reset}`);

        if (page >= total) break;
        page++;
        await sleep(200); // be nice to the API
    }

    process.stdout.write("\r\x1b[K");

    const cleaned = allTracks.map(t => ({
        artist: t.artist["#text"],
        track: t.name,
        album: t.album["#text"] || "",
        timestamp: parseInt(t.date.uts),
                                        date: new Date(parseInt(t.date.uts) * 1000).toISOString(),
    }));

    if (format === "csv") {
        const header = "artist,track,album,timestamp,date";
        const rows = cleaned.map(t =>
        [t.artist, t.track, t.album, t.timestamp, t.date]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
        );
        writeFileSync(output, [header, ...rows].join("\n"));
    } else {
        writeFileSync(output, JSON.stringify(cleaned, null, 2));
    }

    console.log(`${c.green}✓${c.reset} exported ${c.bold}${num(cleaned.length)}${c.reset} scrobbles to ${c.cyan}${output}${c.reset}`);
}

// ── backup ───────────────────────────────────────────────────────────────────

export async function cmdBackup(cfg, opts) {
    const output = opts.output || `scrobblr-backup-${cfg.username}-${Date.now()}.json`;

    process.stdout.write(`${c.gray}backing up profile...${c.reset}`);

    const [user, artists, tracks, albums, loved] = await Promise.all([
        api.getUserInfo(cfg),
                                                                     api.getTopArtists(cfg, "overall", 200),
                                                                     api.getTopTracks(cfg, "overall", 200),
                                                                     api.getTopAlbums(cfg, "overall", 200),
                                                                     api.getLovedTracks(cfg, 200),
    ]);

    const backup = {
        exportedAt: new Date().toISOString(),
        username: cfg.username,
        user: user.user,
        topArtists: artists.topartists.artist,
        topTracks: tracks.toptracks.track,
        topAlbums: albums.topalbums.album,
        lovedTracks: loved.lovedtracks.track,
    };

    process.stdout.write("\r\x1b[K");
    writeFileSync(output, JSON.stringify(backup, null, 2));
    console.log(`${c.green}✓${c.reset} backup saved to ${c.cyan}${output}${c.reset}`);
    console.log(`  ${c.gray}artists: ${num(backup.topArtists.length)} · tracks: ${num(backup.topTracks.length)} · loved: ${num(backup.lovedTracks.length)}${c.reset}`);
}

// ── stats raw ────────────────────────────────────────────────────────────────

export async function cmdStatsRaw(cfg) {
    const data = await api.getUserInfo(cfg);
    console.log(JSON.stringify(data.user, null, 2));
}

// ── cache ────────────────────────────────────────────────────────────────────

export function cmdCacheStatus() {
    header("cache");
    if (!existsSync(CACHE_DIR)) {
        console.log(`  ${c.gray}no cache found${c.reset}\n`);
        return;
    }
    const files = readdirSync(CACHE_DIR);
    const size = files.reduce((acc, f) => {
        try { return acc + statSync(join(CACHE_DIR, f)).size; } catch { return acc; }
    }, 0);
    console.log(`  ${c.gray}location  ${c.reset}${CACHE_DIR}`);
    console.log(`  ${c.gray}files     ${c.reset}${files.length}`);
    console.log(`  ${c.gray}size      ${c.reset}${(size / 1024).toFixed(1)} KB`);
    console.log();
}

export function cmdCacheClear() {
    if (!existsSync(CACHE_DIR)) {
        console.log(`${c.gray}cache already empty${c.reset}`);
        return;
    }
    const files = readdirSync(CACHE_DIR);
    files.forEach(f => { try { unlinkSync(join(CACHE_DIR, f)); } catch {} });
    console.log(`${c.green}✓${c.reset} cleared ${files.length} cached files`);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

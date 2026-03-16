#!/usr/bin/env node

import { program } from "commander";
import { getTopArtists, getTopTracks, getTopAlbums, getRecentTracks, getUserInfo, getRecentTracksPage } from "./lib/api.js";
import { printTopArtists, printTopTracks, printTopAlbums, printRecentTracks, printUserInfo, printStreak, printCompare, clearLines } from "./lib/display.js";
import { loadConfig, saveConfig } from "./lib/config.js";

const PERIODS = ["7day", "1month", "3month", "6month", "12month", "overall"];

program
.name("scrobblr")
.description("Last.fm CLI — stats, scrobbles, top charts")
.version("1.1.0");

program
.command("config")
.description("set API key and username")
.option("-k, --key <apikey>", "Last.fm API key")
.option("-u, --user <username>", "Last.fm username")
.action(async (opts) => {
    const cfg = loadConfig();
    if (opts.key) cfg.apiKey = opts.key;
    if (opts.user) cfg.username = opts.user;
    saveConfig(cfg);
    console.log("\x1b[32m✓ config saved\x1b[0m");
});

program
.command("me")
.description("show your profile stats")
.option("--json", "output raw JSON")
.action(async (opts) => {
    const cfg = requireConfig();
    const data = await getUserInfo(cfg);
    if (opts.json) return console.log(JSON.stringify(data.user, null, 2));
    printUserInfo(data);
});

program
.command("artists")
.description("top artists")
.option("-p, --period <period>", `period: ${PERIODS.join(", ")}`, "1month")
.option("-l, --limit <n>", "number of results", "10")
.option("--json", "output raw JSON")
.action(async (opts) => {
    validatePeriod(opts.period);
    const cfg = requireConfig();
    const data = await getTopArtists(cfg, opts.period, parseInt(opts.limit));
    if (opts.json) return console.log(JSON.stringify(data.topartists.artist, null, 2));
    printTopArtists(data, opts.period);
});

program
.command("tracks")
.description("top tracks")
.option("-p, --period <period>", `period: ${PERIODS.join(", ")}`, "1month")
.option("-l, --limit <n>", "number of results", "10")
.option("--json", "output raw JSON")
.action(async (opts) => {
    validatePeriod(opts.period);
    const cfg = requireConfig();
    const data = await getTopTracks(cfg, opts.period, parseInt(opts.limit));
    if (opts.json) return console.log(JSON.stringify(data.toptracks.track, null, 2));
    printTopTracks(data, opts.period);
});

program
.command("albums")
.description("top albums")
.option("-p, --period <period>", `period: ${PERIODS.join(", ")}`, "1month")
.option("-l, --limit <n>", "number of results", "10")
.option("--json", "output raw JSON")
.action(async (opts) => {
    validatePeriod(opts.period);
    const cfg = requireConfig();
    const data = await getTopAlbums(cfg, opts.period, parseInt(opts.limit));
    if (opts.json) return console.log(JSON.stringify(data.topalbums.album, null, 2));
    printTopAlbums(data, opts.period);
});

program
.command("recent")
.description("recent scrobbles")
.option("-l, --limit <n>", "number of results", "15")
.option("--live", "refresh every 30s")
.option("--json", "output raw JSON")
.action(async (opts) => {
    const cfg = requireConfig();
    const limit = parseInt(opts.limit);

    if (opts.live) {
        let lastTrack = null;
        let lineCount = 0;

        const render = async () => {
            const data = await getRecentTracks(cfg, limit);
            if (opts.json) { console.log(JSON.stringify(data.recenttracks.track, null, 2)); return; }
            const current = data.recenttracks.track[0];
            const key = current.name + current.artist["#text"];
            if (key === lastTrack && lineCount > 0) return; // no change
            if (lineCount > 0) clearLines(lineCount);
            lineCount = printRecentTracks(data, true);
            lastTrack = key;
        };

        await render();
        setInterval(render, 30000);
        return;
    }

    const data = await getRecentTracks(cfg, limit);
    if (opts.json) return console.log(JSON.stringify(data.recenttracks.track, null, 2));
    printRecentTracks(data);
});

program
.command("streak")
.description("your daily scrobble streak")
.action(async () => {
    const cfg = requireConfig();
    process.stdout.write("\x1b[90mcalculating streak...\x1b[0m");
    const streak = await calcStreak(cfg);
    process.stdout.write("\r\x1b[K");
    printStreak(streak);
});

program
.command("compare <period1> <period2>")
.description("compare top artists between two periods")
.option("-l, --limit <n>", "number of results", "5")
.action(async (period1, period2, opts) => {
    validatePeriod(period1);
    validatePeriod(period2);
    const cfg = requireConfig();
    const [d1, d2] = await Promise.all([
        getTopArtists(cfg, period1, parseInt(opts.limit)),
                                       getTopArtists(cfg, period2, parseInt(opts.limit)),
    ]);
    printCompare(d1, d2, period1, period2);
});

program.parse();

function requireConfig() {
    const cfg = loadConfig();
    if (!cfg.apiKey || !cfg.username) {
        console.error("\x1b[31m✗ run `scrobblr config -k <apikey> -u <username>` first\x1b[0m");
        process.exit(1);
    }
    return cfg;
}

function validatePeriod(p) {
    if (!PERIODS.includes(p)) {
        console.error(`\x1b[31m✗ invalid period. use: ${PERIODS.join(", ")}\x1b[0m`);
        process.exit(1);
    }
}

async function calcStreak(cfg) {
    // fetch up to 1000 recent scrobbles to calculate streak
    const data = await getRecentTracksPage(cfg, 200, 1);
    const tracks = data.recenttracks.track.filter(t => !t["@attr"]?.nowplaying);

    const days = new Set();
    for (const t of tracks) {
        if (!t.date) continue;
        const d = new Date(parseInt(t.date.uts) * 1000);
        days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 200; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (days.has(key)) streak++;
        else if (i > 0) break; // allow today to be missing (day not over)
    }
    return streak;
}

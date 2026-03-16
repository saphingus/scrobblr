#!/usr/bin/env node

import { program } from "commander";
import { loadConfig, saveConfig, listProfiles, showConfig } from "./lib/config.js";

import {
    cmdMe, cmdArtists, cmdTracks, cmdAlbums,
    cmdRecent, cmdNow, cmdStreak, cmdLoved,
    cmdCompare, cmdPeak, cmdHeatmap, cmdMilestones,
    cmdHour, cmdDay, cmdWrapped
} from "./lib/commands/stats.js";

import {
    cmdSimilar, cmdTag, cmdArtistInfo,
    cmdUnderground, cmdForgotten, cmdNew,
    cmdObsession
} from "./lib/commands/discovery.js";

import {
    cmdCompareUser, cmdCompat, cmdFriends, cmdFriendsTop
} from "./lib/commands/social.js";

import {
    cmdAuth, cmdLove, cmdUnlove, cmdBan, cmdLoveNow
} from "./lib/commands/account.js";

import {
    cmdExport, cmdBackup, cmdStatsRaw, cmdCacheStatus, cmdCacheClear
} from "./lib/commands/data.js";

import { cmdSetup } from "./lib/commands/setup.js";

const PERIODS = ["7day", "1month", "3month", "6month", "12month", "overall"];

program
.name("scrobblr")
.description("Last.fm stats in your terminal")
.version("2.0.0")
.option("--profile <name>", "use a specific config profile", "default");

// ── setup ────────────────────────────────────────────────────────────────────

program.command("setup")
.description("interactive setup wizard")
.action(() => {
    const profile = program.opts().profile;
    cmdSetup(loadConfig(profile), (cfg) => saveConfig(cfg, profile)).catch(err => {
        console.error(`\x1b[31m✗ ${err.message}\x1b[0m`);
        process.exit(1);
    });
});

// ── config ──────────────────────────────────────────────────────────────────

program
.command("config")
.description("set API key and username")
.option("-k, --key <apikey>", "Last.fm API key")
.option("-u, --user <username>", "Last.fm username")
.option("--show", "show current config")
.option("--reset", "reset current profile config")
.option("--profiles", "list all profiles")
.option("--secret <secret>", "Last.fm API secret (for write operations)")
.action((opts) => {
    const profile = program.opts().profile;
    if (opts.profiles) {
        console.log(listProfiles().join("\n"));
        return;
    }
    const cfg = loadConfig(profile);
    if (opts.show) return showConfig(cfg);
    if (opts.reset) { saveConfig({}, profile); console.log("\x1b[32m✓ config reset\x1b[0m"); return; }
    if (opts.key) cfg.apiKey = opts.key;
    if (opts.user) cfg.username = opts.user;
    if (opts.secret) cfg.secret = opts.secret;
    saveConfig(cfg, profile);
    console.log("\x1b[32m✓ config saved\x1b[0m");
});

// ── stats ────────────────────────────────────────────────────────────────────

program.command("me")
.description("profile overview")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdMe));

program.command("artists")
.description("top artists")
.option("-p, --period <period>", `period`, "1month")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action(opts => { validatePeriod(opts.period); run(opts, cmdArtists); });

program.command("tracks")
.description("top tracks")
.option("-p, --period <period>", `period`, "1month")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action(opts => { validatePeriod(opts.period); run(opts, cmdTracks); });

program.command("albums")
.description("top albums")
.option("-p, --period <period>", `period`, "1month")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action(opts => { validatePeriod(opts.period); run(opts, cmdAlbums); });

program.command("recent")
.description("recent scrobbles")
.option("-l, --limit <n>", "results", "15")
.option("--live", "auto-refresh every 30s")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdRecent));

program.command("now")
.description("now playing")
.option("--info", "show track details")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdNow));

program.command("streak")
.description("daily scrobble streak")
.action(opts => run(opts, cmdStreak));

program.command("loved")
.description("loved tracks")
.option("-l, --limit <n>", "results", "20")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdLoved));

program.command("compare <period1> <period2>")
.description("compare top artists between two periods")
.option("-l, --limit <n>", "results", "5")
.action((p1, p2, opts) => { validatePeriod(p1); validatePeriod(p2); runWith(opts, (cfg, o) => cmdCompare(cfg, p1, p2, o)); });

program.command("peak")
.description("your peak listening days")
.action(opts => run(opts, cmdPeak));

program.command("heatmap")
.description("scrobble heatmap (last 12 weeks)")
.action(opts => run(opts, cmdHeatmap));

program.command("milestones")
.description("scrobble milestones")
.action(opts => run(opts, cmdMilestones));

program.command("hour")
.description("listening activity by hour")
.action(opts => run(opts, cmdHour));

program.command("day")
.description("listening activity by day of week")
.action(opts => run(opts, cmdDay));

program.command("wrapped")
.description("your annual wrapped")
.option("-y, --year <year>", "year")
.action(opts => run(opts, cmdWrapped));

// ── discovery ────────────────────────────────────────────────────────────────

program.command("similar <artist>")
.description("artists similar to <artist>")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action((artist, opts) => runWith(opts, (cfg, o) => cmdSimilar(cfg, artist, o)));

program.command("tag <tag>")
.description("top artists for a tag/genre")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action((tag, opts) => runWith(opts, (cfg, o) => cmdTag(cfg, tag, o)));

program.command("artist <name>")
.description("deep dive on an artist")
.option("--json", "raw JSON")
.action((name, opts) => runWith(opts, (cfg, o) => cmdArtistInfo(cfg, name, o)));

program.command("underground")
.description("artists you love with few global listeners")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdUnderground));

program.command("forgotten")
.description("artists you used to listen to but stopped")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdForgotten));

program.command("new")
.description("artists you discovered this month")
.option("-l, --limit <n>", "results", "10")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdNew));

program.command("obsession")
.description("your current listening obsession")
.action(opts => run(opts, cmdObsession));

// ── social ───────────────────────────────────────────────────────────────────

program.command("compare-user <user1> <user2>")
.description("compare two Last.fm profiles")
.option("-p, --period <period>", "period", "1month")
.option("-l, --limit <n>", "results", "5")
.action((u1, u2, opts) => { validatePeriod(opts.period); runWith(opts, (cfg, o) => cmdCompareUser(cfg, u1, u2, o)); });

program.command("compat <user>")
.description("musical compatibility score with another user")
.option("-p, --period <period>", "period", "overall")
.action((user, opts) => runWith(opts, (cfg, o) => cmdCompat(cfg, user, o)));

program.command("friends")
.description("see what your friends are listening to")
.option("--json", "raw JSON")
.action(opts => run(opts, cmdFriends));

program.command("friends-top")
.description("friends' top artists")
.option("-p, --period <period>", "period", "1month")
.action(opts => run(opts, cmdFriendsTop));

// ── account ──────────────────────────────────────────────────────────────────

program.command("auth")
.description("authenticate for write operations (love, unlove, ban)")
.action(() => {
    const cfg = requireConfig();
    cmdAuth(cfg, {}, (c) => saveConfig(c, program.opts().profile), loadConfig).catch(err => {
        console.error(`\x1b[31m✗ ${err.message}\x1b[0m`);
        process.exit(1);
    });
});

program.command("love <track> <artist>")
.description("love a track")
.action((track, artist) => runWith({}, (cfg) => cmdLove(cfg, track, artist)));

program.command("unlove <track> <artist>")
.description("unlove a track")
.action((track, artist) => runWith({}, (cfg) => cmdUnlove(cfg, track, artist)));

program.command("ban <track> <artist>")
.description("ban a track")
.action((track, artist) => runWith({}, (cfg) => cmdBan(cfg, track, artist)));

program.command("love-now")
.description("love the currently playing track")
.action(() => runWith({}, cmdLoveNow));

// ── data ─────────────────────────────────────────────────────────────────────

program.command("export")
.description("export your scrobbles to JSON or CSV")
.option("-f, --format <fmt>", "json or csv", "json")
.option("-o, --output <file>", "output filename")
.option("--full", "export up to 10,000 scrobbles (slow)")
.action(opts => run(opts, cmdExport));

program.command("backup")
.description("backup your full profile (top artists, tracks, albums, loved)")
.option("-o, --output <file>", "output filename")
.action(opts => run(opts, cmdBackup));

program.command("stats-raw")
.description("dump raw profile stats as JSON")
.action(opts => run(opts, cmdStatsRaw));

program.command("cache")
.description("manage local cache")
.option("--clear", "clear all cached data")
.option("--status", "show cache info")
.action(opts => {
    if (opts.clear) return cmdCacheClear();
    cmdCacheStatus();
});

program.parse();

// ── helpers ──────────────────────────────────────────────────────────────────

function requireConfig() {
    const profile = program.opts().profile;
    const cfg = loadConfig(profile);
    if (!cfg.apiKey || !cfg.username) {
        console.error("\x1b[31m✗ run `scrobblr setup` or `scrobblr config -k <apikey> -u <username>` first\x1b[0m");
        process.exit(1);
    }
    return cfg;
}

function run(opts, fn) {
    const cfg = requireConfig();
    fn(cfg, opts).catch(err => {
        console.error(`\x1b[31m✗ ${err.message}\x1b[0m`);
        process.exit(1);
    });
}

function runWith(opts, fn) {
    const cfg = requireConfig();
    fn(cfg, opts).catch(err => {
        console.error(`\x1b[31m✗ ${err.message}\x1b[0m`);
        process.exit(1);
    });
}

function validatePeriod(p) {
    if (!PERIODS.includes(p)) {
        console.error(`\x1b[31m✗ invalid period. use: ${PERIODS.join(", ")}\x1b[0m`);
        process.exit(1);
    }
}

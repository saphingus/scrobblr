import { createHash } from "crypto";
import { c, header, num } from "../display.js";

const BASE = "https://ws.audioscrobbler.com/2.0/";

function sign(params, secret) {
    const keys = Object.keys(params).filter(k => k !== "format").sort();
    const str = keys.map(k => k + params[k]).join("") + secret;
    return createHash("md5").update(str, "utf8").digest("hex");
}

async function signedCall(cfg, method, params = {}) {
    if (!cfg.secret) {
        throw new Error("write operations require your Last.fm API secret.\nrun: scrobblr config --secret <your_api_secret>");
    }

    const allParams = {
        method,
        api_key: cfg.apiKey,
        sk: cfg.sessionKey,
        ...params,
    };

    const sig = sign(allParams, cfg.secret);

    const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ...allParams, api_sig: sig, format: "json" }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(`Last.fm: ${data.message}`);
    return data;
}

async function getSession(cfg) {
    if (!cfg.secret) {
        throw new Error("session auth requires your Last.fm API secret.\nrun: scrobblr config --secret <your_api_secret>");
    }

    const params = {
        method: "auth.getMobileSession",
        api_key: cfg.apiKey,
        username: cfg.username,
        password: cfg.password,
    };

    const sig = sign(params, cfg.secret);

    const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ...params, api_sig: sig, format: "json" }),
    });

    const data = await res.json();
    if (data.error) throw new Error(`Last.fm auth: ${data.message}`);
    return data.session.key;
}

export async function cmdAuth(cfg, opts, saveConfig, loadConfig) {
    if (!cfg.secret) {
        console.error(`\x1b[31m✗ set your API secret first:\x1b[0m`);
        console.error(`  scrobblr config --secret <your_api_secret>`);
        console.error(`  get it at: https://www.last.fm/api/account/create`);
        process.exit(1);
    }

    const { default: readline } = await import("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const password = await new Promise(resolve => {
        process.stdout.write("Last.fm password: ");
        process.stdin.setRawMode?.(true);
        let pw = "";
        process.stdin.on("data", function handler(ch) {
            ch = ch.toString();
            if (ch === "\n" || ch === "\r") {
                process.stdin.setRawMode?.(false);
                process.stdin.removeListener("data", handler);
                process.stdout.write("\n");
                resolve(pw);
            } else if (ch === "\x7f") {
                pw = pw.slice(0, -1);
            } else {
                pw += ch;
            }
        });
    });
    rl.close();

    process.stdout.write(`${c.gray}authenticating...${c.reset}`);
    try {
        cfg.password = password;
        const sk = await getSession(cfg);
        delete cfg.password;
        cfg.sessionKey = sk;
        saveConfig(cfg);
        process.stdout.write("\r\x1b[K");
        console.log(`\x1b[32m✓ authenticated — session key saved\x1b[0m`);
    } catch (err) {
        process.stdout.write("\r\x1b[K");
        console.error(`\x1b[31m✗ ${err.message}\x1b[0m`);
    }
}

export async function cmdLove(cfg, trackName, artistName) {
    requireSession(cfg);
    process.stdout.write(`${c.gray}loving track...${c.reset}`);
    await signedCall(cfg, "track.love", { track: trackName, artist: artistName });
    process.stdout.write("\r\x1b[K");
    console.log(`${c.green}♥ loved:${c.reset} ${c.bold}${trackName}${c.reset} ${c.gray}by ${artistName}${c.reset}`);
}

export async function cmdUnlove(cfg, trackName, artistName) {
    requireSession(cfg);
    process.stdout.write(`${c.gray}unloving track...${c.reset}`);
    await signedCall(cfg, "track.unlove", { track: trackName, artist: artistName });
    process.stdout.write("\r\x1b[K");
    console.log(`${c.gray}unloved:${c.reset} ${c.bold}${trackName}${c.reset} ${c.gray}by ${artistName}${c.reset}`);
}

export async function cmdBan(cfg, trackName, artistName) {
    requireSession(cfg);
    process.stdout.write(`${c.gray}banning track...${c.reset}`);
    await signedCall(cfg, "track.ban", { track: trackName, artist: artistName });
    process.stdout.write("\r\x1b[K");
    console.log(`${c.red}✗ banned:${c.reset} ${c.bold}${trackName}${c.reset} ${c.gray}by ${artistName}${c.reset}`);
}

export async function cmdLoveNow(cfg) {
    requireSession(cfg);
    const { getRecentTracks } = await import("../api.js");
    const data = await getRecentTracks(cfg, 1);
    const t = data.recenttracks.track[0];
    if (!t["@attr"]?.nowplaying) {
        console.log(`${c.gray}nothing playing right now${c.reset}`);
        return;
    }
    await cmdLove(cfg, t.name, t.artist["#text"]);
}

function requireSession(cfg) {
    if (!cfg.sessionKey) {
        console.error(`\x1b[31m✗ not authenticated. run: scrobblr auth\x1b[0m`);
        process.exit(1);
    }
}

import * as api from "../api.js";
import { c, PERIOD_LABEL, header, bar, num, clearLines, ago, formatDate } from "../display.js";

export async function cmdMe(cfg, opts) {
    const data = await api.getUserInfo(cfg);
    const u = data.user;
    if (opts.json) return console.log(JSON.stringify(u, null, 2));
    if (opts.compact) {
        console.log(`${c.bold}${u.name}${c.reset} ${c.gray}·${c.reset} ${c.bold}${num(u.playcount)}${c.reset} scrobbles ${c.gray}·${c.reset} ${num(u.artist_count)} artists ${c.gray}·${c.reset} ${u.country || "—"}`);
        return;
    }
    header(u.name);
    console.log(`  ${c.gray}registered   ${c.reset}${formatDate(u.registered["#text"])}`);
    console.log(`  ${c.gray}scrobbles    ${c.reset}${c.bold}${num(u.playcount)}${c.reset}`);
    console.log(`  ${c.gray}artists      ${c.reset}${num(u.artist_count)}`);
    console.log(`  ${c.gray}albums       ${c.reset}${num(u.album_count)}`);
    console.log(`  ${c.gray}tracks       ${c.reset}${num(u.track_count)}`);
    console.log(`  ${c.gray}country      ${c.reset}${u.country || "—"}`);
    console.log(`  ${c.gray}url          ${c.reset}${c.dim}${u.url}${c.reset}`);
    console.log();
}

export async function cmdArtists(cfg, opts) {
    const data = await api.getTopArtists(cfg, opts.period, parseInt(opts.limit));
    const artists = data.topartists.artist;
    if (opts.json) return console.log(JSON.stringify(artists, null, 2));
    const max = parseInt(artists[0].playcount);
    header(`top artists`, `— ${PERIOD_LABEL[opts.period]}`);
    artists.forEach((a, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        const plays = parseInt(a.playcount);
        console.log(`  ${rank} ${bar(plays, max)} ${c.bold}${a.name}${c.reset} ${c.gray}${num(plays)} plays${c.reset}`);
    });
    console.log();
}

export async function cmdTracks(cfg, opts) {
    const data = await api.getTopTracks(cfg, opts.period, parseInt(opts.limit));
    const tracks = data.toptracks.track;
    if (opts.json) return console.log(JSON.stringify(tracks, null, 2));
    const max = parseInt(tracks[0].playcount);
    header(`top tracks`, `— ${PERIOD_LABEL[opts.period]}`);
    tracks.forEach((t, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        const plays = parseInt(t.playcount);
        console.log(`  ${rank} ${bar(plays, max)} ${c.bold}${t.name}${c.reset} ${c.gray}by ${t.artist.name} — ${num(plays)} plays${c.reset}`);
    });
    console.log();
}

export async function cmdAlbums(cfg, opts) {
    const data = await api.getTopAlbums(cfg, opts.period, parseInt(opts.limit));
    const albums = data.topalbums.album;
    if (opts.json) return console.log(JSON.stringify(albums, null, 2));
    const max = parseInt(albums[0].playcount);
    header(`top albums`, `— ${PERIOD_LABEL[opts.period]}`);
    albums.forEach((a, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        const plays = parseInt(a.playcount);
        console.log(`  ${rank} ${bar(plays, max)} ${c.bold}${a.name}${c.reset} ${c.gray}by ${a.artist.name} — ${num(plays)} plays${c.reset}`);
    });
    console.log();
}

export async function cmdRecent(cfg, opts) {
    const limit = parseInt(opts.limit);
    const artistFilter = opts.artist?.toLowerCase();

    if (opts.live) {
        let lastKey = null;
        let lineCount = 0;
        const render = async () => {
            const data = await api.getRecentTracks(cfg, limit);
            let tracks = data.recenttracks.track;
            if (artistFilter) tracks = tracks.filter(t => t.artist["#text"].toLowerCase().includes(artistFilter));
            const key = tracks[0]?.name + tracks[0]?.artist["#text"];
            if (key === lastKey && lineCount > 0) return;
            if (lineCount > 0) clearLines(lineCount);
            lineCount = printRecent(tracks, true);
            lastKey = key;
        };
        await render();
        setInterval(render, 30000);
        return;
    }

    const data = await api.getRecentTracks(cfg, limit);
    let tracks = data.recenttracks.track;
    if (artistFilter) tracks = tracks.filter(t => t.artist["#text"].toLowerCase().includes(artistFilter));
    if (opts.json) return console.log(JSON.stringify(tracks, null, 2));
    printRecent(tracks);
}

function printRecent(tracks, returnCount = false) {
    let lines = 0;
    header("recent scrobbles");
    lines += 2;
    if (!tracks.length) {
        console.log(`  ${c.gray}no tracks found${c.reset}`);
        lines++;
    }
    tracks.forEach((t) => {
        const isNow = t["@attr"]?.nowplaying === "true";
        const time = isNow
        ? `${c.green}▶ now playing${c.reset}`
        : `${c.gray}${ago(t.date?.uts)}${c.reset}`;
        console.log(`  ${time}`);
        console.log(`    ${c.bold}${t.name}${c.reset} ${c.gray}— ${t.artist["#text"]}${c.reset}`);
        lines += 2;
    });
    console.log();
    lines++;
    return returnCount ? lines : undefined;
}

export async function cmdNow(cfg, opts) {
    const data = await api.getRecentTracks(cfg, 1);
    const tracks = data.recenttracks.track;
    const t = tracks[0];
    const isNow = t["@attr"]?.nowplaying === "true";

    if (opts.json) return console.log(JSON.stringify(t, null, 2));

    header("now playing");
    if (!isNow) {
        console.log(`  ${c.gray}nothing playing - last scrobble:${c.reset}`);
    }
    console.log(`  ${c.bold}${t.name}${c.reset}`);
    console.log(`  ${c.gray}by ${c.reset}${t.artist["#text"]}`);
    console.log(`  ${c.gray}on ${c.reset}${t.album["#text"] || "—"}`);
    if (!isNow && t.date) console.log(`  ${c.gray}${ago(t.date.uts)}${c.reset}`);

    if (opts.info) {
        try {
            const info = await api.getTrackInfo(cfg, t.name, t.artist["#text"]);
            const tr = info.track;
            console.log(`  ${c.gray}listeners    ${c.reset}${num(tr.listeners)}`);
            console.log(`  ${c.gray}playcount    ${c.reset}${num(tr.playcount)}`);
            console.log(`  ${c.gray}your plays   ${c.reset}${num(tr.userplaycount || 0)}`);
            if (tr.toptags?.tag?.length) {
                const tags = tr.toptags.tag.slice(0, 4).map(t => t.name).join(` ${c.gray}·${c.reset} `);
                console.log(`  ${c.gray}tags         ${c.reset}${tags}`);
            }
        } catch {}
    }

    if (opts.love) {
        if (!cfg.sessionKey) {
            console.log(`\n  ${c.red}✗ not authenticated. run: scrobblr auth${c.reset}`);
        } else {
            try {
                const { cmdLove } = await import("./account.js");
                await cmdLove(cfg, t.name, t.artist["#text"]);
            } catch (err) {
                console.log(`\n  ${c.red}✗ ${err.message}${c.reset}`);
            }
        }
    }

    console.log();
}

export async function cmdStreak(cfg) {
    process.stdout.write(`${c.gray}calculating streak...${c.reset}`);
    const streak = await calcStreak(cfg);
    process.stdout.write("\r\x1b[K");
    header("scrobble streak");
    if (streak === 0) {
        console.log(`  ${c.gray}no streak - go scrobble something${c.reset}`);
    } else {
        const flame = streak >= 30 ? "🔥" : streak >= 7 ? "✦" : "·";
        console.log(`  ${c.bold}${c.yellow}${streak} day${streak > 1 ? "s" : ""}${c.reset} ${flame}`);
    }
    console.log();
}

async function calcStreak(cfg) {
    const data = await api.getRecentTracksPage(cfg, 200, 1);
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
        else if (i > 0) break;
    }
    return streak;
}

export async function cmdLoved(cfg, opts) {
    const data = await api.getLovedTracks(cfg, parseInt(opts.limit) || 20);
    const tracks = data.lovedtracks.track;
    if (opts.json) return console.log(JSON.stringify(tracks, null, 2));
    header("loved tracks");
    tracks.forEach((t, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        console.log(`  ${rank} ${c.bold}${t.name}${c.reset} ${c.gray}— ${t.artist.name}${c.reset}`);
    });
    console.log();
}

export async function cmdCompare(cfg, period1, period2, opts) {
    const [d1, d2] = await Promise.all([
        api.getTopArtists(cfg, period1, parseInt(opts.limit) || 5),
                                       api.getTopArtists(cfg, period2, parseInt(opts.limit) || 5),
    ]);
    const a1 = d1.topartists.artist;
    const a2 = d2.topartists.artist;
    const label1 = PERIOD_LABEL[period1];
    const label2 = PERIOD_LABEL[period2];
    const colW = 32;
    console.log(`\n${c.bold}${c.cyan}${label1.padEnd(colW)}  ${label2}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(colW * 2 + 2)}${c.reset}`);
    const max = Math.max(a1.length, a2.length);
    for (let i = 0; i < max; i++) {
        const left = a1[i] ? `${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a1[i].name}${c.reset} ${c.gray}${num(a1[i].playcount)}${c.reset}` : "";
        const right = a2[i] ? `${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a2[i].name}${c.reset} ${c.gray}${num(a2[i].playcount)}${c.reset}` : "";
        const leftRaw = a1[i] ? `${String(i+1).padStart(2)}. ${a1[i].name} ${num(a1[i].playcount)}` : "";
        const pad = Math.max(1, colW - leftRaw.length);
        console.log(`  ${left}${" ".repeat(pad)}  ${right}`);
    }
    console.log();
}

export async function cmdPeak(cfg) {
    process.stdout.write(`${c.gray}fetching data...${c.reset}`);
    const [p1, p2, p3, p4, p5] = await Promise.all([
        api.getRecentTracksPage(cfg, 200, 1),
                                                   api.getRecentTracksPage(cfg, 200, 2),
                                                   api.getRecentTracksPage(cfg, 200, 3),
                                                   api.getRecentTracksPage(cfg, 200, 4),
                                                   api.getRecentTracksPage(cfg, 200, 5),
    ]);
    process.stdout.write("\r\x1b[K");

    const allTracks = [
        ...p1.recenttracks.track,
        ...p2.recenttracks.track,
        ...p3.recenttracks.track,
        ...p4.recenttracks.track,
        ...p5.recenttracks.track,
    ].filter(t => !t["@attr"]?.nowplaying && t.date);

    const days = {};
    for (const t of allTracks) {
        const d = new Date(parseInt(t.date.uts) * 1000);
        const key = d.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
        days[key] = (days[key] || 0) + 1;
    }

    const sorted = Object.entries(days).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = sorted[0]?.[1] || 1;

    header("peak days", "(last 1000 scrobbles)");
    sorted.forEach(([date, count], i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        console.log(`  ${rank} ${bar(count, max)} ${c.bold}${date}${c.reset} ${c.gray}${count} scrobbles${c.reset}`);
    });
    console.log();
}

export async function cmdHeatmap(cfg) {
    process.stdout.write(`${c.gray}building heatmap...${c.reset}`);
    const pages = await Promise.all([1,2,3,4,5].map(p => api.getRecentTracksPage(cfg, 200, p)));
    process.stdout.write("\r\x1b[K");

    const allTracks = pages.flatMap(p => p.recenttracks.track)
    .filter(t => !t["@attr"]?.nowplaying && t.date);

    const days = {};
    for (const t of allTracks) {
        const d = new Date(parseInt(t.date.uts) * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        days[key] = (days[key] || 0) + 1;
    }

    const max = Math.max(...Object.values(days), 1);
    const blocks = ["░", "▒", "▓", "█"];

    const today = new Date();
    const weeks = 12;
    header("heatmap", "(last 12 weeks)");
    console.log(`  ${c.gray}Mon Wed Fri Sun${c.reset}`);

    for (let w = weeks - 1; w >= 0; w--) {
        let row = "  ";
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + (6 - d)));
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
            const count = days[key] || 0;
            const level = count === 0 ? 0 : Math.min(3, Math.ceil((count / max) * 3));
            const intensity = count === 0 ? `${c.gray}░${c.reset}` : `${c.pink}${blocks[level]}${c.reset}`;
            row += intensity + " ";
        }
        process.stdout.write(row + "\n");
    }
    console.log();
}

export async function cmdMilestones(cfg) {
    const data = await api.getUserInfo(cfg);
    const total = parseInt(data.user.playcount);
    const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

    header("milestones");
    milestones.forEach(m => {
        const reached = total >= m;
        const icon = reached ? `${c.green}✓${c.reset}` : `${c.gray}·${c.reset}`;
        const label = reached ? `${c.bold}${num(m)}${c.reset}` : `${c.gray}${num(m)}${c.reset}`;
        console.log(`  ${icon} ${label}`);
    });
    console.log(`\n  ${c.gray}current: ${c.reset}${c.bold}${c.yellow}${num(total)}${c.reset}`);
    const next = milestones.find(m => m > total);
    if (next) console.log(`  ${c.gray}next:    ${c.reset}${num(next - total)} to go`);
    console.log();
}

export async function cmdHour(cfg) {
    process.stdout.write(`${c.gray}analysing listening patterns...${c.reset}`);
    const pages = await Promise.all([1,2,3,4,5].map(p => api.getRecentTracksPage(cfg, 200, p)));
    process.stdout.write("\r\x1b[K");

    const hours = new Array(24).fill(0);
    pages.flatMap(p => p.recenttracks.track)
    .filter(t => !t["@attr"]?.nowplaying && t.date)
    .forEach(t => {
        const h = new Date(parseInt(t.date.uts) * 1000).getHours();
        hours[h]++;
    });

    const max = Math.max(...hours, 1);
    header("listening by hour");
    for (let h = 0; h < 24; h++) {
        const label = `${String(h).padStart(2, "0")}h`;
        const b = bar(hours[h], max, 30);
        console.log(`  ${c.gray}${label}${c.reset} ${b} ${c.gray}${hours[h]}${c.reset}`);
    }
    console.log();
}

export async function cmdDay(cfg) {
    process.stdout.write(`${c.gray}analysing listening patterns...${c.reset}`);
    const pages = await Promise.all([1,2,3,4,5].map(p => api.getRecentTracksPage(cfg, 200, p)));
    process.stdout.write("\r\x1b[K");

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = new Array(7).fill(0);
    pages.flatMap(p => p.recenttracks.track)
    .filter(t => !t["@attr"]?.nowplaying && t.date)
    .forEach(t => {
        const d = new Date(parseInt(t.date.uts) * 1000).getDay();
        days[d]++;
    });

    const max = Math.max(...days, 1);
    header("listening by day");
    days.forEach((count, i) => {
        console.log(`  ${c.gray}${dayNames[i]}${c.reset} ${bar(count, max, 30)} ${c.gray}${count}${c.reset}`);
    });
    console.log();
}

export async function cmdWrapped(cfg, opts) {
    const year = opts.year || new Date().getFullYear() - (new Date().getMonth() < 11 ? 1 : 0);
    process.stdout.write(`${c.gray}building ${year} wrapped...${c.reset}`);

    const [artists, tracks, albums, user] = await Promise.all([
        api.getTopArtists(cfg, "12month", 5),
                                                              api.getTopTracks(cfg, "12month", 5),
                                                              api.getTopAlbums(cfg, "12month", 3),
                                                              api.getUserInfo(cfg),
    ]);
    process.stdout.write("\r\x1b[K");

    console.log(`\n${c.bold}${c.pink}✦ ${year} wrapped — ${user.user.name}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(30)}${c.reset}`);

    const topArtists = artists.topartists.artist;
    console.log(`\n  ${c.bold}${c.cyan}top artists${c.reset}`);
    topArtists.forEach((a, i) => {
        console.log(`  ${c.gray}${i+1}.${c.reset} ${c.bold}${a.name}${c.reset} ${c.gray}${num(a.playcount)} plays${c.reset}`);
    });

    const topTracks = tracks.toptracks.track;
    console.log(`\n  ${c.bold}${c.cyan}top tracks${c.reset}`);
    topTracks.forEach((t, i) => {
        console.log(`  ${c.gray}${i+1}.${c.reset} ${c.bold}${t.name}${c.reset} ${c.gray}— ${t.artist.name}${c.reset}`);
    });

    const topAlbums = albums.topalbums.album;
    console.log(`\n  ${c.bold}${c.cyan}top albums${c.reset}`);
    topAlbums.forEach((a, i) => {
        console.log(`  ${c.gray}${i+1}.${c.reset} ${c.bold}${a.name}${c.reset} ${c.gray}— ${a.artist.name}${c.reset}`);
    });

    console.log();
}

export async function cmdShare(cfg, opts) {
    const period = opts.period || "7day";
    process.stdout.write(`${c.gray}generating summary...${c.reset}`);

    const [user, artists, streak] = await Promise.all([
        api.getUserInfo(cfg),
                                                      api.getTopArtists(cfg, period, 5),
                                                      calcStreak(cfg),
    ]);

    process.stdout.write("\r\x1b[K");

    const u = user.user;
    const top = artists.topartists.artist;
    const periodLabel = {
        "7day": "last 7 days", "1month": "last month", "3month": "last 3 months",
        "6month": "last 6 months", "12month": "last year", "overall": "all time"
    }[period];

    const lines = [
        `🎵 ${u.name} — ${periodLabel}`,
        top.map((a, i) => `#${i+1} ${a.name} · ${num(a.playcount)} plays`).join("\n"),
        ``,
        `${num(u.playcount)} total scrobbles · ${streak} day streak`,
        `last.fm/user/${u.name}`,
    ];

    const summary = lines.join("\n");

    if (opts.json) return console.log(JSON.stringify({ summary, user: u.name, period }, null, 2));

    console.log(`\n${c.gray}─────────────────────────${c.reset}`);
    console.log(summary);
    console.log(`${c.gray}─────────────────────────${c.reset}`);
    console.log(`\n  ${c.gray}copy and share wherever${c.reset}\n`);
}

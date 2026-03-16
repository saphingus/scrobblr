const c = {
    reset:  "\x1b[0m",
    bold:   "\x1b[1m",
    dim:    "\x1b[2m",
    red:    "\x1b[31m",
    green:  "\x1b[32m",
    yellow: "\x1b[33m",
    cyan:   "\x1b[36m",
    white:  "\x1b[37m",
    gray:   "\x1b[90m",
    pink:   "\x1b[35m",
};

const PERIOD_LABEL = {
    "7day":    "last 7 days",
    "1month":  "last month",
    "3month":  "last 3 months",
    "6month":  "last 6 months",
    "12month": "last year",
    "overall": "all time",
};

function header(text) {
    console.log(`\n${c.bold}${c.cyan}${text}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(text.length)}${c.reset}`);
    return 2;
}

function bar(plays, max, width = 20) {
    const filled = Math.round((plays / max) * width);
    return `${c.pink}${"█".repeat(filled)}${c.gray}${"░".repeat(width - filled)}${c.reset}`;
}

function num(n) {
    return parseInt(n).toLocaleString("en");
}

export function clearLines(n) {
    for (let i = 0; i < n; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
    }
}

export function printUserInfo(data) {
    const u = data.user;
    header(`${u.name}`);
    console.log(`  ${c.gray}registered  ${c.reset}${new Date(u.registered["#text"] * 1000).toLocaleDateString()}`);
    console.log(`  ${c.gray}scrobbles   ${c.reset}${c.bold}${num(u.playcount)}${c.reset}`);
    console.log(`  ${c.gray}artists     ${c.reset}${num(u.artist_count)}`);
    console.log(`  ${c.gray}albums      ${c.reset}${num(u.album_count)}`);
    console.log(`  ${c.gray}tracks      ${c.reset}${num(u.track_count)}`);
    console.log(`  ${c.gray}country     ${c.reset}${u.country || "—"}`);
    console.log();
}

export function printTopArtists(data, period) {
    const artists = data.topartists.artist;
    const max = parseInt(artists[0].playcount);
    header(`top artists — ${PERIOD_LABEL[period]}`);
    artists.forEach((a, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        const plays = parseInt(a.playcount);
        console.log(`  ${rank} ${bar(plays, max)} ${c.bold}${a.name}${c.reset} ${c.gray}${num(plays)} plays${c.reset}`);
    });
    console.log();
}

export function printTopTracks(data, period) {
    const tracks = data.toptracks.track;
    const max = parseInt(tracks[0].playcount);
    header(`top tracks — ${PERIOD_LABEL[period]}`);
    tracks.forEach((t, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        const plays = parseInt(t.playcount);
        console.log(`  ${rank} ${bar(plays, max)} ${c.bold}${t.name}${c.reset} ${c.gray}by ${t.artist.name} — ${num(plays)} plays${c.reset}`);
    });
    console.log();
}

export function printTopAlbums(data, period) {
    const albums = data.topalbums.album;
    const max = parseInt(albums[0].playcount);
    header(`top albums — ${PERIOD_LABEL[period]}`);
    albums.forEach((a, i) => {
        const rank = `${c.gray}${String(i + 1).padStart(2)}.${c.reset}`;
        const plays = parseInt(a.playcount);
        console.log(`  ${rank} ${bar(plays, max)} ${c.bold}${a.name}${c.reset} ${c.gray}by ${a.artist.name} — ${num(plays)} plays${c.reset}`);
    });
    console.log();
}

// returns line count for live mode
export function printRecentTracks(data, returnCount = false) {
    const tracks = data.recenttracks.track;
    let lines = 0;

    const label = "recent scrobbles";
    console.log(`\n${c.bold}${c.cyan}${label}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(label.length)}${c.reset}`);
    lines += 3;

    tracks.forEach((t) => {
        const isNowPlaying = t["@attr"]?.nowplaying === "true";
        const time = isNowPlaying
        ? `${c.green}▶ now playing${c.reset}`
        : `${c.gray}${new Date(parseInt(t.date?.uts) * 1000).toLocaleString()}${c.reset}`;
        console.log(`  ${time}`);
        console.log(`    ${c.bold}${t.name}${c.reset} ${c.gray}— ${t.artist["#text"]}${c.reset}`);
        lines += 2;
    });
    console.log();
    lines += 1;

    return returnCount ? lines : undefined;
}

export function printStreak(days) {
    const label = "scrobble streak";
    console.log(`\n${c.bold}${c.cyan}${label}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(label.length)}${c.reset}`);

    if (days === 0) {
        console.log(`  ${c.gray}no streak — go scrobble something${c.reset}`);
    } else {
        const flame = days >= 30 ? "🔥" : days >= 7 ? "✦" : "·";
        console.log(`  ${c.bold}${c.yellow}${days} day${days > 1 ? "s" : ""}${c.reset} ${flame}`);
    }
    console.log();
}

export function printCompare(d1, d2, period1, period2) {
    const a1 = d1.topartists.artist;
    const a2 = d2.topartists.artist;
    const label1 = PERIOD_LABEL[period1];
    const label2 = PERIOD_LABEL[period2];

    const colW = 30;
    console.log(`\n${c.bold}${c.cyan}${label1.padEnd(colW)}  ${label2}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(colW * 2 + 2)}${c.reset}`);

    const max = Math.max(a1.length, a2.length);
    for (let i = 0; i < max; i++) {
        const left  = a1[i] ? `${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a1[i].name}${c.reset} ${c.gray}${num(a1[i].playcount)}${c.reset}` : "";
        const right = a2[i] ? `${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a2[i].name}${c.reset} ${c.gray}${num(a2[i].playcount)}${c.reset}` : "";
        // strip ansi for padding calculation
        const leftRaw = a1[i] ? `${String(i+1).padStart(2)}. ${a1[i].name} ${num(a1[i].playcount)}` : "";
        const pad = colW - leftRaw.length;
        console.log(`  ${left}${" ".repeat(Math.max(1, pad))}  ${right}`);
    }
    console.log();
}

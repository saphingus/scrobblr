import * as api from "../api.js";
import { c, PERIOD_LABEL, header, bar, num } from "../display.js";

export async function cmdCompareUser(cfg, user1, user2, opts) {
    const period = opts.period || "1month";
    const limit = parseInt(opts.limit) || 5;

    process.stdout.write(`${c.gray}fetching profiles...${c.reset}`);

    const [u1info, u2info, u1artists, u2artists] = await Promise.all([
        api.getUserInfo(cfg, user1),
                                                                     api.getUserInfo(cfg, user2),
                                                                     api.getTopArtists({ ...cfg, username: user1 }, period, limit, user1),
                                                                     api.getTopArtists({ ...cfg, username: user2 }, period, limit, user2),
    ]);

    process.stdout.write("\r\x1b[K");

    const u1 = u1info.user;
    const u2 = u2info.user;
    const a1 = u1artists.topartists.artist;
    const a2 = u2artists.topartists.artist;

    const colW = 30;
    console.log(`\n${c.bold}${c.cyan}${user1.padEnd(colW)}  ${user2}${c.reset}`);
    console.log(`${c.gray}${"─".repeat(colW * 2 + 2)}${c.reset}`);
    console.log(`  ${c.gray}scrobbles${c.reset}  ${c.bold}${num(u1.playcount).padEnd(colW - 10)}${c.reset}  ${c.bold}${num(u2.playcount)}${c.reset}`);
    console.log(`  ${c.gray}artists${c.reset}    ${num(u1.artist_count).padEnd(colW - 10)}  ${num(u2.artist_count)}`);
    console.log(`  ${c.gray}tracks${c.reset}     ${num(u1.track_count).padEnd(colW - 10)}  ${num(u2.track_count)}`);

    console.log(`\n  ${c.bold}top artists — ${PERIOD_LABEL[period]}${c.reset}`);
    console.log(`  ${c.gray}${"─".repeat(colW * 2)}${c.reset}`);

    const max = Math.max(a1.length, a2.length);
    for (let i = 0; i < max; i++) {
        const left  = a1[i] ? `${c.gray}${String(i+1)}.${c.reset} ${c.bold}${a1[i].name}${c.reset} ${c.gray}${num(a1[i].playcount)}${c.reset}` : "";
        const right = a2[i] ? `${c.gray}${String(i+1)}.${c.reset} ${c.bold}${a2[i].name}${c.reset} ${c.gray}${num(a2[i].playcount)}${c.reset}` : "";
        const leftRaw = a1[i] ? `${i+1}. ${a1[i].name} ${num(a1[i].playcount)}` : "";
        const pad = Math.max(1, colW - leftRaw.length);
        console.log(`  ${left}${" ".repeat(pad)}  ${right}`);
    }
    console.log();
}

export async function cmdCompat(cfg, targetUser, opts) {
    const period = opts.period || "overall";
    const limit = 50;

    process.stdout.write(`${c.gray}calculating compatibility with ${targetUser}...${c.reset}`);

    const [myArtists, theirArtists] = await Promise.all([
        api.getTopArtists(cfg, period, limit),
                                                        api.getTopArtists({ ...cfg, username: targetUser }, period, limit, targetUser),
    ]);

    process.stdout.write("\r\x1b[K");

    const myNames = new Set(myArtists.topartists.artist.map(a => a.name));
    const theirNames = new Set(theirArtists.topartists.artist.map(a => a.name));

    const shared = [...myNames].filter(n => theirNames.has(n));
    const score = Math.round((shared.length / Math.max(myNames.size, theirNames.size)) * 100);

    const sharedArtists = myArtists.topartists.artist.filter(a => theirNames.has(a.name)).slice(0, 5);

    header(`compatibility with ${targetUser}`);

    const scoreBar = bar(score, 100, 30);
    const label = score >= 70 ? `${c.green}musical soulmate${c.reset}` :
    score >= 40 ? `${c.yellow}solid overlap${c.reset}` :
    score >= 20 ? `${c.gray}some common ground${c.reset}` :
    `${c.red}very different tastes${c.reset}`;

    console.log(`  ${scoreBar} ${c.bold}${score}%${c.reset} — ${label}`);
    console.log(`  ${c.gray}${shared.length} shared artists out of ${Math.max(myNames.size, theirNames.size)} total${c.reset}`);

    if (sharedArtists.length) {
        console.log(`\n  ${c.gray}you both love:${c.reset}`);
        sharedArtists.forEach(a => {
            console.log(`    ${c.bold}${a.name}${c.reset}`);
        });
    }
    console.log();
}

export async function cmdFriends(cfg, opts) {
    const data = await api.getFriends(cfg, 20);
    const friends = data.friends?.user;

    if (!friends?.length) {
        console.log(`\n  ${c.gray}no friends found — add some on last.fm${c.reset}\n`);
        return;
    }

    if (opts.json) return console.log(JSON.stringify(friends, null, 2));

    process.stdout.write(`${c.gray}fetching friends' recent tracks...${c.reset}`);

    const recentByFriend = await Promise.all(
        friends.slice(0, 10).map(async f => {
            try {
                const r = await api.getRecentTracks({ ...cfg, username: f.name }, 1, f.name);
                const t = r.recenttracks?.track?.[0];
                return { name: f.name, track: t };
            } catch {
                return { name: f.name, track: null };
            }
        })
    );

    process.stdout.write("\r\x1b[K");

    header("friends");
    recentByFriend.forEach(f => {
        const isNow = f.track?.["@attr"]?.nowplaying === "true";
        if (isNow) {
            console.log(`  ${c.green}▶${c.reset} ${c.bold}${f.name}${c.reset} ${c.gray}— ${f.track.name} by ${f.track.artist["#text"]}${c.reset}`);
        } else if (f.track) {
            console.log(`  ${c.gray}· ${f.name}${c.reset} ${c.gray}— ${f.track.name} by ${f.track.artist["#text"]}${c.reset}`);
        } else {
            console.log(`  ${c.gray}· ${f.name}${c.reset}`);
        }
    });
    console.log();
}

export async function cmdFriendsTop(cfg, opts) {
    const period = opts.period || "1month";
    const data = await api.getFriends(cfg, 10);
    const friends = data.friends?.user;

    if (!friends?.length) {
        console.log(`\n  ${c.gray}no friends found${c.reset}\n`);
        return;
    }

    process.stdout.write(`${c.gray}fetching friends' top artists...${c.reset}`);

    const topByFriend = await Promise.all(
        friends.slice(0, 8).map(async f => {
            try {
                const r = await api.getTopArtists({ ...cfg, username: f.name }, period, 3, f.name);
                return { name: f.name, artists: r.topartists.artist };
            } catch {
                return { name: f.name, artists: [] };
            }
        })
    );

    process.stdout.write("\r\x1b[K");

    header("friends' top artists", `— ${PERIOD_LABEL[period]}`);
    topByFriend.forEach(f => {
        if (!f.artists.length) return;
        const artists = f.artists.map(a => `${c.bold}${a.name}${c.reset}`).join(`${c.gray}, ${c.reset}`);
        console.log(`  ${c.cyan}${f.name}${c.reset} ${c.gray}→${c.reset} ${artists}`);
    });
    console.log();
}

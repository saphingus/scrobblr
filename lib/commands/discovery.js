import * as api from "../api.js";
import { c, header, bar, num } from "../display.js";

export async function cmdSimilar(cfg, artist, opts) {
    const limit = parseInt(opts.limit) || 10;
    const data = await api.getSimilarArtists(cfg, artist, limit);
    const artists = data.similarartists.artist;
    if (!artists?.length) {
        console.log(`\n  ${c.gray}no similar artists found for "${artist}"${c.reset}\n`);
        return;
    }
    if (opts.json) return console.log(JSON.stringify(artists, null, 2));
    header(`similar to`, artist);
    artists.forEach((a, i) => {
        const match = Math.round(parseFloat(a.match) * 100);
        const matchBar = bar(match, 100, 15);
        console.log(`  ${c.gray}${String(i+1).padStart(2)}.${c.reset} ${matchBar} ${c.bold}${a.name}${c.reset} ${c.gray}${match}% match${c.reset}`);
    });
    console.log();
}

export async function cmdTag(cfg, tag, opts) {
    const limit = parseInt(opts.limit) || 10;
    const data = await api.getTopTagArtists(cfg, tag, limit);
    const artists = data.topartists?.artist;
    if (!artists?.length) {
        console.log(`\n  ${c.gray}no artists found for tag "${tag}"${c.reset}\n`);
        return;
    }
    if (opts.json) return console.log(JSON.stringify(artists, null, 2));
    header(`top artists`, `#${tag}`);
    artists.forEach((a, i) => {
        console.log(`  ${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a.name}${c.reset}`);
    });
    console.log();
}

export async function cmdArtistInfo(cfg, artist, opts) {
    const [info, similar] = await Promise.all([
        api.getArtistInfo(cfg, artist),
                                              api.getSimilarArtists(cfg, artist, 5),
    ]);

    const a = info.artist;
    if (opts.json) return console.log(JSON.stringify(a, null, 2));

    header(a.name);
    console.log(`  ${c.gray}listeners    ${c.reset}${num(a.stats.listeners)}`);
    console.log(`  ${c.gray}playcount    ${c.reset}${num(a.stats.playcount)}`);
    if (a.stats.userplaycount) {
        console.log(`  ${c.gray}your plays   ${c.reset}${c.bold}${num(a.stats.userplaycount)}${c.reset}`);
    }

    if (a.tags?.tag?.length) {
        const tags = a.tags.tag.slice(0, 5).map(t => `${c.pink}#${t.name}${c.reset}`).join("  ");
        console.log(`\n  ${tags}`);
    }

    if (a.bio?.summary) {
        const bio = a.bio.summary.replace(/<a[^>]*>.*?<\/a>/g, "").replace(/<[^>]+>/g, "").trim().slice(0, 200);
        console.log(`\n  ${c.gray}${bio}...${c.reset}`);
    }

    const sim = similar.similarartists?.artist?.slice(0, 5);
    if (sim?.length) {
        console.log(`\n  ${c.gray}similar:${c.reset} ${sim.map(s => c.bold + s.name + c.reset).join(`${c.gray}, ${c.reset}`)}`);
    }
    console.log();
}

export async function cmdUnderground(cfg, opts) {
    const limit = parseInt(opts.limit) || 10;
    process.stdout.write(`${c.gray}finding underground artists...${c.reset}`);

    const data = await api.getTopArtists(cfg, "overall", 50);
    const artists = data.topartists.artist;

    // fetch listener counts for all artists in parallel (batched)
    const withInfo = await Promise.all(
        artists.map(async a => {
            try {
                const info = await api.getArtistInfo(cfg, a.name);
                return { ...a, listeners: parseInt(info.artist.stats.listeners) };
            } catch {
                return { ...a, listeners: 999999999 };
            }
        })
    );

    process.stdout.write("\r\x1b[K");

    // sort by listener count ascending (most underground first)
    const underground = withInfo
    .filter(a => a.listeners < 500000)
    .sort((a, b) => a.listeners - b.listeners)
    .slice(0, limit);

    if (!underground.length) {
        console.log(`\n  ${c.gray}no underground artists found in your top 50${c.reset}\n`);
        return;
    }

    if (opts.json) return console.log(JSON.stringify(underground, null, 2));

    header("underground artists", "(your favs with <500k listeners)");
    underground.forEach((a, i) => {
        console.log(`  ${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a.name}${c.reset} ${c.gray}${num(a.listeners)} listeners · ${num(a.playcount)} your plays${c.reset}`);
    });
    console.log();
}

export async function cmdForgotten(cfg, opts) {
    process.stdout.write(`${c.gray}digging through your history...${c.reset}`);

    const [old, recent] = await Promise.all([
        api.getTopArtists(cfg, "overall", 50),
                                            api.getTopArtists(cfg, "6month", 50),
    ]);

    process.stdout.write("\r\x1b[K");

    const recentNames = new Set(recent.topartists.artist.map(a => a.name));
    const forgotten = old.topartists.artist
    .filter(a => !recentNames.has(a.name))
    .slice(0, opts.limit || 10);

    if (opts.json) return console.log(JSON.stringify(forgotten, null, 2));

    header("forgotten artists", "(used to listen, not anymore)");
    forgotten.forEach((a, i) => {
        console.log(`  ${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a.name}${c.reset} ${c.gray}${num(a.playcount)} total plays${c.reset}`);
    });
    console.log();
}

export async function cmdNew(cfg, opts) {
    process.stdout.write(`${c.gray}finding new discoveries...${c.reset}`);

    const [overall, recent] = await Promise.all([
        api.getTopArtists(cfg, "overall", 200),
                                                api.getTopArtists(cfg, "1month", 50),
    ]);

    process.stdout.write("\r\x1b[K");

    const overallNames = new Set(
        overall.topartists.artist.slice(0, 100).map(a => a.name)
    );

    const newArtists = recent.topartists.artist
    .filter(a => !overallNames.has(a.name))
    .slice(0, opts.limit || 10);

    if (opts.json) return console.log(JSON.stringify(newArtists, null, 2));

    header("new discoveries", "(this month, not in your all-time top 100)");
    if (!newArtists.length) {
        console.log(`  ${c.gray}no new discoveries this month${c.reset}`);
    } else {
        newArtists.forEach((a, i) => {
            console.log(`  ${c.gray}${String(i+1).padStart(2)}.${c.reset} ${c.bold}${a.name}${c.reset} ${c.gray}${num(a.playcount)} plays this month${c.reset}`);
        });
    }
    console.log();
}

export async function cmdObsession(cfg) {
    process.stdout.write(`${c.gray}finding your current obsession...${c.reset}`);

    const [week, month] = await Promise.all([
        api.getTopArtists(cfg, "7day", 1),
                                            api.getTopArtists(cfg, "1month", 1),
    ]);

    process.stdout.write("\r\x1b[K");

    const weekTop = week.topartists.artist[0];
    const monthTop = month.topartists.artist[0];

    header("current obsession");
    console.log(`  ${c.gray}this week   ${c.reset}${c.bold}${weekTop?.name || "—"}${c.reset} ${c.gray}${weekTop ? num(weekTop.playcount) + " plays" : ""}${c.reset}`);
    console.log(`  ${c.gray}this month  ${c.reset}${c.bold}${monthTop?.name || "—"}${c.reset} ${c.gray}${monthTop ? num(monthTop.playcount) + " plays" : ""}${c.reset}`);
    console.log();
}

const BASE = "https://ws.audioscrobbler.com/2.0/";

async function call(cfg, method, params = {}) {
    const url = new URL(BASE);
    url.search = new URLSearchParams({
        method,
        api_key: cfg.apiKey,
        format: "json",
            ...(params.user === false ? {} : { user: params.user || cfg.username }),
                                     ...params,
    });
    if (params.user === false) url.searchParams.delete("user");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(`Last.fm: ${data.message}`);
    return data;
}

export async function getUserInfo(cfg, username) {
    return call(cfg, "user.getinfo", { user: username || cfg.username });
}

export async function getTopArtists(cfg, period, limit, username) {
    return call(cfg, "user.gettopartists", { period, limit, user: username || cfg.username });
}

export async function getTopTracks(cfg, period, limit, username) {
    return call(cfg, "user.gettoptracks", { period, limit, user: username || cfg.username });
}

export async function getTopAlbums(cfg, period, limit, username) {
    return call(cfg, "user.gettopalbums", { period, limit, user: username || cfg.username });
}

export async function getRecentTracks(cfg, limit, username) {
    return call(cfg, "user.getrecenttracks", { limit, user: username || cfg.username });
}

export async function getRecentTracksPage(cfg, limit, page, username) {
    return call(cfg, "user.getrecenttracks", { limit, page, user: username || cfg.username });
}

export async function getLovedTracks(cfg, limit) {
    return call(cfg, "user.getlovedtracks", { limit });
}

export async function getFriends(cfg, limit) {
    return call(cfg, "user.getfriends", { limit: limit || 20 });
}

export async function getArtistInfo(cfg, artist) {
    return call(cfg, "artist.getinfo", { artist, user: false, username: cfg.username });
}

export async function getSimilarArtists(cfg, artist, limit) {
    return call(cfg, "artist.getsimilar", { artist, limit, user: false });
}

export async function getTopTagArtists(cfg, tag, limit) {
    return call(cfg, "tag.gettopartists", { tag, limit, user: false });
}

export async function getArtistTags(cfg, artist) {
    return call(cfg, "artist.gettoptags", { artist, user: false });
}

export async function getTrackInfo(cfg, track, artist) {
    return call(cfg, "track.getinfo", { track, artist, username: cfg.username, user: false });
}

export async function getWeeklyArtistChart(cfg, from, to) {
    const params = { user: cfg.username };
    if (from) params.from = from;
    if (to) params.to = to;
    return call(cfg, "user.getweeklyartistchart", params);
}

export async function getWeeklyChartList(cfg) {
    return call(cfg, "user.getweeklychartlist", {});
}

export async function getPersonalTags(cfg, tag, taggingtype, limit) {
    return call(cfg, "user.getpersonaltags", { tag, taggingtype, limit });
}

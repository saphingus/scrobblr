const BASE = "https://ws.audioscrobbler.com/2.0/";

async function call(cfg, method, params = {}) {
    const url = new URL(BASE);
    url.search = new URLSearchParams({
        method,
        user: cfg.username,
        api_key: cfg.apiKey,
        format: "json",
            ...params,
    });

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(`Last.fm: ${data.message}`);
    return data;
}

export async function getUserInfo(cfg) {
    return call(cfg, "user.getinfo");
}

export async function getTopArtists(cfg, period, limit) {
    return call(cfg, "user.gettopartists", { period, limit });
}

export async function getTopTracks(cfg, period, limit) {
    return call(cfg, "user.gettoptracks", { period, limit });
}

export async function getTopAlbums(cfg, period, limit) {
    return call(cfg, "user.gettopalbums", { period, limit });
}

export async function getRecentTracks(cfg, limit) {
    return call(cfg, "user.getrecenttracks", { limit });
}

export async function getRecentTracksPage(cfg, limit, page) {
    return call(cfg, "user.getrecenttracks", { limit, page });
}

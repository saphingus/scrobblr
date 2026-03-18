export const c = {
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
    blue:   "\x1b[34m",
};

export const PERIOD_LABEL = {
    "7day":    "last 7 days",
    "1month":  "last month",
    "3month":  "last 3 months",
    "6month":  "last 6 months",
    "12month": "last year",
    "overall": "all time",
};

export function header(text, sub = "") {
    console.log(`\n${c.bold}${c.cyan}${text}${c.reset}${sub ? ` ${c.gray}${sub}${c.reset}` : ""}`);
    console.log(`${c.gray}${"─".repeat(text.length + (sub ? sub.length + 1 : 0))}${c.reset}`);
}

export function bar(plays, max, width = 20) {
    const filled = Math.round((plays / max) * width);
    return `${c.pink}${"█".repeat(filled)}${c.gray}${"░".repeat(width - filled)}${c.reset}`;
}

export function num(n) {
    return parseInt(n).toLocaleString("en");
}

export function clearLines(n) {
    for (let i = 0; i < n; i++) process.stdout.write("\x1b[1A\x1b[2K");
}

export function ago(ts) {
    const diff = Date.now() - ts * 1000;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "just now";
}

export function formatDate(ts) {
    return new Date(ts * 1000).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

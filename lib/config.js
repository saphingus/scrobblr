import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CFG_DIR = join(homedir(), ".config", "scrobblr");
const CFG_FILE = join(CFG_DIR, "config.json");

export function loadConfig(profile = "default") {
    if (!existsSync(CFG_FILE)) return {};
    try {
        const all = JSON.parse(readFileSync(CFG_FILE, "utf8"));
        if (all.apiKey) return all;
        return all[profile] || {};
    } catch {
        return {};
    }
}

export function saveConfig(cfg, profile = "default") {
    mkdirSync(CFG_DIR, { recursive: true });
    let all = {};
    if (existsSync(CFG_FILE)) {
        try { all = JSON.parse(readFileSync(CFG_FILE, "utf8")); } catch {}
    }
    if (all.apiKey) {
        all = { default: all };
    }
    all[profile] = cfg;
    writeFileSync(CFG_FILE, JSON.stringify(all, null, 2));
}

export function listProfiles() {
    if (!existsSync(CFG_FILE)) return [];
    try {
        const all = JSON.parse(readFileSync(CFG_FILE, "utf8"));
        if (all.apiKey) return ["default"];
        return Object.keys(all);
    } catch {
        return [];
    }
}

export function showConfig(cfg) {
    const c = {
        reset: "\x1b[0m", bold: "\x1b[1m",
        cyan: "\x1b[36m", gray: "\x1b[90m",
    };
    console.log(`\n${c.bold}${c.cyan}config${c.reset}`);
    console.log(`${c.gray}──────${c.reset}`);
    console.log(`  ${c.gray}username  ${c.reset}${cfg.username || "—"}`);
    console.log(`  ${c.gray}api key   ${c.reset}${cfg.apiKey ? cfg.apiKey.slice(0, 8) + "..." : "—"}`);
    console.log();
}

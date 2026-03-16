import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CFG_DIR = join(homedir(), ".config", "lfm-cli");
const CFG_FILE = join(CFG_DIR, "config.json");

export function loadConfig() {
    if (!existsSync(CFG_FILE)) return {};
    try {
        return JSON.parse(readFileSync(CFG_FILE, "utf8"));
    } catch {
        return {};
    }
}

export function saveConfig(cfg) {
    mkdirSync(CFG_DIR, { recursive: true });
    writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2));
}

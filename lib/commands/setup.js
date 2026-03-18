import { createInterface } from "readline";
import { saveConfig } from "../config.js";
import { c } from "../display.js";

function ask(rl, question) {
    return new Promise(resolve => rl.question(question, resolve));
}

function askHidden(question) {
    return new Promise(resolve => {
        process.stdout.write(question);
        process.stdin.setRawMode?.(true);
        process.stdin.resume();
        let input = "";
        process.stdin.on("data", function handler(ch) {
            ch = ch.toString();
            if (ch === "\n" || ch === "\r") {
                process.stdin.setRawMode?.(false);
                process.stdin.removeListener("data", handler);
                process.stdout.write("\n");
                resolve(input);
            } else if (ch === "\x7f") {
                input = input.slice(0, -1);
            } else if (ch === "\x03") {
                process.exit();
            } else {
                input += ch;
            }
        });
    });
}

export async function cmdSetup(cfg, saveConfigFn) {
    console.log(`\n${c.bold}${c.cyan}scrobblr setup${c.reset}`);
    console.log(`${c.gray}───────────────${c.reset}`);
    console.log(`${c.gray}let's get you configured in 30 seconds.${c.reset}\n`);

    const rl = createInterface({ input: process.stdin, output: process.stdout });

    // step 1 — api key
    console.log(`${c.bold}step 1/3 - Last.fm API key${c.reset}`);
    console.log(`${c.gray}get one at: https://www.last.fm/api/account/create${c.reset}`);
    const apiKey = await ask(rl, `  api key: `);

    if (!apiKey.trim()) {
        console.error(`\n${c.red}✗ api key is required${c.reset}`);
        rl.close();
        return;
    }

    // step 2 — username
    console.log(`\n${c.bold}step 2/3 - Last.fm username${c.reset}`);
    const username = await ask(rl, `  username: `);

    if (!username.trim()) {
        console.error(`\n${c.red}✗ username is required${c.reset}`);
        rl.close();
        return;
    }

    // step 3 — api secret (optional)
    console.log(`\n${c.bold}step 3/3 - API secret ${c.gray}(optional - needed for love/unlove/ban)${c.reset}`);
    console.log(`${c.gray}skip with enter if you don't need write operations${c.reset}`);
    const secret = await ask(rl, `  secret: `);

    rl.close();

    // save
    const newCfg = {
        apiKey: apiKey.trim(),
        username: username.trim(),
    };
    if (secret.trim()) newCfg.secret = secret.trim();

    saveConfigFn(newCfg);

    console.log(`\n${c.green}✓ all set!${c.reset}`);
    console.log(`\n  ${c.gray}try:${c.reset}`);
    console.log(`  ${c.cyan}scrobblr me${c.reset}         ${c.gray}- profile overview${c.reset}`);
    console.log(`  ${c.cyan}scrobblr artists${c.reset}     ${c.gray}- top artists${c.reset}`);
    console.log(`  ${c.cyan}scrobblr now${c.reset}         ${c.gray}- now playing${c.reset}`);
    console.log(`  ${c.cyan}scrobblr --help${c.reset}      ${c.gray}- all commands${c.reset}`);
    console.log();
}

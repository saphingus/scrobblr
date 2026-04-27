# scrobblr

A lightweight command-line interface for Last.fm statistics and discovery.

[![npm version](https://img.shields.io/npm/v/scrobblr?style=flat-square&color=2563eb&labelColor=1e293b&logo=npm&logoColor=white)](https://www.npmjs.com/package/scrobblr)
[![license](https://img.shields.io/badge/license-GPL--v3-2563eb?style=flat-square&labelColor=1e293b)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-2563eb?style=flat-square&labelColor=1e293b&logo=node.js&logoColor=white)](https://nodejs.org)

## Status

This project is no longer maintained.
Feel free to fork or reuse.

## Overview

Scrobblr is a lightweight command‑line interface for interacting with the Last.fm  API. It provides fast access to your listening statistics, discovery tools, social features directly from the terminal.

**Requirements**: Node.js 18 or higher

## Installation

```bash
npm install -g scrobblr
```

## Quick Start

This interactive prompt will guide you through setting up your Last.fm API key and username.

```bash
scrobblr setup
```
Config is saved to `~/.config/scrobblr/config.json`.

## Usage

scrobblr includes commands for stats, discovery, social features, account actions, and data export. Most commands support `--period`, `--limit`, and `--json`.

### Options

- `-p, --period` - time period (`7day`, `1month`, `3month`, `6month`, `12month`, `overall`)
- `-l, --limit` - number of results (default: 10)
- `--json` - raw JSON output on all commands
- `--live` - auto-refresh every 30s (`recent` only)
- `--watch` - auto-refresh every 30s (`now` only)
- `--info` - show full track details (`now` only)
- `--love` - love the currently playing track (`now` only)
- `--compact` - compact one-line output (`me` only)
- `--artist <name>` - filter by artist (`recent` only)
- `--full` - export up to 10,000 scrobbles (`export` only)
- `--format <fmt>` - output format, `json` or `csv` (`export` only)
- `--secret <secret>` - Last.fm API secret (`config` only)
- `--clear` - clear cached data (`cache` only)
- `--ttl <minutes>` - set cache TTL in minutes (`cache` only)

### Examples

```bash
scrobblr artists -p 7day -l 5
scrobblr tracks -p overall -l 20
scrobblr compare 7day overall
```

## Shell Completions

scrobblr supports tab-completion for fish, zsh, and bash. Once installed, pressing `Tab` after `scrobblr` will suggest available commands and options.

### fish
```bash
scrobblr completions fish > ~/.config/fish/completions/scrobblr.fish
```

No further action needed. fish loads completions automatically from this directory.

### zsh
```bash
mkdir -p ~/.zsh/completions
scrobblr completions zsh > ~/.zsh/completions/_scrobblr
```

Make sure your `.zshrc` includes the completions directory:
```bash
fpath=(~/.zsh/completions $fpath)
autoload -Uz compinit && compinit
```

Then reload your shell:
```bash
source ~/.zshrc
```

### bash
```bash
scrobblr completions bash >> ~/.bashrc
source ~/.bashrc
```

### Updating completions

If you upgrade scrobblr and new commands are added, re-run the appropriate command above to update your completions.

## Commands

### Stats & Activity

| Command | Description |
|--------|-------------|
| `scrobblr me` | Profile overview and global stats |
| `scrobblr me --compact` | Compact one-line profile overview |
| `scrobblr artists` | Top artists |
| `scrobblr tracks` | Top tracks |
| `scrobblr albums` | Top albums |
| `scrobblr recent` | Recent scrobbles |
| `scrobblr recent --live` | Auto‑refresh recent scrobbles |
| `scrobblr recent --artist <name>` | Filter recent scrobbles by artist |
| `scrobblr now` | Currently playing |
| `scrobblr now --info` | Now playing with track details |
| `scrobblr now --love` | Love the currently playing track |
| `scrobblr now --watch` | Auto-refresh now playing every 30s |
| `scrobblr streak` | Daily scrobble streak |
| `scrobblr loved` | Loved tracks |
| `scrobblr compare <p1> <p2>` | Compare two periods |
| `scrobblr peak` | Peak listening days |
| `scrobblr heatmap` | 12‑week scrobble heatmap |
| `scrobblr milestones` | Milestone tracker |
| `scrobblr hour` | Listening activity by hour |
| `scrobblr day` | Listening activity by weekday |
| `scrobblr wrapped` | Annual wrapped |
| `scrobblr share` | Generate a shareable listening summary |

### Discovery

| Command | Description |
|--------|-------------|
| `scrobblr artist <name>` | Artist deep dive |
| `scrobblr similar <artist>` | Similar artists |
| `scrobblr tag <tag>` | Top artists for a genre/tag |
| `scrobblr underground` | Artists you love with few listeners |
| `scrobblr forgotten` | Artists you stopped listening to |
| `scrobblr new` | Artists discovered this month |
| `scrobblr obsession` | Your current listening obsession |

### Social

| Command | Description |
|--------|-------------|
| `scrobblr compare-user <u1> <u2>` | Compare two profiles |
| `scrobblr compat <user>` | Musical compatibility score |
| `scrobblr friends` | What your friends are listening to |
| `scrobblr friends-top` | Friends’ top artists |

### Account (requires auth)

| Command | Description |
|--------|-------------|
| `scrobblr auth` | Authenticate for write operations |
| `scrobblr love <track> <artist>` | Love a track |
| `scrobblr unlove <track> <artist>` | Unlove a track |
| `scrobblr ban <track> <artist>` | Ban a track |
| `scrobblr love-now` | Love the currently playing track |

### Data & Export

| Command | Description |
|--------|-------------|
| `scrobblr export` | Export scrobbles (JSON) |
| `scrobblr export --format csv` | Export CSV |
| `scrobblr export --full` | Export up to 10k scrobbles |
| `scrobblr backup` | Full profile backup |
| `scrobblr stats-raw` | Raw stats (JSON) |
| `scrobblr cache` | Show cache info |
| `scrobblr cache --clear` | Clear cache |
| `scrobblr cache --ttl <minutes>` | Set cache TTL in minutes |
| `scrobblr completions <shell>` | Generate shell completions (fish, zsh, bash) |

## Changelog
All notable changes to this project are documented here.

This project follows the principles of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-03-19
### Added
* Implemented local caching in the API layer to reduce redundant requests.
* `cache --status` now displays cache location, file count, and total size.
* `cache --ttl <minutes>` flag to configure cache expiration time.
* `now --watch` flag to auto-refresh now playing without flooding the API.
### Changed
* API calls are now cached by default with a 5-minute TTL.

## [2.1.0] - 2026-03-19
### Added
* New `share` command to generate a shareable summary of your listening stats.
* New `completions` command to generate shell completions for fish, zsh, and bash.
* `s` as a shorter alias for all commands.
* `now --love` flag to love the currently playing track directly.
* `recent --artist <name>` flag to filter recent scrobbles by artist.
* `me --compact` flag for a compact one-line profile overview.

## [2.0.3] - 2026-03-19
### Changed
- Added robust error handling in the API call function, covering network errors, HTTP status codes, and Last.fm API errors.
- Implemented automatic retries for failed requests with a fixed delay.
- Improved URL construction to correctly handle optional user parameter.
- Clear and descriptive error messages for invalid API key, user not found, and other common API issues.
- Removed `---` separators in README for cleaner appearance.

## [2.0.2] - 2026-03-19
### Changed
- Improved README structure and examples for better clarity

## [2.0.1] - 2026-03-19
### Changed
- Updated README documentation and polished wording

## [2.0.0] - 2026-03-18
### Added
- Detailed now‑playing view with track metadata (`now --info`)
- Peak listening day analysis (`peak`)
- 12‑week GitHub‑style scrobble heatmap (`heatmap`)
- Milestone tracking for major scrobble counts (`milestones`)
- Hourly and weekday listening analytics (`hour`, `day`)
- Annual listening summary (`wrapped`)
- Artist deep‑dive reports (`artist <name>`)
- Similar‑artist and tag‑based discovery (`similar`, `tag`)
- Smart discovery tools: `underground`, `forgotten`, `new`, `obsession`
- Social features: `compare-user`, `compat`, `friends`, `friends-top`
- Write operations: `love`, `unlove`, `ban`, `love-now`
- Data tools: `export`, `backup`, `cache`
- Multi‑profile support (`--profile`)

## [1.1.0] - 2026-03-18
### Added
- Live‑updating recent scrobbles (`recent --live`)
- Daily streak tracking (`streak`)
- Period comparison (`compare`)
- Raw JSON output (`--json`)

## [1.0.0] - 2026-03-18
### Added
- Initial release with core functionality:
  - `me`, `artists`, `tracks`, `albums`, `recent`

## License

Distributed under the GPL‑3.0 License.
See the `LICENSE` file for full details.

## Author

Developed and maintained by [saphingus](https://github.com/saphingus).
Built on top of the Last.fm API.

# scrobblr

A lightweight command-line interface for Last.fm statistics and discovery.

[![npm version](https://img.shields.io/npm/v/scrobblr?style=flat-square&color=2563eb&labelColor=1e293b&logo=npm&logoColor=white)](https://www.npmjs.com/package/scrobblr)
[![license](https://img.shields.io/badge/license-GPL--v3-2563eb?style=flat-square&labelColor=1e293b)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-2563eb?style=flat-square&labelColor=1e293b&logo=node.js&logoColor=white)](https://nodejs.org)

---

## Overview

scrobblr is a lightweight command‑line interface for interacting with the Last.fm  API. It provides fast access to your listening statistics, discovery tools, social features directly from the terminal.

**Requirements**: Node.js 18 or higher

---

## Installation

```bash
npm install -g scrobblr
```

---

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
- `--json` - raw JSON output

### Examples

```bash
scrobblr artists -p 7day -l 5
scrobblr tracks -p overall -l 20
scrobblr compare 7day overall
```

## Commands

### Stats & Activity

| Command | Description |
|--------|-------------|
| `scrobblr me` | Profile overview and global stats |
| `scrobblr artists` | Top artists |
| `scrobblr tracks` | Top tracks |
| `scrobblr albums` | Top albums |
| `scrobblr recent` | Recent scrobbles |
| `scrobblr recent --live` | Auto‑refresh recent scrobbles |
| `scrobblr now` | Currently playing |
| `scrobblr now --info` | Now playing with track details |
| `scrobblr streak` | Daily scrobble streak |
| `scrobblr loved` | Loved tracks |
| `scrobblr compare <p1> <p2>` | Compare two periods |
| `scrobblr peak` | Peak listening days |
| `scrobblr heatmap` | 12‑week scrobble heatmap |
| `scrobblr milestones` | Milestone tracker |
| `scrobblr hour` | Listening activity by hour |
| `scrobblr day` | Listening activity by weekday |
| `scrobblr wrapped` | Annual wrapped |

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

## Changelog
All notable changes to this project are documented here.

This project follows the principles of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

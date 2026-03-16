<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=180&section=header&text=scrobblr&fontSize=70&fontAlignY=35&desc=last.fm+stats+in+your+terminal&descAlignY=60&fontColor=ffffff" />

<br/>

[![npm version](https://img.shields.io/npm/v/scrobblr?style=for-the-badge&color=c678dd&labelColor=0d0d0d&logo=npm&logoColor=white)](https://www.npmjs.com/package/scrobblr)
[![npm downloads](https://img.shields.io/npm/dt/scrobblr?style=for-the-badge&color=c678dd&labelColor=0d0d0d&logo=npm&logoColor=white)](https://www.npmjs.com/package/scrobblr)
[![license](https://img.shields.io/github/license/saphingus/scrobblr?style=for-the-badge&color=c678dd&labelColor=0d0d0d)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-c678dd?style=for-the-badge&labelColor=0d0d0d&logo=node.js&logoColor=white)](https://nodejs.org)

</div>

---

## ▸ what is it

**scrobblr** is a lightweight CLI tool to view your [Last.fm](https://last.fm) stats directly in your terminal.

---

## ▸ install

```bash
npm install -g scrobblr
```

requires **Node.js 18+**

---

## ▸ setup

get a free Last.fm API key at [last.fm/api/account/create](https://www.last.fm/api/account/create), takes 2 minutes.

```bash
scrobblr config -k YOUR_API_KEY -u YOUR_USERNAME
```

config is saved to `~/.config/lfm-cli/config.json`.

---

## ▸ usage

```bash
scrobblr me                         # profile overview & global stats
scrobblr artists                    # top artists
scrobblr tracks                     # top tracks
scrobblr albums                     # top albums
scrobblr recent                     # recent scrobbles
scrobblr recent --live              # auto-refresh every 30s
scrobblr streak                     # daily scrobble streak
scrobblr compare <period1> <period2> # compare two periods side by side
```

### options

| flag | commands | description | default |
|------|----------|-------------|---------|
| `-p, --period` | artists, tracks, albums | time period | `1month` |
| `-l, --limit` | all | number of results | `10` |
| `--live` | recent | auto-refresh every 30s | — |
| `--json` | all | raw JSON output | — |

### periods

`7day` · `1month` · `3month` · `6month` · `12month` · `overall`

### examples

```bash
scrobblr artists -p 7day -l 5        # top 5 artists this week
scrobblr tracks -p overall -l 20     # top 20 tracks all time
scrobblr compare 7day overall         # this week vs all time
scrobblr artists --json | jq '.[0]'   # pipe to jq
```

---

## ▸ changelog

### 1.2.x
- fixed bin entry in package.json
- added repository field

### 1.1.0
- `recent --live` - auto-refresh every 30s
- `streak` - daily scrobble streak counter
- `compare <period1> <period2>` - compare top artists between two periods
- `--json` flag on all commands for raw JSON output

### 1.0.0
- initial release — `me`, `artists`, `tracks`, `albums`, `recent`

---

## ▸ contributing

contributions are welcome. fork the repo, make your changes, open a pull request.

```bash
git clone https://github.com/saphingus/scrobblr
cd scrobblr
npm install
node index.js me
```

things that would be cool to add:
- cache to avoid hammering the API
- `scrobblr artist <name>` - detailed stats for a specific artist
- `scrobblr loved` - display loved tracks
- configurable colors
- more periods for streak calculation

open an issue before starting anything big so we can discuss it first.

---

## ▸ license

MIT

---

<div align="center">

made by **[saphingus](https://github.com/saphingus)** · powered by the [Last.fm API](https://www.last.fm/api)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=100&section=footer" />

</div>

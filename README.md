<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=180&section=header&text=scrobblr&fontSize=70&fontAlignY=35&desc=last.fm+stats+in+your+terminal&descAlignY=60&fontColor=ffffff" />

<br/>

[![npm version](https://img.shields.io/npm/v/scrobblr?style=for-the-badge&color=c678dd&labelColor=0d0d0d&logo=npm&logoColor=white)](https://www.npmjs.com/package/scrobblr)
[![license](https://img.shields.io/badge/license-GPL--v3-c678dd?style=for-the-badge&labelColor=0d0d0d)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-c678dd?style=for-the-badge&labelColor=0d0d0d&logo=node.js&logoColor=white)](https://nodejs.org)
[![made with node](https://img.shields.io/badge/made_with-node.js-c678dd?style=for-the-badge&labelColor=0d0d0d&logo=node.js&logoColor=6cc24a)](https://nodejs.org)


 ⚠️ **v2.0.0 is currently in testing**, some commands may be unstable, report issues [here](https://github.com/saphingus/scrobblr/issues).

</div>

---

## ▸ what is it

**scrobblr** is a lightweight CLI for [Last.fm](https://last.fm).

---

## ▸ install

```bash
npm install -g scrobblr
```

requires **Node.js 18+**

---

## ▸ setup

get a free Last.fm API key at [last.fm/api/account/create](https://www.last.fm/api/account/create).

```bash
scrobblr config -k YOUR_API_KEY -u YOUR_USERNAME
```

config is saved to `~/.config/scrobblr/config.json`.

---

## ▸ commands

### stats

| command | description |
|---------|-------------|
| `scrobblr setup` | interactive first-time setup |
| `scrobblr me` | profile overview & global stats |
| `scrobblr artists` | top artists |
| `scrobblr tracks` | top tracks |
| `scrobblr albums` | top albums |
| `scrobblr recent` | recent scrobbles |
| `scrobblr recent --live` | auto-refresh every 30s |
| `scrobblr now` | now playing |
| `scrobblr now --info` | now playing with track details |
| `scrobblr streak` | daily scrobble streak |
| `scrobblr loved` | your loved tracks |
| `scrobblr compare <p1> <p2>` | compare top artists between two periods |
| `scrobblr peak` | your peak listening days |
| `scrobblr heatmap` | scrobble heatmap (last 12 weeks) |
| `scrobblr milestones` | scrobble milestones (1k, 5k, 10k...) |
| `scrobblr hour` | listening activity by hour |
| `scrobblr day` | listening activity by day of week |
| `scrobblr wrapped` | your annual wrapped |

### discovery

| command | description |
|---------|-------------|
| `scrobblr artist <name>` | deep dive on an artist |
| `scrobblr similar <artist>` | artists similar to one you like |
| `scrobblr tag <tag>` | top artists for a genre/tag |
| `scrobblr underground` | artists you love with few global listeners |
| `scrobblr forgotten` | artists you used to listen to but stopped |
| `scrobblr new` | artists you discovered this month |
| `scrobblr obsession` | your current listening obsession |

### social

| command | description |
|---------|-------------|
| `scrobblr compare-user <u1> <u2>` | compare two Last.fm profiles |
| `scrobblr compat <user>` | musical compatibility score |
| `scrobblr friends` | what your friends are listening to [EXPERIMENTAL] |
| `scrobblr friends-top` | friends' top artists [EXPERIMENTAL] |

### account *(requires auth)*

| command | description |
|---------|-------------|
| `scrobblr auth` | authenticate for write operations |
| `scrobblr love <track> <artist>` | love a track |
| `scrobblr unlove <track> <artist>` | unlove a track |
| `scrobblr ban <track> <artist>` | ban a track |
| `scrobblr love-now` | love the currently playing track |

> write operations require your API secret key (not just the API key). get both at [last.fm/api/account/create](https://www.last.fm/api/account/create), then run `scrobblr config --secret YOUR_SECRET` and `scrobblr auth`.

### data

| command | description |
|---------|-------------|
| `scrobblr export` | export scrobbles to JSON |
| `scrobblr export --format csv` | export to CSV |
| `scrobblr export --full` | export up to 10,000 scrobbles |
| `scrobblr backup` | full profile backup (artists, tracks, loved) |
| `scrobblr stats-raw` | raw profile stats as JSON |
| `scrobblr cache` | show cache info |
| `scrobblr cache --clear` | clear cached data |

---

## ▸ options

most commands accept:

| flag | description | default |
|------|-------------|---------|
| `-p, --period` | time period | `1month` |
| `-l, --limit` | number of results | `10` |
| `--json` | raw JSON output (pipeable) | - |

periods: `7day` - `1month` - `3month` - `6month` - `12month` - `overall`

---

## ▸ examples

```bash
scrobblr artists -p 7day -l 5           # top 5 artists this week
scrobblr tracks -p overall -l 20        # top 20 tracks all time
scrobblr compare 7day overall            # this week vs all time
scrobblr artist "sewerslvt"             # deep dive
scrobblr similar "Burial"               # find similar artists
scrobblr tag "drum and bass"            # top dnb artists
scrobblr compat someuser                # musical compatibility
scrobblr export --format csv --full     # export everything
scrobblr artists --json | jq '.[0]'     # pipe to jq
```

---

## ▸ changelog

### 2.0.0
- `now`, `now --info` - now playing with track details
- `peak` - peak listening days
- `heatmap` - github-style scrobble calendar
- `milestones` - scrobble milestone tracker
- `hour`, `day` - listening patterns by hour/day
- `wrapped` - annual wrapped
- `artist <name>` - artist deep dive
- `similar`, `tag` - discovery commands
- `underground`, `forgotten`, `new`, `obsession` - smart discovery
- `compare-user`, `compat`, `friends`, `friends-top` - social commands
- `auth`, `love`, `unlove`, `ban`, `love-now` - write operations
- `export`, `backup`, `cache` - data management
- multi-profile support (`--profile`)

### 1.1.0
- `recent --live`, `streak`, `compare`, `--json` flag

### 1.0.0
- initial release - `me`, `artists`, `tracks`, `albums`, `recent`

---

## ▸ license

GNU General Public License v3.0

---

<div align="center">

made by **[saphingus](https://github.com/saphingus)** - powered by the [Last.fm API](https://www.last.fm/api)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=100&section=footer" />

</div>

# scrobblr

Last.fm stats in your terminal.

## changelog

### 1.1.0
- `recent --live` - auto-refresh every 30s
- `streak` - daily scrobble streak counter
- `compare <period1> <period2>` - compare top artists between two periods
- `--json` flag on all commands for raw JSON output

### 1.0.0
- initial release
- `me`, `artists`, `tracks`, `albums`, `recent`

## install

```bash
npm install -g scrobblr
```

requires Node.js 18+

## setup

you need a free Last.fm API key, get one at [last.fm/api/account/create](https://www.last.fm/api/account/create) (takes 2 minutes).

then configure scrobblr with your key and username:

```bash
scrobblr config -k YOUR_API_KEY -u YOUR_USERNAME
```

config is saved to `~/.config/lfm-cli/config.json`.

## usage

```bash
scrobblr me                       # profile overview & global stats
scrobblr artists                  # top artists (last month by default)
scrobblr tracks                   # top tracks
scrobblr albums                   # top albums
scrobblr recent                   # recent scrobbles
scrobblr recent --live            # auto-refresh every 30s
scrobblr streak                   # daily scrobble streak
scrobblr compare 7day overall     # compare top artists between two periods
```

### options

all chart commands (`artists`, `tracks`, `albums`) accept:

| flag | description | default |
|------|-------------|---------|
| `-p, --period` | time period (see below) | `1month` |
| `-l, --limit` | number of results | `10` |
| `--json` | output raw JSON | — |

`recent` accepts:

| flag | description | default |
|------|-------------|---------|
| `-l, --limit` | number of results | `15` |
| `--live` | auto-refresh every 30s | — |
| `--json` | output raw JSON | — |

### periods

| value | meaning |
|-------|---------|
| `7day` | last 7 days |
| `1month` | last month |
| `3month` | last 3 months |
| `6month` | last 6 months |
| `12month` | last year |
| `overall` | all time |

### examples

```bash
scrobblr artists -p 7day -l 5       # top 5 artists this week
scrobblr tracks -p overall -l 20    # top 20 tracks all time
scrobblr albums -p 3month           # top albums last 3 months
scrobblr recent -l 30               # last 30 scrobbles
scrobblr recent --live              # live now playing view
scrobblr streak                     # how many days in a row you've scrobbled
scrobblr compare 7day overall       # this week vs all time
scrobblr artists --json             # raw JSON output for piping
```

## license

MIT

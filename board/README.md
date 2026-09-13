# web/ — the Board site (m4.1c)

The public board. It renders one file — `data/board.json`, written by
`fantasy_edge.live.board` — and compares it to the live box score once
games kick off. **It never computes a projection.** Every number on the
PROJ row came out of the exporter; every number on the LIVE row came
out of ESPN's public feed in the reader's own browser. Nothing in
between is calculated here, stored here, or republished.

The binding specs are `docs/plan/UI_SPEC.md` (the charter, including
the §0 departures this build leaves out) and
`docs/design/UI_MOCKUP_v4.html` (the visual spec).

## No build step

Vanilla HTML, CSS and JavaScript. There is no framework, no bundler,
no npm tree, and no transpiler — what is in this directory is what is
served. Inter comes from Google Fonts; the only other host the page
ever contacts is ESPN's public scoreboard API, from the browser.

Three files do the work:

| file | what it is |
|---|---|
| `index.html` | the page skeleton and the paths it reads |
| `style.css` | the mockup's styling, minus every ruled-out element |
| `app.js` | load, render, sort, and the live layer |
| `data/board.json` | the exported contract (written by the pipeline) |
| `demo/` | the bundled fixture for visual QA |

## Running it locally

Serve the directory — do not open `index.html` from the filesystem, or
the browser will refuse the `fetch` of `board.json`:

```
cd web
python -m http.server 8000
```

Then open `http://localhost:8000/`.

You need an exported board first:

```
python -m fantasy_edge.live.board export --season 2026 --week 2
```

With no `data/board.json` present the page renders the honest
"could not be loaded" state rather than anything invented.

## Demo mode

```
http://localhost:8000/?demo=1
```

Loads `demo/board.demo.json` (three games — one pregame, one live, one
final — and twelve fabricated players covering every position, a Q
tag, and the null cases the degradation table calls for) together with
`demo/live.demo.json`, a canned stand-in for the live layer's own
state. **Demo mode never polls ESPN and never reads
`data/board.json`**, so demo numbers cannot mix with real ones. A
persistent `DEMO DATA — visual QA only` banner sits at the top of the
page the whole time.

The fixture is schema-valid against `fantasy_edge.live.board.validate()`
and `tests/test_web_site.py` asserts it stays that way.

## Pinned players

Every card carries a star. Starring a player adds a copy of his card to
a **Pinned** group above the slate; he also stays exactly where he was
in his game group, so the game context is never lost, and either star
unpins from both. Both copies are the same card, rendered by the same
function — same PROJ/LIVE rows, same pace colours, same live updates. The Pinned group is ordered the way the board is —
by kickoff, then by the order the players appear — not by the order the
stars were tapped.

The pins are a list of contract `player_id`s in this browser's
`localStorage` under `fe.pins.v1` (demo mode uses `fe.pins.demo.v1`, so
the two can never mix). Nothing is sent anywhere and nothing is
computed from them. They are global rather than per-week: an id that is
not on the board in front of you renders nothing and is kept in storage
untouched, so it comes back when that player does. A browser that
refuses storage — a private window, where `localStorage` throws rather
than returning nothing — keeps its pins in memory for the life of the
tab instead.

## The live layer

On load, in real mode only, the page reads ESPN's public scoreboard
exactly once — scoped to the board's own season and week, so a game
that finished earlier in the week is in the payload — and pulls a
per-event summary for every joined game that is live or final. That is
what puts the frozen FINAL row on a game that was over before the
reader ever opened the page.

After that pass, while any game is inside its window (kickoff − 10
minutes to final + 10 minutes) the page polls the same endpoints about
every 60 seconds. Outside that window it makes no requests at all, and
if every game was already final on load no loop starts. A game that was
already final when the page opened has no trailing window: it was read
once and there is nothing further to watch. Games join by
`espn_event_id` when
the contract carries one and otherwise by matched team abbreviations on
the same UTC kickoff date, through an alias table that mirrors
`TEAM_ALIASES` in `fantasy_edge/live/board.py`; players join on
`espn_id`. A failing or stale feed freezes the LIVE rows, says so in
the header, and drops the pace colours to neutral — it never invents a
number.

## Deploy

Not here. Publishing this directory to GitHub Pages is **m4.1d**, and
until that sprint lands the only way to see the board is the local
server above.

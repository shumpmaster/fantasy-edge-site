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

## The live layer

While any game is inside its window (kickoff − 10 minutes to final
+ 10 minutes) the page polls ESPN's public scoreboard about every 60
seconds, plus a per-event summary for the box score. Outside that
window it makes no requests at all. Games join by `espn_event_id` when
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

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

## Sorting

The sort control carries four options. `Proj` (the default) and `Live`
order each game group by the position's headline stat, as they always
did. `Hot` and `Cold` order by **pace**: the live count divided by the
projection times the share of the game played — the same ratio the LIVE
cells are already coloured on, so the ordering and the colours can
never disagree. Hot reads down from the player furthest ahead of his
projected pace, Cold up from the one furthest behind.

A pace can only be read for a game in progress, and only where there is
both a projection and a live count. Everyone else — pregame, final, a
stat the exporter could not project, a box score that has not carried a
number yet — keeps his place below the players whose pace can be read,
in the order the board already had him. With nothing live at all a pace
sort is simply the board as it already reads: no error, no empty state.
Nothing about the sort is stored; a reload opens on `Proj`.

## The achievement percentage

Once a game kicks, every card carries one large number on its right:
**how much of that player's projected stat line has actually landed**,
as a percentage. `64%` means the box score has delivered 64% of what
the exporter projected for him. Under it, in small muted type, sits the
comparison the colour is making — `62% of game played` while the clock
runs, `final` once it stops.

It is a **percentage, never a point total**, and the page never renders
either of the two totals it divides. Its colour is the board's own pace
colour: the same two thresholds the LIVE cells, the usage line and the
pace chip are painted with, against the same share of the game played
(and against the whole game once it is final). The hero and the pace
chip can therefore disagree, and there is exactly one reason they ever
will — the chip reads the position's **headline stat**, the hero reads
the **whole stat line**. A receiver short of targets who has already
scored is behind on one and ahead on the other, and both are true.

It renders only while a game is in progress or final, only when there
is a projection worth dividing by, and only when the feed has actually
carried something of his. Pregame there is no hero at all. At the
whistle the number simply stops moving — it was never pace-scaled, so
nothing freezes it but the fact that its inputs stopped. Its colour may
still change there, because the comparison moves from "the share of the
game played" to "the whole game".

### The weights, disclosed

The two totals are built by collapsing a stat line with a fixed weight
table. **These numbers are never displayed** — only the ratio between
the two totals is — but a number on a public page that nobody can check
is not a number anyone should trust, so here they are:

| stat | weight |
|---|---|
| `pass_yds` | × 0.04 |
| `pass_tds` | × 4 |
| `rush_yds` | × 0.1 |
| `rec_yds` | × 0.1 |
| `receptions` | × 0.5 |
| `anytime_td` | × 6 |

`rush_att` and `targets` carry **no weight** and are deliberately
absent: a carry and a target are *opportunities*, not production, and
the usage line above already reads them as opportunities. Weighting
them here would count the same football twice.

Two things are worth saying plainly about how the totals are built:

* **The touchdown term is a disclosed approximation.** What the engine
  publishes under `anytime_td` is `P(at least one TD)` — a probability,
  not a count — and it is used here as the *projected* touchdown term.
  That slightly understates a multi-touchdown game on the projected
  side, which makes the percentage read slightly high for a player who
  scores twice. It is accepted and said out loud rather than papered
  over with a second model this page has no business running. On the
  observed side the term is the player's **actual** touchdowns, read
  through the same value the LIVE row's `Any TD` cell is drawn from.
* **A missing number is missing, not zero.** The projected total runs
  over the weighted keys the contract gave a number for; the observed
  total runs over the weighted keys the box score has actually carried.
  In particular, if the live layer carries no touchdown count for a
  player, that term contributes **0** to what has landed — his hero
  reads low until the feed catches up, rather than being invented.

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

The header carries one line for the live layer's freshness: `updated
12s ago`, restated by every poll (the poll loop is its only clock —
there is no second timer). After three missed polls in a row it reads
`live data stalled · trying again` in the same amber the export's own
ageing stamps wear: the rows on the page are the last known ones, the
next poll is already coming, and the line clears itself the moment one
answers. There is nothing to dismiss and nothing to act on.

## Deploy

Not here. Publishing this directory to GitHub Pages is **m4.1d**, and
until that sprint lands the only way to see the board is the local
server above.

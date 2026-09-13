/* m4.1c — the Board site (D-075, UI_SPEC).
 *
 * Vanilla, no framework, no build step. ONE fetch of the exported
 * board contract at load; everything on the page is read off that
 * file. THE SITE NEVER COMPUTES A PROJECTION — it renders what the
 * pipeline exported and, once a game kicks, COMPARES it to what the
 * browser reads from ESPN's public feed. Nothing is republished,
 * nothing is stored, and a feed that fails freezes rather than
 * invents (UI_SPEC §6).
 *
 * The §0 ruled departures are absent rather than hidden: there is no
 * expand handler, no fantasy points pill, no p10-p90 strip, no
 * fantasy-point sorts and no delta-vs-last-run anywhere in this file.
 */
"use strict";

/* ------------------------------------------------------------------
 * the contract, and the only two remote hosts this page ever touches
 * ------------------------------------------------------------------ */

const BODY = document.body;
const BOARD_URL = BODY.dataset.board || "./data/board.json";
const DEMO_BOARD_URL = BODY.dataset.demoBoard || "./demo/board.demo.json";
const DEMO_LIVE_URL = BODY.dataset.demoLive || "./demo/live.demo.json";

const ESPN_ROOT = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
const ESPN_SCOREBOARD = ESPN_ROOT + "/scoreboard";
const ESPN_SUMMARY = ESPN_ROOT + "/summary";

/* ESPN's season types; 2 is the regular season. The scoreboard
 * defaults to whatever week ESPN thinks is current, which is not
 * always the week this board was exported for, so every request is
 * scoped to the run block's own season and week. */
const ESPN_SEASONTYPE_REG = 2;

const SOURCE_THIRDPARTY = "espn-thirdparty";
const BAND_EARLY = "EARLY";

/* The live window (UI_SPEC §7): kickoff − 10 min → final + 10 min,
 * and nothing outside it. MAX_GAME_MS bounds a game we never joined,
 * so a board left open on a Tuesday stops polling on its own.
 *
 * The window governs the RECURRING poll only. A game that was already
 * final when the page was opened is outside every window and would
 * never be read at all, so the page would show it projections-only
 * forever; UI_SPEC §3 says a final card carries its frozen LIVE row
 * whenever the board is viewed. The load-time pass below is therefore
 * unconditional, and the loop it may or may not start is what the
 * window still limits. */
const POLL_MS = 60000;
const WINDOW_LEAD_MS = 10 * 60 * 1000;
const WINDOW_TRAIL_MS = 10 * 60 * 1000;
const MAX_GAME_MS = 4.5 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15000;

/* How long the search box waits after the last keystroke before the
 * board is rebuilt (m4.2b feature 10). Long enough that typing a name
 * does not reflow the page under the fingers, short enough that the
 * board answers while the reader is still looking at the box. */
const SEARCH_DEBOUNCE_MS = 150;

/* §6: stale after more than three missed polls — LIVE rows freeze,
 * the header says so, and pace colors drop to neutral. */
const MISSED_POLLS_STALE = 3;

/* A source stamp older than this wears the amber dot. */
const FRESH_WARN_MS = 6 * 60 * 60 * 1000;

/* The live layer's own freshness line (m4.2b feature 6). Each is ONE
 * contiguous string: they are the sentinels the site test looks for,
 * and a concatenation would let the wording drift silently.
 *
 * "Stalled" rather than "broken", and in the amber family rather than
 * the red one, because that is the truth of the state: the last known
 * values are still on the page, frozen, and the next poll is already
 * on its way. It clears itself the moment one answers. */
const FEED_STALLED = "live data stalled · trying again";
const FEED_CONNECTING = "live feed connecting";

/* ------------------------------------------------------------------
 * the disclosures — sentinel strings, rendered on every board
 * ------------------------------------------------------------------ */

const NOT_PICKS =
  "Projections, not picks — no line, no price, no recommendation.";

/* Kept as ONE contiguous string: it is the sentinel the site test
 * looks for, and a concatenation would let it drift silently. */
const THIRDPARTY_BANNER =
  "Week {week} — ESPN's projections (third-party), not the fantasy-edge engine.";

const EARLY_BLURB =
  "EARLY — fitted on fewer than three completed weeks of this " +
  "season. The numbers are real and were produced at the real " +
  "cutoff, but each player's own history is short, so the model " +
  "leans on what his position usually does. Expect these to sharpen " +
  "as the season fills in.";

const PUBLIC_EXPOSURE =
  "This page carries derived model outputs only — no raw vendor " +
  "data, and no odds beyond the informational game line already " +
  "published everywhere.";

const DEMO_BANNER = "DEMO DATA — visual QA only";
const DEMO_SUB =
  "Every number below is fabricated and no live feed is polled. " +
  "Demo data never mixes with an exported board.";

/* ------------------------------------------------------------------
 * teams — the alias table MIRRORS fantasy_edge/live/board.py
 * (TEAM_ALIASES) so the exporter and the site agree on who is who.
 * A test parses both and fails if they drift apart.
 * ------------------------------------------------------------------ */

const TEAM_ALIASES = [
  ["WSH", "WAS"],
  ["JAX", "JAC"],
  ["LAR", "LA", "STL"],
  ["LAC", "SD", "SDG"],
  ["LV", "OAK", "LVR"],
  ["ARI", "ARZ"],
  ["BAL", "BLT"],
  ["CLE", "CLV"],
  ["HOU", "HST"],
  ["GB", "GNB"],
  ["KC", "KAN"],
  ["NE", "NWE"],
  ["NO", "NOR"],
  ["SF", "SFO"],
  ["TB", "TAM"]
];

/* The mockup's palette, extended to the whole league (it defined the
 * twenty teams its sample slate used). Keyed by our DB codes; an
 * unknown code falls back to the mockup's neutral. */
const TEAMCOLORS = {
  ARI: "#97233f", ATL: "#a71930", BAL: "#241773", BUF: "#00338d",
  CAR: "#0085ca", CHI: "#0b162a", CIN: "#fb4f14", CLE: "#311d00",
  DAL: "#003594", DEN: "#fb4f14", DET: "#0076b6", GB: "#203731",
  HOU: "#03202f", IND: "#002c5f", JAX: "#006778", KC: "#e31837",
  LAC: "#0080c6", LAR: "#866d4b", LV: "#101010", MIA: "#008e97",
  MIN: "#4f2683", NE: "#002244", NO: "#d3bc8d", NYG: "#0b2265",
  NYJ: "#125740", PHI: "#004c54", PIT: "#1b1b1b", SEA: "#69be28",
  SF: "#aa0000", TB: "#d50a0a", TEN: "#0c2340", WAS: "#5a1414"
};
const TEAM_FALLBACK = "#5b7083";

/* ------------------------------------------------------------------
 * the stat schemas (UI_SPEC §2) — engine vocabulary, in contract keys
 * [label, contract key, decimal places on the PROJ row]
 * ------------------------------------------------------------------ */

const SCHEMA = {
  QB: [["Pa Yds", "pass_yds", 0], ["Pa TD", "pass_tds", 1],
       ["Car", "rush_att", 1], ["Ru Yds", "rush_yds", 0],
       ["Any TD", "anytime_td", 1]],
  RB: [["Car", "rush_att", 1], ["Ru Yds", "rush_yds", 0],
       ["Rec", "receptions", 1], ["Rc Yds", "rec_yds", 0],
       ["Any TD", "anytime_td", 1]],
  WR: [["Tgt", "targets", 1], ["Rec", "receptions", 1],
       ["Rc Yds", "rec_yds", 0], ["Any TD", "anytime_td", 1]]
};
SCHEMA.TE = SCHEMA.WR;
SCHEMA.FB = SCHEMA.WR;

/* The opportunity stats the usage line compares (m4.2b feature 4), per
 * position, in the order they read: [contract key, singular, plural].
 *
 * Opportunity ONLY — a target and a carry are things that happened to a
 * player, counted the same way by the projection and by the box score,
 * which is what makes the subtraction between them plain arithmetic
 * rather than a claim. Yards and touchdowns are outcomes and are left
 * to the PROJ/LIVE grid above. A position that is not in this table
 * (QB) gets no usage line at all.
 */
const USAGE = {
  RB: [["rush_att", "carry", "carries"], ["targets", "target", "targets"]],
  WR: [["targets", "target", "targets"]]
};
USAGE.TE = USAGE.WR;
USAGE.FB = USAGE.WR;

/* The label, as ONE contiguous string: it is what stops the line from
 * being read as a model claim, and a concatenation would let it drift. */
const EXPECTED_BY_NOW = "expected by now";

/* ------------------------------------------------------------------
 * the achievement score weights (m4.2b feature 9)
 *
 * THESE NUMBERS ARE NEVER DISPLAYED. They exist for exactly one
 * purpose: to collapse a projected statline and an observed statline
 * into two comparable totals, so the card can say what SHARE of the
 * projection has actually landed. The card renders that share — a
 * percentage — and never either total, because a total would be a
 * score, and a score on this page would be a number the pipeline never
 * published. The same table is disclosed in web/README.md.
 *
 *   pass_yds   × 0.04
 *   pass_tds   × 4
 *   rush_yds   × 0.1
 *   rec_yds    × 0.1
 *   receptions × 0.5
 *   anytime_td × 6
 *
 * `rush_att` and `targets` carry NO weight and are deliberately absent
 * from this table: a carry and a target are opportunities, not
 * production, and they are already read as opportunities by the usage
 * line above. Weighting them would count the same football twice.
 *
 * The `anytime_td` term is a DISCLOSED APPROXIMATION. What the engine
 * publishes under that key is P(≥1 TD) — a probability, not a count —
 * and it is used here as the projected touchdown term. That slightly
 * UNDERSTATES a multi-touchdown game on the projected side, which
 * makes the percentage read slightly high for a player who scores
 * twice. It is accepted, and said out loud, rather than papered over
 * with a second model this page has no business running. On the
 * observed side the term is the player's ACTUAL touchdowns, read
 * through the same `liveValue` the LIVE row's Any TD cell is drawn
 * from; a player the live layer carries no touchdown count for
 * contributes 0 to that term.
 * ------------------------------------------------------------------ */
const SCORE_WEIGHTS = {
  pass_yds: 0.04,
  pass_tds: 4,
  rush_yds: 0.1,
  rec_yds: 0.1,
  receptions: 0.5,
  anytime_td: 6
};

/* The hero's sub-line and its spoken name. Each is ONE contiguous
 * string, like every other label on this page: they are the sentinels
 * the site test looks for, and a concatenation would let the wording
 * drift silently.
 *
 * The sub-line is the colour's comparison stated in words — the hero is
 * coloured against the share of the game that has been played, and the
 * sub-line says what that share is. */
const ACH_PLAYED = "% of game played";
const ACH_FINAL = "final";
const ACH_ARIA = " percent of projected production";

/* The headline usage each group sorts on (UI_SPEC §4). */
const HEADLINE = {
  QB: "pass_yds", RB: "rush_att", WR: "targets", TE: "targets",
  FB: "targets"
};

const POS_ORDER = ["QB", "RB", "WR", "TE", "FB"];
const POS_FILTERS = ["ALL", "QB", "RB", "WR", "TE"];
const SORTS = [["proj", "Proj"], ["live", "Live"], ["hot", "Hot"],
               ["cold", "Cold"]];

/* The two pace sorts (m4.2b feature 5) and which end of the ratio each
 * one puts first: Hot reads down from the player furthest ahead of his
 * projected pace, Cold reads up from the one furthest behind. The
 * ratio is the SAME one the LIVE cells are already coloured on — the
 * sorts add an ordering, not a number. */
const PACE_SORTS = { hot: -1, cold: 1 };

const PACE_SORT_TITLE =
  "Orders a game in progress by how far ahead of — or behind — the " +
  "projected pace each player is running";

/* The always-visible pace chip (m4.2b feature 8a), keyed by the pace
 * CLASS the LIVE cells are already painted with: [what the chip reads,
 * what it says out loud]. There is no threshold and no ratio in this
 * table — `paceClass` decides which of the three a card is in, exactly
 * as it decides the colour of the numbers above it, so the chip and the
 * colours cannot disagree and there is no second set of numbers to keep
 * in step. */
const PACE_CHIPS = {
  "c-up": ["▲ HOT", "ahead of pace"],
  "c-dn": ["▼ COLD", "behind pace"],
  "c-n": ["– PACE", "on pace"]
};

/* The neutral chip covers two different truths: a player running level
 * with his projected pace, and a player whose pace cannot be read at
 * all (no projection, nothing observed yet, or a stalled feed). Both
 * look the same — quiet — because neither is news, but the spoken label
 * never says "on pace" about a number nobody has. */
const PACE_CHIP_UNREAD = "pace not yet readable";

/* The per-player freshness stamp (m4.2b feature 8b). ONE contiguous
 * string, like every other label on this page, and in GAME time: it is
 * followed by the same "Q3 · 7:42" the game header already reads. */
const LAST_STAT = "last stat ";

/* The box-score fields the QB line renders, which are part of what a
 * reader sees change on a card and therefore part of the signature the
 * stamp watches. The LIVE row's own values are the position's schema,
 * read through the same `liveValue` the row is drawn from. */
const BOX_LINE_FIELDS = ["cmp", "att", "ints"];

/* A cell that rounds to nothing (the pages renderer's rule). */
const BLANK = "—";

/* ESPN box-score blocks → the fields this page compares. Each entry
 * lists the feed's stable key first and its column label second. */
const BOX_BLOCKS = {
  passing: {
    cmpatt: ["completions/passingAttempts", "C/ATT"],
    pass_yds: ["passingYards", "YDS"],
    pass_tds: ["passingTouchdowns", "TD"],
    ints: ["interceptions", "INT"]
  },
  rushing: {
    rush_att: ["rushingAttempts", "CAR"],
    rush_yds: ["rushingYards", "YDS"],
    rush_td: ["rushingTouchdowns", "TD"]
  },
  receiving: {
    receptions: ["receptions", "REC"],
    rec_yds: ["receivingYards", "YDS"],
    rec_td: ["receivingTouchdowns", "TD"],
    targets: ["receivingTargets", "TGTS"]
  }
};

/* ------------------------------------------------------------------
 * state
 * ------------------------------------------------------------------ */

const state = {
  demo: false,
  board: null,
  error: null,
  pos: "ALL",
  sort: "proj",
  /* The game filter (m4.2b feature 7a): the game_ids this reader
   * chose, or an empty list meaning "all of them". Per-visit state,
   * exactly like `pos` above — it is a way of looking at the board in
   * front of you, not a preference to be remembered, and an empty list
   * is the board as it has always read. */
  gameFilter: [],
  /* The board search (m4.2b feature 10): what this reader typed into
   * the search box, verbatim, or "" for the board as it has always
   * read. Per-visit state exactly like `pos` and `gameFilter` above —
   * a way of looking at the board in front of you, never written down
   * and never carried to the next visit. */
  query: "",
  /* game_id → {state, period, displayClock, detail, awayScore,
   *            homeScore, possession, redZone, eventId, finalAt}
   *
   * `possession` is the ABBREVIATION of the team with the ball and
   * `redZone` is the scoreboard's own `situation.isRedZone`; both are
   * read off the same scoreboard payload as everything above them, and
   * both are cleared on any game that is not in progress (m4.2b
   * features 2 and 3). */
  live: {},
  /* espn_id (string) → box-score fields */
  box: {},
  finalBox: {},
  polling: false,
  /* the load-time pass has run (real mode only): the freshness dot
   * exists from then on, the pulsing LIVE dot only while polling */
  feedSeen: false,
  /* true until the load-time pass has been absorbed */
  firstPass: true,
  stale: false,
  misses: 0,
  feedTs: null,
  signature: null
};

/* What this page has WATCHED change (m4.2b feature 8b) — beside
 * `state` rather than in it, because `state` is what the board and the
 * feed said and this is only what we happened to see while we were
 * looking.
 *
 * `sigs` is player_id → the live numbers that player's card was last
 * drawn with; `stamps` is player_id → the game clock of his game at the
 * poll those numbers changed. Both are in memory for the life of the
 * tab and are written NOWHERE: a reload starts with no stamps at all,
 * which is the honest state, because we cannot know when a stat last
 * changed before we were watching.
 *
 * Both are bare maps: a player_id off the contract is a key from
 * outside this file, and a plain object would answer to "constructor"
 * with something that is not a stamp. */
const FRESH = { sigs: Object.create(null), stamps: Object.create(null) };

/* ------------------------------------------------------------------
 * what this reader kept — pinned players (m4.2b feature 1) and folded
 * games (m4.2b feature 7b), D-077 workstream 2
 *
 * Both are display-only and entirely the reader's own: a list of ids
 * kept in this browser's localStorage under a namespaced, versioned
 * key. Nothing is sent anywhere, nothing is computed from either, and
 * the cards a pin promotes are the SAME cards the game groups draw.
 *
 * Neither list is part of `state`: `state` is what the board and the
 * feed said, and these are what this reader said. Both are read fresh
 * on every render rather than cached in the DOM, so a poll update, a
 * finals backfill or a filter change all rebuild the page against the
 * lists as they stand now instead of a stale copy.
 *
 * Both are global rather than per-week: an id that is not on the board
 * in front of you is kept in storage untouched and renders nothing, so
 * it comes back when that player — or that game — does.
 *
 * ONE storage path serves them, because they are one shape: a list of
 * ids, a real key, a demo twin, and the same refusal to fall over when
 * a browser says no. A second copy of this is a second thing to get
 * wrong.
 * ------------------------------------------------------------------ */

const PIN_KEY = "fe.pins.v1";
/* Demo mode writes its own key, so fiddling with the fixture can never
 * disturb a real pin (and the reverse). */
const PIN_KEY_DEMO = "fe.pins.demo.v1";

const COLLAPSE_KEY = "fe.collapse.v1";
const COLLAPSE_KEY_DEMO = "fe.collapse.demo.v1";

/* A private window refuses storage — reading or writing THROWS rather
 * than returning nothing. The first refusal flips that list to the
 * in-memory copy below: it keeps working for the life of the tab and
 * simply does not survive a reload, which is the honest degradation. */
function idStore(real, demo) {
  return { real: real, demo: demo, broken: false, memory: [] };
}

const PINS = idStore(PIN_KEY, PIN_KEY_DEMO);
const FOLDS = idStore(COLLAPSE_KEY, COLLAPSE_KEY_DEMO);

function storeKey(store) {
  return state.demo ? store.demo : store.real;
}

/* Strings, non-empty, first occurrence wins — deduplicated on the way
 * in so a double tap can never leave two copies in storage. */
function cleanIds(ids) {
  const out = [];
  for (const id of ids || []) {
    if (id === null || id === undefined) continue;
    const key = String(id);
    if (!key || out.indexOf(key) >= 0) continue;
    out.push(key);
  }
  return out;
}

function readIds(store) {
  if (store.broken) return store.memory.slice();
  try {
    const raw = window.localStorage.getItem(storeKey(store));
    const parsed = raw ? JSON.parse(raw) : [];
    /* Anything that is not a list of ids — a hand-edited key, another
     * version's shape — is treated as an empty list, never guessed
     * at. */
    return Array.isArray(parsed) ? cleanIds(parsed) : [];
  } catch (err) {
    store.broken = true;
    return store.memory.slice();
  }
}

function writeIds(store, ids) {
  const clean = cleanIds(ids);
  /* Mirrored unconditionally, so storage that breaks on a later write
   * still has somewhere to fall back to. */
  store.memory = clean;
  if (store.broken) return;
  try {
    window.localStorage.setItem(storeKey(store), JSON.stringify(clean));
  } catch (err) {
    store.broken = true;
  }
}

/* One id, one list: the star on the pinned card and the star on the
 * in-group card are two views of the same entry, so either one clears
 * both, and the same is true of a game's chevron. The re-render is
 * forced because the board itself did not move — only what this reader
 * wants to see of it. */
function toggleStored(store, value) {
  const id = String(value === null || value === undefined ? "" : value);
  if (!id) return;
  const ids = readIds(store);
  const at = ids.indexOf(id);
  if (at >= 0) {
    ids.splice(at, 1);
  } else {
    ids.push(id);
  }
  writeIds(store, ids);
  render(true);
}

function hasPin(pins, playerId) {
  return (pins || []).indexOf(String(playerId)) >= 0;
}

function togglePin(playerId) {
  toggleStored(PINS, playerId);
}

/* The cards are innerHTML, so the star carries its handler as an
 * attribute; this is the shim that attribute calls. The id is read
 * back off the button rather than written into the handler, so a
 * player id can never be spliced into a script context. */
function onPinClick(element) {
  if (!element) return;
  togglePin(element.getAttribute("data-pin"));
}

function isCollapsed(folded, gameId) {
  return (folded || []).indexOf(String(gameId)) >= 0;
}

function toggleCollapse(gameId) {
  toggleStored(FOLDS, gameId);
}

/* The game header is innerHTML too, so the chevron carries its handler
 * the same way the star does, and reads its game_id back off itself. */
function onCollapseClick(element) {
  if (!element) return;
  toggleCollapse(element.getAttribute("data-fold"));
}

/* ------------------------------------------------------------------
 * small helpers
 * ------------------------------------------------------------------ */

function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function up(value) {
  return String(value === null || value === undefined ? "" : value)
    .trim().toUpperCase();
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return null;
  const text = String(value).replace(/,/g, "").trim();
  if (!text || text === "-" || text === "--") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/* Counts one decimal, yards none, and a cell that rounds to nothing
 * is an em-dash rather than a column of zeroes. */
function fmt(value, places) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  if (Number(number.toFixed(places)) === 0) return BLANK;
  return number.toFixed(places);
}

function ms(iso) {
  if (!iso) return null;
  const at = Date.parse(iso);
  return Number.isFinite(at) ? at : null;
}

function utcDay(iso) {
  const at = ms(iso);
  if (at === null) return null;
  return new Date(at).toISOString().slice(0, 10);
}

/* A stamp AHEAD of the reader's clock is not aged down to "0s" — a
 * board exported against a skewed clock says when it was stamped
 * instead of claiming to be brand new. */
function ageLabel(stampMs, now) {
  if (stampMs === null) return null;
  if (now - stampMs < -120000) return null;
  const seconds = Math.max(0, Math.round((now - stampMs) / 1000));
  if (seconds < 90) return seconds + "s";
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return minutes + "m";
  const hours = Math.round(minutes / 60);
  if (hours < 48) return hours + "h";
  return Math.round(hours / 24) + "d";
}

function clockLabel(iso) {
  const at = ms(iso);
  if (at === null) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric", minute: "2-digit"
    }).format(new Date(at));
  } catch (err) {
    return new Date(at).toISOString().slice(11, 16);
  }
}

function kickoffLabel(iso) {
  const at = ms(iso);
  if (at === null) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short", hour: "numeric", minute: "2-digit",
      timeZoneName: "short"
    }).format(new Date(at));
  } catch (err) {
    return new Date(at).toISOString().replace("T", " ").slice(0, 16);
  }
}

function stampLabel(iso) {
  const at = ms(iso);
  if (at === null) return iso ? String(iso) : "unrecorded";
  return new Date(at).toISOString().replace("T", " ").slice(0, 16) +
    " UTC";
}

function aliasGroup(code) {
  const team = up(code);
  for (const group of TEAM_ALIASES) {
    if (group.indexOf(team) >= 0) return group;
  }
  return [team];
}

function sameTeam(left, right) {
  const a = up(left);
  const b = up(right);
  if (!a || !b) return false;
  if (a === b) return true;
  return aliasGroup(a).indexOf(b) >= 0;
}

function teamColor(code) {
  const team = up(code);
  if (TEAMCOLORS[team]) return TEAMCOLORS[team];
  for (const alias of aliasGroup(team)) {
    if (TEAMCOLORS[alias]) return TEAMCOLORS[alias];
  }
  return TEAM_FALLBACK;
}

function schemaFor(pos) {
  return SCHEMA[up(pos)] || SCHEMA.WR;
}

function headlineFor(pos) {
  return HEADLINE[up(pos)] || "targets";
}

/* ------------------------------------------------------------------
 * the live join — game state, fraction elapsed, box-score lookups
 * ------------------------------------------------------------------ */

function clockSeconds(display) {
  const text = String(display || "").trim();
  const parts = text.split(":");
  if (parts.length !== 2) return null;
  const minutes = numberOrNull(parts[0]);
  const seconds = numberOrNull(parts[1]);
  if (minutes === null || seconds === null) return null;
  return minutes * 60 + seconds;
}

/* Period + clock over sixty minutes, capped at 1.0; overtime is 1.0
 * and a final is 1.0 (UI_SPEC §2). With no clock we fall back to the
 * last certain boundary — the start of the period — rather than
 * guessing at a position inside it. */
function fractionElapsed(status) {
  if (!status) return 0;
  if (status.state === "post") return 1;
  if (status.state !== "in") return 0;
  const period = numberOrNull(status.period) || 0;
  if (period > 4) return 1;
  if (period <= 0) return 0;
  const remaining = clockSeconds(status.displayClock);
  const played = (period - 1) * 900 +
    (remaining === null ? 0 : 900 - remaining);
  return Math.max(0, Math.min(1, played / 3600));
}

function statusFor(player) {
  return state.live[player.game_id] || null;
}

function boxFor(player) {
  const espnId = player.espn_id;
  if (espnId === null || espnId === undefined || espnId === "") {
    return null;
  }
  return state.box[String(espnId)] || null;
}

/* Any TD actual is the box score's rushing plus receiving TDs — the
 * same anytime touchdown the engine projects (D-059). */
function liveValue(box, key) {
  if (!box) return null;
  if (key === "anytime_td") {
    const rush = numberOrNull(box.rush_td);
    const rec = numberOrNull(box.rec_td);
    if (rush === null && rec === null) return null;
    return (rush || 0) + (rec || 0);
  }
  return numberOrNull(box[key]);
}

/* The two comparable totals behind the achievement hero (m4.2b feature
 * 9). Neither is ever rendered — only the ratio between them is.
 *
 * The projected total runs over every weighted key the contract gave a
 * number for; a key the exporter left null simply is not in the sum,
 * rather than being read as a zero.
 *
 * The observed total runs over the weighted keys this card actually has
 * a live value for — the SAME `liveValue` the LIVE row is drawn from,
 * so nothing here reads a field the page does not already fetch. A key
 * the box score has not carried is absent from the sum, not zero, and a
 * card with no weighted live value at all returns `null`: "cannot be
 * read", never a zero and never a guess. */
function projectedScore(player) {
  const proj = (player || {}).proj || {};
  let total = 0;
  for (const key in SCORE_WEIGHTS) {
    const value = numberOrNull(proj[key]);
    if (value === null) continue;
    total += SCORE_WEIGHTS[key] * value;
  }
  return total;
}

function achievedScore(box) {
  if (!box) return null;
  let total = 0;
  let seen = 0;
  for (const key in SCORE_WEIGHTS) {
    const value = liveValue(box, key);
    if (value === null) continue;
    seen += 1;
    total += SCORE_WEIGHTS[key] * value;
  }
  return seen ? total : null;
}

/* Actual against projection × fraction elapsed — THE ratio on this
 * page. The LIVE cells take their colour from it, the usage line takes
 * the same colour from it, and the Hot/Cold sorts order by it, so a
 * card's colour and its place on the board can never disagree.
 *
 * `null` means "cannot be read": no projection, a projection of zero,
 * or nothing observed yet. It is never a zero and never a guess. */
function paceRatio(proj, actual, frac, isFinal) {
  const projected = numberOrNull(proj);
  const got = numberOrNull(actual);
  if (projected === null || projected === 0 || got === null) return null;
  const expected = isFinal ? projected : projected * frac;
  if (!(expected > 0)) return null;
  return got / expected;
}

/* LIVE cells only: the ratio above, in the board's three bands. */
function paceClass(proj, actual, frac, isFinal) {
  if (state.stale) return "c-n";
  const ratio = paceRatio(proj, actual, frac, isFinal);
  if (ratio === null) return "c-n";
  if (ratio >= 1.12) return "c-up";
  if (ratio <= 0.72) return "c-dn";
  return "c-n";
}

/* ------------------------------------------------------------------
 * the board search (m4.2b feature 10)
 *
 * One box, two questions, ONE rule: a player is kept if his NAME
 * contains what you typed, OR if the game he is in is a game you
 * named. The two are a union rather than a branch, which is what makes
 * the rule sayable in a sentence — a query that happens to be both (a
 * surname that contains a team code) simply keeps both sets, instead
 * of the box silently deciding which kind of query it thought you
 * meant.
 *
 * A matchup is any one or two team codes with "@" or whitespace
 * between them, in either order: "buf@nyj", "buf nyj", "nyj@buf",
 * "buf@" and "@nyj" all name the Buffalo game, because the separator
 * is a separator and not a direction. Team codes go through the same
 * alias table the rest of the page uses, so "was" and "wsh" are one
 * team here exactly as they are everywhere else.
 *
 * Matching is on lowercase, trimmed, accent-folded text on BOTH sides,
 * so "kupp" finds "Kupp" and "kamara" finds "Kamará".
 * ------------------------------------------------------------------ */

function foldText(value) {
  const text = String(value === null || value === undefined ? "" : value)
    .toLowerCase().trim();
  /* Accent-folding is free where `normalize` exists and skipped where
   * it does not, rather than shipping a transliteration table. */
  if (!text.normalize) return text;
  try {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (err) {
    return text;
  }
}

/* The games a query NAMES, as game_ids. One or two tokens, each of
 * which must be a team in that game; anything else (three tokens, a
 * token that is nobody's code) names no game and leaves the query to
 * be read as a name. */
function searchGameIds(query) {
  const tokens = query.split(/[@\s]+/).filter(function (token) {
    return token.length > 0;
  });
  const ids = [];
  if (!tokens.length || tokens.length > 2) return ids;
  for (const game of ((state.board || {}).games || [])) {
    let all = true;
    for (const token of tokens) {
      if (!sameTeam(token, game.away) && !sameTeam(token, game.home)) {
        all = false;
        break;
      }
    }
    if (all) ids.push(String(game.game_id));
  }
  return ids;
}

/* The test a player is put to, or null for "no query, no filtering" —
 * an empty box is the board exactly as it first read. */
function searchMatcher() {
  const query = foldText(state.query);
  if (!query) return null;
  const ids = searchGameIds(query);
  return function (player) {
    if (ids.length && ids.indexOf(String(player.game_id)) >= 0) {
      return true;
    }
    return foldText(player.name).indexOf(query) >= 0;
  };
}

function searching() {
  return foldText(state.query) !== "";
}

/* The debounce. The box keeps the reader's keystrokes; the BOARD is
 * rebuilt once they stop. Anything that sets the query outright — the
 * native clear, Escape — cancels the pending rebuild first, so a
 * keystroke in flight can never land after it and bring the old query
 * back. */
let searchTimer = null;

function setSearch(text) {
  if (searchTimer !== null) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  const next = String(text === null || text === undefined ? "" : text);
  if (next === state.query) return;
  state.query = next;
  /* Forced, exactly as the filters are: the board did not move, only
   * what this reader wants to see of it. */
  render(true);
}

function queueSearch(text) {
  if (searchTimer !== null) clearTimeout(searchTimer);
  searchTimer = setTimeout(function () {
    searchTimer = null;
    setSearch(text);
  }, SEARCH_DEBOUNCE_MS);
}

/* ------------------------------------------------------------------
 * rendering
 * ------------------------------------------------------------------ */

function shownPlayers() {
  const players = (state.board && state.board.players) || [];
  const match = searchMatcher();
  return players.filter(function (p) {
    if (state.pos !== "ALL" && up(p.pos) !== state.pos) return false;
    return match ? match(p) : true;
  });
}

/* The slate in kickoff order — the order the groups read in and the
 * order the game chips read in, computed once so the two can never
 * disagree. A game the contract gave no kickoff sits at the end, in
 * game_id order, rather than jumping the queue. */
function orderedGames() {
  const games = ((state.board || {}).games || []).slice();
  return games.sort(function (a, b) {
    const left = ms(a.kickoff);
    const right = ms(b.kickoff);
    if (left === null && right === null) {
      return String(a.game_id).localeCompare(String(b.game_id));
    }
    if (left === null) return 1;
    if (right === null) return -1;
    if (left !== right) return left - right;
    return String(a.game_id).localeCompare(String(b.game_id));
  });
}

/* The game filter (m4.2b feature 7a). An empty selection is the whole
 * slate — the board exactly as it has always read — so the filter only
 * ever narrows, and "All" is the absence of a choice rather than a
 * thirty-third option to keep in step. */
function gameShown(gameId) {
  if (!state.gameFilter.length) return true;
  return state.gameFilter.indexOf(String(gameId)) >= 0;
}

function gameChipLabel(game) {
  return up(game.away) + "@" + up(game.home);
}

function toggleGameFilter(gameId) {
  const id = String(gameId);
  const at = state.gameFilter.indexOf(id);
  if (at >= 0) {
    state.gameFilter.splice(at, 1);
  } else {
    state.gameFilter.push(id);
  }
  render(true);
}

function anyKicked() {
  for (const key in state.live) {
    const status = state.live[key];
    if (status && (status.state === "in" || status.state === "post")) {
      return true;
    }
  }
  return false;
}

function sortValue(player) {
  const key = headlineFor(player.pos);
  if (state.sort === "live") {
    return liveValue(boxFor(player), key);
  }
  return numberOrNull((player.proj || {})[key]);
}

/* The value a Hot/Cold sort orders on (m4.2b feature 5): the pace
 * ratio, on the position's headline stat — the same stat every other
 * sort already reads — through the same `paceRatio` the colours run
 * on. There is no second clock model and no second projection here.
 *
 * A pace sort is a question that only a game in progress can answer:
 * pregame there is nothing observed, and after the whistle the ratio
 * would be against the whole projection rather than a share of it,
 * which is a different question with the same shape. Both, and any
 * player the feed or the contract left a hole in, return null — and
 * null is what puts a player BELOW the sortable ones in his group
 * rather than ranking him on a number nobody has. */
function paceSortValue(player) {
  const status = statusFor(player);
  if (!status || status.state !== "in") return null;
  const key = headlineFor(player.pos);
  return paceRatio((player.proj || {})[key],
    liveValue(boxFor(player), key), fractionElapsed(status), false);
}

function comparePlayers(a, b) {
  /* Hot/Cold first, and across the whole group: "who is running hot"
   * is a question about the game in front of you, not about one
   * position at a time, so the position rank below does not apply to
   * the players a ratio can be read for. Everyone else falls straight
   * through to the board's own order, unchanged, underneath them. */
  const direction = PACE_SORTS[state.sort];
  if (direction) {
    const paceA = paceSortValue(a);
    const paceB = paceSortValue(b);
    if (paceA !== null && paceB !== null) {
      if (paceA !== paceB) return direction * (paceA - paceB);
      return String(a.name).localeCompare(String(b.name));
    }
    if (paceA !== null) return -1;
    if (paceB !== null) return 1;
  }
  const orderA = POS_ORDER.indexOf(up(a.pos));
  const orderB = POS_ORDER.indexOf(up(b.pos));
  const rankA = orderA < 0 ? POS_ORDER.length : orderA;
  const rankB = orderB < 0 ? POS_ORDER.length : orderB;
  if (rankA !== rankB) return rankA - rankB;
  const valueA = sortValue(a);
  const valueB = sortValue(b);
  if (valueA === null && valueB === null) {
    return String(a.name).localeCompare(String(b.name));
  }
  if (valueA === null) return 1;
  if (valueB === null) return -1;
  if (valueB !== valueA) return valueB - valueA;
  return String(a.name).localeCompare(String(b.name));
}

function renderBanners() {
  const parts = [];
  if (state.demo) {
    parts.push('<div class="banner demo">' + esc(DEMO_BANNER) +
      '<span class="sub">' + esc(DEMO_SUB) + "</span></div>");
  }
  document.getElementById("topbanner").innerHTML = parts.join("");
}

function renderHeader() {
  const run = (state.board && state.board.run) || {};
  const now = Date.now();

  const bits = [];
  if (state.polling) bits.push('<span class="ld">● LIVE</span>');
  const label = [];
  if (run.season) label.push(esc(run.season));
  if (run.week !== undefined && run.week !== null) {
    label.push("WK " + esc(run.week));
  }
  if (run.band) label.push(esc(run.band));
  bits.push(label.join(" · ") || "board");
  document.getElementById("runpill").innerHTML = bits.join(" · ");

  /* Freshness dots: one per source the run block actually stamped.
   * A null source simply does not render a dot (UI_SPEC §6). */
  const dots = [];
  const sources = run.sources || {};
  const labels = {
    projections: "projections", schedule: "schedule", odds: "odds"
  };
  for (const key in labels) {
    const at = ms(sources[key]);
    if (at === null) continue;
    const age = ageLabel(at, now);
    const text = age === null
      ? "stamped " + (clockLabel(sources[key]) || "ahead")
      : age;
    const cls = (now - at) > FRESH_WARN_MS ? "st" : "ok";
    dots.push('<span class="' + cls + '">' + labels[key] + " " +
      esc(text) + "</span>");
  }
  /* The live layer's own freshness line (m4.2b feature 6), beside the
   * export's source stamps and in the same family: how long ago the
   * feed last answered, restated by every poll because every poll
   * re-renders this header. No timer of its own — the poll loop is the
   * clock, and a second one would be a second thing to get wrong.
   *
   * It is stamped by the load-time pass and stays; the pulsing LIVE
   * dot in the run pill above is the one that means the loop is
   * actively polling. */
  if (state.polling || state.feedSeen) {
    if (state.stale) {
      /* Three missed polls in a row (MISSED_POLLS_STALE): the LIVE
       * rows are frozen on their last known values and the colours
       * have already dropped to neutral, so the line says what is
       * happening and that it is still trying. The next poll that
       * answers clears it silently — nothing here latches. */
      dots.push('<span class="st stall">' + esc(FEED_STALLED) +
        "</span>");
    } else {
      const age = ageLabel(state.feedTs, now);
      dots.push('<span class="ok">' +
        (age === null
          ? esc(FEED_CONNECTING)
          : "updated " + esc(age) + " ago") + "</span>");
    }
  }
  document.getElementById("fresh").innerHTML = dots.join("");
}

function renderDisclosure() {
  const run = (state.board && state.board.run) || {};
  const parts = [];
  if (run.disclosure) {
    parts.push("<p>" + esc(run.disclosure) + "</p>");
  }
  parts.push("<p><b>" + esc(NOT_PICKS) + "</b></p>");
  if (up(run.band) === BAND_EARLY) {
    parts.push("<p>" + esc(EARLY_BLURB) + "</p>");
  }
  if (run.source === SOURCE_THIRDPARTY) {
    const banner = THIRDPARTY_BANNER.replace(
      "{week}", String(run.week === undefined ? "" : run.week));
    parts.push('<p class="tpline">' + esc(banner) + "</p>");
    if (run.thirdparty_attribution) {
      parts.push("<p>" + esc(run.thirdparty_attribution) + "</p>");
    }
  }
  document.getElementById("disclosure").innerHTML = parts.join("");
}

function renderControls() {
  const kicked = anyKicked();
  /* `Live` is disabled until a game has kicked, and a board that is
   * still pregame never leaves the sort sitting on it. */
  if (state.sort === "live" && !kicked) state.sort = "proj";

  const posseg = document.getElementById("posseg");
  posseg.innerHTML = "";
  for (const option of POS_FILTERS) {
    const button = document.createElement("button");
    button.textContent = option;
    button.className = option === state.pos ? "on" : "";
    button.onclick = function () {
      state.pos = option;
      render(true);
    };
    posseg.appendChild(button);
  }

  const sortseg = document.getElementById("sortseg");
  sortseg.innerHTML = "";
  for (const entry of SORTS) {
    const key = entry[0];
    const button = document.createElement("button");
    button.textContent = entry[1];
    button.className = key === state.sort ? "on" : "";
    if (key === "live" && !kicked) {
      button.disabled = true;
      button.title = "Live sorting opens once a game has kicked off";
    }
    /* The pace sorts are never locked. `Live` is, because with nothing
     * kicked off it would sort a column of nulls and can only be
     * wrong; Hot and Cold have an honest answer with nothing live —
     * the board exactly as it already reads — so they degrade to it
     * instead of going dark and coming back. */
    if (PACE_SORTS[key]) button.title = PACE_SORT_TITLE;
    button.onclick = function () {
      state.sort = key;
      render(true);
    };
    sortseg.appendChild(button);
  }

  renderSearch();
  renderGameChips();
}

/* The search box is authored in index.html — it is a real `<input
 * type="search">` with its own label, not a div this file dresses up —
 * so all that happens here is the wiring, re-attached on every render
 * the way every other control on this page is rebuilt on every render.
 *
 * Typing is debounced; the native clear (×) and Escape are not, because
 * both are the reader saying "that is enough of that" and a wait would
 * read as a stuck box. Escape also empties the field itself, so what
 * the box says and what the board is showing can never disagree. */
function renderSearch() {
  const input = document.getElementById("search");
  if (!input) return;
  const shown = String(input.value === null || input.value === undefined
    ? "" : input.value);
  /* Only ever written when it has actually drifted from the state (a
   * fresh element, or Escape from somewhere else): assigning `value`
   * on every render would move the caret to the end mid-word. */
  if (shown !== state.query) input.value = state.query;
  input.oninput = function () { queueSearch(input.value); };
  /* WebKit fires `search` on the native × and on its own Escape; both
   * land on the same one-line handler the keyboard path uses. */
  input.onsearch = function () { setSearch(input.value); };
  input.onkeydown = function (event) {
    const key = String((event && event.key) || "");
    if (key !== "Escape" && key !== "Esc") return;
    input.value = "";
    setSearch("");
  };
}

/* One chip per game on the board, in kickoff order, behind a leading
 * "All" (m4.2b feature 7a). Real buttons in the control family the
 * position filter and the sorts already wear: they take focus, they
 * answer the keyboard, and each says out loud whether it is chosen
 * (aria-pressed). The chip's own text is its spoken name — no
 * aria-label, so what a reader sees and what a reader says are the
 * same words — and the row it sits in carries the label that makes
 * "BUF@NYJ" mean a game (index.html: "Filter by game").
 *
 * The row is rebuilt on every render from the board's own game list,
 * so it cannot drift out of step with the groups below it. */
function chipButton(label, on, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = on ? "on" : "";
  button.setAttribute("aria-pressed", on ? "true" : "false");
  button.onclick = handler;
  return button;
}

function renderGameChips() {
  const host = document.getElementById("gameseg");
  if (!host) return;
  host.innerHTML = "";
  const games = orderedGames();
  if (!games.length) return;

  host.appendChild(chipButton("All", !state.gameFilter.length,
    function () {
      state.gameFilter = [];
      render(true);
    }));

  for (const game of games) {
    const id = String(game.game_id);
    const on = state.gameFilter.indexOf(id) >= 0;
    host.appendChild(chipButton(gameChipLabel(game), on, function () {
      toggleGameFilter(id);
    }));
  }
}

/* The period, as the feed states it: halftime and overtime are what
 * the feed called them rather than a quarter number we invented, and a
 * feed that gave us no period at all says nothing here. */
function periodLabel(status) {
  const detail = String((status && status.detail) || "").toLowerCase();
  const period = numberOrNull(status && status.period) || 0;
  if (detail.indexOf("halftime") >= 0) return "HALF";
  if (period > 4) return "OT";
  if (period > 0) return "Q" + period;
  return "";
}

/* "Q3 · 7:42" — the quarter and the game clock, in the board's own
 * separator. Halftime has no clock to show. A payload that carries
 * neither period nor clock falls back to the feed's own words, and
 * only a payload with nothing at all says the bare "LIVE"; nothing
 * here ever renders a placeholder for a field the feed omitted. */
function liveClockLabel(status) {
  const label = periodLabel(status);
  if (label === "HALF") return label;
  const clock = String((status && status.displayClock) || "").trim();
  const bits = [];
  if (label) bits.push(label);
  if (clock) bits.push(clock);
  if (bits.length) return bits.join(" · ");
  return String((status && status.detail) || "").trim() || "LIVE";
}

function statusPill(status, game) {
  if (status && status.state === "in") {
    return '<span class="gspill live"><span class="dot"></span>' +
      esc(liveClockLabel(status)) + "</span>";
  }
  if (status && status.state === "post") {
    return '<span class="gspill final">FINAL</span>';
  }
  const kick = clockLabel(game.kickoff);
  return '<span class="gspill pre">' + esc(kick || "TBD") + "</span>";
}

function gameMeta(game) {
  const bits = [];
  const kick = kickoffLabel(game.kickoff);
  if (kick) bits.push(kick);
  if (numberOrNull(game.ou) !== null) {
    bits.push("O/U " + numberOrNull(game.ou).toFixed(1));
  }
  if (numberOrNull(game.spread) !== null) {
    const spread = numberOrNull(game.spread);
    bits.push("spread " + (spread > 0 ? "+" : "") + spread.toFixed(1));
  }
  return bits.join(" · ");
}

/* The ball, next to the team holding it. Only ever rendered for a game
 * the feed says is in progress, and only when the payload actually
 * named a possessing team — an absent field draws nothing at all. */
function possessionHTML(team) {
  return ' <span class="poss" role="img" aria-label="' + esc(team) +
    ' has the ball">●</span>';
}

function possessingTeam(status) {
  if (!status || status.state !== "in") return "";
  return up(status.possession);
}

/* The red-zone chip (m4.2b feature 3): the "look up now" mark, shown
 * ONLY when the scoreboard's own `situation.isRedZone` said so on a
 * game that is in progress. Nothing is approximated from a yard line. */
function inRedZone(status) {
  return !!(status && status.state === "in" && status.redZone);
}

function redZoneChipHTML() {
  return '<span class="rz" role="img" aria-label="Red zone">RZ</span>';
}

/* A player's own card wears the chip only if HIS team has the ball in
 * the red zone, so the chip on a card always means "this player's
 * offense is about to score". No possession in the payload means no
 * card chips at all — the header chip stands alone rather than being
 * guessed onto one side. */
function playerInRedZone(player, status) {
  if (!inRedZone(status)) return false;
  const holder = possessingTeam(status);
  if (!holder) return false;
  return sameTeam(player.team, holder);
}

/* AWAY @ HOME, with the live score and the possession mark. The score
 * is the feed's own away–home pair in the order the title already
 * reads, and it renders for a game in progress and for a final alike;
 * a payload missing either side renders no score rather than half of
 * one. */
function gameTitleHTML(game, status) {
  const away = up(game.away);
  const home = up(game.home);
  const holder = possessingTeam(status);
  const awayBall = !!holder && sameTeam(holder, away);
  const homeBall = !!holder && !awayBall && sameTeam(holder, home);
  let title = esc(away) + (awayBall ? possessionHTML(away) : "") +
    " @ " + esc(home) + (homeBall ? possessionHTML(home) : "");
  if (status && (status.state === "in" || status.state === "post")) {
    const a = status.awayScore;
    const h = status.homeScore;
    if (a !== null && a !== undefined && h !== null && h !== undefined) {
      title += ' <span class="sc">' + esc(a) + "–" + esc(h) + "</span>";
    }
  }
  return title;
}

/* The disclosure control (m4.2b feature 7b), at the end of the game
 * header. A button, because it is one: it takes focus, it answers the
 * keyboard, and it says out loud whether the group under it is open
 * (aria-expanded) and what pressing it would do (aria-label). It sits
 * AFTER the status block, so everything the header already said stays
 * where it was — a folded game is still glanceable.
 *
 * A game the contract gave no id gets no control at all rather than
 * one that would forget which game it folded. */
function collapseToggleHTML(game, collapsed) {
  const id = game.game_id === null || game.game_id === undefined
    ? "" : String(game.game_id);
  if (!id) return "";
  const label = up(game.away) + " at " + up(game.home);
  return '<button type="button" class="fold' + (collapsed ? " on" : "") +
    '" data-fold="' + esc(id) +
    '" aria-expanded="' + (collapsed ? "false" : "true") +
    '" aria-label="' + (collapsed ? "Expand " : "Collapse ") + esc(label) +
    '" onclick="onCollapseClick(this)">' + (collapsed ? "▸" : "▾") +
    "</button>";
}

/* ONE game-header renderer. A folded group renders exactly this and
 * nothing else, so a collapsed game keeps every piece of live context
 * the open one has — score, clock, possession, red-zone chip, status
 * pill — and folding is only ever a question about the cards. */
function gameHeadHTML(game, status, collapsed) {
  const away = up(game.away);
  const home = up(game.home);
  const chip = inRedZone(status) ? redZoneChipHTML() : "";
  return '<div class="ghead">' +
    '<div class="gbadges">' +
    '<div class="gbadge" style="background:' + teamColor(away) + '">' +
    esc(away) + "</div>" +
    '<div class="gbadge" style="background:' + teamColor(home) + '">' +
    esc(home) + "</div></div>" +
    '<div class="gmain"><div class="gtitle">' +
    gameTitleHTML(game, status) + "</div>" +
    '<div class="gmeta">' + esc(gameMeta(game)) + "</div></div>" +
    '<div class="gstatus">' + chip + statusPill(status, game) +
    "</div>" + collapseToggleHTML(game, !!collapsed) + "</div>";
}

function statGridHTML(player, status) {
  const columns = schemaFor(player.pos);
  const count = columns.length;
  const proj = player.proj || {};
  const box = boxFor(player);
  const started = !!(status &&
    (status.state === "in" || status.state === "post"));
  const isFinal = !!(status && status.state === "post");
  const frac = fractionElapsed(status);

  let head = '<div class="srow shead" style="--n:' + count +
    '"><div></div>';
  let projRow = '<div class="srow proj" style="--n:' + count +
    '"><div class="rlab">PROJ</div>';
  for (const column of columns) {
    head += '<div class="cell">' + esc(column[0]) + "</div>";
    projRow += '<div class="cell">' + fmt(proj[column[1]], column[2]) +
      "</div>";
  }
  head += "</div>";
  projRow += "</div>";

  let liveRow = "";
  if (started && box) {
    liveRow = '<div class="srow liver" style="--n:' + count +
      '"><div class="rlab lv">' + (isFinal ? "FINAL" : "LIVE") +
      "</div>";
    for (const column of columns) {
      const actual = liveValue(box, column[1]);
      const cls = paceClass(proj[column[1]], actual, frac, isFinal);
      liveRow += '<div class="cell ' + cls + '">' + fmt(actual, 0) +
        "</div>";
    }
    liveRow += "</div>";
  }
  return '<div class="stats">' + head + projRow + liveRow + "</div>";
}

/* Usage vs expected-to-now (m4.2b feature 4, D-077: "labelled
 * arithmetic on published values").
 *
 * ONE compact line, live only: the opportunity count the box score has
 * already given us, beside the SAME projection the PROJ row above
 * carries, multiplied by the SAME fraction of the game the pace colours
 * are already computed from. There is no second clock model here and no
 * second projection — `fractionElapsed` and `player.proj` are the two
 * inputs, and the only operation is a multiply.
 *
 * It says "expected by now" out loud because that is the whole of what
 * it means: a share of a published projection, not a forecast of where
 * the player is heading and not a probability of anything.
 *
 * Live only, and deliberately: pregame there is no observation to
 * compare, and after the whistle the frozen FINAL row already carries
 * the comparison against the whole projection, so a scaled one would be
 * a second, worse answer to a question already answered.
 */
function usageLineHTML(player, status) {
  if (!status || status.state !== "in") return "";
  const rows = USAGE[up(player.pos)];
  if (!rows) return "";
  /* A game the feed gave us no position in is a game we cannot scale a
   * projection into — nothing is rendered rather than a zero. */
  const frac = fractionElapsed(status);
  if (!(frac > 0)) return "";
  const box = boxFor(player);
  if (!box) return "";
  const proj = player.proj || {};

  const bits = [];
  for (const row of rows) {
    const projected = numberOrNull(proj[row[0]]);
    const observed = liveValue(box, row[0]);
    /* Either side missing is silence: no placeholder, no em-dash, no
     * half a sentence. A projection of zero has no share to take. */
    if (observed === null || projected === null || !(projected > 0)) {
      continue;
    }
    const expected = projected * frac;
    const noun = Math.abs(Math.round(observed)) === 1 ? row[1] : row[2];
    /* The observed number wears the stat grid's own pace class, on the
     * same thresholds and the same inputs, so the line and the row
     * above it can never disagree about who is ahead. */
    bits.push('<span class="' +
      paceClass(projected, observed, frac, false) + '">' +
      esc(Math.round(observed)) + "</span> " + esc(noun) + " vs " +
      esc(expected.toFixed(1)) + " " + EXPECTED_BY_NOW);
  }
  if (!bits.length) return "";
  return '<p class="usage">' + bits.join(" · ") + "</p>";
}

/* QB only, live or final: the two things the box score carries that
 * the engine has no projection for (D-075 §0). It is a secondary
 * line, never a PROJ/LIVE pair, and it never appears pregame. */
function boxLineHTML(player, status) {
  if (up(player.pos) !== "QB") return "";
  if (!status || (status.state !== "in" && status.state !== "post")) {
    return "";
  }
  const box = boxFor(player);
  if (!box) return "";
  const completions = numberOrNull(box.cmp);
  const attempts = numberOrNull(box.att);
  const ints = numberOrNull(box.ints);
  if (completions === null && attempts === null && ints === null) {
    return "";
  }
  const bits = [];
  if (completions !== null || attempts !== null) {
    bits.push("Cmp/Att " +
      (completions === null ? BLANK : completions) + "/" +
      (attempts === null ? BLANK : attempts));
  }
  if (ints !== null) bits.push("Int " + ints);
  return '<p class="boxline">' + esc(bits.join(" · ")) +
    ' <span class="src">— box score</span></p>';
}

/* The always-visible pace chip (m4.2b feature 8a).
 *
 * Until now a reader inferred hot or cold from the colour of a number,
 * or by choosing the Hot/Cold sort. The chip says it in words, on every
 * live card, without being asked — and it says it from the SAME
 * `paceClass` the LIVE cells are painted with, on the position's
 * headline stat, so the chip, the colours and the pace sorts are three
 * views of one ratio rather than three numbers to keep in step.
 *
 * Live cards only. Pregame there is no pace to be ahead of, and after
 * the whistle the frozen FINAL row already says how the day went
 * against the whole projection — a chip beside it would be a second,
 * worse answer. A live card whose ratio cannot be read keeps the
 * neutral chip rather than losing it: the point of the feature is that
 * the state is always visualised, and "we cannot read this one" is one
 * of the states.
 */
function paceChipHTML(player, status) {
  if (!status || status.state !== "in") return "";
  const key = headlineFor(player.pos);
  const projected = (player.proj || {})[key];
  const actual = liveValue(boxFor(player), key);
  const frac = fractionElapsed(status);
  const cls = paceClass(projected, actual, frac, false);
  const chip = PACE_CHIPS[cls] || PACE_CHIPS["c-n"];
  /* The one thing the class alone cannot tell the chip apart: a level
   * pace and an unreadable one are the same quiet chip, and only the
   * second must not be called "on pace". */
  const readable = !state.stale &&
    paceRatio(projected, actual, frac, false) !== null;
  const label = cls === "c-n" && !readable ? PACE_CHIP_UNREAD : chip[1];
  return '<span class="pchip ' + cls + '" role="img" aria-label="' +
    esc(label) + '">' + chip[0] + "</span>";
}

/* The achievement hero number (m4.2b feature 9).
 *
 * ONE large number on the card's right rail: how much of this player's
 * PROJECTED STATLINE has actually landed, as a percentage. It is
 * `achievedScore / projectedScore` and nothing else — a share of a
 * published projection, expressed the way a share is expressed. It is
 * never a point total, and neither total is ever shown.
 *
 * Live or final only, and only when there is something to divide: a
 * projection worth more than nothing, and at least one weighted live
 * value on the card. Pregame there is no achievement to state, so there
 * is no hero at all — not a zero, not a placeholder. At the whistle the
 * number simply stops moving, because the inputs do.
 *
 * The COLOUR is `paceClass` — the very function the LIVE cells, the
 * usage line, the pace chip and the Hot/Cold sorts already run on, with
 * the projected total standing in for "the projection" and the achieved
 * total for "the observed". Same two thresholds, same clock, same
 * staleness rule: while the game runs the comparison is against the
 * share of the game played, and at final it is against the whole game.
 *
 * So the hero and the pace chip can disagree, and there is exactly ONE
 * reason they ever will: the chip reads the position's HEADLINE STAT
 * and the hero reads the WHOLE STATLINE. A receiver short of targets
 * who has already scored is behind on the chip and ahead on the hero,
 * and both are true. They cannot disagree about thresholds, about the
 * clock, or about a stalled feed, because there is only one copy of
 * each and this function does not carry a second.
 */
function achievementHTML(player, status) {
  if (!status || (status.state !== "in" && status.state !== "post")) {
    return "";
  }
  const isFinal = status.state === "post";
  const projected = projectedScore(player);
  /* Nothing weighted was projected for him — there is no denominator,
   * so there is no percentage and nothing is rendered. */
  if (!(projected > 0)) return "";
  const achieved = achievedScore(boxFor(player));
  /* The feed has carried nothing of his that the projection speaks
   * about. Silence, rather than a 0% he has not earned. */
  if (achieved === null) return "";

  const frac = fractionElapsed(status);
  const cls = paceClass(projected, achieved, frac, isFinal);
  const share = Math.round(100 * achieved / projected);
  const sub = isFinal
    ? ACH_FINAL
    : Math.round(100 * frac) + ACH_PLAYED;
  return '<div class="cright">' +
    '<div class="ach ' + cls + (isFinal ? " fin" : "") +
    '" role="img" aria-label="' + esc(share + ACH_ARIA) + '">' +
    esc(share) + "%</div>" +
    '<div class="achsub">' + esc(sub) + "</div></div>";
}

/* A player's own id, normalised. A contract that gave us none is a
 * player nothing can be kept against — no star, no stamp — rather than
 * one keyed on a blank. */
function playerKey(player) {
  const id = (player || {}).player_id;
  return id === null || id === undefined ? "" : String(id);
}

/* The live numbers a card is showing, as one comparable string: the
 * LIVE row's own values, read through the same `liveValue` the row is
 * drawn from, plus the box-score fields the QB line renders. Nothing
 * derived and nothing rounded — this is only "are these the same
 * numbers as last time". */
function liveSignature(player) {
  const box = boxFor(player);
  if (!box) return null;
  const values = [];
  for (const column of schemaFor(player.pos)) {
    values.push(liveValue(box, column[1]));
  }
  for (const field of BOX_LINE_FIELDS) {
    values.push(numberOrNull(box[field]));
  }
  return JSON.stringify(values);
}

/* Called once per feed pass, before the render it feeds: for every
 * player on the board whose game is in progress, compare the numbers
 * his card would draw now against the ones it drew last pass, and, when
 * they have moved, stamp him with the game clock of HIS game at this
 * poll — the same `liveClockLabel` the game header reads.
 *
 * The first pass over a player records his numbers and stamps nothing:
 * arriving at a card with eighteen carries on it tells us he has
 * eighteen carries, not when he got the eighteenth. A game that is not
 * in progress — pregame, or final — has no stamp and no baseline at
 * all: before kickoff there is nothing to be current about, and after
 * the whistle the FINAL row takes over.
 */
function markFreshness() {
  for (const player of ((state.board || {}).players) || []) {
    const id = playerKey(player);
    if (!id) continue;
    const status = statusFor(player);
    if (!status || status.state !== "in") {
      delete FRESH.sigs[id];
      delete FRESH.stamps[id];
      continue;
    }
    const signed = liveSignature(player);
    if (signed === null) continue;
    const previous = FRESH.sigs[id];
    FRESH.sigs[id] = signed;
    /* No baseline yet, or the same numbers as last poll: the stamp this
     * player already carries is still the truth, so it does not move. */
    if (previous === undefined || previous === signed) continue;
    FRESH.stamps[id] = liveClockLabel(status);
  }
}

/* The stamp itself: a small muted tag saying, in game time, how current
 * this player's numbers are. A player we have not yet watched change
 * renders NOTHING — no placeholder, no em-dash, no "—" — because the
 * only honest answer before then is silence. */
function freshStampHTML(player, status) {
  if (!status || status.state !== "in") return "";
  const stamp = FRESH.stamps[playerKey(player)];
  if (!stamp) return "";
  return '<p class="laststat">' + esc(LAST_STAT + stamp) + "</p>";
}

/* The star, in the card's own header row. A button, because it is one:
 * it takes focus, it answers the keyboard, and it says out loud which
 * of the two states it is in (aria-pressed) and what pressing it would
 * do (aria-label). A player the contract gave no stable id gets no
 * control at all rather than one that would forget him. */
function pinStarHTML(player, pins) {
  const id = playerKey(player);
  if (!id) return "";
  const on = hasPin(pins, id);
  return '<button type="button" class="pin' + (on ? " on" : "") +
    '" data-pin="' + esc(id) +
    '" aria-pressed="' + (on ? "true" : "false") +
    '" aria-label="' + (on ? "Unpin " : "Pin ") + esc(player.name) +
    '" onclick="onPinClick(this)">' + (on ? "★" : "☆") + "</button>";
}

/* ONE card renderer. The Pinned section calls exactly this, with
 * exactly the game and status the group below would pass, so a pinned
 * card is the same card — same PROJ/LIVE rows, same pace colours, same
 * live updates — and not a second rendering to keep in step. */
function cardHTML(player, game, status, pins) {
  const team = up(player.team);
  const opponent = sameTeam(team, game.home)
    ? "vs " + up(game.away)
    : "@ " + up(game.home);
  const injury = player.injury === "Q"
    ? '<span class="qtag">Q</span>' : "";
  /* Built from `status` on every render, never cached: the chip is
   * gone from the next render the moment the feed says the drive
   * ended, in the Pinned copies of this card as well, because those
   * are this same card. */
  const chip = playerInRedZone(player, status) ? redZoneChipHTML() : "";
  /* Built from `status` and the live join on every render too, and for
   * the same reason: a card's pace state is what the last poll said,
   * never what the last render happened to leave behind. */
  const pace = paceChipHTML(player, status);
  /* Recomputed on every render for the same reason again: the hero is
   * a division of two live totals, and it moves whenever they do — in
   * the Pinned copies of this card as well, because those ARE this
   * card. It sits before the star so the star keeps the outside edge
   * and its thumb-sized target is never crowded. */
  const hero = achievementHTML(player, status);
  return '<div class="card">' +
    '<div class="cardtop">' +
    '<div class="badge" style="background:' + teamColor(team) + '">' +
    esc(team) + "</div>" +
    '<div class="cmain">' +
    '<div class="teamline">' + esc(team) + " " + esc(opponent) +
    "</div>" +
    '<div class="pname">' + esc(player.name) +
    '<span class="postag">' + esc(up(player.pos)) + "</span>" +
    injury + pace + chip + "</div></div>" +
    hero + pinStarHTML(player, pins) + "</div>" +
    statGridHTML(player, status) +
    usageLineHTML(player, status) +
    boxLineHTML(player, status) +
    freshStampHTML(player, status) +
    "</div>";
}

/* The Pinned group's header: the game header's shape and rules, with
 * the slate line replaced by what the group is. */
function pinnedHeadHTML(count) {
  const label = count === 1 ? "1 player" : count + " players";
  return '<div class="ghead phead">' +
    '<div class="gmain">' +
    '<div class="gtitle"><span class="pinmark">★</span> Pinned</div>' +
    '<div class="gmeta">' + esc(label) +
    " · each one also kept in the slate below</div></div></div>";
}

function renderGames() {
  const host = document.getElementById("games");
  const empty = document.getElementById("empty");
  const board = state.board || {};
  const games = board.games || [];
  const shown = shownPlayers();

  if (state.error) {
    host.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = "<b>The board could not be loaded.</b>" +
      esc(state.error) + " Nothing is shown rather than something " +
      "invented.";
    return;
  }
  if (!(board.players || []).length) {
    host.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = "<b>No projections on this board.</b>" +
      "Nothing was exported for this slate, so the board is empty " +
      "rather than filled with placeholder numbers.";
    return;
  }
  empty.hidden = true;
  empty.innerHTML = "";

  const ordered = orderedGames();

  /* Read once per render, never cached in the DOM: whatever rebuilt
   * the page — a poll, a finals backfill, a filter — rebuilds it
   * against the pins and the folded games as they stand now. */
  const pins = readIds(PINS);
  const folded = readIds(FOLDS);

  const chunks = [];
  const pinned = [];
  for (const game of ordered) {
    /* A game the reader did not choose is ABSENT, header and all: the
     * game filter governs the whole board, exactly as the position
     * filter does. */
    if (!gameShown(game.game_id)) continue;
    const players = shown.filter(function (p) {
      return String(p.game_id) === String(game.game_id);
    });
    /* A game with no matching players hides entirely (UI_SPEC §1). */
    if (!players.length) continue;
    players.sort(comparePlayers);
    const status = state.live[game.game_id] || null;
    const shut = isCollapsed(folded, game.game_id);
    let block = gameHeadHTML(game, status, shut);
    for (const player of players) {
      const card = cardHTML(player, game, status, pins);
      /* A folded group is its header alone. The cards are still BUILT,
       * because a pinned player from a folded game is still this
       * reader's pinned player: folding a game puts its group away, it
       * does not take anything out of the Pinned section. */
      if (!shut) block += card;
      /* Collected inside the SAME walk that builds the groups, so the
       * Pinned section comes out in kickoff order and then in board
       * order — the order the slate below reads in — rather than in
       * the order the stars happened to be tapped. A pinned player a
       * filter is hiding is hidden here too: the filters govern the
       * whole board. */
      if (hasPin(pins, player.player_id)) pinned.push(card);
    }
    chunks.push("<section>" + block + "</section>");
  }

  /* Above the groups when there is anything to show, and absent
   * entirely when there is not — a pinned id that is not on this
   * board renders nothing and stays in storage. */
  const top = pinned.length
    ? "<section>" + pinnedHeadHTML(pinned.length) + pinned.join("") +
      "</section>"
    : "";
  host.innerHTML = top + chunks.join("");

  if (!chunks.length) {
    empty.hidden = false;
    empty.innerHTML = "<b>No players at this filter.</b>" +
      "Every game on the slate is hidden" + emptyReason();
  }
}

/* Why the board came out empty, in the reader's own terms: which of
 * the three filters did it, and what to press to get the slate back.
 *
 * The search is named FIRST when it is in force, because it is the one
 * a reader typed rather than tapped: a word left in a box is the
 * easiest of the three to forget about, and the hardest to spot on the
 * page. When the other two are also narrowing the board it says so,
 * rather than blaming the search for all of it. */
function emptyReason() {
  const chosen = state.gameFilter.length > 0;
  if (searching()) {
    const also = (chosen || state.pos !== "ALL")
      ? ", with your other filters still on" : "";
    return " because nothing on this board matches your search for " +
      '"' + esc(state.query.trim()) + '"' + also +
      " — clear the search box to bring the slate back.";
  }
  if (chosen && state.pos !== "ALL") {
    return " because no game you chose has a " + esc(state.pos) +
      " on the board — tap All to widen the slate.";
  }
  if (chosen) {
    return " by the game filter — tap All to bring the slate back.";
  }
  if (state.pos !== "ALL") {
    return " because none of them has a " + esc(state.pos) +
      " on the board.";
  }
  return ": no player on this board belongs to a game on it.";
}

function renderFooter() {
  const run = (state.board && state.board.run) || {};
  const parts = [];
  const provenance = [];
  if (run.engine_version) {
    provenance.push("engine <b>" + esc(run.engine_version) + "</b>");
  }
  if (run.generation_id) {
    provenance.push("generation <b>" + esc(run.generation_id) + "</b>");
  }
  if (run.generated_ts) {
    provenance.push("generated <b>" + esc(stampLabel(run.generated_ts)) +
      "</b>");
  }
  if (provenance.length) {
    parts.push("<p>" + provenance.join(" · ") + "</p>");
  }
  parts.push("<p>" + esc(PUBLIC_EXPOSURE) + "</p>");
  parts.push("<p>" + esc(NOT_PICKS) + "</p>");
  if (run.disclosure) parts.push("<p>" + esc(run.disclosure) + "</p>");
  if (run.source === SOURCE_THIRDPARTY && run.thirdparty_attribution) {
    parts.push("<p>" + esc(run.thirdparty_attribution) + "</p>");
  }
  parts.push("<p>Top row is the projected stat line; the row under it " +
    "is live actuals from the public box score, colored against the " +
    "share of the game played. " + esc(BLANK) +
    " means the number rounds to nothing.</p>");
  document.getElementById("foot").innerHTML = parts.join("");
}

function signature() {
  return JSON.stringify([state.pos, state.sort, state.gameFilter,
    state.query, state.polling, state.stale, state.live, state.box]);
}

function render(force) {
  const stamp = signature();
  if (!force && stamp === state.signature) {
    renderHeader();
    return;
  }
  state.signature = stamp;
  renderBanners();
  renderHeader();
  renderDisclosure();
  renderControls();
  renderGames();
  renderFooter();
}

/* ------------------------------------------------------------------
 * the live layer — the browser's own requests, compared and dropped
 * ------------------------------------------------------------------ */

async function getJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); },
    FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal, cache: "no-store"
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/* The scoreboard, scoped to THIS BOARD'S week. Without the scoping
 * ESPN answers with its own idea of the current week, and a Thursday
 * game read on Sunday night is simply not in the payload. year /
 * seasontype / week come off the exported run block — the page still
 * computes nothing, it only asks for the week it was built for. */
function scoreboardURL() {
  const run = (state.board && state.board.run) || {};
  const year = numberOrNull(run.season);
  const week = numberOrNull(run.week);
  if (year === null || week === null) return ESPN_SCOREBOARD;
  return ESPN_SCOREBOARD +
    "?year=" + encodeURIComponent(year) +
    "&seasontype=" + encodeURIComponent(ESPN_SEASONTYPE_REG) +
    "&week=" + encodeURIComponent(week);
}

function eventTeams(event) {
  const competition = ((event || {}).competitions || [])[0] || {};
  const out = {
    away: "", home: "", awayScore: null, homeScore: null,
    awayId: "", homeId: ""
  };
  for (const competitor of competition.competitors || []) {
    const team = (competitor || {}).team || {};
    const abbr = up(team.abbreviation);
    const id = team.id === undefined || team.id === null
      ? "" : String(team.id);
    const score = competitor.score;
    if (up(competitor.homeAway) === "HOME") {
      out.home = abbr;
      out.homeId = id;
      out.homeScore = score === undefined ? null : score;
    } else {
      out.away = abbr;
      out.awayId = id;
      out.awayScore = score === undefined ? null : score;
    }
  }
  return out;
}

/* `situation.possession` is the ESPN TEAM ID of the offense, which is
 * only meaningful against the two competitors of this same event, so
 * it is resolved here into one of the two abbreviations the rest of
 * the page already speaks. Some payloads name the team by its
 * abbreviation instead; that is accepted too. Anything we cannot match
 * to one of these two teams is no possession at all. */
function possessionAbbr(situation, teams) {
  const raw = (situation || {}).possession;
  if (raw === null || raw === undefined || raw === "") return null;
  const id = String(raw);
  if (teams.homeId && id === teams.homeId) return teams.home;
  if (teams.awayId && id === teams.awayId) return teams.away;
  const abbr = up(raw);
  if (abbr && abbr === teams.home) return teams.home;
  if (abbr && abbr === teams.away) return teams.away;
  return null;
}

/* board game ↔ scoreboard event. `espn_event_id` wins whenever the
 * contract carries one; it is null on every game today, so the
 * standing join is matched team abbreviations (through the alias
 * table) on the same kickoff date in UTC. */
function matchEvent(game, events) {
  if (game.espn_event_id) {
    for (const event of events) {
      if (String(event.id) === String(game.espn_event_id)) return event;
    }
  }
  const day = utcDay(game.kickoff);
  for (const event of events) {
    if (day !== null && utcDay(event.date) !== day) continue;
    const teams = eventTeams(event);
    const straight = sameTeam(teams.away, game.away) &&
      sameTeam(teams.home, game.home);
    const swapped = sameTeam(teams.home, game.away) &&
      sameTeam(teams.away, game.home);
    if (straight || swapped) return event;
  }
  return null;
}

function absorbScoreboard(events) {
  const list = events || [];
  const now = Date.now();
  for (const game of (state.board.games || [])) {
    const event = matchEvent(game, list);
    if (!event) continue;
    const competition = (event.competitions || [])[0] || {};
    const status = competition.status || event.status || {};
    const type = status.type || {};
    const teams = eventTeams(event);
    const previous = state.live[game.game_id] || {};
    const feedState = String(type.state || "").toLowerCase();
    /* The drive block of the SAME scoreboard record everything above
     * is read from — no second endpoint, no extra request. */
    const situation = competition.situation || {};
    const playing = feedState === "in";
    const next = {
      state: feedState === "in" || feedState === "post"
        ? feedState : "pre",
      period: numberOrNull(status.period),
      displayClock: status.displayClock || null,
      detail: type.shortDetail || type.detail || null,
      awayScore: teams.awayScore,
      homeScore: teams.homeScore,
      /* Both are live-only. A pregame record has no drive, and a final
       * one can still carry the last one it had — reading either onto
       * a game that is not in progress would leave a chip on the page
       * after the whistle. */
      possession: playing ? possessionAbbr(situation, teams) : null,
      redZone: playing && situation.isRedZone === true,
      eventId: String(event.id || ""),
      finalAt: previous.finalAt || null,
      finalOnArrival: previous.finalOnArrival || false
    };
    /* A game we watched go final keeps the ten-minute trailing window
     * (a stat correction still lands there). A game that was ALREADY
     * final the first time we looked has no trail to keep open: we
     * read its box score once, on load, and there is nothing further
     * to watch. */
    if (next.state === "post" && !next.finalAt && !next.finalOnArrival) {
      if (state.firstPass) {
        next.finalOnArrival = true;
      } else {
        next.finalAt = now;
      }
    }
    state.live[game.game_id] = next;
  }
}

function statIndex(block, candidates) {
  const keys = (block.keys || []).map(function (k) {
    return String(k).toLowerCase();
  });
  const labels = (block.labels || []).map(function (k) {
    return String(k).toUpperCase();
  });
  for (const candidate of candidates) {
    let at = keys.indexOf(String(candidate).toLowerCase());
    if (at >= 0) return at;
    at = labels.indexOf(String(candidate).toUpperCase());
    if (at >= 0) return at;
  }
  return -1;
}

function assignBox(box, field, raw) {
  if (field === "cmpatt") {
    const parts = String(raw === null || raw === undefined ? "" : raw)
      .split("/");
    if (parts.length !== 2) return;
    box.cmp = numberOrNull(parts[0]);
    box.att = numberOrNull(parts[1]);
    return;
  }
  const number = numberOrNull(raw);
  if (number !== null) box[field] = number;
}

function absorbSummary(payload) {
  const teams = ((payload || {}).boxscore || {}).players || [];
  for (const team of teams) {
    for (const block of (team.statistics || [])) {
      const spec = BOX_BLOCKS[String(block.name || "").toLowerCase()];
      if (!spec) continue;
      const positions = {};
      for (const field in spec) {
        positions[field] = statIndex(block, spec[field]);
      }
      for (const entry of (block.athletes || [])) {
        const id = String(((entry || {}).athlete || {}).id || "");
        if (!id) continue;
        const stats = entry.stats || [];
        const box = state.box[id] || (state.box[id] = {});
        for (const field in positions) {
          const at = positions[field];
          if (at < 0 || at >= stats.length) continue;
          assignBox(box, field, stats[at]);
        }
      }
    }
  }
}

async function pollSummaries() {
  const wanted = [];
  for (const game of (state.board.games || [])) {
    const status = state.live[game.game_id];
    if (!status || !status.eventId) continue;
    if (status.state === "in") {
      wanted.push(game);
    } else if (status.state === "post" && !state.finalBox[game.game_id]) {
      wanted.push(game);
    }
  }
  if (!wanted.length) return true;
  let good = 0;
  for (const game of wanted) {
    const status = state.live[game.game_id];
    try {
      const payload = await getJSON(ESPN_SUMMARY + "?event=" +
        encodeURIComponent(status.eventId));
      absorbSummary(payload);
      if (status.state === "post") state.finalBox[game.game_id] = true;
      good += 1;
    } catch (err) {
      /* This game's LIVE row freezes on its last known values. */
    }
  }
  return good > 0;
}

/* ONE fetch → join → render pass. The load-time pass and the
 * steady-state loop are the same work; they differ only in what
 * decides to call them. */
async function feedPass() {
  let good = false;
  try {
    const payload = await getJSON(scoreboardURL());
    absorbScoreboard(payload && payload.events);
    good = await pollSummaries();
  } catch (err) {
    good = false;
  }
  state.feedSeen = true;
  if (good) {
    state.misses = 0;
    state.stale = false;
    state.feedTs = Date.now();
  } else {
    state.misses += 1;
    if (state.misses > MISSED_POLLS_STALE) state.stale = true;
  }
  /* One call, on the one path every poll takes, and before the render
   * it feeds: a poll that brought nothing back moves no numbers and so
   * moves no stamp. */
  markFreshness();
  /* Unforced: the board is rebuilt only when the feed actually moved,
   * so a quiet minute does not reflow the page under the reader. */
  render();
  return good;
}

/* The load-time pass: always, in real mode, whatever the clock says.
 * This is what backfills a game that finished before the reader ever
 * opened the page (UI_SPEC §3). */
async function initialPass() {
  await feedPass();
  state.firstPass = false;
}

/* Every game on the board is final: the slate is over and no amount
 * of polling will change a number, so no loop is started. */
function slateOver() {
  const games = (state.board && state.board.games) || [];
  if (!games.length) return false;
  for (const game of games) {
    const status = state.live[game.game_id];
    if (!status || status.state !== "post") return false;
  }
  return true;
}

function windowOpen(now) {
  for (const game of ((state.board || {}).games || [])) {
    const kick = ms(game.kickoff);
    if (kick === null) continue;
    if (now < kick - WINDOW_LEAD_MS) continue;
    const status = state.live[game.game_id];
    if (status && status.state === "post") {
      if (status.finalOnArrival) continue;
      if (status.finalAt && now > status.finalAt + WINDOW_TRAIL_MS) {
        continue;
      }
      return true;
    }
    if (now > kick + MAX_GAME_MS + WINDOW_TRAIL_MS) continue;
    return true;
  }
  return false;
}

async function tick() {
  const open = windowOpen(Date.now());
  if (!open) {
    if (state.polling) {
      state.polling = false;
      render();
    }
    return;
  }
  if (!state.polling) {
    state.polling = true;
    render();
  }
  await feedPass();
}

/* ------------------------------------------------------------------
 * boot
 * ------------------------------------------------------------------ */

function isDemo() {
  try {
    return new URLSearchParams(window.location.search).get("demo") === "1";
  } catch (err) {
    return false;
  }
}

/* Demo mode reads the bundled fixture and a canned live overlay in
 * the same shape the poller produces, so every state renders through
 * the real code path. It NEVER fetches the exported board and NEVER
 * polls, so demo numbers cannot mix with real ones. */
async function bootDemo() {
  state.demo = true;
  try {
    state.board = await getJSON(DEMO_BOARD_URL);
  } catch (err) {
    state.error = "The demo fixture could not be read (" +
      err.message + ").";
    render(true);
    return;
  }
  try {
    const overlay = await getJSON(DEMO_LIVE_URL);
    state.live = (overlay && overlay.games) || {};
    state.box = (overlay && overlay.players) || {};
    state.feedTs = Date.now();
  } catch (err) {
    state.live = {};
    state.box = {};
  }
  render(true);
}

async function bootLive() {
  try {
    state.board = await getJSON(BOARD_URL);
  } catch (err) {
    state.error = "The exported board could not be read (" +
      err.message + ").";
    render(true);
    return;
  }
  render(true);
  /* Unconditional, and before any window is consulted: whatever is
   * already final is read once, here. */
  await initialPass();
  /* Nothing left to watch — the page settles on the finals it just
   * read rather than waking up every minute to re-read them. */
  if (slateOver()) return;
  state.polling = windowOpen(Date.now());
  render();
  setInterval(tick, POLL_MS);
}

function boot() {
  if (isDemo()) {
    bootDemo();
  } else {
    bootLive();
  }
}

boot();

/* U1 — THE APP SHELL, and U2 — THE HOME MATCHUP TABLE.
 *
 * docs/plan/UI_ALPHA_SPEC.md, realising
 * docs/design/FANTASY_EDGE_UI_HANDOFF.md: the tab bar (sec 2.2), the
 * per-tab stacks (sec 2.3), the + sheet (sec 2.4), the transition set
 * (sec 2.5), the hero (sec 5.1) and the Projections placeholder (sec
 * 5.3) came in with U1; U2 makes the HOME screen real — the game
 * switcher and its search, the game line strip, the five views, the
 * mirrored seven-row table and the expanded rows, all read off
 * `web/data/slate.json`, which `fantasy_edge.live.slate` writes.
 *
 * THE LAB'S IDIOMS, KEPT. Vanilla, no framework, no build step, no
 * module: the directory that is served is the directory that is
 * written. Sentinel constants for every word the reader must see.
 * `esc()` on every value that reaches the page. Honest arms — a cell
 * with no number says so with a dash and a footnote that names the
 * reason, rather than drawing a plausible number nobody computed.
 *
 * WHAT THIS FILE COMPUTES, AND WHAT IT ONLY DRAWS.
 *
 *   IT COMPUTES ONE THING THAT IS A DISPLAY RULE, and that is the
 *   whole of it: the sec 7.3 GAP THRESHOLD. The exporter ships
 *   `gap_pts` and says nothing about whether it is an edge; this file
 *   draws the arrow and the tint at GAP_MIN and a grey dash below it,
 *   because that is a decision about a screen and it belongs where it
 *   can be checked against the screen. Everything else on the page is
 *   a STORED NUMBER FORMATTED — no probability is derived here, no
 *   projection is summed here, and no range is invented for a column
 *   the exporter left null.
 *
 *   IT READS ONE DOCUMENT. `slate.json` in real mode, the bundled
 *   fixture behind `?demo=1`, and nothing else. The document either
 *   arrives or it does not; there is no third state and no cached
 *   yesterday.
 *
 *   IT STORES NOTHING. Not a key, not a token, not a preference. The
 *   Bets sub-view, the open row and the chosen view are remembered
 *   for the visit (sec 2.3) and the visit is all they are remembered
 *   for; nothing here is written to the reader's browser.
 *
 * THE NAVIGATION MODEL (sec 2.3) IS U1'S AND IS UNCHANGED. Each tab
 * owns a STACK. Tapping a tab resets that tab to its root. Detail
 * screens PUSH onto the current tab's stack and the back chevron
 * POPS. The Bets tab remembers which of Screen and Live was last
 * used, and the Screen | Live toggle SWAPS the Bets root without
 * pushing anything. The hash is the address of whatever is on top, so
 * the browser's own back button pops the same stack the chevron does.
 */
"use strict";

/* ------------------------------------------------------------------
 * THE SENTINELS — every word on the screen that is a promise
 * ------------------------------------------------------------------ */

/* THE ALPHA LINE. D-098's idiom in the app's own words: the numbers
 * are the engine's, the interface around them is not finished, and
 * the reader is told so on every screen. It rides `index.html` too,
 * so it is on the page before this script runs, and a test asserts
 * the two are the same string. It may be reworded only where D-098 is
 * rewritten — never softened here. */
const ALPHA_NOTE =
  "ALPHA — engine-certified projections; the interface around them is under active development, and its presentation is experimental (D-098).";

/* The sec 5.1 tag. It LABELS FIXTURES, so it comes off the hero the
 * moment a real slate.json is on screen: real data is real, and a tag
 * that says otherwise would be the one dishonest thing on a page whose
 * whole point is that its numbers are the engine's. It stays in demo
 * mode, where the document IS fabricated, and it stays wherever the
 * shell is still drawing its U3-U6 fixtures. The ALPHA line below it
 * never comes off — that is a statement about the INTERFACE, which is
 * unfinished whatever the data is. */
const SAMPLE_TAG = "Sample data";

const WORDMARK = "Fantasy Edge";

/* Section titles, sec 2.1 and sec 5. */
const TITLE_FANTASY = "Fantasy";
const TITLE_PROJECTIONS = "Projections";
const TITLE_BETS = "Bets";
const TITLE_PICK = "Pick";
const TITLE_TRACK = "Track a slip";
const TITLE_LIVE_CARD = "Live";
const TITLE_REPORT = "Read report";

/* sec 5.3, the Projections placeholder, taken verbatim. */
const PROJ_OVERLINE = "Coming in the merge";
const PROJ_HEADING = "Your sandbox projections plug in here.";
const PROJ_CONTEXT =
  "Until the merge, projected stats appear inside the home table and the pick card; this page takes them over when the sandbox pages land.";

/* sec 2.4, the three + actions. */
const ADD_TITLE = "Add";
const ADD_READ = "Add your read";
const ADD_READ_SUB = "Say what you know about a player or line";
const ADD_SLIP = "Track a slip";
const ADD_SLIP_SUB = "Paste or screenshot a bet you placed";
const ADD_STARTSIT = "Check a start/sit";
const ADD_STARTSIT_SUB = "Compare two players for your lineup";

/* The honest arms. Each stub names the increment that fills it, so
 * nothing on this surface pretends to be finished. */
const NOTE_READS = "Your read arrives in U6. The pick card it opens on is here already.";
const ACTION_OPEN_PICK = "Open the pick";
const NOTE_ALERTS = "Alerts are unruled: which events notify is open question 5 in the handoff.";
const STUB_PICK = "The pick card — distribution, probability bars, context tiles — arrives in U3.";
const STUB_TRACK = "Slip import, leg matching and the break-even check arrive in U3.";
const STUB_LIVE_CARD = "The live chance chart and its swings arrive in U4, on the live contract this app already has.";
const STUB_REPORT = "The graded read report arrives in U6, with the reads engine behind it.";
const STUB_SCREEN = "The screen list — outcome shapes, side pills and gaps — arrives in U3.";
const STUB_LIVE_BOARD = "The live board arrives in U4.";
const STUB_FANTASY_SEASON = "My team, the lineup table, the ranges and the FLEX call arrive in U5.";
const STUB_FANTASY_DFS = "My team for a DFS slate — its own sub-view — arrives in U5.";
const STUB_PICKS = "My picks — the watchlist you saved and the slips you brought back — arrives in U3.";
const STUB_STARTSIT = "Fantasy is here; the start/sit comparison itself arrives in U5.";
const SLATE_HEADER = "Sunday 12:00 slate";
const SLATE_BASIS = "model vs no-vig market";
const LIVE_OVERLINE = "Closest to hitting";
const PICKS_OVERLINE = "Saved and placed";

/* ------------------------------------------------------------------
 * U2 — THE SLATE DOCUMENT
 * ------------------------------------------------------------------
 * THE TWO PATHS, the lab's idiom exactly. Real is the default; the
 * fixture is reachable only by asking for it by name in the query
 * string, and when it is asked for the Sample-data tag stays on. */

const REAL_SLATE_URL = "../data/slate.json";
const DEMO_SLATE_URL = "../demo/slate.demo.json";

/* The one switch, read once. Anything but `?demo=1` is real mode. */
const DEMO = (function () {
  try {
    return window.location.search.indexOf("demo=1") !== -1;
  } catch (err) {
    return false;
  }
})();

const SLATE_URL = DEMO ? DEMO_SLATE_URL : REAL_SLATE_URL;

/* The schema tag the exporter writes. A document that does not carry
 * it is not this contract, and the page refuses it out loud rather
 * than reading fields out of a shape it does not know. */
const SLATE_SCHEMA = "slate-1";
const FETCH_TIMEOUT_MS = 15000;

/* THE ONE DISPLAY RULE THIS FILE OWNS (handoff sec 7.3): a gap under
 * three points is not an edge and is never drawn as one. It lives
 * here, on the client, because it is a decision about a screen — the
 * exporter ships the number and says nothing about it. */
const GAP_MIN = 3;

/* ...and the same shape for the Role trend, which sec 5.1 shows at
 * plus or minus five and hides below. */
const TREND_MIN = 5;

/* The Usage view's own threshold: a red-zone share of a quarter or
 * more is drawn positive. It is declared beside the other two even
 * though NOTHING reaches it today — the exporter publishes no
 * red-zone share at all — so the rule is written once and is already
 * right on the day a split is ingested. */
const RZ_MIN = 0.25;

/* The empty cell, sec 3.1's `disabled` grey. One character, one
 * constant, so a dash is never a hyphen somewhere else. */
const DASH = "—";
const UP = "▲";
const DOWN = "▼";

/* ------------------------------------------------------------------
 * the words — sec 5.1's views, headers and footnotes
 * ------------------------------------------------------------------ */

const VIEWS = [
  ["props", "Props"], ["fantasy", "Fantasy"], ["role", "Role"],
  ["usage", "Usage"], ["market", "Market"]
];

const VIEW_GROUP_LABEL = "Table view";

/* The two column headers per view, away-side order. The home side
 * mirrors them (sec 5.1: away · v1 · v2 | pos | v2 · v1 · home). */
const HEADS = {
  props: ["LINE", "GAP"],
  fantasy: ["PROJ", "RANGE"],
  role: ["SHARE", "TREND"],
  usage: ["OPP/G", "RZ %"],
  market: ["", ""]
};

/* THE LEGENDS, one per view, each its own sentinel. Sec 10: numbers
 * carry units or a legend, and the unit letters are always explained
 * in the view footnote. */
const LEGEND_PROPS =
  "Key prop line with its unit, and the gap against the no-vig market. The arrow and the number appear only when the model beats that market by 3 points or more; anything under that is a dash, because a gap that small is not an edge.";
const LEGEND_FANTASY =
  "Half-PPR projected points, the weighted sum of the generation's own stat means.";
const LEGEND_ROLE =
  "Share is the chain's own allocation, and each cell says which one: attempts weight for a quarterback, carry share for a back, target share for a receiver. Trend is the change against the prior four games from realized weeks, shown at 5 points or more.";
const LEGEND_USAGE =
  "Opportunities per game over the weeks already played: a pass attempts, o carries plus targets, t targets.";
const LEGEND_MARKET =
  "Chance of the lean side of the key prop, from the line's open to now. The solid line is our model at each generation, the dashed one is the book with the vig removed at each capture. It turns positive when the gap is 3 points or more.";

const LEGENDS = {
  props: LEGEND_PROPS, fantasy: LEGEND_FANTASY, role: LEGEND_ROLE,
  usage: LEGEND_USAGE, market: LEGEND_MARKET
};

/* THE CALIBRATION BASIS, per market and never blanket
 * (UI_ALPHA_SPEC sec 1, handoff sec 7.4). One sentence, pinned, under
 * the Props view — the only view on this screen that draws a
 * probability against a price. WHICH markets ride the layer is read
 * off the document's own `run.calibrated_markets` and off each prop's
 * own `calibration` field; this sentence says what that means. */
const CALIBRATION_NOTE =
  "Receptions, receiving yards, rushing attempts and rushing yards ride the adopted calibration layer; every other market here is ungraded, so treat its number as a lean.";

/* The Fantasy view's range column. The exporter publishes no points
 * range and says why on every record; this is that reason in the
 * reader's words, under the column it explains. */
const RANGE_ABSENT =
  "Range is a dash because points quantiles are not persisted at generation yet: the engine archives a quantile grid per stat, and the quantiles of a sum are not the sum of the quantiles.";

/* ...and the Usage view's, for the same reason in a different place. */
const RZ_ABSENT =
  "Red-zone share is a dash because no red-zone split is ingested: it needs a play-by-play cut by field position, and nothing is estimated in its place.";

/* Sec 8: a market with fewer than two points has no shape to draw. */
const LINE_JUST_POSTED = "Line just posted";

/* Sec 8: no games this week. */
const NO_GAMES_SWITCHER = "No games this week";
const NO_GAMES_BODY =
  "The slate carries no game for this week, so there is no matchup to draw.";

/* THE HONEST OFFLINE ARM. The document either arrived or it did not;
 * there is no cached yesterday and no fabricated stand-in on a screen
 * whose whole claim is that its numbers are the engine's. */
const OFFLINE_HEAD = "The slate hasn't loaded.";
const OFFLINE_BODY =
  "This screen reads one file the exporter writes on each deploy. It isn't here right now, so there is nothing true to draw and nothing is being guessed at. The games below are sample data, exactly as the tag says.";
const OFFLINE_SCHEMA =
  "The slate file that loaded is a shape this build does not know, so none of it is drawn. That is a deliberate refusal, not a failure to try.";

/* Sec 5.1's expanded row and search overlay. */
const PROJECTED = "PROJECTED";
const FANTASY_ROW = "Fantasy";
const OPEN_PICK = "Open pick";
const SEARCH_PLACEHOLDER = "Search teams or players";
const SEARCH_CANCEL = "Cancel";
const SEARCH_HEADING = "THIS WEEK'S GAMES";
const SEARCH_HAS = "has ";
const SEARCH_EMPTY = "No games match";

/* A NAMED DEVIATION from sec 5.1, recorded where it is made: the
 * search there lists full team names beside the abbreviations, and
 * slate.json carries abbreviations only. A thirty-two-name table
 * written into this file would be the app inventing data the engine
 * never gave it, which is exactly what every other arm here refuses to
 * do — so the results list matches on the abbreviation and on the
 * player names the slate does carry, and says so under the input. */
const SEARCH_BASIS =
  "Matches on team abbreviation and on any player listed in the table.";

/* The market sparkline, sec 4: 84 x 24, model solid, book dashed, end
 * dot on the model line. The y-window is the CELL'S OWN range with a
 * floor on its width, so a line that barely moved is drawn as a line
 * that barely moved rather than amplified to fill the box. */
const SPARK_W = 84;
const SPARK_H = 24;
const SPARK_PAD = 2;
const SPARK_MIN_SPAN = 0.10;

/* ------------------------------------------------------------------
 * THE FIXTURES — fabricated, every one of them
 * ------------------------------------------------------------------
 * No real player appears on this surface. These names exist to give
 * the shell something of the right SHAPE to lay out: a week of games
 * for the switcher, a few rows for the stub lists. They are replaced
 * wholesale by `slate.json` at U2, and until then the Sample-data tag
 * is on the hero. */

const SAMPLE_WEEK = "Week 5";
const SAMPLE_SCORING = "half-PPR";

const SAMPLE_GAMES = [
  { away: "HOU", home: "IND", when: "SUN 12:00" },
  { away: "ATL", home: "CAR", when: "SUN 12:00" },
  { away: "DET", home: "GB", when: "SUN 12:00" },
  { away: "PHI", home: "DAL", when: "SUN 3:25" },
  { away: "BUF", home: "MIA", when: "SUN 3:25" },
  { away: "CHI", home: "MIN", when: "SUN 7:20" }
];

/* The sec 4 skeleton row, six of them on the placeholder (sec 5.3). */
const SKELETON_WIDTHS = [62, 48, 70, 55, 66, 44];

const SAMPLE_SCREEN_ROWS = [
  { name: "D. Hale", note: "WR · vs IND · receptions 4.5" },
  { name: "K. Ames", note: "RB · vs CAR · rush att 15.5" },
  { name: "M. Okafor", note: "WR · vs GB · receptions 5.5" }
];

const SAMPLE_LIVE_ROWS = [
  { name: "T. Rourke", note: "Rush att 16+ · Q3" },
  { name: "L. Pryor", note: "Rec 3+ · Q2" }
];

const SAMPLE_WATCHLIST_ROWS = [
  { name: "D. Hale", note: "Watchlist · More 4.5 receptions" }
];

const SAMPLE_SLIP_ROWS = [
  { name: "Three-leg slip", note: "Tracked · placed elsewhere" }
];

const SAMPLE_LINEUP_SLOTS = ["QB", "RB", "RB2", "WR", "WR2", "TE", "FLEX"];

/* ------------------------------------------------------------------
 * THE ROUTE TABLE — board 16's map, one row per screen
 * ------------------------------------------------------------------
 * `tab` is the tab a route BELONGS to. For a root that is simply its
 * tab; for a detail it is the owner used only when the address is
 * typed in cold, because a detail opened by hand pushes onto whatever
 * stack the reader is standing in. */

const ROUTES = {
  home: { tab: "home", hash: "#/home", root: true },
  season: { tab: "fantasy", hash: "#/fantasy/season-long", root: true },
  dfs: { tab: "fantasy", hash: "#/fantasy/dfs", root: true },
  projections: { tab: "projections", hash: "#/projections", root: true },
  screen: { tab: "bets", hash: "#/bets/screen", root: true },
  live: { tab: "bets", hash: "#/bets/live", root: true },
  picks: { tab: "bets", hash: "#/bets/my-picks", root: true },
  pick: { tab: "bets", hash: "#/pick", root: false },
  track: { tab: "bets", hash: "#/track", root: false },
  card: { tab: "bets", hash: "#/card", root: false },
  report: { tab: "home", hash: "#/report", root: false }
};

const TAB_ORDER = ["home", "fantasy", "projections", "bets"];

/* THE SUB-VIEWS, and the owner's amendment (UI_ALPHA_SPEC sec 3's
 * OWNER CAVEAT, 2026-09-19). The handoff gave Bets two sub-views
 * behind a remembered toggle; the owner extended that shape to
 * FANTASY — Season long and DFS — and added a third Bets segment, My
 * picks. It is ONE model, written once: a tab with sub-views has no
 * root of its own, its root IS whichever sub-view was last used, and
 * its toggle replaces that root rather than pushing onto it. A tab
 * missing from this table is its own root and has no toggle. */
const TAB_SUBS = {
  fantasy: ["season", "dfs"],
  bets: ["screen", "live", "picks"]
};

const SUB_LABELS = {
  season: "Season long",
  dfs: "DFS",
  screen: "Screen",
  live: "Live",
  picks: "My picks"
};

const SUB_GROUP_LABEL = { fantasy: "Fantasy view", bets: "Bets view" };

/* sec 2.2's five slots in the order they are drawn, with the raised
 * ink + in the middle. */
const TAB_SLOTS = [
  { tab: "home", label: "Home", icon: "home" },
  { tab: "fantasy", label: "Fantasy", icon: "star" },
  { tab: null, label: ADD_TITLE, icon: "plus" },
  { tab: "projections", label: "Projections", icon: "chart" },
  { tab: "bets", label: "Bets", icon: "ticket" }
];

/* sec 3.4 — 2px stroke line icons, round caps, drawn inline so the
 * page names no icon host. */
const ICONS = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  star: "M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z",
  chart: "M4 19V5M4 19h16M8 15l4-5 3 3 5-6",
  ticket: "M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4zM10 7v12",
  plus: "M12 5v14M5 12h14",
  back: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
  profile: "M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
  alerts: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  search: "M20 20l-4-4",
  close: "M6 6l12 12M18 6L6 18",
  chevron: "M6 9l6 6 6-6"
};

/* ------------------------------------------------------------------
 * THE HERO ART — sec 5.1, parameter for parameter
 * ------------------------------------------------------------------
 * Single-hue and white-only. Eight concentric circles around the
 * centre ring, radius 120 to 374, opacity .13 fading to .03; four
 * dotted circles around EACH side ring, radius 58 to 118, opacity .07
 * to .035, which is what makes the interference pattern where they
 * cross the ripples; a soft radial glow behind the centre; and
 * monochrome film grain at 7%. No additional hues, and nothing here
 * moves. */

const HERO_BOX = { width: 390, height: 360 };
const HERO_CENTRE = { x: 195, y: 184 };
const HERO_SIDES = [50, 340];
const HERO_RINGS = [
  [120, 0.13], [146, 0.11], [174, 0.095], [206, 0.08],
  [242, 0.065], [282, 0.05], [326, 0.04], [374, 0.03]
];
const HERO_DOTTED = [[58, 0.07], [74, 0.055], [94, 0.045], [118, 0.035]];
const HERO_DASH = "2 5";
const HERO_GRAIN = 0.07;
const HERO_GLOW = 0.22;

/* ------------------------------------------------------------------
 * the shell's state — held for the visit, written nowhere
 * ------------------------------------------------------------------ */

const nav = {
  tab: "home",
  /* sec 2.3: one stack per tab, each starting at its own root */
  stacks: {
    home: ["home"],
    fantasy: ["season"],
    projections: ["projections"],
    bets: ["screen"]
  },
  /* sec 2.3, as the owner's amendment extends it: a tab with
   * sub-views remembers the last one used, for Fantasy exactly as for
   * Bets. Remembered for the visit; written nowhere. */
  subs: { fantasy: "season", bets: "screen" },

  /* THE FIRST PAINT IS AT REST, and this null is what says so.
   *
   * sec 2.5 is a table of transitions BETWEEN screens — a push, a tab
   * switch, a sheet rising. None of them is "the app opened": there
   * is no launch animation in the handoff and there should be none
   * here. Booting with a motion set made the whole of `#screen` fade
   * up from the ground colour on first paint, which cost a real
   * defect: anything that looks at the page inside those 180ms — a
   * screenshot, a slow first frame, a reader on a tired phone — sees
   * the app half-composited. The hero is the worst of it, because
   * #2F353D at 50% over the ground is #929598, a flat mid-grey, with
   * the ring strokes showing through as brighter lines.
   *
   * So `motion` starts null and `booted` starts false: the first
   * render draws the screen and its lists exactly as they will sit,
   * and every transition after that is a CHANGE THE READER CAUSED. */
  motion: null,
  booted: false,
  sheet: false,
  toast: null,
  game: 0,
  /* the player a pick was opened for. U3 reads it; U2 only sets it. */
  pick: null,

  /* U2's own state, and it is held for the visit exactly as the rest
   * of this object is: the slate document once it has arrived (or
   * null, which is a real and drawn state), the reason it did not,
   * the chosen view, the ONE open row — sec 5.1: one at a time — and
   * the search panel with whatever has been typed into it. */
  slate: null,
  slateNote: null,
  view: "props",
  exp: null,
  search: false,
  query: ""
};

/* ------------------------------------------------------------------
 * small helpers — the lab's, spelled the same way
 * ------------------------------------------------------------------ */

function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function el(id) {
  return document.getElementById(id);
}

/* An animation is restarted by taking the class off, forcing the
 * layout to settle, and putting it back — sec 2.5's "restart the
 * animation on every change" for Swap, and the same mechanism for
 * every other named transition. Under reduced motion the class does
 * nothing at all, because the media query has already zeroed it. */
function restart(node, className) {
  if (!node) return;
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
}

function icon(name, size, strokeWidth) {
  const width = size || 22;
  return '<svg width="' + width + '" height="' + width +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
    (strokeWidth || 2) + '" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true"><path d="' + esc(ICONS[name]) + '"></path></svg>';
}

/* ------------------------------------------------------------------
 * sec 2.3 — the navigation model
 * ------------------------------------------------------------------ */

function rootOf(tab) {
  /* a tab with sub-views has no root of its own: its root is
   * whichever sub-view was last used */
  return TAB_SUBS[tab] ? nav.subs[tab] : tab;
}

function currentStack() {
  return nav.stacks[nav.tab];
}

function currentRoute() {
  const stack = currentStack();
  return stack[stack.length - 1];
}

/* TAPPING A TAB RESETS THAT TAB TO ITS ROOT. Not "returns to where you
 * were": the handoff says reset, and a stack that survived the tap
 * would make the tab bar a history control. */
function selectTab(tab) {
  if (!nav.stacks[tab]) return;
  nav.tab = tab;
  nav.stacks[tab] = [rootOf(tab)];
  closeSheet();
  navigate(currentRoute(), "tab");
}

/* A DETAIL PUSHES onto the stack the reader is standing in, whichever
 * tab that is. */
function openDetail(route) {
  if (!ROUTES[route] || ROUTES[route].root) return;
  currentStack().push(route);
  closeSheet();
  navigate(route, "push");
}

/* AND THE CHEVRON POPS. A root has nothing to pop to, so the chevron
 * is not drawn there. */
function goBack() {
  const stack = currentStack();
  if (stack.length < 2) return;
  stack.pop();
  navigate(currentRoute(), "pop");
}

/* A SUB-VIEW TOGGLE SWAPS THAT TAB'S ROOT WITHOUT PUSHING. The stack
 * is REPLACED, not extended, so back from a pick opened on Live
 * returns to Live and never to Screen — and the same is now true of
 * Fantasy's Season long and DFS. One function, both toggles: a second
 * copy of this rule is how two tabs drift apart. */
function swapSub(tab, sub) {
  const subs = TAB_SUBS[tab];
  if (!subs || subs.indexOf(sub) < 0) return;
  nav.subs[tab] = sub;
  nav.tab = tab;
  nav.stacks[tab] = [sub];
  navigate(sub, "tab");
}

/* An address that names a TAB rather than a screen — `#/fantasy`,
 * `#/bets` — resolves to that tab's REMEMBERED sub-view, and is then
 * normalised to that screen's own address. Links written before the
 * owner's amendment split Fantasy in two therefore still land
 * somewhere true instead of falling back to Home. */
const TAB_HASHES = { "#/fantasy": "fantasy", "#/bets": "bets" };

function routeFromHash() {
  const hash = String(window.location.hash || "");
  for (const name in ROUTES) {
    if (ROUTES[name].hash === hash) return name;
  }
  if (TAB_HASHES[hash]) return rootOf(TAB_HASHES[hash]);
  return "home";
}

/* The address always names the screen that is actually on top. An
 * empty hash, a tab-level hash or one that names nothing at all is
 * rewritten to the canonical one — with `replaceState`, so it does
 * not fire a second hashchange, draw a second time, or leave a dead
 * address in the reader's history to go back to. */
function normalizeHash() {
  const wanted = ROUTES[currentRoute()].hash;
  if (String(window.location.hash || "") === wanted) return;
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", wanted);
  } else {
    window.location.hash = wanted;
  }
}

/* Every move goes through the address, so the browser's own back
 * button walks the same stack the chevron does. */
function navigate(route, motion) {
  nav.motion = motion;
  nav.toast = null;
  const wanted = ROUTES[route].hash;
  if (String(window.location.hash) === wanted) {
    render();
    return;
  }
  window.location.hash = wanted;
}

/* A hash this file did not just write — the back button, a forward,
 * or an address typed in cold. The stack is reconciled to it rather
 * than fought with. */
function applyHash() {
  const route = routeFromHash();
  const stack = currentStack();
  if (stack[stack.length - 1] === route) return;

  const at = stack.indexOf(route);
  if (at >= 0) {
    nav.stacks[nav.tab] = stack.slice(0, at + 1);
    nav.motion = "pop";
    return;
  }
  const owner = ROUTES[route].tab;
  nav.tab = owner;
  if (ROUTES[route].root) {
    if (TAB_SUBS[owner]) nav.subs[owner] = route;
    nav.stacks[owner] = [route];
    nav.motion = "tab";
    return;
  }
  nav.stacks[owner] = [rootOf(owner), route];
  nav.motion = "push";
}

/* ------------------------------------------------------------------
 * sec 2.5 — the toast and the sheet
 * ------------------------------------------------------------------ */

/* One toast at a time, above the tab bar, optionally carrying one
 * action button. */
function showToast(text, actionLabel, actionRoute) {
  nav.toast = {
    text: text,
    label: actionLabel || "",
    route: actionRoute || ""
  };
  renderToast();
}

function closeToast() {
  nav.toast = null;
  renderToast();
}

function openSheet() {
  nav.sheet = true;
  nav.toast = null;
  renderToast();
  renderSheet();
}

function closeSheet() {
  if (!nav.sheet) return;
  nav.sheet = false;
  renderSheet();
}

/* ------------------------------------------------------------------
 * sec 5.1 — the hero
 * ------------------------------------------------------------------ */

function heroArt() {
  const parts = [];
  parts.push('<svg class="heroart" viewBox="0 0 ' + HERO_BOX.width + ' ' +
    HERO_BOX.height + '" preserveAspectRatio="xMidYMid slice" ' +
    'aria-hidden="true" focusable="false">');
  parts.push('<defs>');
  /* THE GRAIN'S 7% LIVES INSIDE THE FILTER, and this is deliberate.
   *
   * A turbulence filter REPLACES its source graphic: what the rect
   * below paints is the noise itself, at full strength, over the
   * whole hero. The 7% is therefore the only thing standing between a
   * dark slate hero and a flat mid-grey one — and when it rode the
   * rect as an `opacity` attribute, a renderer that did not apply it
   * turned the whole hero #939597. That was seen in a headless render
   * and reproduced here by dropping the attribute.
   *
   * So the fade is now part of the filter RESULT: `feFuncA` scales
   * the noise's alpha to HERO_GRAIN before it is ever composited.
   * Same number, same look, but it is no longer an attribute that can
   * be lost. The rect is `fill="none"` for the same reason — if the
   * filter itself fails to resolve, the fallback paints nothing
   * rather than a slab of black. The failure direction is now always
   * "no grain", never "no hero". */
  parts.push('<filter id="appgrain" x="0" y="0" width="100%" height="100%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" ' +
    'stitchTiles="stitch"></feTurbulence>' +
    '<feColorMatrix type="saturate" values="0"></feColorMatrix>' +
    '<feComponentTransfer><feFuncA type="linear" slope="' + HERO_GRAIN +
    '"></feFuncA></feComponentTransfer></filter>');
  parts.push('<radialGradient id="appglow" cx="50%" cy="51%" r="60%">' +
    '<stop offset="0%" stop-color="#A9B6C6" stop-opacity="' + HERO_GLOW + '"></stop>' +
    '<stop offset="100%" stop-color="#A9B6C6" stop-opacity="0"></stop>' +
    '</radialGradient>');
  parts.push('</defs>');
  parts.push('<rect x="0" y="0" width="' + HERO_BOX.width + '" height="' +
    HERO_BOX.height + '" fill="url(#appglow)"></rect>');

  HERO_RINGS.forEach(function (ring) {
    parts.push('<circle cx="' + HERO_CENTRE.x + '" cy="' + HERO_CENTRE.y +
      '" r="' + ring[0] + '" fill="none" stroke="#FFFFFF" stroke-opacity="' +
      ring[1] + '" stroke-width="1"></circle>');
  });
  HERO_SIDES.forEach(function (cx) {
    HERO_DOTTED.forEach(function (ring) {
      parts.push('<circle cx="' + cx + '" cy="' + HERO_CENTRE.y + '" r="' +
        ring[0] + '" fill="none" stroke="#FFFFFF" stroke-opacity="' + ring[1] +
        '" stroke-width="1" stroke-dasharray="' + HERO_DASH + '"></circle>');
    });
  });

  parts.push('<rect x="0" y="0" width="' + HERO_BOX.width + '" height="' +
    HERO_BOX.height + '" fill="none" filter="url(#appgrain)"></rect>');
  parts.push('</svg>');
  return parts.join("");
}

/* The three nav rings: text only, no numbers (sec 4), each wired to
 * its own tab — and Bets to whichever sub-view was last used. */
function heroRings() {
  return [
    '<button class="ring side left" data-act="tab" data-tab="fantasy" ',
    'aria-label="Open Fantasy">', esc(TITLE_FANTASY), '</button>',
    '<button class="ring centre" data-act="tab" data-tab="projections" ',
    'aria-label="Open Projections">', esc(TITLE_PROJECTIONS), '</button>',
    '<button class="ring side right" data-act="tab" data-tab="bets" ',
    'aria-label="Open Bets">', esc(TITLE_BETS), '</button>'
  ].join("");
}

function heroTop() {
  return '<div class="herotop">' +
    (onFixtures()
      ? '<div class="sampletag">' + esc(SAMPLE_TAG) + '</div>'
      : '<div class="sampletag off"></div>') +
    '<div class="wordmark">' + esc(WORDMARK) + '</div>' +
    '<div class="heroicons">' +
    '<button class="iconbtn" data-act="open" data-route="report" ' +
    'aria-label="Your reads">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'aria-hidden="true"><circle cx="12" cy="8" r="4"></circle>' +
    '<path d="' + esc(ICONS.profile) + '"></path></svg></button>' +
    '<button class="iconbtn" data-act="note" data-note="' + esc(NOTE_ALERTS) +
    '" aria-label="Alerts">' + icon("alerts") + '</button>' +
    '</div></div>';
}

function skeletonRows(widths) {
  return widths.map(function (width, index) {
    return '<div class="skelrow' + growClass() + '" style="--i:' +
      index + '">' +
      '<div class="skelbar lead"></div>' +
      '<div class="skelbar" style="width:' + width + '%"></div>' +
      '<div class="skelbar tail"></div></div>';
  }).join("");
}

function stubCard(overline, heading, body) {
  return '<div class="card">' +
    '<div class="overline">' + esc(overline) + '</div>' +
    '<div class="cardhead">' + esc(heading) + '</div>' +
    '<div class="cardbody">' + esc(body) + '</div></div>';
}

function stubRows(rows, mark, route) {
  return rows.map(function (row, index) {
    return '<button class="stubrow' + growClass() + '" style="--i:' +
      index + '" ' +
      'data-act="open" data-route="' + esc(route) + '" ' +
      'aria-label="' + esc(row.name + ", " + row.note + ". Sample row; " +
      mark) + '">' +
      '<span class="stubcol"><span class="stubname">' + esc(row.name) +
      '</span><span class="stubnote">' + esc(row.note) + '</span></span>' +
      '<span class="stubmark">' + esc(mark) + '</span></button>';
  }).join("");
}

/* ------------------------------------------------------------------
 * U2 — reading the slate document
 * ------------------------------------------------------------------ */

/* ONE fetch in this file, so there is one timeout and one error shape.
 * `no-store` because the file is rewritten on every deploy and a
 * cached yesterday is the one thing this screen must never show. */
async function getJSON(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(function () { controller.abort(); },
    FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function loadSlate() {
  try {
    const loaded = await getJSON(SLATE_URL);
    /* THE SCHEMA TAG IS READ BEFORE ANY FIELD IS. A document that does
     * not say which iteration it is could be anything, and reading a
     * field out of a shape this build does not know is how a page
     * comes to draw a number that means something else. */
    if (!loaded || loaded.slate_schema !== SLATE_SCHEMA) {
      nav.slateNote = OFFLINE_SCHEMA;
    } else {
      nav.slate = loaded;
    }
  } catch (err) {
    nav.slateNote = OFFLINE_BODY;
  }
  nav.game = 0;
  nav.exp = null;
  render();
}

/* REAL DATA IS REAL. The tag labels fixtures, so it comes off exactly
 * when a real document is driving the screen — and stays on in demo
 * mode, where the document is fabricated by design. */
function onFixtures() {
  return DEMO || !nav.slate;
}

function games() {
  return (nav.slate && nav.slate.games) || [];
}

function currentGame() {
  const list = games();
  if (!list.length) return null;
  return list[Math.min(nav.game, list.length - 1)] || null;
}

function playerOf(id) {
  if (!id || !nav.slate || !nav.slate.players) return null;
  return nav.slate.players[id] || null;
}

function calibratedMarkets() {
  return (nav.slate && nav.slate.run &&
    nav.slate.run.calibrated_markets) || [];
}

/* ------------------------------------------------------------------
 * formatting — stored numbers, printed; never a number derived here
 * ------------------------------------------------------------------ */

/* A projected quantity at the precision it can carry. Big counts read
 * whole, small ones to a decimal, rates to two — one rule, so the same
 * number never reads two ways in two columns. */
function num(value) {
  if (value === null || value === undefined) return DASH;
  const size = Math.abs(value);
  if (size >= 100) return String(Math.round(value));
  if (size >= 10) return value.toFixed(1);
  if (size >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

function pct(value) {
  if (value === null || value === undefined) return DASH;
  return Math.round(value * 100) + "%";
}

function signed(points) {
  const up = points >= 0;
  return (up ? UP : DOWN) + Math.abs(points);
}

/* ------------------------------------------------------------------
 * THE STATLINE — ONE renderer, and the only one
 * ------------------------------------------------------------------
 * UI_ALPHA_SPEC sec 1's standing requirement: projection value · stat
 * label · threshold, rendered IDENTICALLY wherever a statline appears.
 * The home expanded row is its first consumer; the pick card (U3), the
 * live card (U4) and the projections merge (U7) are the next three,
 * and each of them calls THIS FUNCTION rather than laying out its own
 * rows, which is the whole reason it takes a plain list of entries and
 * knows nothing about where it is drawn.
 *
 * An entry is `{label, value, reason, threshold}`. A null value draws
 * the sec 8 dash and carries its reason as the cell's own title, so an
 * absence is explained where it is seen and never just blank. The
 * threshold slot is optional — the home table has none, the pick card
 * and the live card do — and a banked value (U4) arrives as a second
 * entry list beside the projected one, not as a second renderer. */
function statline(entries) {
  return '<div class="statline">' + (entries || []).map(function (entry) {
    const absent = entry.value === null || entry.value === undefined;
    return '<div class="statrow">' +
      '<span class="statlabel">' + esc(entry.label) + '</span>' +
      (entry.threshold
        ? '<span class="statthreshold">' + esc(entry.threshold) +
          '</span>'
        : "") +
      '<span class="statvalue' + (absent ? " absent" : "") + '"' +
      (absent && entry.reason
        ? ' title="' + esc(entry.reason) + '"'
        : "") + '>' +
      (absent ? DASH : esc(num(entry.value))) + '</span></div>';
  }).join("") + '</div>';
}

/* ------------------------------------------------------------------
 * THE MARKET SPARKLINE — sec 4, 84 x 24
 * ------------------------------------------------------------------ */

/* The y-window is the CELL'S OWN range, widened to a floor so a line
 * that barely moved is drawn as a line that barely moved. Both series
 * share the window, or the two would not be comparable — which is the
 * only thing this chart is for. */
function sparkWindow(series) {
  const values = [];
  (series || []).forEach(function (point) {
    if (point.model_p !== null && point.model_p !== undefined) {
      values.push(point.model_p);
    }
    if (point.book_p !== null && point.book_p !== undefined) {
      values.push(point.book_p);
    }
  });
  if (!values.length) return null;
  let lo = Math.min.apply(null, values);
  let hi = Math.max.apply(null, values);
  const span = hi - lo;
  if (span < SPARK_MIN_SPAN) {
    const grow = (SPARK_MIN_SPAN - span) / 2;
    lo -= grow;
    hi += grow;
  }
  return { lo: lo, hi: hi };
}

function sparkY(value, box) {
  const scale = (value - box.lo) / (box.hi - box.lo);
  const usable = SPARK_H - SPARK_PAD * 2;
  return SPARK_PAD + (1 - Math.max(0, Math.min(1, scale))) * usable;
}

/* One path through the points that HAVE the reading asked for. The
 * series is honest about its sparsity — a stamp may carry a model
 * reading and no book price — so nothing is interpolated across a gap
 * and nothing is carried forward; the path simply joins the points
 * that exist, at their own places on the x-axis. */
function sparkPath(series, key) {
  const box = sparkWindow(series);
  if (!box) return "";
  const last = Math.max(1, series.length - 1);
  const parts = [];
  series.forEach(function (point, index) {
    const value = point[key];
    if (value === null || value === undefined) return;
    const x = SPARK_PAD + (index / last) * (SPARK_W - SPARK_PAD * 2);
    parts.push((parts.length ? "L" : "M") + x.toFixed(1) + " " +
      sparkY(value, box).toFixed(1));
  });
  return parts.join(" ");
}

function lastOf(series, key) {
  let held = null;
  (series || []).forEach(function (point) {
    if (point[key] !== null && point[key] !== undefined) {
      held = point;
    }
  });
  return held;
}

function marketCell(person, big) {
  const series = (person && person.market_series) || [];
  if (series.length < 2) {
    return '<span class="justposted">' + esc(LINE_JUST_POSTED) +
      '</span>';
  }
  const box = sparkWindow(series);
  const model = lastOf(series, "model_p");
  const book = lastOf(series, "book_p");
  const stroke = big ? "var(--positive)" : "var(--ink)";
  const dot = model
    ? '<circle cx="' + (SPARK_W - SPARK_PAD) + '" cy="' +
      sparkY(model.model_p, box).toFixed(1) +
      '" r="2.5" fill="' + stroke + '"></circle>'
    : "";
  return '<span class="spark">' +
    '<svg width="' + SPARK_W + '" height="' + SPARK_H + '" viewBox="0 0 ' +
    SPARK_W + ' ' + SPARK_H + '" role="img" aria-label="' +
    esc("Model " + pct(model && model.model_p) + " against book " +
      pct(book && book.book_p)) + '">' +
    '<path d="' + esc(sparkPath(series, "book_p")) +
    '" fill="none" stroke="var(--subtle)" stroke-width="1.4" ' +
    'stroke-dasharray="3 2"></path>' +
    '<path d="' + esc(sparkPath(series, "model_p")) +
    '" fill="none" stroke="' + stroke +
    '" stroke-width="1.8" stroke-linejoin="round"></path>' + dot +
    '</svg>' +
    '<span class="sparknums"><b>' + esc(pct(model && model.model_p)) +
    '</b> vs ' + esc(pct(book && book.book_p)) + '</span></span>';
}

/* ------------------------------------------------------------------
 * THE FIVE VIEWS — one cell's two values, per sec 5.1's table
 * ------------------------------------------------------------------ */

/* `{v1, v2, tone, big}`. `tone` colours v2 and `big` tints the whole
 * cell; both are decided HERE, because both are display rules. A
 * quantity the exporter left null comes back as a dash with its own
 * reason on it, never as a zero. */
function cellValues(person) {
  const empty = { v1: DASH, v2: DASH, tone: "absent", big: false };
  if (!person) return empty;

  if (nav.view === "props") {
    const prop = person.key_prop;
    if (!prop) return empty;
    const line = num(prop.line) + prop.unit;
    /* SEC 7.3, AND THIS IS THE WHOLE OF IT. At GAP_MIN and above the
     * gap is an edge and is drawn as one; below it the cell is a grey
     * dash, never a small number a reader could take for one. */
    const big = prop.gap_pts >= GAP_MIN;
    return { v1: line, v2: big ? signed(prop.gap_pts) : DASH,
      tone: big ? "positive" : "absent", big: big };
  }

  if (nav.view === "fantasy") {
    const points = person.fantasy && person.fantasy.proj;
    return { v1: num(points), v2: DASH, tone: "absent", big: false };
  }

  if (nav.view === "role") {
    const role = person.role || {};
    const trend = role.trend_pts_vs_prior4;
    const shown = trend !== null && trend !== undefined &&
      Math.abs(trend) >= TREND_MIN;
    return { v1: pct(role.share),
      v2: shown ? signed(trend) : DASH,
      tone: shown ? (trend > 0 ? "positive" : "negative") : "absent",
      big: false };
  }

  if (nav.view === "usage") {
    const usage = person.usage || {};
    const opp = usage.opp_per_game;
    const share = usage.rz_share;
    const hot = share !== null && share !== undefined &&
      share >= RZ_MIN;
    return {
      v1: opp === null || opp === undefined
        ? DASH : num(opp) + usage.opp_unit,
      v2: share === null || share === undefined ? DASH : pct(share),
      tone: hot ? "positive" : "absent", big: false };
  }

  /* market: the cell IS the sparkline, so it has no v1 or v2 — but it
   * still carries the tint, because the gap is the same gap. */
  const prop = person.key_prop;
  return { v1: "", v2: "",
    tone: "absent",
    big: !!(prop && prop.gap_pts >= GAP_MIN) };
}

function cellLabel(person, team, slot) {
  if (!person) return team + " " + slot + ", no player listed";
  const values = cellValues(person);
  if (nav.view === "market") {
    const model = lastOf(person.market_series, "model_p");
    const book = lastOf(person.market_series, "book_p");
    return person.name + ", " + person.team + " " + person.pos +
      ", model " + pct(model && model.model_p) + " against book " +
      pct(book && book.book_p);
  }
  return person.name + ", " + person.team + " " + person.pos + ", " +
    HEADS[nav.view][0] + " " + values.v1 + ", " +
    HEADS[nav.view][1] + " " + values.v2;
}

/* The two inner layouts, mirrored. The away side reads name, v1, v2
 * outward from the centre; the home side reads v2, v1, name inward —
 * which is what sec 5.1 means by a mirrored table and is why the two
 * are written as one function with a side. */
function cellBody(person, side) {
  const values = cellValues(person);
  if (nav.view === "market") {
    const spark = marketCell(person, values.big);
    const name = '<span class="cellname">' +
      esc(person ? person.name : DASH) + '</span>';
    return side === "away" ? name + spark : spark + name;
  }
  const name = '<span class="cellname">' +
    esc(person ? person.name : DASH) + '</span>';
  const one = '<span class="cellv1">' + esc(values.v1) + '</span>';
  const two = '<span class="cellv2 ' + values.tone + '">' +
    esc(values.v2) + '</span>';
  return side === "away" ? name + one + two : two + one + name;
}

function playerCell(id, side, team, slot) {
  const person = playerOf(id);
  const values = cellValues(person);
  const classes = ["cellbtn", side, nav.view];
  if (values.big) classes.push("tinted");
  if (!person) classes.push("empty");
  /* The cell is a button whether or not it has a player in it, so the
   * seven rows keep their shape and the grid never reflows between
   * views. An empty one is disabled rather than silently inert. */
  return '<button class="' + classes.join(" ") +
    '" data-act="player" data-player="' + esc(id || "") + '"' +
    (person ? "" : " disabled") + ' aria-label="' +
    esc(cellLabel(person, team, slot)) + '">' +
    cellBody(person, side) + '</button>';
}

/* ------------------------------------------------------------------
 * THE EXPANDED ROW — sec 5.1, two cards on a ground panel
 * ------------------------------------------------------------------ */

function expandedCard(id) {
  const person = playerOf(id);
  if (!person) {
    return '<div class="expcard empty">' + esc(DASH) + '</div>';
  }
  const points = person.fantasy && person.fantasy.proj;
  return '<div class="expcard">' +
    '<div class="exphead"><span class="expname">' +
    esc(person.name) + '</span><span class="expteam">' +
    esc(person.team + " " + person.pos) + '</span></div>' +
    '<div class="overline" title="' +
    esc(person.projected_line_template) + '">' + esc(PROJECTED) +
    '</div>' +
    statline(person.projected_line) +
    '<div class="statrow exppoints"><span class="statlabel">' +
    esc(FANTASY_ROW) + '</span><span class="statvalue">' +
    esc(num(points)) + '</span></div>' +
    '<button class="openpick" data-act="player" data-player="' +
    esc(id) + '">' + esc(OPEN_PICK) + '</button></div>';
}

function expandedRow(game, index) {
  return '<div class="exprow' + growClass() + '">' +
    expandedCard(game.players.away[index]) +
    expandedCard(game.players.home[index]) + '</div>';
}

/* ------------------------------------------------------------------
 * THE TABLE — seven mirrored rows, sec 5.1
 * ------------------------------------------------------------------ */

function tableHead(game) {
  const heads = HEADS[nav.view];
  return '<div class="thead">' +
    '<div class="tside away"><span class="tteam">' + esc(game.away) +
    '</span><span class="th1">' + esc(heads[0]) +
    '</span><span class="th2">' + esc(heads[1]) + '</span></div>' +
    '<div class="tpos">POS</div>' +
    '<div class="tside home"><span class="th2">' + esc(heads[1]) +
    '</span><span class="th1">' + esc(heads[0]) +
    '</span><span class="tteam">' + esc(game.home) + '</span></div>' +
    '</div>';
}

function tableRows(game) {
  const slots = game.slots || [];
  return slots.map(function (slot, index) {
    const open = nav.exp === index;
    return '<div class="trow' + (open ? " open" : "") +
      (index % 2 ? " alt" : "") + '">' +
      playerCell(game.players.away[index], "away", game.away, slot) +
      '<button class="posbtn' + (open ? " open" : "") +
      '" data-act="row" data-row="' + index +
      '" aria-expanded="' + open + '" aria-label="' +
      esc((open ? "Hide" : "Show") + " projected stats for the " +
        slot + " row") + '">' +
      '<span class="posname">' + esc(slot) + '</span>' +
      icon("chevron", 12, 2.5) + '</button>' +
      playerCell(game.players.home[index], "home", game.home, slot) +
      '</div>' + (open ? expandedRow(game, index) : "");
  }).join("");
}

/* THE PROPS UNIT KEY, built from the cells actually on screen. Sec 10
 * asks that every unit letter be explained in the view footnote, and
 * a fixed sentence would sooner or later name a letter no cell
 * carries — or miss one that a new key market brought in. */
function unitKey(game) {
  const seen = {};
  ["away", "home"].forEach(function (side) {
    (game.players[side] || []).forEach(function (id) {
      const person = playerOf(id);
      if (person && person.key_prop) {
        seen[person.key_prop.unit] = person.key_prop.unit_word;
      }
    });
  });
  const keys = Object.keys(seen).sort();
  if (!keys.length) return "";
  return " Units: " + keys.map(function (unit) {
    return unit + " " + seen[unit];
  }).join(", ") + ".";
}

/* WHETHER THE CALIBRATION SENTENCE APPLIES is read off the document,
 * not assumed: it is shown when a prop on this screen belongs to one
 * of the markets the run block names, or when one does not — which is
 * both arms, and is exactly why the sentence names both. */
function propsFootnote(game) {
  return LEGEND_PROPS + unitKey(game) + " " + CALIBRATION_NOTE;
}

function legendFor(game) {
  if (nav.view === "props") return propsFootnote(game);
  if (nav.view === "fantasy") {
    return LEGEND_FANTASY + " " + RANGE_ABSENT;
  }
  if (nav.view === "usage") return LEGEND_USAGE + " " + RZ_ABSENT;
  return LEGENDS[nav.view];
}

function footnotes(game) {
  const lines = [legendFor(game)].concat(game.notes || []);
  return lines.map(function (line) {
    return '<div class="legend">' + esc(line) + '</div>';
  }).join("");
}

function viewToggle() {
  return '<div class="viewseg" role="group" aria-label="' +
    esc(VIEW_GROUP_LABEL) + '">' + VIEWS.map(function (view) {
      return '<button data-act="view" data-view="' + esc(view[0]) +
        '" aria-pressed="' + (nav.view === view[0]) + '">' +
        esc(view[1]) + '</button>';
    }).join("") + '</div>';
}

/* Sec 4's game line strip: three cells on a ground panel. Each one is
 * a stored number or a dash — the exporter ships the line the forecast
 * CONSUMED, and where it had none the strip says so rather than
 * falling back to a different number that would look the same. */
function lineStrip(game) {
  const cells = [
    [game.away + " TOTAL", num(game.implied_total_away)],
    ["SPREAD", game.spread_label || DASH],
    [game.home + " TOTAL", num(game.implied_total_home)]
  ];
  return '<div class="linestrip" title="' + esc(game.line_basis) + '">' +
    cells.map(function (cell) {
      return '<div class="linecell"><span class="linelabel">' +
        esc(cell[0]) + '</span><span class="linevalue">' +
        esc(cell[1]) + '</span></div>';
    }).join("") + '</div>';
}

/* ------------------------------------------------------------------
 * THE GAME SWITCHER — sec 4
 * ------------------------------------------------------------------ */

function kickoffLabel(stamp) {
  if (!stamp) return "";
  const when = new Date(stamp);
  if (isNaN(when.getTime())) return "";
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let hour = when.getHours();
  hour = hour % 12 || 12;
  const minutes = String(when.getMinutes()).padStart(2, "0");
  return days[when.getDay()] + " " + hour + ":" + minutes;
}

function switcher(game, count) {
  const dots = games().map(function (unused, index) {
    return '<span class="' + (index === nav.game ? "on" : "") +
      '"></span>';
  }).join("");
  const when = kickoffLabel(game.kickoff);
  return '<div class="switcher">' +
    '<button class="arrow" data-act="game" data-step="-1" ' +
    'aria-label="Previous game">' + icon("back", 20, 2.5) + '</button>' +
    '<button class="matchup" data-act="search-open" aria-label="' +
    esc(game.away + " at " + game.home + (when ? ", " + when : "") +
      ". Search games") + '">' +
    '<span class="teams">' + esc(game.away) +
    ' <span class="at">@</span> ' + esc(game.home) +
    icon("search", 15, 2.5) + '</span>' +
    '<span class="when">' + esc(when ? when + " · " : "") +
    (nav.game + 1) + ' OF ' + count + '</span></button>' +
    '<button class="arrow" data-act="game" data-step="1" ' +
    'aria-label="Next game">' + icon("next", 20, 2.5) + '</button>' +
    '</div>' +
    '<div class="dots" aria-hidden="true">' + dots + '</div>';
}

/* ------------------------------------------------------------------
 * THE MATCHUP CARD — the only table on Home
 * ------------------------------------------------------------------ */

function matchBody(game) {
  return lineStrip(game) + viewToggle() +
    '<div class="table" id="matchtable">' + tableHead(game) +
    tableRows(game) + '</div>' + footnotes(game);
}

function matchCard() {
  const game = currentGame();
  if (!game) {
    /* Sec 8: no games this week. The switcher says so and the table is
     * replaced by an empty state — not by a skeleton, which would
     * promise something that is coming. */
    return '<div class="matchcard" id="matchcard">' +
      '<div class="switcher"><div class="matchupflat">' +
      esc(NO_GAMES_SWITCHER) + '</div></div>' +
      '<div class="legend">' + esc(NO_GAMES_BODY) + '</div></div>';
  }
  return '<div class="matchcard" id="matchcard">' +
    switcher(game, games().length) + matchBody(game) + '</div>';
}

/* THE OFFLINE ARM. The shell's own stub, with the honest note: the
 * sample games below it are labelled by the Sample-data tag in the
 * hero, which stays on for exactly as long as they are what is on
 * screen. */
function matchStub() {
  const game = SAMPLE_GAMES[nav.game % SAMPLE_GAMES.length];
  const dots = SAMPLE_GAMES.map(function (unused, index) {
    return '<span class="' +
      (index === nav.game % SAMPLE_GAMES.length ? "on" : "") +
      '"></span>';
  }).join("");
  return '<div class="matchcard" id="matchcard">' +
    '<div class="switcher">' +
    '<button class="arrow" data-act="game" data-step="-1" ' +
    'aria-label="Previous game">' + icon("back", 20, 2.5) + '</button>' +
    '<div class="matchupflat"><span class="teams">' + esc(game.away) +
    ' <span class="at">@</span> ' + esc(game.home) + '</span>' +
    '<span class="when">' + esc(game.when) + '</span></div>' +
    '<button class="arrow" data-act="game" data-step="1" ' +
    'aria-label="Next game">' + icon("next", 20, 2.5) + '</button>' +
    '</div><div class="dots" aria-hidden="true">' + dots + '</div>' +
    '<div class="tablestub" id="tablestub">' +
    '<div class="skeleton" aria-hidden="true">' +
    skeletonRows(SKELETON_WIDTHS) + '</div></div>' +
    '<div class="cardhead offhead">' + esc(OFFLINE_HEAD) + '</div>' +
    '<div class="legend">' + esc(nav.slateNote || OFFLINE_BODY) +
    '</div></div>';
}

/* ------------------------------------------------------------------
 * THE GAME SEARCH OVERLAY — sec 5.1
 * ------------------------------------------------------------------ */

function playersIn(game) {
  const out = [];
  ["away", "home"].forEach(function (side) {
    (game.players[side] || []).forEach(function (id) {
      const person = playerOf(id);
      if (person) out.push(person);
    });
  });
  return out;
}

function gapsIn(game) {
  return playersIn(game).filter(function (person) {
    return person.key_prop && person.key_prop.gap_pts >= GAP_MIN;
  }).length;
}

/* THE FILTER. Team abbreviation and player name, case-insensitively,
 * and the first matching player becomes the "has ..." hint — which is
 * the whole reason a player search on a GAME list makes sense. */
function searchResults() {
  const query = String(nav.query || "").trim().toLowerCase();
  const out = [];
  games().forEach(function (game, index) {
    const people = playersIn(game);
    const hay = [game.away, game.home].concat(
      people.map(function (person) { return person.name; }))
      .join(" ").toLowerCase();
    if (query && hay.indexOf(query) < 0) return;
    let hit = null;
    if (query) {
      people.some(function (person) {
        if (person.name.toLowerCase().indexOf(query) >= 0) {
          hit = person.name;
          return true;
        }
        return false;
      });
    }
    out.push({ index: index, game: game, hit: hit,
      gaps: gapsIn(game) });
  });
  return out;
}

function renderSearch() {
  const node = el("searchoverlay");
  if (!node) return;
  if (!nav.search) {
    node.hidden = true;
    node.innerHTML = "";
    return;
  }
  const results = searchResults();
  const when = function (game) {
    const label = kickoffLabel(game.kickoff);
    return label ? label : "";
  };
  const rows = results.map(function (result) {
    const bits = [result.game.away + " at " + result.game.home];
    const time = when(result.game);
    if (time) bits.push(time);
    if (result.hit) bits.push(SEARCH_HAS + result.hit);
    return '<button class="gameresult' +
      (result.index === nav.game ? " current" : "") +
      '" data-act="pick-game" data-game="' + result.index +
      '" aria-label="' + esc(bits.join(", ")) + '">' +
      '<span class="gamecol"><span class="gamename">' +
      esc(result.game.away + " @ " + result.game.home) +
      '</span><span class="gamesub">' + esc(bits.slice(1).join(" · ")) +
      '</span></span>' +
      (result.gaps
        ? '<span class="gapchip">' + result.gaps +
          (result.gaps === 1 ? " gap" : " gaps") + '</span>'
        : "") + '</button>';
  }).join("");
  node.innerHTML = '<button class="scrim" data-act="search-close" ' +
    'aria-label="Close search"></button>' +
    '<div class="searchpanel motion-drop" role="dialog" ' +
    'aria-modal="true" aria-label="Search games">' +
    '<div class="searchbar">' + icon("search", 18, 2.5) +
    '<input class="searchinput" id="gamesearch" type="text" ' +
    'autocomplete="off" placeholder="' + esc(SEARCH_PLACEHOLDER) +
    '" aria-label="Search games" value="' + esc(nav.query) + '">' +
    '<button class="searchcancel" data-act="search-close">' +
    esc(SEARCH_CANCEL) + '</button></div>' +
    '<div class="searchbasis">' + esc(SEARCH_BASIS) + '</div>' +
    '<div class="overline">' + esc(SEARCH_HEADING) + '</div>' +
    rows +
    (results.length ? "" :
      '<div class="legend">' + esc(SEARCH_EMPTY + ' "' + nav.query +
        '".') + '</div>') +
    '</div>';
  node.hidden = false;
}

/* ------------------------------------------------------------------
 * the screens
 * ------------------------------------------------------------------ */

function renderHome() {
  return '<div class="hero">' + heroArt() + heroTop() + heroRings() +
    '<div class="herofade"></div></div>' +
    (nav.slate ? matchCard() : matchStub());
}

function lineupSkeleton() {
  return '<div class="skeleton" aria-hidden="true">' +
    SAMPLE_LINEUP_SLOTS.map(function (slot, index) {
      return '<div class="skelrow' + growClass() + '" style="--i:' +
      index + '">' +
        '<div class="skelbar lead"></div>' +
        '<div class="skelbar" style="width:' +
        SKELETON_WIDTHS[index % SKELETON_WIDTHS.length] + '%"></div>' +
        '<div class="skelbar tail"></div></div>';
    }).join("") + '</div>';
}

function fantasyHead() {
  return '<div class="pagehead"><div class="pagetitle">' +
    esc(TITLE_FANTASY) + '</div><div class="pagemeta">' +
    esc(SAMPLE_WEEK + " · " + SAMPLE_SCORING) + '</div></div>' +
    subToggle("fantasy");
}

function renderFantasySeason() {
  return '<div class="page">' + fantasyHead() +
    stubCard("Arrives in U5", "My team, and the calls on it.",
      STUB_FANTASY_SEASON) + lineupSkeleton() + '</div>';
}

function renderFantasyDfs() {
  return '<div class="page">' + fantasyHead() +
    stubCard("Arrives in U5", "My team, built for a slate.",
      STUB_FANTASY_DFS) + lineupSkeleton() + '</div>';
}

function renderProjections() {
  return '<div class="page">' +
    '<div class="pagehead"><div class="pagetitle">' +
    esc(TITLE_PROJECTIONS) + '</div><div class="pagemeta">' +
    esc(SAMPLE_WEEK) + '</div></div>' +
    stubCard(PROJ_OVERLINE, PROJ_HEADING, PROJ_CONTEXT) +
    '<div class="skeleton" aria-hidden="true">' +
    skeletonRows(SKELETON_WIDTHS) + '</div></div>';
}

/* sec 2.2 and sec 4: the tab stays active on EVERY one of its
 * sub-views, and the segmented control is drawn on every one of them
 * so the reader can always see which he is on and reach the others.
 * Two tabs use it now, so it is written once. */
function subToggle(tab) {
  return '<div class="seg" role="group" aria-label="' +
    esc(SUB_GROUP_LABEL[tab]) + '">' +
    TAB_SUBS[tab].map(function (sub) {
      return '<button data-act="sub" data-tab="' + esc(tab) +
        '" data-sub="' + esc(sub) + '" aria-pressed="' +
        (nav.subs[tab] === sub) + '">' + esc(SUB_LABELS[sub]) +
        '</button>';
    }).join("") + '</div>';
}

function betsHead() {
  return '<div class="pagehead"><div class="pagetitle">' + esc(TITLE_BETS) +
    '</div></div>' + subToggle("bets");
}

function renderBetsScreen() {
  return '<div class="page">' + betsHead() +
    '<div class="slatehead"><div class="slatetitle">' + esc(SLATE_HEADER) +
    '</div><div class="pagemeta">' + esc(SLATE_BASIS) + '</div></div>' +
    stubCard("Arrives in U3", "Screen the slate.", STUB_SCREEN) +
    stubRows(SAMPLE_SCREEN_ROWS, "U3", "pick") + '</div>';
}

function renderBetsLive() {
  return '<div class="page">' + betsHead() +
    '<div class="overline">' + esc(LIVE_OVERLINE) + '</div>' +
    stubCard("Arrives in U4", "Watch a bet live.", STUB_LIVE_BOARD) +
    stubRows(SAMPLE_LIVE_ROWS, "U4", "card") + '</div>';
}

/* The owner's third segment: the watchlist and the slips already
 * tracked, which is where a pick saved on the Pick card and a slip
 * brought back from Track a slip both land. Content is U3; the two
 * stub rows below open the two routes that will fill it. */
function renderBetsPicks() {
  return '<div class="page">' + betsHead() +
    '<div class="overline">' + esc(PICKS_OVERLINE) + '</div>' +
    stubCard("Arrives in U3", "Everything you saved or placed.",
      STUB_PICKS) +
    stubRows(SAMPLE_WATCHLIST_ROWS, "U3", "pick") +
    stubRows(SAMPLE_SLIP_ROWS, "U3", "track") + '</div>';
}

function detailHead(title) {
  return '<div class="pagehead">' +
    '<button class="backbtn" data-act="back" aria-label="Back">' +
    icon("back") + '</button>' +
    '<div class="pagetitle">' + esc(title) + '</div></div>';
}

function renderPick() {
  return '<div class="page">' + detailHead(TITLE_PICK) +
    stubCard("Arrives in U3", "The pick card lands here.", STUB_PICK) +
    '<div class="skeleton" aria-hidden="true">' +
    skeletonRows(SKELETON_WIDTHS.slice(0, 4)) + '</div></div>';
}

function renderTrack() {
  return '<div class="page">' + detailHead(TITLE_TRACK) +
    stubCard("Arrives in U3", "Bring the slip back.", STUB_TRACK) + '</div>';
}

function renderLiveCard() {
  return '<div class="page">' + detailHead(TITLE_LIVE_CARD) +
    stubCard("Arrives in U4", "One bet, watched.", STUB_LIVE_CARD) + '</div>';
}

function renderReport() {
  return '<div class="page">' + detailHead(TITLE_REPORT) +
    stubCard("Arrives in U6", "How each part of your read held up.",
      STUB_REPORT) + '</div>';
}

const SCREENS = {
  home: renderHome,
  season: renderFantasySeason,
  dfs: renderFantasyDfs,
  projections: renderProjections,
  screen: renderBetsScreen,
  live: renderBetsLive,
  picks: renderBetsPicks,
  pick: renderPick,
  track: renderTrack,
  card: renderLiveCard,
  report: renderReport
};

/* ------------------------------------------------------------------
 * the chrome
 * ------------------------------------------------------------------ */

function renderTabBar() {
  const bar = el("tabbar");
  if (!bar) return;
  bar.innerHTML = TAB_SLOTS.map(function (slot) {
    if (!slot.tab) {
      return '<div class="tabadd"><button class="addbtn" ' +
        'data-act="sheet-open" aria-label="' + esc(ADD_TITLE) + '">' +
        icon("plus", 26, 2.5) + '</button></div>';
    }
    const active = nav.tab === slot.tab;
    return '<button class="tab" data-act="tab" data-tab="' + esc(slot.tab) +
      '" aria-label="' + esc(slot.label) + '"' +
      (active ? ' aria-current="page"' : "") + '>' + icon(slot.icon) +
      '<span class="tablabel">' + esc(slot.label) + '</span></button>';
  }).join("");
}

function renderToast() {
  const node = el("toast");
  if (!node) return;
  if (!nav.toast) {
    node.hidden = true;
    node.innerHTML = "";
    return;
  }
  const action = nav.toast.label
    ? '<button class="toastact" data-act="toast-go" data-route="' +
      esc(nav.toast.route) + '">' + esc(nav.toast.label) + '</button>'
    : "";
  node.innerHTML = '<span class="toasttext">' + esc(nav.toast.text) +
    '</span>' + action +
    '<button class="toastclose" data-act="toast-close" ' +
    'aria-label="Dismiss">' + icon("close", 16, 2.5) + '</button>';
  node.hidden = false;
  restart(node, "motion-toast");
}

/* sec 2.4 — the + sheet, over a 45% ink scrim; tapping the scrim
 * closes it, and so does Escape. */
function renderSheet() {
  const node = el("overlay");
  if (!node) return;
  if (!nav.sheet) {
    node.hidden = true;
    node.innerHTML = "";
    return;
  }
  const actions = [
    { title: ADD_READ, sub: ADD_READ_SUB, colour: "var(--read)",
      act: "sheet-read" },
    { title: ADD_SLIP, sub: ADD_SLIP_SUB, colour: "var(--positive)",
      act: "sheet-track" },
    { title: ADD_STARTSIT, sub: ADD_STARTSIT_SUB, colour: "var(--heating)",
      act: "sheet-startsit" }
  ].map(function (action) {
    return '<button class="action" data-act="' + esc(action.act) + '">' +
      '<span class="dot" style="background:' + action.colour + '"></span>' +
      '<span class="actioncol"><span class="actiontitle">' +
      esc(action.title) + '</span><span class="actionsub">' +
      esc(action.sub) + '</span></span></button>';
  }).join("");
  node.innerHTML = '<button class="scrim" data-act="sheet-close" ' +
    'aria-label="Close"></button>' +
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="' +
    esc(ADD_TITLE) + '"><div class="handle"></div>' +
    '<div class="sheettitle">' + esc(ADD_TITLE) + '</div>' + actions +
    '</div>';
  node.hidden = false;
}

function renderAlpha() {
  const node = el("alpha");
  if (node) node.textContent = ALPHA_NOTE;
}

const MOTION_CLASS = {
  push: "motion-push",
  pop: "motion-pop",
  tab: "motion-tab"
};

/* sec 2.5's Grow, and the same rule as the screen's own motion: a
 * list STAGGERS IN when its items arrive, not when the app opens. On
 * the first paint the rows are simply there. */
function growClass() {
  return nav.booted ? " grow" : "";
}

function render() {
  const route = currentRoute();
  const screen = el("screen");
  if (!screen) return;
  screen.className = "screen";
  screen.innerHTML = SCREENS[route]();
  /* THE BOOT GUARD IS `booted`, NOT the motion value. A deep link —
   * an address that names a route the shell is not already standing
   * on — reconciles the stack BEFORE the first render and sets a
   * motion while doing it, so keying off the motion alone left
   * `…#/bets/my-picks` fading up from the ground exactly as the home
   * screen did. Nothing animates until the reader has asked for
   * something. */
  const motion = nav.booted && nav.motion ? MOTION_CLASS[nav.motion] : null;
  if (motion) restart(screen, motion);
  renderTabBar();
  renderAlpha();
  renderToast();
  renderSheet();
  renderSearch();
}

/* The game switcher's own re-draw: the table slides 14px in the
 * direction of travel and nothing else on the screen moves, so this
 * does not go through `render()`'s screen transition. Sec 2.5 asks
 * that the animation RESTART on every change, which `restart` does.
 *
 * CHANGING GAME COLLAPSES THE OPEN ROW (sec 5.1). A row is a pair of
 * players in one game; carrying it across would leave the panel open
 * on two different men. */
function redrawCard(step) {
  const card = el("matchcard");
  if (!card) return;
  const game = currentGame();
  if (nav.slate && game) {
    card.innerHTML = switcher(game, games().length) + matchBody(game);
    /* ONLY A GAME CHANGE SWAPS. A view change and a row toggle redraw
     * the same game's table, and sliding it sideways would say a
     * different game had arrived. */
    if (step) {
      restart(el("matchtable"),
        step > 0 ? "motion-swap-next" : "motion-swap-prev");
    }
    return;
  }
  render();
}

function stepGame(step) {
  const count = nav.slate ? games().length : SAMPLE_GAMES.length;
  if (!count) return;
  nav.game = (nav.game + step + count) % count;
  nav.exp = null;
  redrawCard(step);
}

function pickGame(index) {
  const count = games().length;
  if (!count) return;
  const step = index >= nav.game ? 1 : -1;
  nav.game = Math.max(0, Math.min(index, count - 1));
  nav.exp = null;
  nav.search = false;
  nav.query = "";
  renderSearch();
  redrawCard(step);
}

/* Sec 5.1: ONE row open at a time. Tapping the open one closes it. */
function toggleRow(index) {
  nav.exp = nav.exp === index ? null : index;
  redrawCard(0);
}

function setView(view) {
  if (!HEADS[view] || nav.view === view) return;
  nav.view = view;
  redrawCard(0);
}

/* ------------------------------------------------------------------
 * one click handler for the whole shell
 * ------------------------------------------------------------------
 * Every control is a real <button> carrying `data-act`, so there is
 * no inline handler anywhere and a control added to a screen is wired
 * by existing. */

function onClick(event) {
  const target = event.target.closest ? event.target.closest("[data-act]") : null;
  if (!target) return;
  const act = target.getAttribute("data-act");

  if (act === "tab") {
    selectTab(target.getAttribute("data-tab"));
  } else if (act === "open") {
    openDetail(target.getAttribute("data-route"));
  } else if (act === "back") {
    goBack();
  } else if (act === "sub") {
    swapSub(target.getAttribute("data-tab"), target.getAttribute("data-sub"));
  } else if (act === "game") {
    stepGame(Number(target.getAttribute("data-step")) || 1);
  } else if (act === "view") {
    setView(target.getAttribute("data-view"));
  } else if (act === "row") {
    toggleRow(Number(target.getAttribute("data-row")));
  } else if (act === "player") {
    /* Sec 2.1: a player cell opens that player's pick. U3 fills the
     * card; the id travels on the address so the day it does, this
     * handler does not change. */
    openPick(target.getAttribute("data-player"));
  } else if (act === "search-open") {
    openSearch();
  } else if (act === "search-close") {
    closeSearch();
  } else if (act === "pick-game") {
    pickGame(Number(target.getAttribute("data-game")) || 0);
  } else if (act === "note") {
    showToast(target.getAttribute("data-note"));
  } else if (act === "sheet-open") {
    openSheet();
  } else if (act === "sheet-close") {
    closeSheet();
  } else if (act === "sheet-read") {
    /* sec 2.4: Add your read opens the read sheet on a player's pick.
     * The sheet itself is U6, so the honest arm is the note plus the
     * pick card it will open on. */
    closeSheet();
    showToast(NOTE_READS, ACTION_OPEN_PICK, "pick");
  } else if (act === "sheet-track") {
    openDetail("track");
  } else if (act === "sheet-startsit") {
    /* sec 2.4 sends this to Fantasy. Since the owner's amendment
     * split Fantasy in two, it goes to the sub-view that will hold
     * the start/sit call — Season long — which is an explicit
     * navigation and so sets the memory, exactly as tapping the
     * toggle would. */
    closeSheet();
    swapSub("fantasy", "season");
    showToast(STUB_STARTSIT);
  } else if (act === "toast-go") {
    const route = target.getAttribute("data-route");
    closeToast();
    if (route) openDetail(route);
  } else if (act === "toast-close") {
    closeToast();
  }
}

/* Sec 5.1's search panel. Opening it clears nothing and closing it
 * clears the query, so re-opening is a fresh search rather than a
 * half-remembered one. */
function openSearch() {
  if (!nav.slate || !games().length) return;
  nav.search = true;
  nav.toast = null;
  renderToast();
  renderSearch();
  const input = el("gamesearch");
  if (input && input.focus) input.focus();
}

function closeSearch() {
  if (!nav.search) return;
  nav.search = false;
  nav.query = "";
  renderSearch();
}

/* THE PICK STUB ROUTE. U3 fills the card; until then the route exists
 * and the player it was opened for rides the address, so nothing
 * about this call changes on the day it does. */
function openPick(playerId) {
  if (playerId) nav.pick = playerId;
  closeSearch();
  openDetail("pick");
}

/* The search input is the one control in this app that is not a
 * button, so it is the one thing wired by its own listener rather
 * than by `data-act`. Re-rendering the panel on each keystroke would
 * take the caret with it, so only the RESULTS are redrawn. */
function onInput(event) {
  const target = event.target;
  if (!target || target.id !== "gamesearch") return;
  nav.query = target.value;
  const panel = el("searchoverlay");
  if (!panel) return;
  const held = target.selectionStart;
  renderSearch();
  const again = el("gamesearch");
  if (again) {
    again.focus();
    try {
      again.setSelectionRange(held, held);
    } catch (err) {
      /* a browser that will not place the caret still has the text */
    }
  }
}

function onKeyDown(event) {
  if (event.key !== "Escape") return;
  if (nav.search) {
    closeSearch();
    return;
  }
  if (nav.sheet) closeSheet();
}

function onHashChange() {
  applyHash();
  render();
  normalizeHash();
}

/* ------------------------------------------------------------------
 * boot — no fetch, no storage, one render
 * ------------------------------------------------------------------ */

document.addEventListener("click", onClick);
document.addEventListener("input", onInput);
document.addEventListener("keydown", onKeyDown);
window.addEventListener("hashchange", onHashChange);

/* Boot order matters: the address is reconciled and normalised
 * BEFORE the first paint. Where `replaceState` is missing, normalising
 * writes the hash instead, and writing it fires a hashchange — doing
 * that after the first render would hand the reader a second render
 * with a transition on it, which is the entry animation this file has
 * just finished removing. Normalise first and every boot path paints
 * once, at rest. */
applyHash();
normalizeHash();
render();

/* Boot is over. `booted` is set HERE and nowhere else — it means the
 * app has finished opening, not that a render happened, so the extra
 * render the `replaceState` fallback can provoke is still part of
 * booting and still at rest. Every transition from this line on
 * belongs to something the reader did. */
nav.booted = true;

/* ...and only then is the document asked for. The first paint is the
 * shell at rest (U1's rule, unchanged); the slate arrives after it and
 * redraws the home screen when it does, so a slow network shows the
 * app rather than a blank page, and a network that never answers shows
 * the honest arm rather than a spinner that means nothing. */
loadSlate();

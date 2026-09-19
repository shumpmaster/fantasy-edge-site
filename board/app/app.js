/* U1 — THE APP SHELL.
 *
 * docs/plan/UI_ALPHA_SPEC.md sec 3, realising
 * docs/design/FANTASY_EDGE_UI_HANDOFF.md: the tab bar (sec 2.2), the
 * per-tab stacks (sec 2.3), the + sheet (sec 2.4), the transition set
 * (sec 2.5), the hero (sec 5.1) and the Projections placeholder (sec
 * 5.3), with honest stubs at every other route so the navigation of
 * the reference prototype's board 16 works end to end.
 *
 * THE LAB'S IDIOMS, KEPT. Vanilla, no framework, no build step, no
 * module: the directory that is served is the directory that is
 * written. Sentinel constants for every word the reader must see.
 * `esc()` on every value that reaches the page. Honest arms — a stub
 * says it is a stub, in the increment's own words, rather than
 * drawing a plausible number nobody computed.
 *
 * WHAT THIS FILE DOES NOT DO, AND WHY.
 *
 *   IT FETCHES NOTHING. There is no exporter behind this surface yet
 *   (slate.json arrives at U2), so there is no document to read and
 *   no contract to honour. Everything the shell draws comes from the
 *   FIXTURES block below — fabricated names, a fabricated week — and
 *   the hero's Sample-data tag says so on screen for exactly as long
 *   as that is true. A test asserts this directory makes no network
 *   call of any kind, so the day that changes is a deliberate day.
 *
 *   IT STORES NOTHING. Not a key, not a token, not a preference. The
 *   Bets sub-view is remembered for the visit (sec 2.3) and the visit
 *   is all it is remembered for; nothing here is written to the
 *   reader's browser. When something does need remembering it will be
 *   written through a guarded read and a guarded write like the lab's.
 *
 *   IT COMPUTES NOTHING THAT IS A CLAIM. There is no probability, no
 *   projection and no gap on this surface yet. The one arithmetic in
 *   the file is the hero art's geometry and a modulo over six sample
 *   games, neither of which is ever shown as a quantity.
 *
 * THE NAVIGATION MODEL (sec 2.3) IS THE POINT OF THIS INCREMENT.
 * Each tab owns a STACK. Tapping a tab resets that tab to its root.
 * Detail screens PUSH onto the current tab's stack and the back
 * chevron POPS. The Bets tab remembers which of Screen and Live was
 * last used, and the Screen | Live toggle SWAPS the Bets root without
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
  "ALPHA — engine-certified projections; the interface around them is under active development, and its presentation is experimental (D-098). Sample data drives this build.";

/* The sec 5.1 tag, shown for as long as fixtures drive the shell. */
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
const STUB_HOME_TABLE = "The matchup table arrives in U2, from the slate the exporter writes.";
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
  close: "M6 6l12 12M18 6L6 18"
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
  game: 0
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
    '<div class="sampletag">' + esc(SAMPLE_TAG) + '</div>' +
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

/* The game switcher's shell (sec 4). The arrows move through the
 * sample week and the table below them re-runs its Swap in the
 * direction of travel, which is the whole point of building the shell
 * before the table: the overlap, the shadow and the motion are real
 * from U1 and only the rows are missing. */
function gameSwitcher() {
  const game = SAMPLE_GAMES[nav.game];
  const dots = SAMPLE_GAMES.map(function (unused, index) {
    return '<span class="' + (index === nav.game ? "on" : "") + '"></span>';
  }).join("");
  return '<div class="switcher">' +
    '<button class="arrow" data-act="game" data-step="-1" ' +
    'aria-label="Previous game">' + icon("back", 20, 2.5) + '</button>' +
    '<button class="matchup" data-act="note" data-note="' +
    esc(STUB_HOME_TABLE) + '" aria-label="' + esc(game.away + " at " +
    game.home + ", " + game.when + ". Game search arrives in U2") + '">' +
    '<span class="teams">' + esc(game.away) +
    ' <span class="at">@</span> ' + esc(game.home) + '</span>' +
    '<span class="when">' + esc(game.when) + ' · ' + (nav.game + 1) +
    ' OF ' + SAMPLE_GAMES.length + '</span></button>' +
    '<button class="arrow" data-act="game" data-step="1" ' +
    'aria-label="Next game">' + icon("next", 20, 2.5) + '</button>' +
    '</div>' +
    '<div class="dots" aria-hidden="true">' + dots + '</div>';
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
 * the screens
 * ------------------------------------------------------------------ */

function renderHome() {
  return '<div class="hero">' + heroArt() + heroTop() + heroRings() +
    '<div class="herofade"></div></div>' +
    '<div class="matchcard" id="matchcard">' + gameSwitcher() +
    '<div class="tablestub" id="tablestub">' +
    '<div class="skeleton" aria-hidden="true">' +
    skeletonRows(SKELETON_WIDTHS) + '</div></div>' +
    '<div class="legend">' + esc(STUB_HOME_TABLE) + '</div></div>';
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
}

/* The game switcher's own re-draw: the table slides 14px in the
 * direction of travel and nothing else on the screen moves, so this
 * does not go through `render()`'s screen transition. */
function stepGame(step) {
  const count = SAMPLE_GAMES.length;
  nav.game = (nav.game + step + count) % count;
  const card = el("matchcard");
  if (!card) return;
  card.innerHTML = gameSwitcher() +
    '<div class="tablestub" id="tablestub">' +
    '<div class="skeleton" aria-hidden="true">' +
    skeletonRows(SKELETON_WIDTHS) + '</div></div>' +
    '<div class="legend">' + esc(STUB_HOME_TABLE) + '</div>';
  restart(el("tablestub"),
    step > 0 ? "motion-swap-next" : "motion-swap-prev");
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

function onKeyDown(event) {
  if (event.key === "Escape" && nav.sheet) closeSheet();
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

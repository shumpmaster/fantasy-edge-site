/* LAB ITERATION L3 — THE SWEAT SANDBOX.
 *
 * The two screens of docs/design/SWEAT_UI_BRIEF.md — the LIVE SWEATS
 * BOARD and the chart-first SWEAT CARD — built as one page, in the
 * lab's idiom: vanilla, no framework, no build step, no module, one
 * fetch of one bundled file.
 *
 * WHAT THIS PAGE IS FED — TWO BOOTS, NEVER MIXED (L3b, D-122).
 *
 *   REAL (the default). `../../data/sweats.json`, ONE data-contract
 *   document written by `fantasy_edge.live.sweat`: the current
 *   generation's own distributions read at the market lines the live
 *   capture stored, with the American prices as captured. The owner
 *   ruled full bets with odds onto this surface, scoped to the lab and
 *   under its ALPHA banner. It is model output, NOT YET CALIBRATED,
 *   and it is not a pick.
 *
 *   DEMO (`?demo=1` only). `../../demo/sweats.demo.json`, an ARRAY of
 *   poll snapshots, every entity in it FABRICATED, kept exactly as
 *   built as the design and QA harness — seven states on demand is
 *   what a fixture is for. The replay control walks that recording and
 *   stands in for the poll loop.
 *
 * ONE URL IS CHOSEN BEFORE ANYTHING IS FETCHED and there is one fetch:
 * the two paths never blend, and the banner at the top of the page
 * says which one the reader is looking at.
 *
 * A SINGLE DOCUMENT HAS NOTHING TO REPLAY. The discriminator is as
 * dumb as it can be — an ARRAY is a recording, an OBJECT is one poll —
 * and the replay bar and the paused-feed banner belong to a recording.
 * A pregame board has no needle to freeze, so neither is drawn.
 *
 * WHAT THIS PAGE COMPUTES: nothing that is a claim. The snapshot
 * carries `state`, `p_now`, `band`, `delta_pregame_pts`, the ladder
 * rung chances, the summary tiles and every `why` line ready-made, as
 * the contract assigns them to the exporter. This file does two kinds
 * of arithmetic and no other:
 *   1. GEOMETRY — a stored `t` and a stored `p` divided by the axis the
 *      snapshot declares, to get the x and y a mark is drawn at. It
 *      produces no quantity and is never shown as a number.
 *   2. PRESENTATION ROUNDING — 0.74 printed as "74%", a stored band
 *      printed as "66-81".
 * It NEVER infers a state. There is no threshold in this file: the
 * brief's proposed cut-offs (its sec 10.3) are unruled, they live in
 * the fixture that authored the states, and the client renders the
 * `state` field as it finds it. That is honesty rule sec 6.4, and it
 * holds in the sandbox exactly as it would in the product.
 *
 * L3f — THE TWO CONTROLS, AND WHY THEY COMPUTE NOTHING EITHER.
 *
 *   THE REFERENCE TOGGLE (vs line · vs projection) PICKS BETWEEN TWO
 *   NUMBERS THE FILE ALREADY CARRIES. `p_pregame` is P(stat >= the
 *   book's line) and `p_vs_projection` is P(stat >= our own projected
 *   value), both read by the exporter off one distribution by one
 *   method. The toggle changes which stored number is read; it derives
 *   no third one, and a row the exporter left without the projection
 *   fields shows the dash rather than a number this page worked out.
 *   In the projection view the AMERICAN PRICE IS NOT DRAWN AT ALL:
 *   our own number is not a market's, and printing a price beside it
 *   would imply a bet somebody is offering at that threshold.
 *
 *   THE STAT CHIPS come out of the FILE — one chip per market actually
 *   present in the snapshot, so a market the exporter starts carrying
 *   appears here the day its rows do and this page never holds a list
 *   of markets that can go stale. They filter rows and nothing else.
 *
 * Both are PRESENTATION STATE, held in `ui` beside the replay position
 * and never written anywhere.
 *
 * NOTHING HERE HAS GRADUATED. The board is untouched by this file, and
 * nothing moves from the sandbox to the product without the owner's
 * word on the design.
 */
"use strict";

const BODY = document.body;

/* THE TWO PATHS. Real is the default (D-122); the fixture is reachable
 * only by asking for it by name in the query string. */
const REAL_SWEATS_URL = "../../data/sweats.json";
const DEMO_SWEATS_URL = "../../demo/sweats.demo.json";

/* The one switch, read once. Anything but `?demo=1` is real mode. */
const DEMO = (function () {
  try {
    return window.location.search.indexOf("demo=1") !== -1;
  } catch (err) {
    return false;
  }
})();

const SWEATS_URL = DEMO ? DEMO_SWEATS_URL : REAL_SWEATS_URL;
const FETCH_TIMEOUT_MS = 15000;

/* ------------------------------------------------------------------
 * the sentinels — each ONE contiguous string, the lab's idiom, so the
 * wording cannot drift silently. The two banners are written into
 * index.html as well; a test asserts the page and these constants say
 * the same thing.
 * ------------------------------------------------------------------ */

const SWEAT_IN_PROGRESS =
  "LAB — IN PROGRESS: design sandbox; presentation is experimental";

/* THE SAMPLE-SWEATS SENTINEL. It rides the top of the page always, on
 * every screen, and it is the one string on this page that may never
 * be softened: every bet, every price and every number below it was
 * made up for design work. */
const SAMPLE_SWEATS =
  "SAMPLE SWEATS — fabricated bets and numbers for design work; nothing here is a pick, a price, or a recommendation";

/* THE ALPHA SENTINEL — real mode's own, and the sample one's opposite
 * number. It names exactly what the numbers are: lines and prices as
 * the books posted them, probabilities the engine read off its own
 * distributions, an uncalibrated model, and a presentation nobody has
 * signed off as finished. It rides the same slot, always visible, and
 * it may never be softened either. */
const ALPHA_SWEATS =
  "ALPHA SWEATS — real lines and engine probabilities; model, not yet calibrated; experimental presentation (D-122)";

const SAMPLE_CHIP = "Sample data";
const ALPHA_CHIP = "Alpha";

const BOARD_TITLE = "LIVE SWEATS";
const CARD_TITLE = "SWEAT";
const BACK_LABEL = "Back to the live sweats board";

const LIVE_HEAD = "LIVE · CLOSEST TO CASHING";
const PREGAME_HEAD = "PREGAME · BY KICKOFF";
const SETTLED_HEAD = "SETTLED";
const DASHED_NOTE = "Dashed = pregame";

/* The brief's sec 7 empty board, word for word. */
const EMPTY_BOARD =
  "No live sweats. Bets you track show up here at kickoff.";

const NO_FILE =
  "The sweat file could not be read, so there is nothing to show. This page renders the one document it was pointed at and never invents a bet.";

/* Frame 9. The needle freezes and the page says so; it never carries a
 * value forward to cover the gap. */
const STALE_HEAD = "Live data paused · last update ";
const STALE_TAIL = " ago";
const STALE_NOTE =
  "The trace and the now dot are frozen where the last snapshot left them. Nothing is extrapolated.";

/* The chart's own title. It says "Live chance" only while the bet is
 * live: on a settled or voided bet the number is history, and calling
 * it live would be the page dressing up a fact it was handed. */
const CHART_TITLE_LIVE = "Live chance · ";
const CHART_TITLE_DONE = "Chance · ";

const NEW_SWING = "New swing ›";
const SWING_TAIL = " · tap any dot";
const NO_SWINGS = "No swings yet — the chart starts at the pregame chance.";

/* The replay control is SANDBOX CHROME. It is labelled as such so it
 * is never read as part of the designed surface. */
const REPLAY_LABEL = "REPLAY — sandbox control, not part of the design";
const REPLAY_NOTE =
  "Play walks the recorded snapshots; pause long enough and the paused-feed banner appears, because a stopped replay is exactly the stale case.";

/* Honesty rule sec 6.2 — the source is declared in plain words
 * whenever the snapshot says the source has not passed its calibration
 * gate. The wording is per `p_source` and nothing else. */
const SOURCE_LABELS = {
  model: "model, not yet calibrated",
  market: "market-implied",
  blend: "blended model and market, not yet calibrated"
};

/* ------------------------------------------------------------------
 * L3f — the two controls' own words. The toggle's two references, the
 * one sentence that says what the second one means, and the chips'
 * "All". Every one of them is a contiguous string for the same reason
 * the banners are.
 * ------------------------------------------------------------------ */

const REF_LINE = "line";
const REF_PROJECTION = "projection";

const REF_LEGEND = "Reference";
const REF_LINE_LABEL = "Vs line";
const REF_PROJECTION_LABEL = "Vs projection";

/* Said once, above the board, whenever the projection view is on. It
 * is the whole definition: the same distribution, a different
 * threshold. */
const VS_PROJECTION_NOTE =
  "Vs projection: chance of reaching our projected value, from the same distribution.";

/* ...and what the big number says when the row carries no projection
 * to be read against. The dash is the number; this is the reason. */
const NO_PROJECTION = "no projected value on this row";

const MARKET_LEGEND = "Stat";
const ALL_MARKETS_LABEL = "All";

/* The Exp. hits tile is a BET count and always answers the bet's own
 * question, so it is the one number on the board the reference toggle
 * does not move. It says so on itself. */
const EXP_HITS_TITLE =
  "Bets already cashed, plus the chance of each live and pregame bet against ITS OWN LINE. A bet settles against its line, so this total never follows the vs-projection toggle.";

/* The measured markets' unit, abbreviated, and the reason the wording
 * differs: a yardage bet clears a THRESHOLD ("88.5+ yds") while a
 * counted one needs whole things ("2 catches"). The unit comes off the
 * row, so no market list lives here. */
const YARD_UNITS = { yard: "yds", yards: "yds" };

/* The chart's dashed reference line, per view. */
const PREGAME_MARK = "Pregame ";
const PROJECTION_MARK = "Projection ";

/* The state's word, so colour is never the only signal (sec 8). */
const STATE_LABELS = {
  pregame: "Pregame",
  alive: "Alive",
  heating: "Heating",
  long_shot: "Long shot",
  cashed: "Cashed",
  lost: "Lost",
  void: "Void"
};

/* The three groupings the board draws, named by the states that fall
 * in each. This is an ORDERING, read off the state the snapshot
 * stored; it never changes a state and never invents one. */
const LIVE_STATES = ["alive", "heating", "long_shot"];
const SETTLED_STATES = ["cashed", "lost", "void"];

const BLANK = "—";
const FULL_GAME_S = 3600;

/* The only motions the brief allows, in milliseconds. */
const PULSE_MS = 600;
const SLIDE_MS = 250;
const REPLAY_MS = 2000;

const REDUCED = (function () {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    return false;
  }
})();

/* ------------------------------------------------------------------
 * the page's own memory — never a bet's
 * ------------------------------------------------------------------ */

const ui = {
  snapshots: [],
  /* true when the file was an ARRAY — a recording with something to
   * replay. A single document has no sequence, so the replay bar and
   * the paused-feed banner are not drawn at all. */
  replayable: false,
  index: 0,
  playing: false,
  timer: null,
  ticker: null,
  advancedAt: Date.now(),
  pulse: false,
  bet: null,          // the bet_id the card screen is showing, or null
  pinned: null,       // an event index the reader chose, or null = auto
  /* L3f. Presentation state, both of them: which stored number the
   * page reads, and which market's rows the board shows. They default
   * to the bet's own reference and to everything. */
  reference: REF_LINE,
  market: "",
  boardScroll: 0,
  error: ""
};

/* ------------------------------------------------------------------
 * small helpers — the lab's, spelled the same way
 * ------------------------------------------------------------------ */

function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/* A stored chance, printed. Rounding is presentation: 0.74 is the
 * number the snapshot carries and "74%" is how it is read. */
function pct(value) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  return Math.round(number * 100) + "%";
}

function pctNumber(value) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  return String(Math.round(number * 100));
}

function bandText(band) {
  if (!Array.isArray(band) || band.length < 2) return "";
  return "range " + pctNumber(band[0]) + "–" + pctNumber(band[1]);
}

function signed(points) {
  const number = numberOrNull(points);
  if (number === null) return BLANK;
  return (number > 0 ? "+" : "") + number + " pts";
}

function deltaFamily(points) {
  const number = numberOrNull(points);
  if (number === null || number === 0) return "flat";
  return number > 0 ? "up" : "dn";
}

function elapsedWords(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return minutes + ":" + (rest < 10 ? "0" : "") + rest;
}

function isOneOf(list, value) {
  return list.indexOf(value) !== -1;
}

/* The time of day out of a stored stamp. It slices the string the
 * snapshot carries; it parses nothing and computes no time. */
function clockOf(stamp) {
  const split = String(stamp).indexOf("T");
  return split === -1 ? String(stamp) : String(stamp).slice(split + 1);
}

function snapshot() {
  return ui.snapshots[ui.index] || null;
}

function sweats() {
  const now = snapshot();
  return (now && Array.isArray(now.sweats)) ? now.sweats : [];
}

/* THE CHANCE A ROW SHOWS, and the ONE place any of them is read.
 *
 * VS THE LINE (the default): `p_now` when the exporter published one,
 * and the pregame chance when it did not — which is the same number
 * before kickoff, honestly named.
 *
 * VS THE PROJECTION: `p_vs_projection`, the exporter's own read of the
 * same distribution at our projected value. There is no fallback: a
 * row without it has no such number and the page shows the dash.
 *
 * It is a READ of stored fields and never a computation: nothing here
 * averages them, moves one toward the other or fills in a missing one
 * with arithmetic. `reference` lets a caller ask for a view other than
 * the toggled one, which the Exp. hits tile does because a bet settles
 * against its line whatever the reader is looking at. */
function chanceOf(bet, reference) {
  const which = reference ? reference : ui.reference;
  if (which === REF_PROJECTION) return numberOrNull(bet.p_vs_projection);
  const now = numberOrNull(bet.p_now);
  return now === null ? numberOrNull(bet.p_pregame) : now;
}

/* ...and the band that belongs to that same number. Read, never
 * widened, never narrowed: honesty rule sec 6.1 holds in both views
 * because the exporter published a band for each. */
function bandOf(bet) {
  return ui.reference === REF_PROJECTION
    ? bet.band_vs_projection : bet.band;
}

/* Is the page reading our own number rather than the bet's? One place
 * answers it, so no renderer decides for itself. */
function vsProjection() {
  return ui.reference === REF_PROJECTION;
}

function findBet(betId) {
  const all = sweats();
  for (let i = 0; i < all.length; i += 1) {
    if (all[i].bet_id === betId) return all[i];
  }
  return null;
}

/* The game strip, repeated on every row of the same game (sec 7).
 *
 * A GAME THAT HAS NOT KICKED OFF HAS NO SCORE. The exporter says so by
 * sending null, and a null printed into a string reads "DET null"; the
 * matchup is drawn without scores instead, which is the truth of a
 * board before kickoff. */
function gameLine(game) {
  if (!game) return "";
  const away = numberOrNull(game.away_score);
  const home = numberOrNull(game.home_score);
  const score = (away === null || home === null)
    ? game.away + " @ " + game.home
    : game.away + " " + away + " · " + game.home + " " + home;
  let when = "";
  if (game.status === "pre") {
    when = "kickoff";
  } else if (game.status === "final") {
    when = "FINAL";
  } else if (game.period >= 5) {
    when = "OT " + game.clock;
  } else {
    when = "Q" + game.period + " " + game.clock;
  }
  return score + " · " + when;
}

/* THE PRICE IS THE LINE VIEW'S, AND ONLY THE LINE VIEW'S (L3f). This
 * is the one place the American price is read on this page, so the
 * rule is kept in one branch: our own projection is not a market, and a
 * price printed beside it would imply a bet being offered at that
 * threshold by somebody. */
function metaLine(bet) {
  /* THE PROJECTION VIEW IS ABOUT THE STAT, not about the bet: it names
   * the market and stops. Carrying "Receiving yards 88.5+" beside a
   * percentage that answers 74.2 would invite exactly the misreading
   * the toggle exists to avoid, and the price would invent a market
   * for our own number. */
  if (vsProjection()) {
    return [bet.player.pos, marketWords(bet.market)].join(" · ");
  }
  const parts = [bet.player.pos, bet.market_label];
  const odds = numberOrNull(bet.odds_american);
  if (odds !== null) parts.push((odds > 0 ? "+" : "") + odds);
  return parts.join(" · ");
}

/* THE THRESHOLD THE BIG NUMBER ANSWERS, as the chart titles it: the
 * bet's own line label, or our projected value in the projection
 * view. */
function thresholdLabel(bet) {
  if (!vsProjection()) return bet.line_label;
  const value = numberOrNull(bet.projection);
  return value === null ? BLANK : value + "+";
}

/* WHAT THE BET STILL ASKS FOR, in the stat's own words. A MEASURED
 * market clears a threshold and says so ("Needs 88.5+ yds"); a COUNTED
 * one needs whole things ("Needs 2 catches"). Which it is comes off
 * the row's own `need_unit`, so this page holds no market list. */
function needWords(value, unit) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  const yards = YARD_UNITS[String(unit)];
  if (yards) return "Needs " + number + "+ " + yards;
  return "Needs " + number + " " + unit;
}

/* The threshold the headline names: the BET's need in the line view,
 * OUR OWN PROJECTED VALUE in the projection view — because that is the
 * number the percentage beside it answers. */
function needValue(bet) {
  return vsProjection() ? bet.projection : bet.need;
}

function needLine(bet) {
  if (bet.state === "void") return "Voided";
  if (bet.state === "cashed") return "Cashed";
  if (bet.state === "lost") return "Did not hit";
  return needWords(needValue(bet), bet.need_unit);
}

/* Honesty rule sec 6.2, as a line of words under the number. */
function sourceLabel(bet) {
  if (bet.calibrated !== false) return "";
  return SOURCE_LABELS[bet.p_source] || String(bet.p_source);
}

/* ------------------------------------------------------------------
 * GEOMETRY — the first of this file's two kinds of arithmetic. A
 * stored `t` over the axis the snapshot declares, and a stored `p` over
 * the height. No result of it is ever printed as a number.
 * ------------------------------------------------------------------ */

function axisOf(bet) {
  return numberOrNull(bet.game && bet.game.axis_max_s) || FULL_GAME_S;
}

function scaler(axis, left, width, top, height) {
  return {
    x: function (t) { return left + (t / axis) * width; },
    y: function (p) { return top + (1 - p) * height; }
  };
}

function points(trace, at, key) {
  return trace.map(function (point) {
    return at.x(point.t).toFixed(1) + "," + at.y(point[key]).toFixed(1);
  }).join(" ");
}

/* ------------------------------------------------------------------
 * THE SPARKLINE (sec 3.1) — 110x44, four layers, no event markers, and
 * aria-hidden because the row's own text carries every number on it.
 * ------------------------------------------------------------------ */

const SPARK_W = 110;
const SPARK_H = 44;

function sparkline(bet) {
  const axis = axisOf(bet);
  /* inset by the now dot's own radius, so a bet still at kickoff draws
   * its dot at t=0 whole instead of half outside the drawing */
  const at = scaler(axis, 4, SPARK_W - 8, 4, SPARK_H - 8);
  const trace = Array.isArray(bet.trace) ? bet.trace : [];
  const layers = [];

  /* 1. the unplayed game */
  const played = numberOrNull(bet.game && bet.game.elapsed_s) || 0;
  const edge = at.x(played);
  if (edge < SPARK_W) {
    layers.push('<rect class="future" x="' + edge.toFixed(1) +
      '" y="0" width="' + (SPARK_W - edge).toFixed(1) +
      '" height="' + SPARK_H + '"></rect>');
  }

  /* 2. the dashed reference: the pregame chance against the line, and
   *    in the projection view the stored chance against our own value.
   *    Absent draws nothing rather than a line at zero. */
  const mark = vsProjection() ? chanceOf(bet) : numberOrNull(bet.p_pregame);
  if (mark !== null) {
    const pre = at.y(mark).toFixed(1);
    layers.push('<line class="preline" x1="0" y1="' + pre + '" x2="' +
      SPARK_W + '" y2="' + pre + '"></line>');
  }

  /* 3. the trace, once there is more than a kickoff point. THE TRACE
   *    IS THE BET'S HISTORY AGAINST ITS LINE and there is no stored
   *    history against the projection, so the projection view draws
   *    none rather than re-labelling this one. */
  if (trace.length > 1 && !vsProjection()) {
    layers.push('<polyline class="trace" points="' +
      points(trace, at, "p") + '"></polyline>');
  }

  /* 4. the now dot, in the state colour, at whichever stored chance is
   *    being read. A void bet has no chance to mark, so it gets no dot
   *    at all — and neither does a row with no number in this view. */
  const last = trace[trace.length - 1];
  const dot = vsProjection() ? mark : (last ? numberOrNull(last.p) : null);
  if (last && dot !== null && bet.state !== "void") {
    layers.push('<circle class="nowdot' + (ui.pulse ? " pulse" : "") +
      '" cx="' + at.x(last.t).toFixed(1) + '" cy="' +
      at.y(dot).toFixed(1) + '" r="3.5"></circle>');
  }

  return '<svg class="spark" width="' + SPARK_W + '" height="' +
    SPARK_H + '" viewBox="0 0 ' + SPARK_W + " " + SPARK_H +
    '" aria-hidden="true" focusable="false">' + layers.join("") +
    "</svg>";
}

/* ------------------------------------------------------------------
 * THE CARD CHART (sec 3.2) — 330x200, seven layers, quarter gridlines,
 * and one transparent 44x44 button per event dot.
 * ------------------------------------------------------------------ */

const CHART_W = 330;
const CHART_H = 200;
const CHART_L = 8;
const CHART_T = 14;
const CHART_BOTTOM = 172;
const PLOT_W = CHART_W - CHART_L * 2;
const PLOT_H = CHART_BOTTOM - CHART_T;

const QUARTERS = [
  [900, 450, "Q1"], [1800, 1350, "Q2"],
  [2700, 2250, "Q3"], [3600, 3150, "Q4"]
];
const OT_CENTRE = 3900;
const OT_LABEL = "OT";

const DOT_CLASSES = {
  catch: "d-hit",
  carry: "d-hit",
  target: "d-miss",
  drop: "d-miss",
  red_zone: "d-zone",
  drive_start: "d-note",
  injury_note: "d-note"
};

const DOT_RADIUS = { "d-hit": 4.5, "d-miss": 4.5, "d-zone": 5.5, "d-note": 4.5 };

function chartAria(bet) {
  const who = bet.player.name + ", " +
    (vsProjection()
      ? marketWords(bet.market) + " " + thresholdLabel(bet)
      : bet.market_label);
  if (bet.state === "void") {
    return who + ": voided, no chance is shown.";
  }
  const parts = [who + ": " + pct(chanceOf(bet)) + " chance"];
  const band = bandOf(bet);
  if (Array.isArray(band)) {
    parts.push("range " + pctNumber(band[0]) + " to " +
      pctNumber(band[1]));
  }
  parts.push(STATE_LABELS[bet.state] || bet.state);
  parts.push(gameLine(bet.game));
  return parts.join(", ") + ".";
}

function selectedIndex(bet) {
  const events = Array.isArray(bet.events) ? bet.events : [];
  if (!events.length) return -1;
  if (ui.pinned === null) return events.length - 1;
  return Math.min(Math.max(0, ui.pinned), events.length - 1);
}

function traceAt(bet, t) {
  const trace = Array.isArray(bet.trace) ? bet.trace : [];
  for (let i = 0; i < trace.length; i += 1) {
    if (trace[i].t === t) return trace[i];
  }
  return trace[trace.length - 1] || null;
}

function cardChart(bet) {
  const axis = axisOf(bet);
  const at = scaler(axis, CHART_L, PLOT_W, CHART_T, PLOT_H);
  const trace = Array.isArray(bet.trace) ? bet.trace : [];
  const events = Array.isArray(bet.events) ? bet.events : [];
  const chosen = selectedIndex(bet);
  const layers = [];

  /* 1. the unplayed game — over the overtime span too, but only once
   *    the snapshot says overtime has actually started (sec 7). */
  const played = numberOrNull(bet.game && bet.game.elapsed_s) || 0;
  const edge = at.x(played);
  if (edge < CHART_L + PLOT_W) {
    layers.push('<rect class="future" x="' + edge.toFixed(1) +
      '" y="' + CHART_T + '" width="' +
      (CHART_L + PLOT_W - edge).toFixed(1) + '" height="' + PLOT_H +
      '"></rect>');
  }

  /* 2. quarter gridlines and the axis */
  QUARTERS.forEach(function (quarter) {
    if (quarter[0] > axis) return;
    const line = at.x(quarter[0]).toFixed(1);
    layers.push('<line class="grid" x1="' + line + '" y1="' + CHART_T +
      '" x2="' + line + '" y2="' + CHART_BOTTOM + '"></line>');
  });
  layers.push('<line class="axis" x1="' + CHART_L + '" y1="' +
    CHART_BOTTOM + '" x2="' + (CHART_L + PLOT_W) + '" y2="' +
    CHART_BOTTOM + '"></line>');

  /* 3. the dashed reference line, labelled with what it IS: the
   *    pregame chance against the line, or the stored chance against
   *    our own projected value when that is what is being read. */
  const marked = vsProjection() ? chanceOf(bet) : numberOrNull(bet.p_pregame);
  if (marked !== null) {
    const word = vsProjection() ? PROJECTION_MARK : PREGAME_MARK;
    const line = at.y(marked).toFixed(1);
    layers.push('<line class="preline" x1="' + CHART_L + '" y1="' + line +
      '" x2="' + (CHART_L + PLOT_W) + '" y2="' + line + '"></line>');
    const label = Math.min(CHART_BOTTOM - 4,
      Math.max(CHART_T + 9, at.y(marked) - 5));
    layers.push('<text class="prelabel" x="' + (CHART_L + PLOT_W) +
      '" y="' + label.toFixed(1) + '" text-anchor="end">' +
      esc(word + pct(marked)) + "</text>");
  }

  /* THE HISTORY LAYERS BELONG TO THE LINE. The trace, its band, the
   * guide and the swing dots are all the stored history of the bet
   * against its line; the file carries no such history against the
   * projection, so the projection view draws the reference line above
   * and nothing that would have to be invented. */
  const swings = vsProjection() ? [] : events;

  /* 4. THE BAND. Honesty rule sec 6.1: while a bet is live this is
   *    always drawn, so a bare point estimate is never what the reader
   *    sees. On a settled bet the stored band has collapsed and the
   *    path draws as the flat line it now is. */
  if (trace.length > 1 && !vsProjection()) {
    const up = trace.map(function (point) {
      return at.x(point.t).toFixed(1) + "," + at.y(point.hi).toFixed(1);
    });
    const down = trace.slice().reverse().map(function (point) {
      return at.x(point.t).toFixed(1) + "," + at.y(point.lo).toFixed(1);
    });
    layers.push('<path class="band" d="M' + up.join(" L ") + " L " +
      down.join(" L ") + ' Z"></path>');
  }

  /* 5. the trace */
  if (trace.length > 1 && !vsProjection()) {
    layers.push('<polyline class="trace big" points="' +
      points(trace, at, "p") + '"></polyline>');
  }

  /* 6. the selected swing's guide, dropped to the axis */
  if (chosen >= 0 && !vsProjection()) {
    const here = traceAt(bet, events[chosen].t);
    if (here) {
      const line = at.x(events[chosen].t).toFixed(1);
      layers.push('<line class="guide" x1="' + line + '" y1="' +
        at.y(here.p).toFixed(1) + '" x2="' + line + '" y2="' +
        CHART_BOTTOM + '"></line>');
    }
  }

  /* 7. the event dots */
  const hits = [];
  swings.forEach(function (event, index) {
    const here = traceAt(bet, event.t);
    if (!here) return;
    const family = DOT_CLASSES[event.type] || "d-note";
    const cx = at.x(event.t);
    const cy = at.y(here.p);
    if (index === chosen) {
      layers.push('<circle class="ring" cx="' + cx.toFixed(1) + '" cy="' +
        cy.toFixed(1) + '" r="7"></circle>');
    }
    layers.push('<circle class="dot ' + family + '" cx="' + cx.toFixed(1) +
      '" cy="' + cy.toFixed(1) + '" r="' + DOT_RADIUS[family] +
      '"></circle>');
    /* the 44x44 tap target, placed as a SHARE of the drawing so it
     * keeps its dot when the chart is scaled down on a 360px phone,
     * and clamped so a dot at the very edge of the axis cannot hang
     * its button outside the chart it belongs to */
    hits.push('<button type="button" class="swinghit" data-swing="' + index +
      '" style="left:clamp(0px,calc(' +
      ((cx / CHART_W) * 100).toFixed(2) +
      '% - 22px),calc(100% - 44px));top:clamp(0px,calc(' +
      ((cy / CHART_H) * 100).toFixed(2) +
      '% - 22px),calc(100% - 44px))" aria-label="' +
      esc(event.clock + ", " + event.title) + '"' +
      (index === chosen ? ' aria-current="true"' : "") + "></button>");
  });

  /* the quarter labels, under the axis */
  const marks = QUARTERS.filter(function (quarter) {
    return quarter[0] <= axis;
  }).map(function (quarter) {
    return '<text class="qlabel" x="' + at.x(quarter[1]).toFixed(1) +
      '" y="' + (CHART_BOTTOM + 15) + '" text-anchor="middle">' +
      esc(quarter[2]) + "</text>";
  });
  if (axis > FULL_GAME_S) {
    marks.push('<text class="qlabel" x="' + at.x(OT_CENTRE).toFixed(1) +
      '" y="' + (CHART_BOTTOM + 15) + '" text-anchor="middle">' +
      esc(OT_LABEL) + "</text>");
  }

  return '<div class="chartwrap"><svg class="chart" viewBox="0 0 ' +
    CHART_W + " " + CHART_H + '" role="img" aria-label="' +
    esc(chartAria(bet)) + '">' + layers.join("") + marks.join("") +
    "</svg>" + hits.join("") + "</div>";
}

/* ------------------------------------------------------------------
 * THE BOARD (sec 3.1)
 * ------------------------------------------------------------------ */

function boardRow(bet) {
  const chance = bet.state === "void" ? BLANK : pct(chanceOf(bet));
  return '<a class="sw row" data-state="' + esc(bet.state) +
    '" data-bet="' + esc(bet.bet_id) + '" href="#/sweat/' +
    encodeURIComponent(bet.bet_id) + '">' +
    '<span class="rtop"><span class="rname">' + esc(bet.player.name) +
    '</span><span class="chip">' +
    esc(STATE_LABELS[bet.state] || bet.state) + "</span></span>" +
    '<span class="rmeta">' + esc(metaLine(bet)) + "</span>" +
    '<span class="rgame">' + esc(gameLine(bet.game)) + "</span>" +
    '<span class="rneed">' + esc(needLine(bet)) + "</span>" +
    '<span class="rspark">' + sparkline(bet) + "</span>" +
    '<span class="rpct">' + esc(chance) + "</span></a>";
}

function section(title, note, rows) {
  if (!rows.length) return "";
  return '<section class="sect"><div class="secthead"><span>' +
    esc(title) + "</span>" +
    (note ? '<span class="sectnote">' + esc(note) + "</span>" : "") +
    "</div>" + rows.map(boardRow).join("") + "</section>";
}

/* The board's ORDER, off the stored state and the stored chance: the
 * live bets closest to cashing first, then what has not kicked off, by
 * kickoff, then everything settled. Ordering moves nothing and infers
 * nothing — the state each row shows is the one the snapshot stored. */
/* THE CHIP FILTER, applied to the BOARD and to nothing else: a card
 * reached by its own link is still findable while a chip is on, and
 * the summary tiles stay the file's own counts. */
function shown() {
  const all = sweats();
  if (!ui.market) return all;
  return all.filter(function (bet) {
    return String(bet.market) === ui.market;
  });
}

function ordered() {
  const all = shown();
  const live = all.filter(function (bet) {
    return isOneOf(LIVE_STATES, bet.state);
  }).sort(function (a, b) {
    return (chanceOf(b) || 0) - (chanceOf(a) || 0);
  });
  const pregame = all.filter(function (bet) {
    return bet.state === "pregame";
  }).sort(function (a, b) {
    const kick = String(a.game.kickoff).localeCompare(String(b.game.kickoff));
    if (kick) return kick;
    /* the tiebreak follows whichever chance is being read, so the
     * ordering is about the numbers on screen and not about a number
     * the reader cannot see */
    return (chanceOf(b) || 0) - (chanceOf(a) || 0);
  });
  const settled = all.filter(function (bet) {
    return isOneOf(SETTLED_STATES, bet.state);
  }).sort(function (a, b) {
    return SETTLED_STATES.indexOf(a.state) - SETTLED_STATES.indexOf(b.state);
  });
  return { live: live, pregame: pregame, settled: settled };
}

/* FRAME 1's THIRD TILE. The exporter's number when it published one;
 * otherwise the board's own total, which is the brief's own rule:
 * every bet already cashed counts one, and every bet still running or
 * not yet kicked off counts its chance. It is summed AGAINST THE LINE
 * whatever the reference toggle shows, because a bet settles against
 * its line and against nothing else — the tile's title says so. */
function expHits() {
  const now = snapshot();
  const tiles = (now && now.summary) || {};
  const stored = numberOrNull(tiles.exp_hits);
  if (stored !== null) return stored.toFixed(1);
  const all = sweats();
  if (!all.length) return BLANK;
  let total = 0;
  all.forEach(function (bet) {
    if (bet.state === "cashed") {
      total += 1;
      return;
    }
    if (bet.state === "pregame" || isOneOf(LIVE_STATES, bet.state)) {
      total += numberOrNull(chanceOf(bet, REF_LINE)) || 0;
    }
  });
  return total.toFixed(1);
}

function summaryTiles() {
  const now = snapshot();
  const tiles = (now && now.summary) || {};
  const counts = [["Live", tiles.live], ["Cashed", tiles.cashed]];
  const cells = counts.map(function (cell) {
    const value = numberOrNull(cell[1]);
    return [cell[0], value === null ? BLANK : String(value), ""];
  });
  cells.push(["Exp. hits", expHits(), EXP_HITS_TITLE]);
  return '<div class="tiles">' + cells.map(function (cell) {
    return '<div class="tile"' +
      (cell[2] ? ' title="' + esc(cell[2]) + '"' : "") +
      '><span class="tlab">' + esc(cell[0]) +
      '</span><span class="tval">' + esc(cell[1]) + "</span></div>";
  }).join("") + "</div>";
}

/* ------------------------------------------------------------------
 * L3f — THE TWO CONTROLS. A segmented toggle and a chip row, both of
 * them real buttons with `aria-pressed`, both 44px in the stylesheet,
 * and neither of them holding a number or a market list of its own.
 * ------------------------------------------------------------------ */

function referenceToggle() {
  const options = [[REF_LINE, REF_LINE_LABEL],
                   [REF_PROJECTION, REF_PROJECTION_LABEL]];
  return '<div class="seg" role="group" aria-label="' + esc(REF_LEGEND) +
    '">' + options.map(function (option) {
      const on = ui.reference === option[0];
      return '<button type="button" class="segbtn' + (on ? " on" : "") +
        '" data-reference="' + esc(option[0]) + '" aria-pressed="' +
        (on ? "true" : "false") + '">' + esc(option[1]) + "</button>";
    }).join("") + "</div>";
}

/* THE CHIPS COME OUT OF THE FILE. One per market actually present in
 * the snapshot, in the words the exporter wrote, so a market that
 * starts appearing in the rows appears here the same day and this page
 * never carries a list that can go stale. */
function marketsPresent() {
  const seen = [];
  sweats().forEach(function (bet) {
    const market = String(bet.market === undefined ? "" : bet.market);
    if (market && seen.indexOf(market) === -1) seen.push(market);
  });
  return seen.sort();
}

function marketWords(market) {
  const text = String(market);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function statChips() {
  const chips = [["", ALL_MARKETS_LABEL]].concat(
    marketsPresent().map(function (market) {
      return [market, marketWords(market)];
    }));
  /* A row of "All" plus one market filters nothing, so it is not
   * drawn: a control that cannot change what is on screen is chrome. */
  if (chips.length < 3) return "";
  return '<div class="chips" role="group" aria-label="' +
    esc(MARKET_LEGEND) + '">' + chips.map(function (chip) {
      const on = ui.market === chip[0];
      return '<button type="button" class="statchip' + (on ? " on" : "") +
        '" data-market="' + esc(chip[0]) + '" aria-pressed="' +
        (on ? "true" : "false") + '">' + esc(chip[1]) + "</button>";
    }).join("") + "</div>";
}

/* The one line that says what the projection view means. It is shown
 * once, above the board, and only while that view is on. */
function referenceNote() {
  if (!vsProjection()) return "";
  return '<div class="refnote">' + esc(VS_PROJECTION_NOTE) + "</div>";
}

function controls() {
  return '<div class="controls">' + referenceToggle() + statChips() +
    "</div>" + referenceNote();
}

/* The sentence the exporter wrote on a file with nothing on it. A
 * document with no sweats always carries one, and the page shows it
 * rather than leaving a reader with a blank board and no explanation.
 * It is READ, never composed here. */
function emptyReason() {
  const now = snapshot();
  const run = (now && now.run) || {};
  return typeof run.reason === "string" ? run.reason : "";
}

function renderBoard() {
  const groups = ordered();
  const body = section(LIVE_HEAD, DASHED_NOTE, groups.live) +
    section(PREGAME_HEAD, "", groups.pregame) +
    section(SETTLED_HEAD, "", groups.settled);
  const reason = emptyReason();
  const empty = body ? "" :
    '<div class="empty"><b>' + esc(EMPTY_BOARD) + "</b>" +
    (reason ? esc(reason) : "") + "</div>";
  return '<div class="titlerow"><h1>' + esc(BOARD_TITLE) +
    '</h1><span class="samplechip">' + esc(chipText()) + "</span></div>" +
    summaryTiles() + controls() + body + empty;
}

/* ------------------------------------------------------------------
 * THE CARD (sec 3.2)
 * ------------------------------------------------------------------ */

function headline(bet) {
  if (bet.state === "void") {
    return '<span class="hbig">Void</span>';
  }
  if (bet.state === "cashed") {
    return '<span class="hbig">Cashed</span>';
  }
  if (bet.state === "lost") {
    return '<span class="hbig">Did not hit</span>';
  }
  const need = numberOrNull(needValue(bet));
  if (need === null) return '<span class="hbig">' + esc(BLANK) + "</span>";
  const yards = YARD_UNITS[String(bet.need_unit)];
  return '<span class="hbig">Needs ' + esc(yards ? need + "+" : need) +
    '</span><span class="hunit">' +
    esc(yards ? yards : bet.need_unit) + "</span>";
}

function bigChance(bet) {
  if (bet.state === "void") {
    return '<div class="bigpct">' + esc(BLANK) +
      '</div><div class="bsub">no chance is shown on a voided bet</div>';
  }
  const chance = chanceOf(bet);
  const parts = ['<div class="bigpct">' + esc(pct(chance)) + "</div>"];
  if (chance === null && vsProjection()) {
    /* the dash is the number; this says why there is no number */
    parts.push('<div class="bsub">' + esc(NO_PROJECTION) + "</div>");
  } else if (bet.settled_at_s !== null && bet.settled_at_s !== undefined) {
    parts.push('<div class="bsub">settled</div>');
  } else {
    const band = bandText(bandOf(bet));
    if (band) parts.push('<div class="bsub">' + esc(band) + "</div>");
  }
  const source = sourceLabel(bet);
  if (source) {
    parts.push('<div class="bsrc">' + esc(source) + "</div>");
  }
  return parts.join("");
}

function explanation(bet) {
  const events = Array.isArray(bet.events) ? bet.events : [];
  const chosen = selectedIndex(bet);
  if (chosen < 0) {
    return '<div class="panel"><div class="ptitle">' + esc(NO_SWINGS) +
      "</div></div>";
  }
  const event = events[chosen];
  const why = (Array.isArray(event.why) ? event.why : []).map(
    function (line) { return "<li>" + esc(line) + "</li>"; }).join("");
  const behind = ui.pinned !== null && chosen < events.length - 1;
  return '<div class="panel">' +
    '<div class="prow"><span class="pclock">' + esc(event.clock) +
    '</span><span class="pdelta ' + deltaFamily(event.delta_pts) + '">' +
    esc(signed(event.delta_pts)) + "</span></div>" +
    '<div class="ptitle">' + esc(event.title) + "</div>" +
    (why ? '<ul class="pwhy">' + why + "</ul>" : "") +
    '<div class="pnav">' +
    '<button type="button" class="step" data-step="-1" aria-label="Previous swing"' +
    (chosen <= 0 ? " disabled" : "") + ">‹</button>" +
    '<button type="button" class="step" data-step="1" aria-label="Next swing"' +
    (chosen >= events.length - 1 ? " disabled" : "") + ">›</button>" +
    '<span class="pcount">' + esc("Swing " + (chosen + 1) + " of " +
      events.length + SWING_TAIL) + "</span>" +
    (behind ? '<button type="button" class="newswing" data-latest="1">' +
      esc(NEW_SWING) + "</button>" : "") +
    "</div></div>";
}

function ladderStrip(bet) {
  const rungs = Array.isArray(bet.ladder) ? bet.ladder : [];
  if (!rungs.length) return "";
  const cells = rungs.map(function (rung) {
    const isBet = rung.line === bet.line;
    const value = rung.cleared ? "Hit" : pct(rung.p);
    return '<div class="lcell' + (rung.cleared ? " hit" : "") +
      (isBet ? " bet" : "") + '"><span class="lline">' +
      esc(rung.line) + '</span><span class="lval">' + esc(value) +
      "</span></div>";
  }).join("");
  return '<section class="ladder"><div class="lhead"><span>Ladder</span>' +
    '<span class="lnote">' + esc(bet.ladder_note || "") + "</span></div>" +
    '<div class="lcells" style="grid-template-columns:repeat(' +
    rungs.length + ',1fr)">' + cells + "</div></section>";
}

function renderCard(bet) {
  const delta = numberOrNull(bet.delta_pregame_pts);
  const running = isOneOf(LIVE_STATES, bet.state) || bet.state === "pregame";
  const head = '<div class="chead"><span class="ctitle">' +
    esc((running ? CHART_TITLE_LIVE : CHART_TITLE_DONE) +
      thresholdLabel(bet)) + "</span>" +
    (delta === null ? "" : '<span class="cdelta ' + deltaFamily(delta) +
      '">' + esc(signed(delta)) + "</span>") + "</div>";
  return '<div class="topbar"><a class="back" href="#/board" aria-label="' +
    esc(BACK_LABEL) + '">‹</a><span class="ttl">' + esc(CARD_TITLE) +
    '</span><span class="samplechip">' + esc(chipText()) + "</span></div>" +
    '<article class="sw card" data-state="' + esc(bet.state) + '">' +
    '<section class="hdr"><div class="hleft">' +
    '<div class="hname"><span class="hwho">' + esc(bet.player.name) +
    '</span><span class="chip">' +
    esc(STATE_LABELS[bet.state] || bet.state) + "</span></div>" +
    '<div class="hmeta">' + esc(metaLine(bet)) + " · " +
    esc(gameLine(bet.game)) + "</div>" +
    (bet.game && bet.game.situation
      ? '<div class="hsit">' + esc(bet.game.situation) + "</div>" : "") +
    '<div class="hhead">' + headline(bet) + "</div></div>" +
    '<div class="hright">' + bigChance(bet) + "</div></section>" +
    '<section class="chartcard">' + head + cardChart(bet) +
    explanation(bet) + "</section>" +
    ladderStrip(bet) + "</article>";
}

/* ------------------------------------------------------------------
 * THE REPLAY CONTROL — sandbox chrome, plainly labelled as such
 * ------------------------------------------------------------------ */

function renderReplay() {
  const total = ui.snapshots.length;
  const now = snapshot();
  /* A SINGLE DOCUMENT HAS NOTHING TO WALK. The real file is one poll,
   * so the bar is not drawn at all rather than drawn with one dead
   * position in it. */
  if (!total || !ui.replayable) {
    document.getElementById("replay").innerHTML = "";
    return;
  }
  /* the position, and the recording's own clock. The stamp is shown as
   * its time of day — the whole ISO string is sandbox chrome that would
   * only crowd the bar, so it rides the control's title instead. */
  const full = (now && now.generated_at) ? String(now.generated_at) : "";
  const at = "Snapshot " + (ui.index + 1) + " of " + total +
    (full ? " · " + clockOf(full) : "");
  document.getElementById("replay").innerHTML =
    '<div class="rlab">' + esc(REPLAY_LABEL) + "</div>" +
    '<div class="rctl">' +
    '<button type="button" class="rbtn" data-move="-1" aria-label="Step back one snapshot"' +
    (ui.index <= 0 ? " disabled" : "") + ">‹</button>" +
    '<button type="button" class="rbtn play" data-play="1" aria-pressed="' +
    (ui.playing ? "true" : "false") + '">' +
    (ui.playing ? "Pause" : "Play") + "</button>" +
    '<button type="button" class="rbtn" data-move="1" aria-label="Step on one snapshot"' +
    (ui.index >= total - 1 ? " disabled" : "") + ">›</button>" +
    '<span class="rat" title="' + esc(full) + '">' + esc(at) +
    "</span></div>" +
    '<div class="rnote">' + esc(REPLAY_NOTE) + "</div>";
}

/* Frame 9. Staleness is measured against WALL TIME since the replay
 * last advanced, against twice the recording's own poll interval — a
 * stopped replay IS the stale case. Nothing is carried forward to
 * cover the gap; the trace and the now dot stay exactly where the last
 * snapshot left them. */
function renderStale() {
  const node = document.getElementById("stale");
  const now = snapshot();
  const interval = numberOrNull(now && now.poll_interval_s);
  /* The paused banner is about a FROZEN NEEDLE, and staleness here is
   * measured against the replay's own position. A single document has
   * no replay and a pregame board has no needle, so there is nothing
   * to declare frozen and the banner stays down. */
  if (!ui.replayable || !now || interval === null) {
    node.hidden = true;
    return;
  }
  const since = (Date.now() - ui.advancedAt) / 1000;
  if (since <= interval * 2) {
    node.hidden = true;
    node.textContent = "";
    BODY.dataset.frozen = "no";
    return;
  }
  node.hidden = false;
  BODY.dataset.frozen = "yes";
  node.innerHTML = "<b>" + esc(STALE_HEAD + elapsedWords(since) +
    STALE_TAIL) + '</b><span class="sub">' + esc(STALE_NOTE) + "</span>";
}

/* ------------------------------------------------------------------
 * render and route
 * ------------------------------------------------------------------ */

/* The top sentinel is the mode's own: the SAMPLE one in demo, the
 * ALPHA one on the real file. One slot, one string, never both — the
 * reader is never left guessing which kind of numbers are below it. */
function topSentinel() {
  return DEMO ? SAMPLE_SWEATS : ALPHA_SWEATS;
}

/* ... and the title-row chip says the same thing in two words. */
function chipText() {
  return DEMO ? SAMPLE_CHIP : ALPHA_CHIP;
}

function renderBanners() {
  document.getElementById("topbanner").textContent = topSentinel();
  document.getElementById("labbanner").textContent = SWEAT_IN_PROGRESS;
  BODY.dataset.mode = DEMO ? "demo" : "real";
}

function boardTops() {
  const map = {};
  document.querySelectorAll("[data-bet]").forEach(function (node) {
    map[node.dataset.bet] = node.getBoundingClientRect().top;
  });
  return map;
}

/* The board's one motion (sec 4): a row that changed place slides to
 * it, about 250ms. Under prefers-reduced-motion it simply arrives. */
function slideRows(before) {
  if (REDUCED || !before) return;
  document.querySelectorAll("[data-bet]").forEach(function (node) {
    const was = before[node.dataset.bet];
    if (was === undefined) return;
    const shift = was - node.getBoundingClientRect().top;
    if (!shift) return;
    node.style.transition = "none";
    node.style.transform = "translateY(" + shift.toFixed(1) + "px)";
    window.requestAnimationFrame(function () {
      node.style.transition = "transform " + SLIDE_MS + "ms ease";
      node.style.transform = "";
    });
  });
}

function render(before) {
  renderBanners();
  renderReplay();
  renderStale();
  const screen = document.getElementById("screen");
  if (ui.error) {
    screen.innerHTML = '<div class="empty"><b>Nothing to show</b>' +
      esc(ui.error) + "</div>";
    return;
  }
  if (ui.bet) {
    const bet = findBet(ui.bet);
    if (bet) {
      screen.innerHTML = renderCard(bet);
      return;
    }
    /* a bet that is not in this snapshot is not invented back */
    ui.bet = null;
  }
  screen.innerHTML = renderBoard();
  slideRows(before);
}

function readRoute() {
  const hash = String(window.location.hash || "");
  const match = hash.match(/^#\/sweat\/(.+)$/);
  const wanted = match ? decodeURIComponent(match[1]) : null;
  if (wanted !== ui.bet) {
    if (wanted && !ui.bet) ui.boardScroll = window.scrollY;
    ui.bet = wanted;
    ui.pinned = null;
  }
}

function route() {
  const goingBack = ui.bet !== null;
  readRoute();
  render(null);
  if (ui.bet) {
    window.scrollTo(0, 0);
  } else if (goingBack) {
    window.scrollTo(0, ui.boardScroll);
  }
}

/* ------------------------------------------------------------------
 * the replay itself
 * ------------------------------------------------------------------ */

/* How many swings the whole snapshot carries. Frame 5's pulse belongs
 * to a swing ARRIVING, so a poll that reported nothing new does not
 * get one — the page has no ambient motion. */
function swingCount(index) {
  const snap = ui.snapshots[index];
  if (!snap || !Array.isArray(snap.sweats)) return 0;
  let total = 0;
  snap.sweats.forEach(function (bet) {
    total += (Array.isArray(bet.events) ? bet.events.length : 0);
  });
  return total;
}

function advance(step) {
  const next = ui.index + step;
  if (next < 0 || next >= ui.snapshots.length) {
    stop();
    return;
  }
  const before = ui.bet ? null : boardTops();
  /* the "now" dot pulses ONCE, about 600ms, and then stops (sec 4) */
  ui.pulse = !REDUCED && swingCount(next) !== swingCount(ui.index);
  ui.index = next;
  ui.advancedAt = Date.now();
  if (ui.pinned !== null) {
    const bet = ui.bet ? findBet(ui.bet) : null;
    const events = (bet && Array.isArray(bet.events)) ? bet.events : [];
    if (ui.pinned >= events.length) ui.pinned = null;
  }
  render(before);
  if (ui.pulse) {
    window.setTimeout(function () {
      ui.pulse = false;
      document.querySelectorAll(".nowdot.pulse").forEach(function (node) {
        node.classList.remove("pulse");
      });
    }, PULSE_MS);
  }
}

function stop() {
  ui.playing = false;
  if (ui.timer) {
    window.clearInterval(ui.timer);
    ui.timer = null;
  }
  renderReplay();
}

function play() {
  if (ui.index >= ui.snapshots.length - 1) ui.index = 0;
  ui.playing = true;
  ui.advancedAt = Date.now();
  if (ui.timer) window.clearInterval(ui.timer);
  ui.timer = window.setInterval(function () { advance(1); }, REPLAY_MS);
  render(null);
}

/* ------------------------------------------------------------------
 * the controls
 * ------------------------------------------------------------------ */

document.addEventListener("click", function (event) {
  const target = event.target;
  if (!target || !target.closest) return;

  const move = target.closest("[data-move]");
  if (move) {
    stop();
    advance(Number(move.dataset.move));
    return;
  }
  if (target.closest("[data-play]")) {
    if (ui.playing) {
      stop();
    } else {
      play();
    }
    return;
  }
  /* L3f. Both controls do one thing: they set a presentation field and
   * re-render. Nothing is stored, nothing is fetched and no number is
   * worked out on the way. */
  const reference = target.closest("[data-reference]");
  if (reference) {
    ui.reference = reference.dataset.reference;
    render(null);
    return;
  }
  const chip = target.closest("[data-market]");
  if (chip) {
    ui.market = chip.dataset.market;
    render(null);
    return;
  }
  const swing = target.closest("[data-swing]");
  if (swing) {
    pick(Number(swing.dataset.swing));
    return;
  }
  const step = target.closest("[data-step]");
  if (step) {
    const bet = ui.bet ? findBet(ui.bet) : null;
    if (bet) pick(selectedIndex(bet) + Number(step.dataset.step));
    return;
  }
  if (target.closest("[data-latest]")) {
    ui.pinned = null;
    render(null);
  }
});

/* Frame 5's rule, in one place: choosing the newest swing leaves the
 * selection on automatic, so it keeps following the feed; choosing an
 * older one pins it, and the "New swing" pill is how the reader comes
 * back to the front. */
function pick(index) {
  const bet = ui.bet ? findBet(ui.bet) : null;
  if (!bet) return;
  const events = Array.isArray(bet.events) ? bet.events : [];
  if (!events.length) return;
  const held = Math.min(Math.max(0, index), events.length - 1);
  ui.pinned = (held === events.length - 1) ? null : held;
  render(null);
}

window.addEventListener("hashchange", route);

/* ------------------------------------------------------------------
 * boot — one fetch of one bundled file, and no second path
 * ------------------------------------------------------------------ */

async function getJSON(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(function () { controller.abort(); },
    FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal, cache: "no-store"
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function boot() {
  renderBanners();
  try {
    const loaded = await getJSON(SWEATS_URL);
    /* THE DISCRIMINATOR, and it stays dumb: an ARRAY is a recording of
     * polls and an OBJECT is one poll. Both render through the same
     * code; only the replay chrome depends on which arrived.
     *
     * An empty recording — and a document with no sweats in it — is
     * not a broken one: it renders the empty board's own words, plus
     * whatever reason the exporter wrote, and invents nothing to fill
     * the screen. */
    ui.replayable = Array.isArray(loaded);
    if (ui.replayable) {
      ui.snapshots = loaded;
    } else {
      ui.snapshots = (loaded && typeof loaded === "object") ? [loaded] : [];
    }
  } catch (err) {
    ui.error = NO_FILE + " (" + err.message + ")";
  }
  ui.advancedAt = Date.now();
  readRoute();
  render(null);
  /* the paused-feed banner has to be able to appear while nothing else
   * is happening, so one second-hand ticks for it and for nothing else */
  ui.ticker = window.setInterval(renderStale, 1000);
}

boot();

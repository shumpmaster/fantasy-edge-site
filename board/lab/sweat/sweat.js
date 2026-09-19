/* LAB ITERATION L3 — THE LIVE SANDBOX.
 *
 * The two screens of docs/design/SWEAT_UI_BRIEF.md — the LIVE BOARD
 * and the chart-first card — built as one page, in the lab's idiom:
 * vanilla, no framework, no build step, no module, one fetch.
 *
 * D-123 ITEM (4) — THE RENAME. What the reader sees says "Live"; the
 * plumbing keeps every spelling it had — this file's name and path,
 * `sweats.json`, `bet_id`, the `#/sweat/...` route — because renaming
 * files would churn the exporters, the deploy and every link for no
 * reader's benefit. Wording, not plumbing.
 *
 * R0b — THE CAPTURE BOX (READS_LAB_SPEC §6). The card gained the one
 * control on this page that WRITES: "Add your read" posts the reader's
 * own words to the reads service and shows them back with their time.
 * No category, no chip, no impact number — the hierarchy is internal
 * (brief Addendum 2) and R0 moves no probability at all.
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
 *   of markets that can go stale.
 *
 * Both are PRESENTATION STATE, held in `ui` beside the replay position
 * and never written anywhere.
 *
 * L3g — THE STATLINE PIVOT, AND WHY THE PILLS STOPPED FILTERING.
 *
 *   A ROW IS A PLAYER. The exporter groups his lined markets onto one
 *   entry, so a row carries his WHOLE projected statline — every stat
 *   with a captured line, its projected value and the market's own
 *   short word — and the page never joins rows back together by name.
 *
 *   THE PILLS FOCUS, THEY DO NOT FILTER. Choosing a stat emphasises
 *   that number in every statline and makes it the row's LEAD: the big
 *   %, the needs headline, the sparkline and the state colour all
 *   follow it, in whichever reference the toggle selects. A player
 *   with no captured line for the focused stat KEEPS HIS ROW with his
 *   statline intact and the focused slot dashed, because his statline
 *   is still true; what is missing is a bet, and a bet is never
 *   invented to fill the slot. It is the same `ui.focus` the
 *   retrospective has always used, through the same helpers.
 *
 *   WITH NO PILL CHOSEN each row leads with its own CLOSEST TO
 *   CASHING stat — the largest chance the file already stored for him
 *   under the current reference. That is a display ordering over
 *   stored numbers and not a third kind of arithmetic: nothing is
 *   added, averaged or scaled to arrive at it.
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

/* L3e — THE THIRD PATH, and it never mixes with either of those two.
 * `#/retro` reads its OWN document, written by
 * `fantasy_edge.live.sweat_retro`: 2026 week 1 replayed from the
 * play-by-play the capture job banked, against the lines the live
 * capture stored. It is fetched only when that route is opened, it is
 * held in its own field, and neither the live board nor the fixture
 * ever reads a row of it. `?demo=1` does not change it: the fixture is
 * a design harness and this file is the real, finished week. */
const RETRO_URL = "../../data/sweats_retro_2026w01.json";

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

/* THE SAMPLE SENTINEL. It rides the top of the page always, on
 * every screen, and it is the one string on this page that may never
 * be softened: every bet, every price and every number below it was
 * made up for design work. */
const SAMPLE_SWEATS =
  "SAMPLE LIVE BOARD — fabricated bets and numbers for design work; nothing here is a pick, a price, or a recommendation";

/* THE ALPHA SENTINEL — real mode's own, and the sample one's opposite
 * number. It names exactly what the numbers are: lines and prices as
 * the books posted them, probabilities the engine read off its own
 * distributions, an uncalibrated model, and a presentation nobody has
 * signed off as finished. It rides the same slot, always visible, and
 * it may never be softened either. */
const ALPHA_SWEATS =
  "ALPHA LIVE BOARD — real lines and engine probabilities; model, not yet calibrated; experimental presentation (D-122)";

const SAMPLE_CHIP = "Sample data";
const ALPHA_CHIP = "Alpha";

/* D-123 item (4) — THE RENAME. The surface the reader sees is LIVE.
 * The wording retires "sweat"; the plumbing does not move, because a
 * file rename would churn the exporters, the deploy and every link
 * for no reader's benefit. Identifiers, file names, JSON names,
 * bet_id spellings and the `#/sweat/...` route fragment are therefore
 * unchanged on purpose — the ledger records that scoping. */
const BOARD_TITLE = "LIVE";
const CARD_TITLE = "LIVE";
const BACK_LABEL = "Back to the live board";

const LIVE_HEAD = "LIVE · CLOSEST TO CASHING";
const PREGAME_HEAD = "PREGAME · BY KICKOFF";
const SETTLED_HEAD = "SETTLED";
const DASHED_NOTE = "Dashed = pregame";

/* The brief's sec 7 empty board, in the renamed surface's words. */
const EMPTY_BOARD =
  "Nothing live right now. Bets you track show up here at kickoff.";

const NO_FILE =
  "The live board file could not be read, so there is nothing to show. This page renders the one document it was pointed at and never invents a bet.";

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

const ALL_MARKETS_LABEL = "All";

/* L3g. The state a row takes when the FOCUSED stat is one this player
 * has no line for: the neutral family, because there is no bet to be
 * in a state about and colouring it as one would be a claim. */
const NO_LEAD_STATE = "pregame";

/* ------------------------------------------------------------------
 * L3e — THE WEEK-1 RETROSPECTIVE'S OWN WORDS. Every one of them is a
 * contiguous string for the same reason the banners are: the wording
 * is the contract, and a wording that can be assembled can drift.
 * ------------------------------------------------------------------ */

/* THE RETROSPECTIVE SENTINEL. It rides the top slot on the `#/retro`
 * route in place of the mode's own, because this screen is neither the
 * fabricated fixture nor the live alpha board: it is a finished week
 * replayed from what was banked, with NO probability anywhere on it.
 * It is written into index.html as well, and it may not be softened. */
const RETRO_SWEATS =
  "RETROSPECTIVE — 2026 week 1 replayed from banked play-by-play; no probabilities existed for this week";

const RETRO_CHIP = "Retro";
const RETRO_TITLE = "WEEK 1 RETRO";
const RETRO_LINK = "Week 1 retro ›";
const BOARD_LINK = "‹ Live board";
const RETRO_BACK_LABEL = "Back to the week 1 retrospective";

/* The one line under the card's drawing that says what its axis IS.
 * A reader arriving from the live board has just been looking at a
 * chance trace, and the two drawings look alike. */
const RETRO_AXIS_NOTE =
  "The axis is the BANKED STAT against the line at each checkpoint — not a chance. No probability existed for this week.";

const CHECKPOINT_LEGEND = "Checkpoint";
const FOCUS_LEGEND = "Focus";

/* The three groupings the retrospective board draws, at whichever
 * checkpoint is selected. They are read off the state the exporter
 * stored at that checkpoint and this page assigns none of them. */
const RETRO_CASHED_HEAD = "CASHED BY THIS POINT";
const RETRO_OPEN_HEAD = "STILL RUNNING AT THIS POINT";

/* ...and the grouping BOTH boards draw since L3g, for the players a
 * chosen pill leaves without a bet. One heading, one wording, because
 * it is one fact on either screen. */
const NO_LINE_HEAD = "NO LINE CAPTURED FOR THIS STAT";

/* "Cashed (Q2)" — the checkpoint it crossed at, off the row. */
const CASHED_AT_OPEN = "Cashed (";
const CASHED_AT_CLOSE = ")";
const NO_LINE_NEED = "No line was captured for this stat";

const RETRO_EMPTY =
  "No week-1 retrospective rows. This page renders the file it was pointed at and replays nothing itself.";

const RETRO_NO_FILE =
  "The week-1 retrospective file could not be read, so there is nothing to show. This page renders the one document it was pointed at and never replays a week of its own.";

const RETRO_LOADING = "Reading the week-1 retrospective…";

/* The Exp. hits tile is a BET count and always answers the bet's own
 * question, so it is the one number on the board the reference toggle
 * does not move. It says so on itself. */
const EXP_HITS_TITLE =
  "Bets already cashed, plus the chance of each live and pregame bet against ITS OWN LINE. A bet settles against its line, so this total never follows the vs-projection toggle.";

/* ------------------------------------------------------------------
 * R0b — THE CAPTURE BOX (READS_LAB_SPEC §6, brief Addendum 2)
 *
 * The reader types what he knows about this player and it is BANKED.
 * That is the whole feature in R0: no chips, no categories, no node
 * labels, and no impact number anywhere — the hierarchy is internal
 * only (Addendum 2) and there is no effect library to draw from yet
 * (R1). What comes back is HIS OWN TEXT with a timestamp.
 *
 * THE ONE HOST THIS PAGE NAMES. Everything else here reads bundled
 * files; the reads service is a service the owner deploys, so its URL
 * is a page constant. Until it is pinned it is the placeholder below,
 * and while it is the placeholder — or while the service does not
 * answer — the box says so in one line rather than posting into the
 * void. That is the no-file arm's own idiom, applied to a writer.
 * ------------------------------------------------------------------ */

const SERVICE_PLACEHOLDER = "https://reads.fantasy-edge.example";
const SERVICE_URL = "https://fantasy-edge-production-ab88.up.railway.app";

/* The token is the reader's own, kept in HIS browser under the house
 * key shape (`fe.<what>.v<n>`), asked for once, and sent to the reads
 * service and nowhere else. Every touch is guarded: a private window
 * THROWS rather than answering, and an unguarded read would take the
 * card down with it. */
const READS_KEY = "fe.reads.token.v1";

const READ_TITLE = "Add your read";
const READ_PLACEHOLDER = "What do you know about this player?";
const READ_SAVE = "Save read";
const READ_SAVING = "Saving…";

/* Said under every saved read. It is the whole promise R0 makes: the
 * read is banked and it will be graded, and nothing on this page
 * claims it moved a number, because nothing did. */
const READ_SAVED_NOTE = "Saved — graded after the game.";

/* The honest arm. The service is not pinned yet, or it did not answer:
 * the box stays on screen and says this, and nothing is silently
 * dropped. */
const READS_OFFLINE = "reads are offline right now";

/* ...and the fabricated board's own arm. A made-up page must not write
 * a real read, so the box renders and the save is off. */
const READS_DEMO_NOTE =
  "Sample data — reads are not saved from a fabricated board.";

const READ_TOKEN_PROMPT =
  "Paste the reads token. It is kept in this browser only and sent to the reads service.";

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
  void: "Void",
  /* L3e. The retrospective's third word, and the only one it adds:
   * without a chance model there is no "alive" or "heating" to claim,
   * so a bet that has neither cashed nor finished is simply open. */
  open: "Open"
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
  /* L3f/L3g. Presentation state: which stored number the page reads.
   * The other control, the stat pills, is `focus` below — ONE field
   * for both boards, because a pill means the same thing on each. */
  reference: REF_LINE,
  boardScroll: 0,
  error: "",
  /* L3e. The retrospective's own screen and its own document.
   * `checkpoint` is a position in the FILE's own checkpoint list.
   * `focus` is the market whose number is emphasised in every
   * statline and led with — the retrospective's since L3e and the
   * LIVE BOARD'S since L3g, because one pill row means one thing.
   * Neither is a filter and neither is ever written anywhere. */
  retro: false,
  retroPlayer: null,
  retroDoc: null,
  retroError: "",
  retroAsked: false,
  checkpoint: 0,
  focus: "",
  /* R0b. What the reader has typed but not yet sent (kept across a
   * re-render so a poll does not eat a sentence), the reads the
   * service has handed back per player, which players have been asked
   * about already, and whether the last attempt reached the service.
   * None of it is a bet and none of it is written to this browser —
   * the reads themselves live in the ledger, which is their home. */
  readsDraft: "",
  reads: {},
  readsAsked: {},
  readsSaving: false,
  readsOffline: false
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

/* THE ROWS OF THE LIVE BOARD, and they are PLAYERS (L3g). The file's
 * top-level array is `players`; each entry carries the player, his
 * game and his statline. */
function boardPlayers() {
  const now = snapshot();
  return (now && Array.isArray(now.players)) ? now.players : [];
}

/* One entry's statline, however it arrived. Shared by both boards,
 * because the retrospective's entries are shaped the same way. */
function statsOf(entry) {
  return (entry && Array.isArray(entry.stats)) ? entry.stats : [];
}

/* ONE stat of one entry, by market — the pill's own lookup. */
function statOf(entry, market) {
  const stats = statsOf(entry);
  for (let i = 0; i < stats.length; i += 1) {
    if (String(stats[i].market) === String(market)) return stats[i];
  }
  return null;
}

/* Every bet on the live board, flat. The tiles count BETS and the
 * chips are read off bets, so the one place that flattens the
 * grouping is here. */
function allStats() {
  const out = [];
  boardPlayers().forEach(function (entry) {
    statsOf(entry).forEach(function (stat) { out.push(stat); });
  });
  return out;
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

/* THE CARD'S SUBJECT, from the address in the hash: the PLAYER whose
 * statline carries that bet. The card then leads with whichever stat
 * the pills say, exactly as his row did — the two screens read the
 * same lead through the same helper, so a card can never show a
 * different stat from the row that was tapped. */
function findPlayer(betId) {
  const all = boardPlayers();
  for (let i = 0; i < all.length; i += 1) {
    const stats = statsOf(all[i]);
    for (let j = 0; j < stats.length; j += 1) {
      if (stats[j].bet_id === betId) return all[i];
    }
  }
  return null;
}

/* ...and the ONE stat that card is currently about — the swing panel
 * and its buttons belong to it, not to the player. */
function cardStat() {
  const entry = ui.bet ? findPlayer(ui.bet) : null;
  return entry ? leadStat(entry, leadChance) : null;
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
function metaLine(entry, bet) {
  /* THE PROJECTION VIEW IS ABOUT THE STAT, not about the bet: it names
   * the market and stops. Carrying "Receiving yards 88.5+" beside a
   * percentage that answers 74.2 would invite exactly the misreading
   * the toggle exists to avoid, and the price would invent a market
   * for our own number. */
  if (vsProjection()) {
    return [entry.player.pos, marketWords(bet.market)].join(" · ");
  }
  const parts = [entry.player.pos, bet.market_label];
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
 * the row's own `need_unit`, so this page holds no market list.
 *
 * It is handed the TEXT to print rather than a raw number, because the
 * two views print the same field to different precision — see
 * `needShown`. */
function needWords(value, unit) {
  if (value === null || value === undefined || value === "") return BLANK;
  const yards = YARD_UNITS[String(unit)];
  if (yards) return "Needs " + value + "+ " + yards;
  return "Needs " + value + " " + unit;
}

/* The threshold the headline names: the BET's need in the line view,
 * OUR OWN PROJECTED VALUE in the projection view — because that is the
 * number the percentage beside it answers. */
function needValue(bet) {
  return vsProjection() ? bet.projection : bet.need;
}

/* PRESENTATION ROUNDING — the second of this file's two kinds of
 * arithmetic, and the whole of this one.
 *
 * A BET's need is a posted threshold: a whole number or a book's half,
 * and it is printed exactly as the file carries it. OUR OWN PROJECTED
 * VALUE is a model quantity with model precision, and printed raw it
 * reads "Needs 3.9625 catches" — precision this page has no business
 * showing and the model has no business claiming. In the projection
 * view it is printed to ONE DECIMAL: "Needs 4.0 catches", "Needs
 * 236.2+ yds". The stored `projection` is untouched, nothing is
 * computed from this text, and the line view is exactly what it was. */
function needShown(value) {
  const number = numberOrNull(value);
  if (number === null) return null;
  return vsProjection() ? number.toFixed(1) : String(number);
}

function needLine(bet) {
  if (bet.state === "void") return "Voided";
  if (bet.state === "cashed") return "Cashed";
  if (bet.state === "lost") return "Did not hit";
  return needWords(needShown(needValue(bet)), bet.need_unit);
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

function axisOf(game) {
  return numberOrNull(game && game.axis_max_s) || FULL_GAME_S;
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

function sparkline(game, bet) {
  const axis = axisOf(game);
  /* inset by the now dot's own radius, so a bet still at kickoff draws
   * its dot at t=0 whole instead of half outside the drawing */
  const at = scaler(axis, 4, SPARK_W - 8, 4, SPARK_H - 8);
  const trace = Array.isArray(bet.trace) ? bet.trace : [];
  const layers = [];

  /* 1. the unplayed game */
  const played = numberOrNull(game && game.elapsed_s) || 0;
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

function chartAria(entry, bet) {
  const who = entry.player.name + ", " +
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
  parts.push(gameLine(entry.game));
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

function cardChart(entry, bet) {
  const axis = axisOf(entry.game);
  const at = scaler(axis, CHART_L, PLOT_W, CHART_T, PLOT_H);
  const trace = Array.isArray(bet.trace) ? bet.trace : [];
  const events = Array.isArray(bet.events) ? bet.events : [];
  const chosen = selectedIndex(bet);
  const layers = [];

  /* 1. the unplayed game — over the overtime span too, but only once
   *    the snapshot says overtime has actually started (sec 7). */
  const played = numberOrNull(entry.game && entry.game.elapsed_s) || 0;
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
    esc(chartAria(entry, bet)) + '">' + layers.join("") +
    marks.join("") + "</svg>" + hits.join("") + "</div>";
}

/* ------------------------------------------------------------------
 * L3g — THE STATLINE AND THE FOCUS, shared by both boards.
 *
 * The live board and the retrospective draw the same idiom over two
 * different files, so they draw it through the SAME functions: what
 * differs between them is the number in a cell and the score a row is
 * led and ordered by, and both arrive as arguments. Neither of these
 * decides anything about a bet — they choose which stored number is
 * emphasised and print it.
 * ------------------------------------------------------------------ */

/* THE ROW'S LEAD STAT: the focused one when a pill is chosen — present
 * or not, because a dashed slot is the honest answer for a player with
 * no line on it — and otherwise the one the screen's own `score` ranks
 * highest. `score` reads stored numbers and returns a rank that is
 * never printed. */
function leadStat(entry, score) {
  if (ui.focus) return statOf(entry, ui.focus);
  const stats = statsOf(entry);
  let best = null;
  let mark = -1;
  stats.forEach(function (stat) {
    const rank = score(stat);
    if (rank > mark) {
      mark = rank;
      best = stat;
    }
  });
  return best;
}

/* THE STATLINE — every stat the file carries for this player, with the
 * focused one emphasised. `valueOf` hands back the number a cell
 * shows and `noteOf` the small word beside it (the captured line on
 * the live board; nothing on the retrospective). The short words come
 * off the rows, so this page holds no market list. */
function statLine(entry, lead, valueOf, noteOf) {
  const stats = statsOf(entry);
  return '<span class="statline">' + stats.map(function (stat) {
    const on = lead && String(stat.market) === String(lead.market);
    const value = valueOf(stat);
    const note = noteOf ? noteOf(stat) : "";
    return '<span class="stat' + (on ? " on" : "") + '">' +
      '<span class="sval">' +
      esc(value === null ? BLANK : value) + "</span>" +
      '<span class="slab">' + esc(stat.short_label) + "</span>" +
      (note ? '<span class="sline">' + esc(note) + "</span>" : "") +
      "</span>";
  }).join("") + "</span>";
}

/* THE PILLS. "All" plus one per market the file actually carries, in
 * the words the exporter wrote. A row of "All" plus one focuses
 * nothing, so it is not drawn: a control that cannot change what is on
 * screen is chrome. */
function focusChips(markets) {
  const chips = [["", ALL_MARKETS_LABEL]].concat(markets);
  if (chips.length < 3) return "";
  return '<div class="chips" role="group" aria-label="' +
    esc(FOCUS_LEGEND) + '">' + chips.map(function (chip) {
      const on = ui.focus === chip[0];
      return '<button type="button" class="statchip' + (on ? " on" : "") +
        '" data-focus="' + esc(chip[0]) + '" aria-pressed="' +
        (on ? "true" : "false") + '">' + esc(chip[1]) + "</button>";
    }).join("") + "</div>";
}

/* ------------------------------------------------------------------
 * THE BOARD (sec 3.1)
 * ------------------------------------------------------------------ */

/* HOW CLOSE A BET IS TO CASHING, for the live board: the chance the
 * file already stored for it under the current reference. Choosing the
 * largest of a player's own stored numbers is a display ordering, not
 * arithmetic — nothing is added, scaled or averaged to get it, and the
 * rank itself is never printed. A row with no number in this view
 * ranks below every row that has one. */
function leadChance(bet) {
  const chance = numberOrNull(chanceOf(bet));
  return chance === null ? -1 : chance;
}

/* THE STATLINE'S OWN NUMBER on the live board: OUR PROJECTED VALUE for
 * the stat, to one decimal, for `needShown`'s reason exactly — a model
 * quantity printed raw reads "3.9625", which is precision this page
 * has no business showing. The stored value is untouched. */
function projectedValue(bet) {
  const value = numberOrNull(bet.projection);
  return value === null ? null : value.toFixed(1);
}

/* ...and the small word beside it: the threshold the book posted for
 * that stat, so a statline says what each number is being measured
 * against. */
function statThreshold(bet) {
  return typeof bet.line_label === "string" ? bet.line_label : "";
}

function boardRow(entry) {
  const lead = leadStat(entry, leadChance);
  /* A player with no line on the FOCUSED stat keeps his row: his
   * statline is still true, and what is missing is a bet. The lead
   * slot dashes and the neutral family colours the row, because there
   * is no state to be in without a bet to be in it. */
  const state = lead ? String(lead.state) : NO_LEAD_STATE;
  const chance = (!lead || lead.state === "void")
    ? BLANK : pct(chanceOf(lead));
  const chip = lead ? (STATE_LABELS[lead.state] || lead.state) : BLANK;
  /* The card is addressed by a BET, and a row the focus leaves without
   * one is still a player worth opening: it takes the address of the
   * first bet on his statline, and his card opens with the same slot
   * dashed and the same pills on it. */
  const first = statsOf(entry)[0];
  const address = (lead || first || {}).bet_id;
  return '<a class="sw row" href="#/sweat/' +
    encodeURIComponent(address === undefined ? "" : address) +
    '" data-state="' + esc(state) + '" data-player="' +
    esc(entry.player_id) + '">' +
    '<span class="rtop"><span class="rname">' + esc(entry.player.name) +
    '</span><span class="chip">' + esc(chip) + "</span></span>" +
    '<span class="rmeta">' +
    esc(lead ? metaLine(entry, lead) : entry.player.pos) + "</span>" +
    '<span class="rgame">' + esc(gameLine(entry.game)) + "</span>" +
    '<span class="rline">' +
    statLine(entry, lead, projectedValue, statThreshold) + "</span>" +
    '<span class="rneed">' +
    esc(lead ? needLine(lead) : NO_LINE_NEED) + "</span>" +
    '<span class="rspark">' +
    (lead ? sparkline(entry.game, lead) : "") + "</span>" +
    '<span class="rpct">' + esc(chance) + "</span></a>";
}

function section(title, note, rows) {
  if (!rows.length) return "";
  return '<section class="sect"><div class="secthead"><span>' +
    esc(title) + "</span>" +
    (note ? '<span class="sectnote">' + esc(note) + "</span>" : "") +
    "</div>" + rows.map(boardRow).join("") + "</section>";
}

/* The board's ORDER, off the stored state and the stored chance of
 * each row's LEAD stat: the live bets closest to cashing first, then
 * what has not kicked off, by kickoff, then everything settled, then
 * the players the focused stat leaves without a bet. Ordering moves
 * nothing and infers nothing — the state each row shows is the one the
 * snapshot stored.
 *
 * THE PILLS FOCUS AND NEVER FILTER (L3g): every player stays on the
 * board whichever pill is on, and it is his lead that follows it. */
function ordered() {
  const all = boardPlayers();
  const lead = function (entry) { return leadStat(entry, leadChance); };
  const inState = function (test) {
    return all.filter(function (entry) {
      const stat = lead(entry);
      return Boolean(stat) && test(stat);
    });
  };
  const live = inState(function (stat) {
    return isOneOf(LIVE_STATES, stat.state);
  }).sort(function (a, b) {
    return leadChance(lead(b)) - leadChance(lead(a));
  });
  const pregame = inState(function (stat) {
    return stat.state === "pregame";
  }).sort(function (a, b) {
    const kick = String(a.game.kickoff).localeCompare(
      String(b.game.kickoff));
    if (kick) return kick;
    /* the tiebreak follows whichever chance is being read, so the
     * ordering is about the numbers on screen and not about a number
     * the reader cannot see */
    return leadChance(lead(b)) - leadChance(lead(a));
  });
  const settled = inState(function (stat) {
    return isOneOf(SETTLED_STATES, stat.state);
  }).sort(function (a, b) {
    return SETTLED_STATES.indexOf(lead(a).state) -
      SETTLED_STATES.indexOf(lead(b).state);
  });
  const unlined = all.filter(function (entry) {
    return !lead(entry);
  });
  return { live: live, pregame: pregame, settled: settled,
           unlined: unlined };
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
  /* A BET COUNT, so it is summed over every stat on the board and not
   * over the rows: a player with three lines is three bets. */
  const all = allStats();
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
 * the snapshot, labelled with the SHORT word the exporter wrote beside
 * it, so a market that starts appearing in the rows appears here the
 * same day and this page never carries a list that can go stale. */
function marketsPresent() {
  const seen = [];
  const words = {};
  allStats().forEach(function (bet) {
    const market = String(bet.market === undefined ? "" : bet.market);
    if (market && seen.indexOf(market) === -1) {
      seen.push(market);
      words[market] = String(bet.short_label);
    }
  });
  return seen.sort().map(function (market) {
    return [market, words[market]];
  });
}

function marketWords(market) {
  const text = String(market);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* The one line that says what the projection view means. It is shown
 * once, above the board, and only while that view is on. */
function referenceNote() {
  if (!vsProjection()) return "";
  return '<div class="refnote">' + esc(VS_PROJECTION_NOTE) + "</div>";
}

/* L3e. The one way into the retrospective, beside the controls it
 * belongs with — the same shape the lab's one link to this sandbox
 * takes. It is a link and nothing else: the tab it opens fetches its
 * own file. */
function retroLink() {
  return '<a class="retrolink" href="#/retro">' + esc(RETRO_LINK) +
    "</a>";
}

function controls() {
  return '<div class="controls">' + referenceToggle() +
    focusChips(marketsPresent()) + retroLink() + "</div>" +
    referenceNote();
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
    section(SETTLED_HEAD, "", groups.settled) +
    section(NO_LINE_HEAD, "", groups.unlined);
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
  const need = needShown(needValue(bet));
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

/* ------------------------------------------------------------------
 * R0b — THE CAPTURE BOX ITSELF
 * ------------------------------------------------------------------ */

/* Whether the service URL has been pinned to a real deploy yet. While
 * it is the placeholder there is nothing to post to, and the box says
 * so instead of failing silently on a click. */
function readsConfigured() {
  return SERVICE_URL !== SERVICE_PLACEHOLDER;
}

/* THE READER'S TOKEN, kept in his own browser. Both touches are
 * guarded: storage that refuses (a private window, blocked site data)
 * leaves him able to type a token per visit rather than leaving the
 * card broken. */
function readToken() {
  try {
    return window.localStorage.getItem(READS_KEY) || "";
  } catch (err) {
    return "";
  }
}

function writeToken(token) {
  try {
    window.localStorage.setItem(READS_KEY, token);
    return true;
  } catch (err) {
    return false;
  }
}

/* Asked ONCE, on the first save (single user, one token — D-123 item
 * 2). Nothing is prompted merely to LOOK at saved reads. */
function askToken() {
  const held = readToken();
  if (held) return held;
  let typed = "";
  try {
    typed = window.prompt(READ_TOKEN_PROMPT) || "";
  } catch (err) {
    typed = "";
  }
  typed = typed.trim();
  if (typed) writeToken(typed);
  return typed;
}

function readWhen(stamp) {
  try {
    const when = new Date(String(stamp));
    if (isNaN(when.getTime())) return String(stamp);
    return when.toLocaleString();
  } catch (err) {
    return String(stamp);
  }
}

/* HIS OWN WORDS BACK, with the time they were banked and the one
 * sentence R0 can honestly say about them. No category, no chip, no
 * number: there is nothing else to show and the taxonomy is not the
 * reader's business (Addendum 2). */
function savedReads(list) {
  if (!list.length) return "";
  return '<ul class="rlist">' + list.map(function (read) {
    return '<li class="ritem"><span class="rtext">' +
      esc(read.text) + '</span><span class="rwhen">' +
      esc(readWhen(read.created_at)) + " · " +
      esc(READ_SAVED_NOTE) + "</span></li>";
  }).join("") + "</ul>";
}

function readBox(entry) {
  const id = String(entry.player_id === undefined ? "" : entry.player_id);
  const off = DEMO ? " disabled" : "";
  const note = DEMO ? READS_DEMO_NOTE
    : ((!readsConfigured() || ui.readsOffline) ? READS_OFFLINE : "");
  return '<section class="reads"><div class="rhead">' +
    esc(READ_TITLE) + "</div>" +
    '<textarea class="rbox" id="readtext" rows="3" ' +
    'aria-label="' + esc(READ_TITLE) + '" ' +
    'data-read-draft placeholder="' + esc(READ_PLACEHOLDER) + '"' +
    off + ">" + esc(ui.readsDraft) + "</textarea>" +
    '<div class="ractions"><button type="button" class="rsave" ' +
    'data-read-save="' + esc(id) + '"' + off + ">" +
    esc(ui.readsSaving ? READ_SAVING : READ_SAVE) + "</button>" +
    (note ? '<span class="rnote">' + esc(note) + "</span>" : "") +
    "</div>" + savedReads(ui.reads[id] || []) + "</section>";
}

/* The two calls this page makes to the service, and the only two. Both
 * carry the bearer token and nothing else about the reader, and both
 * go through the page's ONE fetch (`getJSON`), because a second one
 * would be a second timeout, a second error shape and a second thing
 * to get wrong. */
async function readsAsk(url, token, body) {
  const headers = { Authorization: "Bearer " + token };
  if (body) headers["Content-Type"] = "application/json";
  return getJSON(url, {
    method: body ? "POST" : "GET",
    headers: headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

/* A card that opens asks for that player's reads ONCE. It is the same
 * one-shot ask the retrospective's file gets, and it asks for nothing
 * at all on the fabricated board or before the service is pinned. */
async function askReads(playerId) {
  if (DEMO || !readsConfigured() || !playerId) return;
  if (ui.readsAsked[playerId]) return;
  ui.readsAsked[playerId] = true;
  const token = readToken();
  if (!token) return;
  try {
    const answer = await readsAsk(
      SERVICE_URL + "/reads?player_id=" + encodeURIComponent(playerId),
      token, null);
    ui.reads[playerId] = Array.isArray(answer && answer.reads)
      ? answer.reads : [];
    ui.readsOffline = false;
  } catch (err) {
    ui.readsOffline = true;
  }
  render(null);
}

/* THE SAVE. Synchronous from the reader's side: the read appears under
 * the box only once the service says it is banked, because "saved" on
 * this page means the ledger has it. */
async function saveRead(playerId) {
  if (DEMO || ui.readsSaving) return;
  const text = String(ui.readsDraft || "").trim();
  if (!text) return;
  if (!readsConfigured()) {
    ui.readsOffline = true;
    render(null);
    return;
  }
  const token = askToken();
  if (!token) return;
  const entry = ui.bet ? findPlayer(ui.bet) : null;
  const bet = entry ? leadStat(entry, leadChance) : null;
  const body = { player_id: playerId, text: text };
  if (bet) {
    body.market = bet.market;
    body.line = numberOrNull(bet.line);
  }
  ui.readsSaving = true;
  render(null);
  try {
    const saved = await readsAsk(SERVICE_URL + "/read", token, body);
    ui.reads[playerId] = [{
      read_id: saved.read_id, text: saved.text,
      created_at: saved.created_at
    }].concat(ui.reads[playerId] || []);
    ui.readsDraft = "";
    ui.readsOffline = false;
  } catch (err) {
    /* Never a silent drop: the words stay in the box and the line
     * under it says the service is not answering. */
    ui.readsOffline = true;
  }
  ui.readsSaving = false;
  render(null);
}

/* THE CARD IS A PLAYER'S TOO (L3g). His whole statline rides the
 * header with the focused number emphasised, and the pills under it
 * switch which stat the chart, the threshold, the needs headline and
 * the big % are about — the same focus, through the same helpers, as
 * the row he was tapped from. A pill he has no line for leaves the
 * chart and the number dashed rather than inventing either. */
function renderCard(entry) {
  const bet = leadStat(entry, leadChance);
  const pills = '<div class="controls">' +
    focusChips(marketsPresent()) + "</div>";
  const top = '<div class="topbar"><a class="back" href="#/board" ' +
    'aria-label="' + esc(BACK_LABEL) + '">‹</a><span class="ttl">' +
    esc(CARD_TITLE) + '</span><span class="samplechip">' +
    esc(chipText()) + "</span></div>";
  const statline = '<div class="hstat">' +
    statLine(entry, bet, projectedValue, statThreshold) + "</div>";
  if (!bet) {
    return top +
      '<article class="sw card" data-state="' + esc(NO_LEAD_STATE) +
      '"><section class="hdr"><div class="hleft">' +
      '<div class="hname"><span class="hwho">' +
      esc(entry.player.name) + '</span><span class="chip">' +
      esc(BLANK) + "</span></div>" +
      '<div class="hmeta">' + esc(entry.player.pos) + " · " +
      esc(gameLine(entry.game)) + "</div>" +
      '<div class="hhead"><span class="hbig">' + esc(BLANK) +
      "</span></div>" + statline + "</div></section>" + pills +
      '<div class="empty">' + esc(NO_LINE_NEED) + "</div>" +
      readBox(entry) + "</article>";
  }
  const delta = numberOrNull(bet.delta_pregame_pts);
  const running = isOneOf(LIVE_STATES, bet.state) || bet.state === "pregame";
  const head = '<div class="chead"><span class="ctitle">' +
    esc((running ? CHART_TITLE_LIVE : CHART_TITLE_DONE) +
      thresholdLabel(bet)) + "</span>" +
    (delta === null ? "" : '<span class="cdelta ' + deltaFamily(delta) +
      '">' + esc(signed(delta)) + "</span>") + "</div>";
  return top +
    '<article class="sw card" data-state="' + esc(bet.state) + '">' +
    '<section class="hdr"><div class="hleft">' +
    '<div class="hname"><span class="hwho">' + esc(entry.player.name) +
    '</span><span class="chip">' +
    esc(STATE_LABELS[bet.state] || bet.state) + "</span></div>" +
    '<div class="hmeta">' + esc(metaLine(entry, bet)) + " · " +
    esc(gameLine(entry.game)) + "</div>" +
    (entry.game && entry.game.situation
      ? '<div class="hsit">' + esc(entry.game.situation) + "</div>" : "") +
    '<div class="hhead">' + headline(bet) + "</div>" + statline +
    "</div>" +
    '<div class="hright">' + bigChance(bet) + "</div></section>" +
    pills +
    '<section class="chartcard">' + head + cardChart(entry, bet) +
    explanation(bet) + "</section>" +
    ladderStrip(bet) + readBox(entry) + "</article>";
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
  if (!total || !ui.replayable || ui.retro) {
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
  if (!ui.replayable || !now || interval === null || ui.retro) {
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
 * L3e — THE WEEK-1 RETROSPECTIVE (#/retro)
 *
 * A third screen over a third file, and THE ONE THING IT NEVER DOES IS
 * REPLAY ANYTHING. Every banked value, every needs-remaining, every
 * state and the checkpoint a bet cashed at are computed by
 * `fantasy_edge.live.sweat_retro` out of the play-by-play the capture
 * job banked, and written into the file. This screen renders them as
 * stored.
 *
 * THE ROWS ARE PLAYERS, NOT BETS. The exporter groups a player's whole
 * banked statline onto one entry, so this page never joins rows back
 * together by name and never has to decide which of a player's bets a
 * row "is". A row shows his full statline at the selected checkpoint.
 *
 * THE PILLS FOCUS, THEY DO NOT FILTER. Choosing a stat emphasises that
 * number in every statline and makes it the row's lead — the
 * needs-remaining, the state colour and the big number on the right
 * all follow it. A player with no captured line for the focused stat
 * KEEPS HIS ROW with his statline intact and the focused slot dashed,
 * because his statline is still true; what is missing is a bet, and a
 * bet is never invented to fill the slot.
 *
 * SINCE L3g THAT IDIOM IS THE LIVE BOARD'S TOO, and both screens draw
 * it through the SAME helpers — `leadStat`, `statLine`, `focusChips`
 * and one `ui.focus` — handed this screen's own numbers (banked at a
 * checkpoint) and its own ordering (closeness). Nothing about what
 * this screen shows changed with it.
 *
 * THE ONLY ARITHMETIC ON THIS SCREEN, beyond the geometry every chart
 * on this page does and the presentation rounding every number does,
 * is ONE RATIO OF TWO STORED NUMBERS — banked over need — used to
 * decide which stat a row leads with when no pill is chosen and in
 * what order the rows sit. Its result is never printed as a number and
 * nothing is derived from it.
 *
 * AND THERE IS NO CHANCE ON IT AT ALL. Week 1 had no engine
 * distribution and there is no live model yet, so the file carries no
 * probability field and this screen draws no percentage, no band and
 * no chance trace. The banner says so and the card's axis note says so
 * again, because the drawing looks like the live card's and is a
 * completely different quantity.
 * ------------------------------------------------------------------ */

function retroRun() {
  const doc = ui.retroDoc;
  return (doc && doc.run) || {};
}

function retroPlayers() {
  const doc = ui.retroDoc;
  return (doc && Array.isArray(doc.players)) ? doc.players : [];
}

/* THE SELECTOR'S SEGMENTS COME OUT OF THE FILE. The exporter writes
 * the checkpoints it actually carries, in order, and the OT segment is
 * there only because some game of that week actually went to overtime.
 * This page derives none of them and offers none the rows do not
 * have. */
function retroMarks() {
  const marks = retroRun().checkpoints;
  return Array.isArray(marks) ? marks : [];
}

function retroMarkIndex() {
  const marks = retroMarks();
  if (!marks.length) return 0;
  return Math.min(Math.max(0, ui.checkpoint), marks.length - 1);
}

function retroMarkKey() {
  const mark = retroMarks()[retroMarkIndex()];
  return mark ? String(mark.key) : "";
}

/* One stat's record AT a checkpoint. A game that never went to
 * overtime has no OT checkpoint, and its LAST one — the end of its
 * game — is what stood while another game was still playing. That is a
 * lookup of a stored record, not a value worked out for the gap. */
function statAt(stat, key) {
  const marks = Array.isArray(stat.checkpoints) ? stat.checkpoints : [];
  for (let i = 0; i < marks.length; i += 1) {
    if (String(marks[i].key) === String(key)) return marks[i];
  }
  return marks[marks.length - 1] || null;
}

function hasLine(stat) {
  return Boolean(stat) && stat.line !== null && stat.line !== undefined;
}

/* HOW CLOSE A LINED STAT IS TO CASHING, at this checkpoint: banked
 * over need, with anything already cashed sitting above everything
 * still running. It is the one ratio this screen takes, it is taken of
 * two numbers the file stored, and it is used only to CHOOSE and to
 * ORDER — it is never printed. */
function closeness(stat, key) {
  if (!hasLine(stat)) return -1;
  const at = statAt(stat, key);
  const need = numberOrNull(stat.need);
  const banked = at ? numberOrNull(at.banked) : null;
  if (at === null || need === null || banked === null || need <= 0) {
    return -1;
  }
  const share = banked / need;
  return at.state === "cashed" ? 1 + share : Math.min(share, 1);
}

/* THE RETROSPECTIVE'S OWN SCORE, handed to the shared `leadStat`: how
 * close each stat is to cashing AT THIS CHECKPOINT. A screen brings
 * its ordering and the lead rule is the same one on both. */
function closenessAt(key) {
  return function (stat) { return closeness(stat, key); };
}

/* THE ROW'S LEAD STAT here, at the selected checkpoint. */
function retroLead(entry, key) {
  return leadStat(entry, closenessAt(key));
}

/* ...and the banked value the statline prints at that checkpoint. */
function bankedAt(key) {
  return function (stat) {
    const at = statAt(stat, key);
    const banked = at ? numberOrNull(at.banked) : null;
    return banked === null ? null : banked;
  };
}

/* The word on a row's chip: the stored state, and for a cashed one the
 * checkpoint the exporter says it first crossed at. */
function retroChip(stat, at) {
  if (!hasLine(stat) || at === null) return STATE_LABELS.open;
  if (at.state === "cashed" && stat.cashed_at_label) {
    return CASHED_AT_OPEN + stat.cashed_at_label + CASHED_AT_CLOSE;
  }
  return STATE_LABELS[at.state] || String(at.state);
}

function retroMeta(entry) {
  const parts = [entry.player.pos, entry.player.team].filter(
    function (part) { return Boolean(part); });
  return parts.join(" · ");
}

/* What the row's headline says, off the lead stat's stored checkpoint:
 * the cashed word with its checkpoint, "Did not hit" once the game is
 * over, the needs-remaining while it was still running — and, for a
 * focused stat this player has no line on, the reason there is no
 * number rather than a number. */
function retroNeed(stat, at) {
  if (!hasLine(stat) || at === null) return NO_LINE_NEED;
  if (at.state === "cashed") return retroChip(stat, at);
  if (at.state === "lost") return "Did not hit";
  /* the unit is THIS remaining's, off the checkpoint: a bet one catch
   * short needs "1 catch" and not "1 catches", and this page holds no
   * market list it could work that out from */
  return needWords(at.needs, at.needs_unit);
}

function retroRow(entry, key) {
  const lead = retroLead(entry, key);
  const at = lead ? statAt(lead, key) : null;
  const state = (lead && at && at.state) ? String(at.state) : "open";
  const banked = at ? numberOrNull(at.banked) : null;
  return '<a class="sw row retro" data-state="' + esc(state) +
    '" data-retro="' + esc(entry.player_id) + '" href="#/retro/' +
    encodeURIComponent(entry.player_id) + '">' +
    '<span class="rtop"><span class="rname">' +
    esc(entry.player.name) + '</span><span class="chip">' +
    esc(retroChip(lead, at)) + "</span></span>" +
    '<span class="rmeta">' + esc(retroMeta(entry)) + "</span>" +
    '<span class="rgame">' + esc(gameLine(entry.game)) + "</span>" +
    '<span class="rneed">' + esc(retroNeed(lead, at)) + "</span>" +
    '<span class="rspark">' +
    statLine(entry, lead, bankedAt(key), null) + "</span>" +
    '<span class="rpct">' +
    esc(banked === null ? BLANK : banked) + "</span></a>";
}

function retroSection(title, rows, key) {
  if (!rows.length) return "";
  return '<section class="sect"><div class="secthead"><span>' +
    esc(title) + "</span></div>" + rows.map(function (entry) {
      return retroRow(entry, key);
    }).join("") + "</section>";
}

/* The board's three groupings at the selected checkpoint, off the
 * STORED state of each row's lead stat. Ordering follows the same
 * closeness the lead was chosen by, so the rows nearest to cashing sit
 * nearest the top. */
function retroGroups(key) {
  const cashed = [];
  const open = [];
  const settled = [];
  const unlined = [];
  retroPlayers().forEach(function (entry) {
    const lead = retroLead(entry, key);
    const at = lead ? statAt(lead, key) : null;
    if (!hasLine(lead) || at === null || !at.state) {
      unlined.push(entry);
    } else if (at.state === "cashed") {
      cashed.push(entry);
    } else if (at.state === "lost") {
      settled.push(entry);
    } else {
      open.push(entry);
    }
  });
  const byCloseness = function (a, b) {
    const left = closeness(retroLead(a, key), key);
    const right = closeness(retroLead(b, key), key);
    if (right !== left) return right - left;
    return String(a.player.name).localeCompare(String(b.player.name));
  };
  cashed.sort(byCloseness);
  open.sort(byCloseness);
  settled.sort(byCloseness);
  return { cashed: cashed, open: open, settled: settled,
           unlined: unlined };
}

function checkpointSelector() {
  const marks = retroMarks();
  if (!marks.length) return "";
  const here = retroMarkIndex();
  return '<div class="seg" role="group" aria-label="' +
    esc(CHECKPOINT_LEGEND) + '">' + marks.map(function (mark, index) {
      const on = index === here;
      return '<button type="button" class="segbtn' + (on ? " on" : "") +
        '" data-checkpoint="' + index + '" aria-pressed="' +
        (on ? "true" : "false") + '">' + esc(mark.label) + "</button>";
    }).join("") + "</div>";
}

/* THE FOCUS PILLS COME OUT OF THE FILE, exactly as the board's stat
 * chips do: one per market the retrospective actually carries, in the
 * words the exporter wrote. */
function retroMarkets() {
  const seen = [];
  const words = {};
  retroPlayers().forEach(function (entry) {
    statsOf(entry).forEach(
      function (stat) {
        const market = String(stat.market);
        if (market && seen.indexOf(market) === -1) {
          seen.push(market);
          words[market] = String(stat.short_label);
        }
      });
  });
  return seen.map(function (market) {
    return [market, words[market]];
  });
}

/* ------------------------------------------------------------------
 * THE STEP TRACE — the banked stat against the line, across the
 * checkpoints. GEOMETRY ONLY: a stored value over an axis this
 * function picks so the drawing fits, turned into an x and a y. The
 * axis is the STAT and the page says so under it.
 * ------------------------------------------------------------------ */

const STEP_W = 330;
const STEP_H = 200;
const STEP_L = 8;
const STEP_T = 14;
const STEP_BOTTOM = 172;

function stepAxis(stat) {
  let top = numberOrNull(stat.need) || 0;
  (Array.isArray(stat.checkpoints) ? stat.checkpoints : []).forEach(
    function (mark) {
      const banked = numberOrNull(mark.banked);
      if (banked !== null && banked > top) top = banked;
    });
  return top > 0 ? top * 1.15 : 1;
}

function stepAria(entry, stat) {
  const marks = Array.isArray(stat.checkpoints) ? stat.checkpoints : [];
  const parts = [entry.player.name + ", " + stat.label +
    ", banked stat by checkpoint"];
  marks.forEach(function (mark) {
    parts.push(mark.label + " " + mark.banked);
  });
  if (hasLine(stat)) parts.push("line " + stat.line);
  return parts.join(", ") + ".";
}

function stepTrace(entry, stat) {
  const marks = Array.isArray(stat.checkpoints) ? stat.checkpoints : [];
  if (!marks.length) return "";
  const width = STEP_W - STEP_L * 2;
  const height = STEP_BOTTOM - STEP_T;
  const top = stepAxis(stat);
  const span = marks.length > 1 ? width / (marks.length - 1) : 0;
  const at = {
    x: function (index) { return STEP_L + index * span; },
    y: function (value) { return STEP_T + (1 - value / top) * height; }
  };
  const layers = [];

  layers.push('<line class="axis" x1="' + STEP_L + '" y1="' +
    STEP_BOTTOM + '" x2="' + (STEP_L + width) + '" y2="' +
    STEP_BOTTOM + '"></line>');
  marks.forEach(function (mark, index) {
    const line = at.x(index).toFixed(1);
    layers.push('<line class="grid" x1="' + line + '" y1="' + STEP_T +
      '" x2="' + line + '" y2="' + STEP_BOTTOM + '"></line>');
  });

  /* THE LINE IT WAS BET AGAINST, dashed, labelled with the threshold
   * the file carries. A stat with no captured line draws none. */
  if (hasLine(stat)) {
    const need = numberOrNull(stat.need) || 0;
    const y = at.y(need).toFixed(1);
    layers.push('<line class="preline" x1="' + STEP_L + '" y1="' + y +
      '" x2="' + (STEP_L + width) + '" y2="' + y + '"></line>');
    const label = Math.min(STEP_BOTTOM - 4,
      Math.max(STEP_T + 9, at.y(need) - 5));
    layers.push('<text class="prelabel" x="' + (STEP_L + width) +
      '" y="' + label.toFixed(1) + '" text-anchor="end">' +
      esc(stat.line_label) + "</text>");
  }

  /* THE STEP ITSELF. A banked stat does not drift between checkpoints
   * — it stands where it stood and then jumps — so it is drawn as
   * steps and not as a slope, which would show a value the file never
   * stated. */
  const path = [];
  marks.forEach(function (mark, index) {
    const banked = numberOrNull(mark.banked) || 0;
    const y = at.y(banked).toFixed(1);
    if (index > 0) path.push(at.x(index).toFixed(1) + "," +
      at.y(numberOrNull(marks[index - 1].banked) || 0).toFixed(1));
    path.push(at.x(index).toFixed(1) + "," + y);
  });
  layers.push('<polyline class="trace big" points="' + path.join(" ") +
    '"></polyline>');

  marks.forEach(function (mark, index) {
    const banked = numberOrNull(mark.banked) || 0;
    const family = mark.state === "cashed" ? "d-hit" : "d-note";
    layers.push('<circle class="dot ' + family + '" cx="' +
      at.x(index).toFixed(1) + '" cy="' + at.y(banked).toFixed(1) +
      '" r="4.5"></circle>');
  });

  const labels = marks.map(function (mark, index) {
    return '<text class="qlabel" x="' + at.x(index).toFixed(1) +
      '" y="' + (STEP_BOTTOM + 15) + '" text-anchor="middle">' +
      esc(mark.label) + "</text>";
  });

  return '<div class="chartwrap"><svg class="chart" viewBox="0 0 ' +
    STEP_W + " " + STEP_H + '" role="img" aria-label="' +
    esc(stepAria(entry, stat)) + '">' + layers.join("") +
    labels.join("") + "</svg></div>";
}

/* ------------------------------------------------------------------
 * the retrospective's two screens
 * ------------------------------------------------------------------ */

function retroTitleRow(title) {
  return '<div class="titlerow"><h1>' + esc(title) +
    '</h1><span class="samplechip">' + esc(RETRO_CHIP) +
    "</span></div>";
}

function retroTiles() {
  const tiles = retroRun();
  const totals = (ui.retroDoc && ui.retroDoc.summary) || {};
  const cells = [["Players", totals.players], ["Cashed", totals.cashed],
                 ["Lost", totals.lost]];
  return '<div class="tiles">' + cells.map(function (cell) {
    const value = numberOrNull(cell[1]);
    return '<div class="tile"><span class="tlab">' + esc(cell[0]) +
      '</span><span class="tval">' +
      esc(value === null ? BLANK : String(value)) + "</span></div>";
  }).join("") + "</div>" +
    (tiles.chance_absent_reason
      ? '<div class="refnote">' + esc(tiles.chance_absent_reason) +
        "</div>" : "");
}

function retroBoard() {
  const key = retroMarkKey();
  const groups = retroGroups(key);
  const body = retroSection(RETRO_CASHED_HEAD, groups.cashed, key) +
    retroSection(RETRO_OPEN_HEAD, groups.open, key) +
    retroSection(SETTLED_HEAD, groups.settled, key) +
    retroSection(NO_LINE_HEAD, groups.unlined, key);
  const reason = typeof retroRun().reason === "string"
    ? retroRun().reason : "";
  const empty = body ? "" :
    '<div class="empty"><b>' + esc(RETRO_EMPTY) + "</b>" +
    (reason ? esc(reason) : "") + "</div>";
  return '<div class="topbar"><a class="back" href="#/board" ' +
    'aria-label="' + esc(BACK_LABEL) + '">‹</a><span class="ttl">' +
    esc(BOARD_LINK) + "</span></div>" + retroTitleRow(RETRO_TITLE) +
    retroTiles() +
    '<div class="controls">' + checkpointSelector() + focusChips(retroMarkets()) +
    "</div>" + body + empty;
}

function findRetro(playerId) {
  const all = retroPlayers();
  for (let i = 0; i < all.length; i += 1) {
    if (String(all[i].player_id) === String(playerId)) return all[i];
  }
  return null;
}

function retroCard(entry) {
  const key = retroMarkKey();
  const lead = retroLead(entry, key);
  const at = lead ? statAt(lead, key) : null;
  const state = (lead && at && at.state) ? String(at.state) : "open";
  const banked = at ? numberOrNull(at.banked) : null;
  const drawing = lead
    ? stepTrace(entry, lead)
    : '<div class="empty">' + esc(NO_LINE_NEED) + "</div>";
  return '<div class="topbar"><a class="back" href="#/retro" ' +
    'aria-label="' + esc(RETRO_BACK_LABEL) + '">‹</a>' +
    '<span class="ttl">' + esc(RETRO_TITLE) +
    '</span><span class="samplechip">' + esc(RETRO_CHIP) +
    "</span></div>" +
    '<article class="sw card" data-state="' + esc(state) + '">' +
    '<section class="hdr"><div class="hleft">' +
    '<div class="hname"><span class="hwho">' +
    esc(entry.player.name) + '</span><span class="chip">' +
    esc(retroChip(lead, at)) + "</span></div>" +
    '<div class="hmeta">' + esc(retroMeta(entry)) + " · " +
    esc(gameLine(entry.game)) + "</div>" +
    '<div class="hhead"><span class="hbig">' +
    esc(banked === null ? BLANK : banked) +
    '</span><span class="hunit">' +
    esc(lead ? lead.short_label : "") + "</span></div>" +
    '<div class="hstat">' + statLine(entry, lead, bankedAt(key), null) + "</div>" +
    "</div></section>" +
    '<div class="controls">' + checkpointSelector() + focusChips(retroMarkets()) +
    "</div>" +
    '<section class="chartcard"><div class="chead">' +
    '<span class="ctitle">' +
    esc(lead ? lead.label : BLANK) + "</span></div>" + drawing +
    '<div class="axisnote">' + esc(RETRO_AXIS_NOTE) + "</div>" +
    '<div class="panel"><div class="ptitle">' +
    esc(retroNeed(lead, at)) + "</div></div></section></article>";
}

function renderRetro() {
  if (ui.retroError) {
    return '<div class="empty"><b>Nothing to show</b>' +
      esc(ui.retroError) + "</div>";
  }
  if (!ui.retroDoc) {
    return '<div class="empty"><b>' + esc(RETRO_LOADING) + "</b></div>";
  }
  if (ui.retroPlayer) {
    const entry = findRetro(ui.retroPlayer);
    if (entry) return retroCard(entry);
    ui.retroPlayer = null;
  }
  return retroBoard();
}

/* ONE FETCH OF ONE FILE, on the route that needs it, held in its own
 * field. It is asked for once: a file that could not be read leaves
 * the honest no-file arm on screen rather than retrying behind the
 * reader's back. */
async function askRetro() {
  if (ui.retroAsked) return;
  ui.retroAsked = true;
  try {
    ui.retroDoc = await getJSON(RETRO_URL);
  } catch (err) {
    ui.retroError = RETRO_NO_FILE + " (" + err.message + ")";
  }
  render(null);
}

/* ------------------------------------------------------------------
 * render and route
 * ------------------------------------------------------------------ */

/* The top sentinel is the mode's own: the SAMPLE one in demo, the
 * ALPHA one on the real file. One slot, one string, never both — the
 * reader is never left guessing which kind of numbers are below it.
 *
 * L3e. The retrospective takes the slot for itself, because neither of
 * the other two describes it: nothing on it is fabricated, so the
 * SAMPLE sentinel would be a lie, and nothing on it is an engine
 * probability, so the ALPHA one would be too. The lab's in-progress
 * banner rides under all three, always. */
function topSentinel() {
  if (ui.retro) return RETRO_SWEATS;
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
  BODY.dataset.screen = ui.retro ? "retro" : "sweats";
}

/* WHERE EACH ROW SAT, keyed by the player it is (L3g). */
function boardTops() {
  const map = {};
  document.querySelectorAll("[data-player]").forEach(function (node) {
    map[node.dataset.player] = node.getBoundingClientRect().top;
  });
  return map;
}

/* The board's one motion (sec 4): a row that changed place slides to
 * it, about 250ms. Under prefers-reduced-motion it simply arrives. */
function slideRows(before) {
  if (REDUCED || !before) return;
  document.querySelectorAll("[data-player]").forEach(function (node) {
    const was = before[node.dataset.player];
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
  /* L3e. The retrospective is its OWN screen over its OWN document.
   * It is drawn before anything else is consulted, so a failed live
   * fetch never empties it and a live row never reaches it. */
  if (ui.retro) {
    screen.innerHTML = renderRetro();
    return;
  }
  if (ui.error) {
    screen.innerHTML = '<div class="empty"><b>Nothing to show</b>' +
      esc(ui.error) + "</div>";
    return;
  }
  if (ui.bet) {
    const entry = findPlayer(ui.bet);
    if (entry) {
      screen.innerHTML = renderCard(entry);
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
  /* L3e. `#/retro` and `#/retro/<player_id>` are the third route. It
   * is read FIRST because it owns the screen: the live board's card
   * and its reference toggle belong to the other two. */
  const retro = hash.match(/^#\/retro(?:\/(.+))?$/);
  ui.retro = Boolean(retro);
  if (ui.retro) {
    ui.retroPlayer = retro[1] ? decodeURIComponent(retro[1]) : null;
    ui.bet = null;
    ui.reference = REF_LINE;
    return;
  }
  ui.retroPlayer = null;
  const match = hash.match(/^#\/sweat\/(.+)$/);
  const wanted = match ? decodeURIComponent(match[1]) : null;
  if (wanted !== ui.bet) {
    if (wanted && !ui.bet) ui.boardScroll = window.scrollY;
    ui.bet = wanted;
    ui.pinned = null;
    /* R0b. A half-typed read belongs to the player it was typed on,
     * so it does not follow the reader to the next card. */
    ui.readsDraft = "";
  }
}

/* R0b. The card that just opened asks the service for that player's
 * own reads, once. It is the retrospective's one-shot ask, applied to
 * the other document this page can read. */
function askReadsForCard() {
  const entry = ui.bet ? findPlayer(ui.bet) : null;
  if (entry) askReads(String(entry.player_id));
}

function route() {
  const goingBack = ui.bet !== null;
  readRoute();
  render(null);
  /* the retrospective's own file, asked for once, on the route that
   * needs it — never on a route that does not */
  if (ui.retro) askRetro();
  if (ui.bet) askReadsForCard();
  if (ui.bet || ui.retro) {
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
  if (!snap || !Array.isArray(snap.players)) return 0;
  let total = 0;
  snap.players.forEach(function (entry) {
    statsOf(entry).forEach(function (bet) {
      total += (Array.isArray(bet.events) ? bet.events.length : 0);
    });
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
    const bet = cardStat();
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
  /* L3e/L3g. The two pill controls, and they do the same one thing:
   * set a presentation field and re-render. The checkpoint is a
   * position in the file's own list and the focus is a market the file
   * already carries; neither fetches, stores or works out a number,
   * and the focus is ONE field for both boards. */
  const mark = target.closest("[data-checkpoint]");
  if (mark) {
    ui.checkpoint = Number(mark.dataset.checkpoint);
    render(null);
    return;
  }
  const focus = target.closest("[data-focus]");
  if (focus) {
    ui.focus = focus.dataset.focus;
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
    const bet = cardStat();
    if (bet) pick(selectedIndex(bet) + Number(step.dataset.step));
    return;
  }
  if (target.closest("[data-latest]")) {
    ui.pinned = null;
    render(null);
    return;
  }
  /* R0b. The one control on this page that WRITES, and it writes to
   * the reads service alone — never to a file this page reads, never
   * to sweats.json, and never on the fabricated board. */
  const save = target.closest("[data-read-save]");
  if (save) {
    saveRead(save.dataset.readSave);
  }
});

/* The box keeps what has been typed across a re-render: the page
 * redraws on every poll, and a sentence eaten by a redraw is a read
 * the reader has to write twice. */
document.addEventListener("input", function (event) {
  const box = event.target;
  if (box && box.dataset && box.dataset.readDraft !== undefined) {
    ui.readsDraft = String(box.value === undefined ? "" : box.value);
  }
});

/* Frame 5's rule, in one place: choosing the newest swing leaves the
 * selection on automatic, so it keeps following the feed; choosing an
 * older one pins it, and the "New swing" pill is how the reader comes
 * back to the front. */
function pick(index) {
  const bet = cardStat();
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

/* ONE fetch for this page: the board's own document, the
 * retrospective's, and R0b's two calls to the reads service all come
 * through here, so there is one timeout and one error shape. `init` is
 * how the reads service's method, headers and body ride along; the
 * file reads pass none. */
async function getJSON(url, init) {
  const controller = new AbortController();
  const timer = window.setTimeout(function () { controller.abort(); },
    FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, Object.assign(
      { signal: controller.signal, cache: "no-store" }, init || {}));
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
  /* ...and a reader who LANDED on the retrospective — from a link, or
   * a reload — needs its file too. It is the same one-shot ask the
   * route makes, so arriving at #/retro and navigating to it behave
   * identically. */
  if (ui.retro) askRetro();
  /* ...and a reader who LANDED on a card wants the reads he has
   * already banked on that player, for the same reason. */
  if (ui.bet) askReadsForCard();
  /* the paused-feed banner has to be able to appear while nothing else
   * is happening, so one second-hand ticks for it and for nothing else */
  ui.ticker = window.setInterval(renderStale, 1000);
}

boot();

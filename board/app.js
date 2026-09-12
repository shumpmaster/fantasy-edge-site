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

const SOURCE_THIRDPARTY = "espn-thirdparty";
const BAND_EARLY = "EARLY";

/* The live window (UI_SPEC §7): kickoff − 10 min → final + 10 min,
 * and nothing outside it. MAX_GAME_MS bounds a game we never joined,
 * so a board left open on a Tuesday stops polling on its own. */
const POLL_MS = 60000;
const WINDOW_LEAD_MS = 10 * 60 * 1000;
const WINDOW_TRAIL_MS = 10 * 60 * 1000;
const MAX_GAME_MS = 4.5 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15000;

/* §6: stale after more than three missed polls — LIVE rows freeze,
 * the header says so, and pace colors drop to neutral. */
const MISSED_POLLS_STALE = 3;

/* A source stamp older than this wears the amber dot. */
const FRESH_WARN_MS = 6 * 60 * 60 * 1000;

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

/* The headline usage each group sorts on (UI_SPEC §4). */
const HEADLINE = {
  QB: "pass_yds", RB: "rush_att", WR: "targets", TE: "targets",
  FB: "targets"
};

const POS_ORDER = ["QB", "RB", "WR", "TE", "FB"];
const POS_FILTERS = ["ALL", "QB", "RB", "WR", "TE"];
const SORTS = [["proj", "Proj"], ["live", "Live"]];

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
  /* game_id → {state, period, displayClock, detail, awayScore,
   *            homeScore, eventId, finalAt} */
  live: {},
  /* espn_id (string) → box-score fields */
  box: {},
  finalBox: {},
  polling: false,
  stale: false,
  misses: 0,
  feedTs: null,
  signature: null
};

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

/* LIVE cells only: actual against projection × fraction elapsed. */
function paceClass(proj, actual, frac, isFinal) {
  if (state.stale) return "c-n";
  const projected = numberOrNull(proj);
  const got = numberOrNull(actual);
  if (projected === null || projected === 0 || got === null) {
    return "c-n";
  }
  const expected = isFinal ? projected : projected * frac;
  if (!(expected > 0)) return "c-n";
  const ratio = got / expected;
  if (ratio >= 1.12) return "c-up";
  if (ratio <= 0.72) return "c-dn";
  return "c-n";
}

/* ------------------------------------------------------------------
 * rendering
 * ------------------------------------------------------------------ */

function shownPlayers() {
  const players = (state.board && state.board.players) || [];
  if (state.pos === "ALL") return players.slice();
  return players.filter(function (p) { return up(p.pos) === state.pos; });
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

function comparePlayers(a, b) {
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
  if (state.polling) {
    if (state.stale) {
      dots.push('<span class="bad">live feed stale — rows frozen' +
        "</span>");
    } else {
      const age = ageLabel(state.feedTs, now);
      dots.push('<span class="ok">live feed ' +
        esc(age === null ? "connecting" : age) + "</span>");
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
    button.onclick = function () {
      state.sort = key;
      render(true);
    };
    sortseg.appendChild(button);
  }
}

function statusPill(status, game) {
  if (status && status.state === "in") {
    let text = "LIVE";
    const detail = String((status.detail || "")).toLowerCase();
    const period = numberOrNull(status.period) || 0;
    if (detail.indexOf("halftime") >= 0) {
      text = "HALF";
    } else if (period > 4) {
      text = ("OT " + (status.displayClock || "")).trim();
    } else if (period > 0) {
      text = ("Q" + period + " " + (status.displayClock || "")).trim();
    }
    return '<span class="gspill live"><span class="dot"></span>' +
      esc(text) + "</span>";
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

function gameHeadHTML(game, status) {
  const away = up(game.away);
  const home = up(game.home);
  let title = esc(away) + " @ " + esc(home);
  if (status && (status.state === "in" || status.state === "post")) {
    const a = status.awayScore;
    const h = status.homeScore;
    if (a !== null && a !== undefined && h !== null && h !== undefined) {
      title += ' <span class="sc">' + esc(a) + "–" + esc(h) + "</span>";
    }
  }
  return '<div class="ghead">' +
    '<div class="gbadges">' +
    '<div class="gbadge" style="background:' + teamColor(away) + '">' +
    esc(away) + "</div>" +
    '<div class="gbadge" style="background:' + teamColor(home) + '">' +
    esc(home) + "</div></div>" +
    '<div class="gmain"><div class="gtitle">' + title + "</div>" +
    '<div class="gmeta">' + esc(gameMeta(game)) + "</div></div>" +
    '<div class="gstatus">' + statusPill(status, game) + "</div></div>";
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

function cardHTML(player, game, status) {
  const team = up(player.team);
  const opponent = sameTeam(team, game.home)
    ? "vs " + up(game.away)
    : "@ " + up(game.home);
  const injury = player.injury === "Q"
    ? '<span class="qtag">Q</span>' : "";
  return '<div class="card">' +
    '<div class="cardtop">' +
    '<div class="badge" style="background:' + teamColor(team) + '">' +
    esc(team) + "</div>" +
    '<div class="cmain">' +
    '<div class="teamline">' + esc(team) + " " + esc(opponent) +
    "</div>" +
    '<div class="pname">' + esc(player.name) +
    '<span class="postag">' + esc(up(player.pos)) + "</span>" +
    injury + "</div></div></div>" +
    statGridHTML(player, status) +
    boxLineHTML(player, status) +
    "</div>";
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

  const ordered = games.slice().sort(function (a, b) {
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

  const chunks = [];
  for (const game of ordered) {
    const players = shown.filter(function (p) {
      return String(p.game_id) === String(game.game_id);
    });
    /* A game with no matching players hides entirely (UI_SPEC §1). */
    if (!players.length) continue;
    players.sort(comparePlayers);
    const status = state.live[game.game_id] || null;
    let block = gameHeadHTML(game, status);
    for (const player of players) {
      block += cardHTML(player, game, status);
    }
    chunks.push("<section>" + block + "</section>");
  }
  host.innerHTML = chunks.join("");

  if (!chunks.length) {
    empty.hidden = false;
    empty.innerHTML = "<b>No players at this filter.</b>" +
      "Every game on the slate is hidden" +
      (state.pos === "ALL"
        ? ": no player on this board belongs to a game on it."
        : " because none of them has a " + esc(state.pos) +
          " on the board.");
  }
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
  return JSON.stringify([state.pos, state.sort, state.polling,
    state.stale, state.live, state.box]);
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

function eventTeams(event) {
  const competition = ((event || {}).competitions || [])[0] || {};
  const out = { away: "", home: "", awayScore: null, homeScore: null };
  for (const competitor of competition.competitors || []) {
    const abbr = up(((competitor || {}).team || {}).abbreviation);
    const score = competitor.score;
    if (up(competitor.homeAway) === "HOME") {
      out.home = abbr;
      out.homeScore = score === undefined ? null : score;
    } else {
      out.away = abbr;
      out.awayScore = score === undefined ? null : score;
    }
  }
  return out;
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
    const next = {
      state: feedState === "in" || feedState === "post"
        ? feedState : "pre",
      period: numberOrNull(status.period),
      displayClock: status.displayClock || null,
      detail: type.shortDetail || type.detail || null,
      awayScore: teams.awayScore,
      homeScore: teams.homeScore,
      eventId: String(event.id || ""),
      finalAt: previous.finalAt || null
    };
    if (next.state === "post" && !next.finalAt) next.finalAt = now;
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

async function poll() {
  let good = false;
  try {
    const payload = await getJSON(ESPN_SCOREBOARD);
    absorbScoreboard(payload && payload.events);
    good = await pollSummaries();
  } catch (err) {
    good = false;
  }
  if (good) {
    state.misses = 0;
    state.stale = false;
    state.feedTs = Date.now();
  } else {
    state.misses += 1;
    if (state.misses > MISSED_POLLS_STALE) state.stale = true;
  }
  /* Unforced: the board is rebuilt only when the feed actually moved,
   * so a quiet minute does not reflow the page under the reader. */
  render();
}

function windowOpen(now) {
  for (const game of ((state.board || {}).games || [])) {
    const kick = ms(game.kickoff);
    if (kick === null) continue;
    if (now < kick - WINDOW_LEAD_MS) continue;
    const status = state.live[game.game_id];
    if (status && status.state === "post") {
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
  await poll();
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
  tick();
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

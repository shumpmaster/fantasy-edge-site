/* m4.4L — THE LAB (PLAYER_BREAKDOWN_SPEC amendment).
 *
 * A DESIGN SANDBOX on live engine data. Vanilla, no framework, no
 * build step, exactly as the board is. ONE fetch of ../data/lab.json —
 * written by `fantasy_edge.live.lab` — and everything on the page is
 * read off that file.
 *
 * THIS PAGE PROJECTS NOTHING. It does not forecast, it does not score,
 * it does not poll a feed and it contacts no host but the one the
 * stylesheet's font comes from. There are exactly TWO carve-outs to
 * that, both named here rather than left to be discovered:
 *   1. the exporter's own signed movement, which the file carries
 *      ready-made and this page only prints;
 *   2. the likeliness strip's POSITIONING ARITHMETIC (L2) — each
 *      stat's five stored points and its stored mean divided by that
 *      row's own domain, max(p90, mean), to get the percentages the
 *      CSS places the marks at. It is presentation only: it produces
 *      no new quantity, it is never shown as a number, and every
 *      figure on the page is still the one the generation stored.
 * A number that is absent renders as absent, with the reason the
 * generation stored beside it.
 *
 * WHAT IT SHOWS, per the owner's ask: for one game of the current run,
 * a player's projected results as a straight table (mean and the
 * five-point range, per stat, with what moved since the week opened),
 * and the tangible elements in chain order, so the projection reads as
 * arithmetic a person can follow.
 *
 * NOTHING HERE HAS GRADUATED. The main board is untouched by this
 * file, and nothing moves from the lab to the board without the
 * owner's word on the design.
 */
"use strict";

const BODY = document.body;
const LAB_URL = BODY.dataset.lab || "../data/lab.json";
const DEMO_LAB_URL = BODY.dataset.demoLab || "../demo/lab.demo.json";
const FETCH_TIMEOUT_MS = 15000;

/* ------------------------------------------------------------------
 * the sentinels — each ONE contiguous string, like the board's, so
 * the wording cannot drift silently. These are the LAB's own
 * constants: the board's strings are not imported, not edited and not
 * shared, because the two pages carry their own obligations.
 * ------------------------------------------------------------------ */

/* The banner. It is also written into index.html so it is on screen
 * before this file runs and stays there if the fetch never answers; a
 * test asserts the page and this constant say the same thing. */
const LAB_IN_PROGRESS =
  "LAB — IN PROGRESS: design sandbox on live data; numbers are real, presentation is experimental";

const LAB_SCOPE =
  "One game of the current run, from the newest generation. This is where the breakdown is designed; nothing moves to the board without a decision to move it.";

/* The disclosures a public page carries. Same obligations as the
 * board, in the lab's own constants. */
const LAB_ALPHA =
  "ALPHA — engine-certified projections; interface and features under active development (D-098).";
const LAB_NOT_PICKS =
  "Projections, not picks — no line, no price, no recommendation.";
const LAB_PUBLIC_EXPOSURE =
  "This page carries derived model outputs only — no raw vendor data, and no odds beyond the informational game line already published everywhere.";

const LAB_DEMO_BANNER = "DEMO DATA — visual QA only";
const LAB_DEMO_SUB =
  "Every number below is fabricated and nothing is fetched from the pipeline. Demo data never mixes with an exported lab file.";

const LAB_NO_FILE =
  "The exported lab file could not be read, so there is nothing to show. The lab renders web/data/lab.json and never invents a slate.";

/* The ceiling probability's label, said in full wherever it appears:
 * it is a PROBABILITY about a population, not a score and not a
 * projection of anything a player will do. */
const P_CEILING_LABEL =
  "Ceiling probability — chance of a top-15% week at position";

/* What the elements table says when the generation stored no chain at
 * all. The exporter ships its own sentence on the file; this is the
 * heading above it. */
const ELEMENTS_ABSENT = "The elements are not available for this generation.";

/* The context table's own note: these are the circumstances the
 * generation ran in, not numbers it multiplied. */
const CONTEXT_NOTE =
  "The circumstances this generation ran in, read off the same row as the elements below.";

/* The chain, in words, above the table that walks it. */
const CHAIN_NOTE =
  "In chain order: the game line the volume model read, the team's volume, this player's shares, his opportunities, then the rates applied to them.";

const MOVEMENT_NOTE = "Movement is this generation's mean minus the same mean in the week's first generation.";

/* L2 — the owner's "thin line labeled 'likeliness' that serves as an
 * almost axis". It is the row header of the strip under each stat, and
 * it is a sentinel because it is the one word on the page that names
 * the whole idea. */
const LIKELINESS_LABEL = "likeliness";

/* What the strip is, for the reader who wants it said in words rather
 * than inferred from a drawing. */
const LIKELINESS_NOTE =
  "Each stat's strip is its own axis, 0 to the wider of p90 and the mean: the light span is p10–p90, the darker core is p25–p75, the tick is p50 and the dot is the mean. A stat whose range is a single value draws no strip.";

const BLANK = "—";

/* ------------------------------------------------------------------
 * the stat vocabulary — the exporter's contract keys, with the label
 * and the decimals each one reads in. The board's own spellings.
 * ------------------------------------------------------------------ */

const STATS = [
  ["Pass yds", "pass_yds", 0],
  ["Pass TD", "pass_tds", 2],
  ["Carries", "rush_att", 1],
  ["Rush yds", "rush_yds", 0],
  ["Targets", "targets", 1],
  ["Receptions", "receptions", 1],
  ["Rec yds", "rec_yds", 0],
  ["Any TD", "anytime_td", 2]
];

const QUANTILE_COLUMNS = ["p10", "p25", "p50", "p75", "p90"];

const POS_ORDER = ["QB", "RB", "WR", "TE", "FB"];

const DENSITIES = [["comfortable", "Comfortable"], ["compact", "Compact"]];

/* ------------------------------------------------------------------
 * state
 * ------------------------------------------------------------------ */

const state = {
  demo: isDemo(),
  lab: null,
  error: "",
  selected: null,
  density: "comfortable"
};

/* ------------------------------------------------------------------
 * small helpers — the board's, spelled the same way
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

function fmt(value, places) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  return number.toFixed(places);
}

/* An element's value, read at the precision the number deserves: a
 * share or a rate is a fraction and wants its digits, a count of plays
 * does not. Nothing is rescaled — 0.62 is shown as 0.62, never as
 * "62%", because the stored number is what the pass used. */
function elementNumber(value) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  const size = Math.abs(number);
  if (size < 1) return number.toFixed(3);
  if (size < 20) return number.toFixed(2);
  return number.toFixed(1);
}

function pct(value) {
  const number = numberOrNull(value);
  if (number === null) return BLANK;
  return (number * 100).toFixed(1) + "%";
}

function stamp(iso) {
  if (!iso) return "";
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return String(iso);
  return new Date(at).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function isDemo() {
  try {
    return new URLSearchParams(window.location.search).get("demo") === "1";
  } catch (err) {
    return false;
  }
}

/* ------------------------------------------------------------------
 * the renderers
 * ------------------------------------------------------------------ */

function renderBanners() {
  /* The banner is in index.html too; this keeps the two in step from
   * one constant rather than trusting them to stay typed alike. */
  document.getElementById("labbanner").textContent = LAB_IN_PROGRESS;
  const parts = [];
  if (state.demo) {
    parts.push('<div class="banner demo">' + esc(LAB_DEMO_BANNER) +
      '<span class="sub">' + esc(LAB_DEMO_SUB) + "</span></div>");
  }
  document.getElementById("topbanner").innerHTML = parts.join("");
}

function renderHeader() {
  const lab = state.lab;
  const run = (lab && lab.run) || {};
  const game = (lab && lab.game) || {};
  const pill = [];
  if (run.season) pill.push(esc(run.season));
  if (run.week !== undefined && run.week !== null) {
    pill.push("WK " + esc(run.week));
  }
  if (run.band) pill.push(esc(run.band));
  if (run.snapshot_kind) pill.push(esc(run.snapshot_kind));
  document.getElementById("runpill").textContent =
    pill.length ? pill.join(" · ") : (state.error ? "no file" : "loading");

  const lines = [];
  if (game.away || game.home) {
    lines.push("<b>" + esc(game.away) + " @ " + esc(game.home) + "</b>");
  }
  const meta = [];
  if (game.kickoff) meta.push("kickoff " + esc(stamp(game.kickoff)));
  if (game.spread !== null && game.spread !== undefined) {
    meta.push("line " + esc(fmt(game.spread, 1)));
  }
  if (game.ou !== null && game.ou !== undefined) {
    meta.push("total " + esc(fmt(game.ou, 1)));
  }
  if (meta.length) lines.push(meta.join(" · ") + " (informational)");
  if (run.generated_ts) {
    lines.push("generated " + esc(stamp(run.generated_ts)) +
      (run.generation_id ? " · " + esc(run.generation_id) : ""));
  }
  document.getElementById("gameline").innerHTML = lines.join("<br>");
}

function renderDisclosure() {
  const run = (state.lab && state.lab.run) || {};
  const parts = ["<p><b>" + esc(LAB_SCOPE) + "</b></p>"];
  parts.push("<p>" + esc(LAB_ALPHA) + "</p>");
  parts.push("<p><b>" + esc(LAB_NOT_PICKS) + "</b></p>");
  if (run.disclosure) parts.push("<p>" + esc(run.disclosure) + "</p>");
  document.getElementById("disclosure").innerHTML = parts.join("");
}

function renderControls() {
  const seg = document.getElementById("density");
  seg.innerHTML = DENSITIES.map(function (pair) {
    return '<button type="button" data-density="' + esc(pair[0]) +
      '" class="' + (state.density === pair[0] ? "on" : "") +
      '" aria-pressed="' + (state.density === pair[0]) + '">' +
      esc(pair[1]) + "</button>";
  }).join("");
}

function players() {
  return (state.lab && state.lab.players) || [];
}

function selected() {
  const all = players();
  if (!all.length) return null;
  for (let i = 0; i < all.length; i += 1) {
    if (all[i].player_id === state.selected) return all[i];
  }
  return all[0];
}

function renderRoster() {
  const all = players();
  const groups = {};
  all.forEach(function (player) {
    const pos = String(player.pos || "").toUpperCase() || "—";
    (groups[pos] = groups[pos] || []).push(player);
  });
  const order = POS_ORDER.filter(function (pos) { return groups[pos]; })
    .concat(Object.keys(groups).filter(function (pos) {
      return POS_ORDER.indexOf(pos) === -1;
    }).sort());
  const here = selected();
  const parts = order.map(function (pos) {
    const rows = groups[pos].map(function (player) {
      const on = here && player.player_id === here.player_id;
      return '<button type="button" class="who' + (on ? " on" : "") +
        '" data-player="' + esc(player.player_id) + '"' +
        (on ? ' aria-current="true"' : "") + '>' +
        '<span class="nm">' + esc(player.name) + "</span>" +
        '<span class="tm">' + esc(player.team) + "</span></button>";
    }).join("");
    return '<section class="posgroup"><div class="poshead">' +
      esc(pos) + "</div>" + rows + "</section>";
  });
  document.getElementById("roster").innerHTML = parts.join("");
}

/* Every stat the exporter carried a number for, one row each: the
 * mean, the five points of its range, and what moved since the week
 * opened. A stat this player has neither a mean nor a range for is not
 * a result and is not a row. */
function resultsTable(player) {
  const rows = STATS.filter(function (stat) {
    const key = stat[1];
    return numberOrNull(player.proj[key]) !== null ||
      Array.isArray(player.stat_quantiles[key]);
  }).map(function (stat) {
    const label = stat[0];
    const key = stat[1];
    const places = stat[2];
    const grid = player.stat_quantiles[key];
    const cells = QUANTILE_COLUMNS.map(function (_name, index) {
      const value = Array.isArray(grid) ? grid[index] : null;
      return '<td class="q">' + esc(fmt(value, places)) + "</td>";
    }).join("");
    /* The strip is built FIRST, because whether there is one decides
     * how the numbers above it are ruled off: a stat and its strip are
     * one unit and share one divider, and a degenerate stat keeps the
     * divider it has always had. */
    const strip = likelinessRow(grid, player.proj[key]);
    return '<tr class="statrow' + (strip ? " withlike" : "") +
      '"><th scope="row">' + esc(label) + "</th>" +
      '<td class="mean">' + esc(fmt(player.proj[key], places)) +
      "</td>" + cells + movementCell(player, key, places) + "</tr>" +
      strip;
  }).join("");
  if (!rows) {
    return '<p class="tnote">' +
      esc("This generation carried no projected stat for him.") + "</p>";
  }
  return '<div class="tscroll"><table>' +
    "<thead><tr><th>Stat</th><th>Mean</th>" +
    QUANTILE_COLUMNS.map(function (name) {
      return "<th>" + esc(name) + "</th>";
    }).join("") +
    "<th>Moved</th></tr></thead><tbody>" + rows +
    "</tbody></table></div>";
}

/* L2 — THE LIKELINESS STRIP, the second row under a stat's numbers.
 *
 * The numeric columns are evenly spaced whatever the numbers say; this
 * strip is where the shape of the distribution becomes visible, because
 * it is drawn TO SCALE on the row's own axis: domain 0 → max(p90,
 * mean), with a small "0" anchoring the left end so it reads as an
 * axis rather than as decoration.
 *
 * DEGENERATE ROWS DRAW NOTHING, and that is the point of the guard
 * below rather than an accident of it. A missing grid, a non-numeric
 * point, no mean, an axis with nothing above zero, or p10 === p90 —
 * the Any TD row whose whole visible range is 0 — would all draw a
 * strip that asserts a spread the generation never produced. In every
 * one of those cases this returns "" and the stat row renders exactly
 * as it did before L2. A chance-of-at-least-one treatment for the
 * rare-event case is a separate iteration, not a mark placed here.
 *
 * The arithmetic is the file preamble's second carve-out: a division
 * by the row's own domain, per mark, to a percentage the stylesheet
 * positions with. No result of it is ever shown as a number. */
function likelinessRow(grid, mean) {
  if (!Array.isArray(grid)) return "";
  const at10 = numberOrNull(grid[0]);
  const at25 = numberOrNull(grid[1]);
  const at50 = numberOrNull(grid[2]);
  const at75 = numberOrNull(grid[3]);
  const at90 = numberOrNull(grid[4]);
  const centre = numberOrNull(mean);
  const points = [at10, at25, at50, at75, at90, centre];
  for (let i = 0; i < points.length; i += 1) {
    if (points[i] === null) return "";
  }
  if (at10 === at90) return "";
  const top = Math.max(at90, centre);
  if (!(top > 0)) return "";
  const span = at90 - at10;
  const core = at75 - at25;
  const cell = 1 + QUANTILE_COLUMNS.length + 1;
  return '<tr class="likerow"><th scope="row" class="likelab">' +
    esc(LIKELINESS_LABEL) + '</th><td class="likecell" colspan="' +
    cell + '"><div class="like"><span class="zero">0</span>' +
    '<span class="track">' +
    '<span class="span" style="left:' + axisShare(at10, top) +
    ';width:' + axisShare(span, top) + '"></span>' +
    '<span class="core" style="left:' + axisShare(at25, top) +
    ';width:' + axisShare(core, top) + '"></span>' +
    '<span class="tick" style="left:' + axisShare(at50, top) + '"></span>' +
    '<span class="dot" style="left:' + axisShare(centre, top) + '"></span>' +
    "</span></div></td></tr>";
}

/* One mark's place on one row's axis, as a CSS percentage: the stored
 * number over the row's domain, clamped so a mean above p90 cannot
 * push a mark off the end of the track it belongs to. Two decimals is
 * more than a phone can resolve and keeps the markup short. */
function axisShare(value, top) {
  const part = (value / top) * 100;
  const held = Math.min(100, Math.max(0, part));
  return held.toFixed(2) + "%";
}

function movementCell(player, key, places) {
  const moved = numberOrNull(player.movement[key]);
  const opened = numberOrNull(player.week_open[key]);
  if (moved === null) {
    return '<td class="mv flat" title="' +
      esc("no mean in the week's first generation, so there is " +
          "nothing to compare") + '">' + esc(BLANK) + "</td>";
  }
  /* Rounded FIRST, then signed: a move of -0.004 carries shown to one
   * decimal is not a fall, and "-0.0" would read as one. */
  const rounded = Number(moved.toFixed(places));
  const shown = (rounded > 0 ? "+" : "") +
    (rounded === 0 ? Math.abs(rounded) : rounded).toFixed(places);
  const family = rounded > 0 ? "up" : (rounded < 0 ? "dn" : "flat");
  const opening = opened === null ? BLANK : opened.toFixed(places);
  return '<td class="mv ' + family + '" title="' +
    esc("week open " + opening + " · " + MOVEMENT_NOTE) + '">' +
    esc(shown) + '<span class="mvsub">from ' + esc(opening) +
    "</span></td>";
}

/* The chain, in the order the projection is computed in. The labels
 * come off the file (the exporter ships `explain.ELEMENT_LABELS`), so
 * this page never invents wording for a column name. */
/* A MAPPING THE GENERATION STORED WHOLE, drawn as the small table it
 * is: `{profile: {bucket: rate}}`, one row per (profile, bucket).
 *
 * The chain's touchdown conversion is a rate PER FIELD-POSITION
 * BUCKET, applied as a mixture over a player's own bucket exposure, so
 * there is no single number that is "his rate" — collapsing these into
 * one figure would be arithmetic this page invented, which is the very
 * thing the persistence layer refused to do. They are league rates
 * (the pooled tag rides the row), and they are shown as what they are.
 *
 * Anything that is not a mapping of mappings returns "" and the caller
 * falls back to showing the stored text verbatim. */
function bucketTable(text) {
  let mapping;
  try {
    mapping = JSON.parse(text);
  } catch (err) {
    return "";
  }
  if (!mapping || typeof mapping !== "object" ||
      Array.isArray(mapping)) {
    return "";
  }
  const rows = [];
  Object.keys(mapping).forEach(function (profile) {
    const buckets = mapping[profile];
    if (!buckets || typeof buckets !== "object" ||
        Array.isArray(buckets)) {
      return;
    }
    Object.keys(buckets).forEach(function (bucket) {
      const rate = numberOrNull(buckets[bucket]);
      rows.push('<tr><th scope="row">' + esc(profile) + " · " +
        esc(bucket) + "</th><td>" +
        esc(rate === null ? BLANK : rate.toFixed(3)) + "</td></tr>");
    });
  });
  if (!rows.length) return "";
  return '<table class="buckets"><tbody>' + rows.join("") +
    "</tbody></table>";
}

/* ONE CELL, BOTH TABLES: the value the generation stored, or the
 * sentence saying which object it did not carry. A stored value may be
 * a number (most of the chain), or TEXT — an opponent, a kickoff, a
 * designation, or a whole mapping the generation stores whole rather
 * than collapsing into a scalar. Text is shown as it was stored; this
 * page does not re-format a value it did not compute. */
function valueCell(cell) {
  if (cell && cell.value !== null && cell.value !== undefined) {
    if (typeof cell.value === "number") {
      return '<td class="elval">' + esc(elementNumber(cell.value)) +
        "</td>";
    }
    const buckets = bucketTable(cell.value);
    if (buckets) return '<td class="elval">' + buckets + "</td>";
    return '<td class="elval eltext">' + esc(cell.value) + "</td>";
  }
  return '<td class="reason">' + esc(BLANK + " ") + "(" +
    esc((cell && cell.reason) || "") + ")</td>";
}

/* The circumstances, above the arithmetic: same row, same
 * value-or-reason idiom, same labels off the file. */
function contextTable(player) {
  const block = (state.lab && state.lab.context) || {};
  const order = block.order || [];
  const labels = block.labels || {};
  const rows = order.map(function (element) {
    const cell = (player.context || {})[element] || {};
    return '<tr class="elrow"><th scope="row">' +
      esc(labels[element] || element) + "</th>" + valueCell(cell) +
      "</tr>";
  }).join("");
  if (!rows) return "";
  return '<div class="tscroll"><table>' +
    "<thead><tr><th>Context</th><th>Value</th></tr></thead><tbody>" +
    rows + "</tbody></table></div>";
}

function elementsTable(player) {
  const block = (state.lab && state.lab.elements) || {};
  const order = block.order || [];
  const labels = block.labels || {};
  const pooled = block.pooled || [];
  const pooledLabel = block.pooled_label || "";
  const rows = order.map(function (element) {
    const cell = (player.elements || {})[element] || {};
    const tag = (pooled.indexOf(element) !== -1 && pooledLabel)
      ? '<span class="tag">' + esc(pooledLabel) + "</span>" : "";
    return '<tr class="elrow"><th scope="row">' +
      esc(labels[element] || element) + tag + "</th>" +
      valueCell(cell) + "</tr>";
  }).join("");
  const share = numberOrNull(player.p_ceiling);
  const probability = share === null ? "" :
    '<tr class="elrow probrow"><th scope="row">' + esc(P_CEILING_LABEL) +
    '<span class="tag prob">probability</span></th>' +
    '<td class="elval">' + esc(pct(share)) + "</td></tr>";
  const absent = block.generation_id ? "" :
    '<p class="tnote">' + esc(ELEMENTS_ABSENT) + " " +
    esc(block.absent_reason || "") + "</p>";
  return absent + '<div class="tscroll"><table>' +
    "<thead><tr><th>Element</th><th>Value</th></tr></thead><tbody>" +
    rows + probability + "</tbody></table></div>";
}

function renderDetail() {
  const player = selected();
  const empty = document.getElementById("empty");
  const detail = document.getElementById("detail");
  if (!player) {
    detail.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = "<b>" +
      esc(state.error ? "Nothing to show" : "No players in this file") +
      "</b>" + esc(state.error || LAB_NO_FILE);
    return;
  }
  empty.hidden = true;
  const meta = [esc(player.team), esc(player.pos)];
  if (player.n_draws) meta.push(esc(player.n_draws) + " draws");
  if (player.td_rates_pooled) {
    meta.push(esc("touchdown rates pooled"));
  }
  detail.innerHTML =
    '<section class="detail">' +
    '<div class="dname">' + esc(player.name) + "</div>" +
    '<div class="dmeta">' + meta.join(" · ") + "</div>" +
    '<div class="tsec"><div class="thead">All projected results</div>' +
    '<p class="tnote">' + esc(MOVEMENT_NOTE) + "</p>" +
    '<p class="tnote">' + esc(LIKELINESS_NOTE) + "</p>" +
    resultsTable(player) + "</div>" +
    '<div class="tsec"><div class="thead">The context</div>' +
    '<p class="tnote">' + esc(CONTEXT_NOTE) + "</p>" +
    contextTable(player) + "</div>" +
    '<div class="tsec"><div class="thead">The elements</div>' +
    '<p class="tnote">' + esc(CHAIN_NOTE) + "</p>" +
    elementsTable(player) + "</div></section>";
}

function renderFoot() {
  const run = (state.lab && state.lab.run) || {};
  const parts = [];
  const provenance = [];
  if (run.engine_version) {
    provenance.push("engine <b>" + esc(run.engine_version) + "</b>");
  }
  if (run.generation_id) {
    provenance.push("generation <b>" + esc(run.generation_id) + "</b>");
  }
  if (run.week_open_generation_id) {
    provenance.push("week open <b>" +
      esc(run.week_open_generation_id) + "</b>");
  }
  if (state.lab && state.lab.lab_schema) {
    provenance.push("schema <b>" + esc(state.lab.lab_schema) + "</b>");
  }
  if (provenance.length) parts.push("<p>" + provenance.join(" · ") + "</p>");
  parts.push("<p>" + esc(LAB_PUBLIC_EXPOSURE) + "</p>");
  parts.push("<p>" + esc(LAB_NOT_PICKS) + "</p>");
  parts.push("<p>" + esc(LAB_IN_PROGRESS) + "</p>");
  document.getElementById("foot").innerHTML = parts.join("");
}

function render() {
  BODY.dataset.density = state.density;
  renderBanners();
  renderHeader();
  renderDisclosure();
  renderControls();
  renderRoster();
  renderDetail();
  renderFoot();
}

/* ------------------------------------------------------------------
 * the two controls this page has
 * ------------------------------------------------------------------ */

document.addEventListener("click", function (event) {
  const who = event.target.closest ? event.target.closest(".who") : null;
  if (who && who.dataset.player) {
    state.selected = who.dataset.player;
    render();
    return;
  }
  const button = event.target.closest
    ? event.target.closest("#density button") : null;
  if (button && button.dataset.density) {
    state.density = button.dataset.density;
    render();
  }
});

/* ------------------------------------------------------------------
 * boot — two separate paths, and neither falls back to the other
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

/* Demo mode reads the bundled fixture and NOTHING else: it never
 * fetches the exported lab file, so demo numbers cannot mix with real
 * ones. The banner rides the whole time. */
async function bootDemo() {
  try {
    state.lab = await getJSON(DEMO_LAB_URL);
  } catch (err) {
    state.error = "The demo fixture could not be read (" +
      err.message + ").";
  }
  render();
}

async function bootLive() {
  try {
    state.lab = await getJSON(LAB_URL);
  } catch (err) {
    state.error = LAB_NO_FILE + " (" + err.message + ")";
  }
  render();
}

function boot() {
  render();
  if (state.demo) {
    bootDemo();
  } else {
    bootLive();
  }
}

boot();

/* Real compact-card providers. Sample modules never supply these records. */
(function (root) {
  "use strict";
  let h;
  let lastSync = null;
  const providers = new Map();
  const fresh = () => ({selected: null, form: null, error: "", errors: {},
    busy: false, receipt: null, conflict: false, legacyDraft: null, query: "", capabilities: null,
    playedOpen: false, playedAsked: false, playedFailed: false, played: null,
    playedCards: {},
    /* m4.10 S1/F1/F2 — the sort, the four filters and the rung the
     * reader last tapped. All of them live for the session only, like
     * the played section's open state; nothing about them is stored. */
    sort: "", pos: "", stat: "", game: "", day: "", rung: null});
  const state = fresh();
  const copy = value => JSON.parse(JSON.stringify(value));
  const esc = value => h.esc(value);
  const sideWord = side => side === "less" ? "Under" : "Over";
  const MARKET_WORDS = {player_receptions: 'receptions', player_reception_yds: 'receiving yards',
    player_rush_attempts: 'rushing attempts', player_rush_yds: 'rushing yards',
    player_pass_yds: 'passing yards', player_pass_tds: 'passing touchdowns',
    player_pass_attempts: 'passing attempts', player_pass_completions: 'passing completions',
    player_pass_interceptions: 'interceptions thrown', player_anytime_td: 'anytime touchdown'};
  function marketWord(value) {
    const words = MARKET_WORDS[value] || String(value || '').replace(/^player_/, '').replace(/_/g, ' ');
    return h.labelTitle && h.labelTitle(words) || words;
  }
  const chance = value => h.formatChance(value);
  const price = value => value == null ? "Not supplied" : (value > 0 ? "+" : "") + value;
  const button = (act, text, value, extra) => '<button data-act="ac-' + act + '"' +
    (value == null ? '' : ' data-value="' + esc(value) + '"') + (extra || '') + '>' + text + '</button>';
  const link = (route, title, note) => button('go', '<span>' + esc(title) + '</span><small>' + esc(note || '') + '</small><i aria-hidden="true">↗</i>', route, ' class="cx-link"');

  function configure(host) { h = host; return api; }
  function register(route, provider) { providers.set(route, provider); }
  function resetMember() {
    lastSync = null;
    const capabilities = state.capabilities;
    Object.assign(state, fresh(), {capabilities});
    new Set(providers.values()).forEach(p => { if (p.resetMember) p.resetMember(); });
  }
  function capability(id) {
    return state.capabilities && state.capabilities.capabilities.find(row => row.id === id);
  }
  function reason(id) {
    const row = capability(id);
    return row && row.reason || (row && row.status === 'ready'
      ? 'Open this feature to load its published data.'
      : 'Feature availability is not available from the service. Try again when connected.');
  }
  async function loadCapabilities() {
    if (h.isDemo() || !h.service()) return;
    state.capabilities = await h.service().capabilities();
    h.render();
  }
  function props() { return h.props().filter(row => row && row.id && row.prop && row.person); }

  /* m4.7 B1 — UPCOMING AND ALREADY PLAYED.
   *
   * The slate is exported once a week and holds the whole week, so a
   * Thursday game stays on it until the next export. The split is
   * therefore decided HERE, on every render, from the game's own
   * `kickoff` against the clock — a game moves from one section to the
   * other at kickoff without a reload and without a new export.
   *
   * A kickoff that is missing or does not parse counts as UPCOMING:
   * nothing in the file says that game has started, and the service's
   * own check is the backstop for a page that has it wrong.
   *
   * NOTHING IS CUT. Every prop the list yields is rendered; a played
   * one is rendered in the second section, quieter and with no way to
   * select it. */
  function kickoffOf(row) {
    const stamp = row && row.game && row.game.kickoff;
    if (!stamp) return null;
    const when = Date.parse(stamp);
    return Number.isFinite(when) ? when : null;
  }
  /* THE CLOCK IS A SEAM, not a global. The host supplies it and the
   * default is the real one; a test that pinned a date against
   * `Date.now` would pass until that date and then start lying about
   * what the code does. */
  function clock() { return h.now ? h.now() : Date.now(); }
  function started(row) {
    const when = kickoffOf(row);
    return when !== null && when <= clock();
  }

  /* m4.10 S1 — THE SORT.
   *
   * THREE ORDERS, AND NOT ONE OF THEM CUTS A ROW. The house rule is
   * "sorted, never cut" (D-177): this moves rows and it is the whole
   * of what it does. Two of the three keys are app.js's own
   * (`h.sortGap`, `h.sortChance`) because the blind-spot divider rule
   * reads them and there is one of that rule; the third is this page's
   * and is declared here.
   *
   * A ROW WITH NO VALUE FOR THE CHOSEN ORDER SORTS LAST, in name
   * order. An absent gap is not the smallest gap and an absent kickoff
   * is not the earliest one; neither is drawn as a zero. */
  const SORT_KICKOFF = 'kickoff';
  const SORT_LABEL = 'Sort';
  function sortKey() { return state.sort || h.sortGap; }
  function sorts() {
    return [[h.sortGap, 'Biggest gap'], [h.sortChance, 'Our chance'],
      [SORT_KICKOFF, 'Kickoff']];
  }
  function sortValue(row) {
    const key = sortKey();
    if (key === h.sortChance) return numberOr(row.prop.model_p);
    if (key === SORT_KICKOFF) return kickoffOf(row);
    return numberOr(row.prop.gap_pts);
  }
  function byName(one, two) {
    return String(one.row.person.name).localeCompare(String(two.row.person.name));
  }
  function ordered(entries) {
    const key = sortKey(), earliestFirst = key === SORT_KICKOFF;
    return entries.slice().sort(function (one, two) {
      const a = sortValue(one.row), b = sortValue(two.row);
      if (a === null || b === null) return a === b ? byName(one, two) : a === null ? 1 : -1;
      /* THE BAND COMES FIRST IN THE BIGGEST-GAP ORDER (UI_ALPHA_SPEC
       * §5), so every moderate gap sits above every blind-spot
       * candidate; inside a band the published gap orders them. The
       * other two views make no edge claim and are not re-banded. */
      if (key === h.sortGap) {
        const band = h.gapBand(one.row.prop) - h.gapBand(two.row.prop);
        if (band) return band;
      }
      return (earliestFirst ? a - b : b - a) || byName(one, two);
    });
  }
  /* The §5 divider, from app.js's own rule, told which view is being
   * drawn. It is an EXTRA node between two rows, never a row's
   * replacement. */
  function dividerAt(entries) {
    return h.blindSpotDividerAt(entries.map(entry => entry.row), sortKey());
  }

  /* m4.10 F1/F2 — THE FILTERS.
   *
   * A filter is THE READER'S OWN CHOICE and nothing else hides a prop:
   * with no filter set every prop the slate published is on the page.
   * Each active one is named on screen with a one-tap way out, and a
   * list a filter emptied says so rather than looking broken.
   *
   * Every value is read off the published row — `person.pos`,
   * `market_label`, the game's own teams, the game's own kickoff. */
  const POSITIONS = ['QB', 'RB', 'WR', 'TE'];
  const ALL_POS = 'All';
  const ALL_STATS = 'All stats';
  const ALL_GAMES = 'All games';
  const ALL_DAYS = 'All days';
  const POS_LABEL = 'Position';
  const STAT_LABEL = 'Stat';
  const GAME_LABEL = 'Game';
  const DAY_LABEL = 'Day';
  const FILTERS_ON = 'Showing only ';
  const CLEAR_FILTERS = 'Clear filters';
  const FILTERED_EMPTY = 'No lines match these filters.';
  const FILTER_FIELDS = ['pos', 'stat', 'game', 'day'];
  /* THE READER'S OWN WEEKDAY. `getDay` reads the local clock, which is
   * the clock the reader's Thursday night game is on. */
  const DAY_WORDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function dayOf(row) {
    const when = kickoffOf(row);
    return when === null ? '' : DAY_WORDS[new Date(when).getDay()];
  }
  function statOf(row) {
    const p = row.prop;
    return String(p.market_label || marketWord(p.market));
  }
  function gameWords(game) {
    return game && game.away && game.home ? game.away + ' at ' + game.home : '';
  }
  function gameOf(row) { return String((row.game && row.game.game_id) || gameWords(row.game)); }
  function filtersOn() { return FILTER_FIELDS.some(field => !!state[field]); }
  function keeps(row) {
    return (!state.pos || String(row.person.pos) === state.pos) &&
      (!state.stat || statOf(row) === state.stat) &&
      (!state.game || gameOf(row) === state.game) &&
      (!state.day || dayOf(row) === state.day);
  }
  /* The options a slate actually carries, in the order it carries
   * them, and each one once. A stat or a game nobody published is not
   * offered. */
  function optionsOf(rows, keyOf, wordsOf) {
    const out = [];
    rows.forEach(({row}) => {
      const key = keyOf(row);
      if (key && !out.some(option => option.key === key))
        out.push({key: key, words: wordsOf(row)});
    });
    return out;
  }
  function filterSelect(field, label, all, options) {
    const id = 'ac-filter-' + field;
    return '<label class="ac-field ac-filter" for="' + id + '">' + esc(label) +
      '<select id="' + id + '" data-ac-field="' + field + '">' +
      '<option value=""' + (state[field] ? '' : ' selected') + '>' + esc(all) + '</option>' +
      options.map(option => '<option value="' + esc(option.key) + '"' +
        (state[field] === option.key ? ' selected' : '') + '>' + esc(option.words) +
        '</option>').join('') + '</select></label>';
  }
  function chips(field, label, all, values) {
    return '<div class="seg ac-chips" role="group" aria-label="' + esc(label) + '">' +
      [[all, '']].concat(values.map(value => [value, value]))
        .map(([words, value]) => button(field, esc(words), value,
          ' aria-pressed="' + (state[field] === value) + '"')).join('') + '</div>';
  }
  function controls(rows) {
    const days = [];
    rows.forEach(({row}) => { const day = dayOf(row); if (day && days.indexOf(day) < 0) days.push(day); });
    return '<div class="ac-controls">' +
      '<div class="seg sortseg ac-sort" role="group" aria-label="' + esc(SORT_LABEL) + '">' +
      sorts().map(([key, words]) => button('sort', esc(words), key,
        ' aria-pressed="' + (sortKey() === key) + '"')).join('') + '</div>' +
      chips('pos', POS_LABEL, ALL_POS, POSITIONS) +
      /* The two selects share a row where there is room for one, and
       * stack where there is not, so the controls do not push the
       * first card off a small screen. */
      '<div class="ac-picks">' +
      filterSelect('stat', STAT_LABEL, ALL_STATS, optionsOf(rows, statOf, statOf)) +
      filterSelect('game', GAME_LABEL, ALL_GAMES, optionsOf(rows, gameOf, row => gameWords(row.game))) +
      '</div>' +
      chips('day', DAY_LABEL, ALL_DAYS, days) + activeFilters() + '</div>';
  }
  function filterWords() {
    return [state.pos, state.stat, state.game && gameLabelOf(state.game), state.day]
      .filter(Boolean).join(' · ');
  }
  function gameLabelOf(key) {
    const found = props().find(row => gameOf(row) === key);
    return found ? gameWords(found.game) : key;
  }
  function clearButton() {
    return button('clear-filters', esc(CLEAR_FILTERS), null, ' class="ac-clear"');
  }
  function activeFilters() {
    if (!filtersOn()) return '';
    return '<p class="ac-filters-on" role="status">' + esc(FILTERS_ON + filterWords()) +
      '</p>' + clearButton();
  }
  /* "Upcoming · 12 of 48": the filtered number against the number the
   * slate published for that section, and the plain count when nothing
   * is narrowing the list. */
  function countWords(shown, total) {
    return shown === total ? String(total) : shown + ' of ' + total;
  }

  /* m4.7 B3 — HOW A PLAYED LINE LANDED.
   *
   * The actuals are the ones the product already publishes: `GET
   * /history` joins the archived pre-kickoff generation with the same
   * banked final box score the grader settles against, so a number
   * here and a settled bet can never disagree. It is read ONCE per
   * page load, through the page's one door, and never polled.
   *
   * The side is the grader's own rule (`grades.outcome_of`): above the
   * line went Over, below it went Under, exactly on it is a push. That
   * is a comparison of two published numbers, not probability
   * arithmetic. */
  const PLAYED_PENDING = 'In progress';
  const PLAYED_NONE = 'No result recorded';
  /* A READ THAT HAS NOT ANSWERED IS NOT A GAME THAT IS STILL RUNNING.
   * Until the results read comes back — and if it fails — the page
   * cannot tell a finished line from a live one, so it says the one
   * thing that is true instead of guessing at "In progress". */
  const PLAYED_UNAVAILABLE = "Results aren't available right now.";
  function marketOf(row) {
    const raw = row && row.prop && row.prop.market;
    const key = root.AlphaService && root.AlphaService.marketKey(raw);
    return key || String(raw || '');
  }
  function playedIndex(answer) {
    const out = {};
    ((answer && answer.rows) || []).forEach(row => {
      const who = String((row && row.player_id) || '');
      if (!who) return;
      const held = out[who] || (out[who] = {stats: {}, awaiting: false});
      held.stats[String(row.stat)] = row;
      if (row.status === 'awaiting') held.awaiting = true;
    });
    return out;
  }
  function playedResult(row) {
    const index = state.played;
    if (!index) return {state: 'unknown'};
    const person = index[String(row.id)];
    if (!person) return {state: 'pending'};
    const mine = person.stats[marketOf(row)];
    const actual = mine ? Number(mine.actual) : null;
    if (mine && mine.status === 'final' && mine.actual !== null && Number.isFinite(actual))
      return {state: 'result', actual: actual};
    if (person.awaiting) return {state: 'pending'};
    return {state: 'none'};
  }
  const plainNumber = value => String(Math.round(Number(value) * 100) / 100);
  function playedWords(row) {
    const found = playedResult(row), p = row.prop;
    if (found.state === 'unknown') return PLAYED_UNAVAILABLE;
    if (found.state === 'pending') return PLAYED_PENDING;
    if (found.state === 'none') return PLAYED_NONE;
    const line = Number(p.line);
    // No line to compare against is no result, never a guessed push.
    if (!Number.isFinite(line)) return PLAYED_NONE;
    const said = marketWord(p.market_label || p.market);
    // The result stands on its own line, so it opens like a sentence.
    const word = said.charAt(0).toUpperCase() + said.slice(1);
    const landed = found.actual > line ? 'went Over'
      : found.actual < line ? 'went Under' : 'landed on the line · push';
    return word + ' ' + p.line + ' → ' + plainNumber(found.actual) + ' · ' + landed;
  }
  /* m4.7 B4 — TAP A PLAYED CARD TO SEE OUR PROJECTION AGAINST IT
   * (owner, 2026-09-26, D-185).
   *
   * Everything below reads the SAME `/history` answer the section
   * already loaded. There is no second request, no new endpoint and
   * no arithmetic beyond two declared display rules: the rounding
   * these numbers are shown at, and whether the final sits between
   * the two published ends of the range. Both are comparisons of
   * numbers the service published; neither derives a probability.
   *
   * A played card still cannot be selected and still has no bet
   * control. It opens, and that is all it does. */

  /* THE ROUNDING, DECLARED, AND THERE IS ONLY ONE OF IT. The archive
   * publishes means to many places and nobody reads "231.37 passing
   * yards" as a projection, so a number is shown to one decimal, as a
   * whole number when the decimal is zero.
   *
   * `shown` IS THE NUMBER AND `tidy` IS ITS TEXT, and everything that
   * compares these values compares what `shown` returns. A card that
   * rounded 4.96 to "5" for the reader and then judged an actual of 5
   * against 4.96 said "likely 2–5" and "outside our range" one line
   * apart (PR #425). The two cannot diverge while there is one
   * helper and the comparison uses it. */
  function shown(value) {
    const number = Math.round(Number(value) * 10) / 10;
    return Number.isFinite(number) ? number : null;
  }
  function tidy(value) {
    const number = shown(value);
    return number === null ? '' : String(number);
  }
  function playedStats(row) {
    const person = state.played && state.played[String(row.id)];
    return person ? person.stats : null;
  }
  function statWordOf(hrow) {
    return String((hrow && hrow.stat_word) || marketWord(hrow && hrow.stat) || '');
  }
  /* `Number(null)` IS ZERO, and the service says "no number" with a
   * null: `history.quantiles_of_row` returns `{p10: null, p90: null}`
   * for a stat whose generation stored no draws. Coerced, that prints
   * a range of 0 to 0 — a published range, invented. Absent is
   * absent, and it is checked before anything is coerced. */
  function numberOr(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  function forecastOf(hrow) {
    const held = hrow && hrow.forecast;
    if (!held) return null;
    return {mean: numberOr(held.mean), lo: numberOr(held.p10),
      hi: numberOr(held.p90)};
  }
  function finalActual(hrow) {
    if (!hrow || hrow.status !== 'final') return null;
    return numberOr(hrow.actual);
  }
  /* "We projected 231 passing yards (likely 180–285)." A published
   * middle with no published ends says the middle and nothing about
   * a range, rather than inventing one. */
  function projectionWords(hrow) {
    const found = forecastOf(hrow);
    if (!found || found.mean === null) return '';
    const range = found.lo !== null && found.hi !== null
      ? ' (likely ' + tidy(found.lo) + '–' + tidy(found.hi) + ')' : '';
    return 'We projected ' + tidy(found.mean) + ' ' + statWordOf(hrow) + range + '.';
  }
  /* THE WITHIN-RANGE TEST ITSELF, in one place, on the numbers the
   * reader is shown. `'inside'`, `'above'` or `'below'`, and null when
   * either end or the value is absent — which is not a verdict and is
   * never drawn as one. m4.9's chart dots and live cells colour by
   * this, and the sentence below reads it, so a colour and a sentence
   * about the same game cannot disagree. */
  function rangeSide(low, high, value) {
    /* ABSENT FIRST, COERCED SECOND. `Number(null)` is zero, so an end
     * that was never published has to be refused before any rounding
     * touches it — `numberOr` is that refusal. */
    if (numberOr(low) === null || numberOr(high) === null ||
        numberOr(value) === null) return null;
    const lo = shown(low), hi = shown(high), landed = shown(value);
    if (lo === null || hi === null || landed === null) return null;
    if (landed > hi) return 'above';
    if (landed < lo) return 'below';
    return 'inside';
  }
  /* ONE FACTUAL SENTENCE, and only when there is a range AND a final
   * to hold against it. It is a statement about this one line; there
   * is no count of them anywhere and never will be here. */
  function rangeWords(hrow) {
    const found = forecastOf(hrow);
    if (!found) return '';
    const side = rangeSide(found.lo, found.hi, finalActual(hrow));
    if (side === null) return '';
    return side === 'inside'
      ? 'That landed inside our range.' : 'That landed outside our range.';
  }
  const PLAYED_AWAITING = 'The result arrives after the final whistle.';

  async function loadPlayed() {
    if (h.isDemo() || state.playedAsked || !h.request || !h.week) return;
    const week = h.week();
    if (!week) return;
    state.playedAsked = true;
    try {
      state.played = playedIndex(await h.request('/history?season=' +
        encodeURIComponent(week.season) + '&week=' + encodeURIComponent(week.week),
        h.readToken() || '', null));
    } catch (err) {
      /* THE FAILURE IS REMEMBERED, so the page neither pretends the
       * read is still coming nor asks again on every render. The next
       * expand, or the next visit to this page, asks once more. */
      state.played = null; state.playedFailed = true;
    }
    h.render();
  }

  function quoteFor(prop) {
    const side = prop.lean === 'less' ? 'less' : 'more';
    const odds = Array.isArray(prop.odds) ? Number(prop.odds[side === 'less' ? 1 : 0]) : null;
    return { line: prop.line, side, odds: Number.isInteger(odds) && Math.abs(odds) >= 100 ? odds : null,
      book: prop.book || null, odds_snapshot_ts: prop.odds_snapshot_ts || null };
  }
  function quoteTime(value) {
    if (!value) return 'Capture time unavailable';
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
      : 'Capture time unavailable';
  }
  function quoteText(quote) {
    return (quote.book || 'Book unavailable') + ' · ' +
      (quote.odds == null ? 'Odds unavailable' : price(quote.odds)) + ' · ' + quoteTime(quote.odds_snapshot_ts);
  }
  function select(index) {
    const row = props()[Number(index)];
    /* A played line is not a bet you can still take, whatever the
     * page was showing when it was tapped. */
    if (!row || started(row)) return;
    const quote = quoteFor(row.prop);
    state.selected = {id: row.id, market: row.prop.market};
    state.form = {player_id: row.id, player_text: row.person.name,
      /* m4.7 B2 — the leg carries the game it was offered on, so the
       * service never has to infer it from a team and a clock. */
      game_id: (row.game && row.game.game_id) || null,
      market: row.prop.market, line_screened: row.prop.line,
      side: quote.side, quote,
      line: String(row.prop.line == null ? '' : row.prop.line),
      odds: quote.odds == null ? '' : String(quote.odds), book: quote.book || '', stake: ''};
    state.errors = {}; state.error = ''; state.receipt = null; state.conflict = false; state.legacyDraft = null;
    /* m4.10 C3 — a newly opened card starts on its own main line, not
     * on the rung the last card was left showing. */
    state.rung = null;
  }
  function selectedRow() {
    return state.selected && props().find(row => row.id === state.selected.id && row.prop.market === state.selected.market);
  }
  function selectedChance() {
    const row = selectedRow(), form = state.form;
    if (!row || !form || !String(form.line).trim()) return null;
    const line = Number(form.line), prop = row.prop;
    const rung = (prop.alt_ladder || []).find(r => r.line === line);
    const value = rung ? (form.side === 'less' ? rung.p_less : rung.p_more)
      : line === prop.line && form.side === prop.lean ? prop.model_p : null;
    return Number.isFinite(value) ? value : null;
  }
  function input(field, value) {
    if (field === 'query') { state.query = value; return; }
    /* m4.10 F1/F2 — a filter takes effect as soon as it is chosen, and
     * a re-choice of the same value is not a change to redraw for. */
    if (FILTER_FIELDS.includes(field)) {
      const next = String(value == null ? '' : value);
      if (state[field] === next) return;
      state[field] = next; h.render(); return;
    }
    if (!['side','line','odds','book','stake'].includes(field)) {
      const provider = providers.get(h.route());
      if (provider && provider.input) provider.input(field, value, h);
      return;
    }
    if (!state.form) return;
    state.form[field] = value;
    delete state.errors[field];
    state.receipt = null;
    const node = root.document && root.document.getElementById('ac-selected-chance');
    if (node) node.textContent = chance(selectedChance());
  }
  function validate() {
    const f = state.form, errors = {};
    if (!f) return {form: 'Choose a player line first.'};
    if (!['more','less'].includes(f.side)) errors.side = 'Choose Over or Under.';
    if (!String(f.line).trim() || !Number.isFinite(Number(f.line)) || Number(f.line) < 0)
      errors.line = 'Enter your exact line as a number of zero or more.';
    if (!String(f.odds).trim() || !Number.isInteger(Number(f.odds)) || Math.abs(Number(f.odds)) < 100)
      errors.odds = 'Enter American odds of +100 or higher, or -100 or lower.';
    if (!f.book.trim() || f.book.trim().length > 40) errors.book = 'Enter the book name, up to 40 characters.';
    if (String(f.stake).trim() && (!Number.isFinite(Number(f.stake)) || Number(f.stake) <= 0 || Number(f.stake) > 1000000))
      errors.stake = 'Enter a stake greater than zero and no more than 1,000,000.';
    return errors;
  }
  function draft() {
    const f = state.form;
    return {source: f.book.trim(), input: 'manual', stake: String(f.stake).trim() ? Number(f.stake) : null,
      legs: [{player_id: f.player_id, player_text: f.player_text, market: f.market,
        game_id: f.game_id, side: f.side,
        line_placed: Number(f.line), line_screened: f.line_screened,
        odds_american: Number(f.odds), book: f.book.trim(), odds_source: 'personal'}]};
  }
  function pending() { return !h.isDemo() && h.service() ? h.service().pendingSlip() : null; }
  function signature(payload) {
    const clean = root.AlphaService.slipPayload(payload); delete clean.contract;
    const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
      ? Object.keys(value).sort().reduce((out, key) => {out[key] = stable(value[key]); return out;}, {}) : value;
    return JSON.stringify(stable(clean));
  }
  function reviewDraft(payload) {
    const previous = pending();
    if (previous && signature(previous.payload) !== signature(payload)) {
      state.legacyDraft = copy(payload); state.conflict = true; state.receipt = null;
      return false;
    }
    state.legacyDraft = null; state.conflict = false;
    return true;
  }
  async function send(payload, allowNew) {
    const token = h.readToken();
    if (!token) { h.connect(); return; }
    const started = h.snapshot();
    state.busy = true; state.error = ''; state.conflict = false; h.render();
    try {
      if (!h.identityReady()) await h.loadMe(token);
      if (!h.current(started)) return;
      if (!h.identityReady()) { state.error = 'Connect your account before recording this bet.'; return; }
      const previous = pending();
      if (previous && signature(previous.payload) !== signature(payload) && !allowNew) {
        state.conflict = true; return;
      }
      const receipt = await h.service().saveSlip(payload);
      if (!h.current(started) || !receipt) return;
      state.receipt = receipt; state.conflict = false;
      if (h.route() === 'track' && h.nav.track) h.nav.track.saved = receipt;
      // The returned receipt is immediately visible while GET /slips refreshes.
      h.nav.slips = [receipt].concat((h.nav.slips || []).filter(row => row.slip_id !== receipt.slip_id));
      await h.loadPicks(true);
    } catch (err) {
      if (h.current(started)) state.error = h.note(err);
    } finally {
      if (h.current(started)) {
        state.busy = false; h.render();
        if (state.error) focus('ac-error');
      }
    }
  }
  async function save(allowNew) {
    if (h.isDemo() || state.busy) return;
    // Reconcile cross-tab credential changes before reading this member's draft.
    h.readToken();
    state.errors = validate();
    if (Object.keys(state.errors).length) {h.render(); focus('ac-error'); return;}
    const clicked = copy(draft());
    return send(clicked, allowNew === true);
  }
  async function retry() {
    if (h.isDemo() || state.busy) return;
    const previous = pending();
    if (previous) return send(copy(previous.payload), false);
  }
  function focus(id) {
    const node = root.document && root.document.getElementById(id);
    if (node && node.focus) node.focus({preventScroll: true});
  }
  function recovery() {
    const previous = pending();
    if (!previous || state.receipt) return '';
    const legs = previous.payload.legs || [];
    return '<section class="ac-recovery" role="status"><h2>Check your last save</h2><p>The last request may already have been recorded. Retry its exact terms to recover the same bet.</p>' +
      legs.map(l => '<p>' + esc(l.player_text || l.player_id) + ' · ' + esc(sideWord(l.side) + ' ' + l.line_placed + ' ' + marketWord(l.market)) + ' · ' + esc(price(l.odds_american)) + ' · ' + esc(l.book) + '</p>').join('') +
      button('retry', 'Retry original save', null, state.busy ? ' disabled' : '') +
      (state.conflict ? '<p>You edited the terms. Saving them creates a separate bet; it does not replace the earlier request.</p>' +
        button('new-intent', 'Record edited terms as a separate bet', null, state.busy ? ' disabled' : '') : '') + '</section>';
  }
  function field(key, label, type, extra) {
    const f = state.form, error = state.errors[key];
    return '<label class="ac-field" for="ac-' + key + '">' + label + '<input id="ac-' + key + '" data-ac-field="' + key + '" type="' + (type || 'text') +
      '" value="' + esc(f[key]) + '" aria-invalid="' + !!error + '" aria-describedby="ac-' + key + '-error"' + (extra || '') + '>' +
      '<span id="ac-' + key + '-error" class="ac-field-error">' + esc(error || '') + '</span></label>';
  }
  function form() {
    if (!state.form) return '';
    const f = state.form;
    return '<section class="ac-record" aria-label="Record exact personal terms"><h2>Your terms</h2><p>Saved here. Real bets are placed elsewhere.</p>' +
      '<p class="ac-quote">Starting quote · ' + esc(sideWord(f.quote.side) + ' ' + f.quote.line + ' ' + marketWord(f.market)) +
      ' · ' + esc(quoteText(f.quote)) + '</p><p>Change these fields to match the offer you have. Your terms stay separate from the starting quote.</p>' +
      '<div class="ef-edit"><label class="ac-field" for="ac-side">Your side<select id="ac-side" data-ac-field="side"><option value="more"' + (f.side === 'more' ? ' selected' : '') + '>Over</option><option value="less"' + (f.side === 'less' ? ' selected' : '') + '>Under</option></select></label>' +
      field('line', 'Your line', 'text', ' inputmode="decimal"') + field('odds', 'Your American odds', 'text', ' inputmode="text"') +
      field('book', 'Your book', 'text', ' maxlength="40"') + field('stake', 'Your stake (optional)', 'text', ' inputmode="decimal"') + '</div>' +
      '<p>Published chance at your side and line: <strong id="ac-selected-chance">' + chance(selectedChance()) + '</strong>. Your odds do not change this chance.</p>' +
      '<p class="ef-caption">A dash means this side and line has no published chance. The service supplies the saved chance.</p>' +
      '<div id="ac-error" class="ac-error" role="alert" tabindex="-1">' + esc(state.error || Object.values(state.errors)[0] || '') + '</div>' + recovery() +
      (state.receipt ? receipt(state.receipt) + button('another', 'Record another line', null, ' class="ghost"') :
        button('save', state.busy ? 'Recording…' : 'Record bet', null, ' class="ef-primary"' + (state.busy ? ' disabled' : ''))) +
      button('read', 'Add an optional angle', null, ' class="ghost"') + '</section>';
  }
  /* ANGLES_A1_SPEC §4.3 — THE OUTLOOK, WHERE THE BET IS.
   * The block the read sheet draws on save is the block this card
   * draws afterwards: one component, `h.angleOutlook`, and one match,
   * `h.scenarioMatches`. A line the angle moved that this card is not
   * standing on gets the marker instead, which expands to the same
   * block rather than to a different rendering of it. */
  function outlook(terms) {
    const exact = (h.nav.scenarios || []).filter(row => h.scenarioMatches(row, terms));
    if (exact.length) return exact.map(row => h.angleOutlook(row, true)).join('');
    const touched = (h.scenariosOf(terms.player_id) || []);
    if (!touched.length) return '';
    return '<details class="anglemarker"><summary>' + esc(h.angleMarker) + '</summary>' +
      touched.map(row => h.angleOutlook(row, true)).join('') + '</details>';
  }
  /* m4.10 C1 — THE RANGE AGAINST THE LINE.
   *
   * The drawing is app.js's own `shapeFor`: the outcome histogram for a
   * market that publishes P(k), the quantile range bar for a measured
   * one, and on whichever it drew, the line's own dashed marker on the
   * same scale (the range bar widens that scale to hold a line outside
   * the published ends, the way m4.9's live dot does). Nothing is
   * re-drawn here; what this adds is the caption, in words, and the
   * line's own label.
   *
   * ABSENCE IS NOT ZERO. With neither `distribution` nor
   * `floor_median_ceiling` the renderer returns nothing and so does
   * this — no empty track, no zero-width bar, no 0%. Where the
   * exporter said why, that one line stands in its place. */
  const RANGE_HEAD = 'Likely range';
  const OUTCOMES_HEAD = 'Likely outcomes';
  const LINE_HEAD = 'Line ';
  /* THE CARD HAS A WHOLE ROW, so it asks for the drawing at a width
   * that fills one and the CSS scales it to whatever the phone is. The
   * pre-alpha Screen asks for nothing and gets the drawing it always
   * got. */
  const SHAPE_W = 288;
  function shapeBlock(p) {
    const drawn = h.shapeFor(p, false, SHAPE_W);
    if (!drawn) {
      const why = p.distribution_reason;
      return why ? '<p class="ef-caption">' + esc(h.plainNote(why)) + '</p>' : '';
    }
    const ends = h.rangeEndsText(p);
    const said = p.distribution ? OUTCOMES_HEAD : RANGE_HEAD + (ends ? ' · ' + ends : '');
    /* THE LINE'S LABEL SITS OVER ITS OWN MARK, at the share the mark
     * itself was drawn at. Against either end it is anchored inwards so
     * it stays inside the card rather than hanging off it. */
    const share = h.shapeLineShare(p);
    const at = share === null ? null : Math.max(0, Math.min(1, share)) * 100;
    const anchor = at === null ? '' : at <= 12 ? ' at-start' : at >= 88 ? ' at-end' : '';
    return '<div class="ac-shape"><span class="ef-caption">' + esc(said) + '</span>' +
      '<span class="ac-shape-plot">' +
      (at === null ? '' : '<span class="ac-shape-line' + anchor + '" style="left:' +
        at.toFixed(2) + '%">' + esc(LINE_HEAD + p.line) + '</span>') +
      drawn + '</span></div>';
  }

  /* m4.10 C2 — US AGAINST THE MARKET.
   *
   * Two of app.js's own probability bars — ours with the band the
   * exporter published for it, the book's with the book's own name —
   * and under them the gap's words, from the one `gapText` there is,
   * tinted only where the one `isEdge` there is says so. The headline
   * chance above them is unchanged: these sit under it.
   *
   * A LINE WITH NO BOOK PRICE DRAWS ONE BAR and says why, rather than
   * a second bar at nought. */
  const OUR_CHANCE = 'Our chance';
  const BOOK_CHANCE = "Book's chance";
  const NO_BOOK_PRICE = 'No book price was captured for this line.';
  function chanceBlock(p) {
    return '<div class="ac-chances">' +
      h.probBar(OUR_CHANCE, p.model_p, p.model_band || null) +
      (numberOr(p.market_p_novig) === null
        ? '<p class="ef-caption">' + esc(NO_BOOK_PRICE) + '</p>'
        : h.probBar(BOOK_CHANCE, p.market_p_novig, null, p.book || '')) +
      '<span class="gapline ' + (h.isEdge(p) ? 'positive' : 'absent') + '">' +
      esc(h.gapText(p)) + '</span>' +
      /* THE ADMISSION RIDES EVERY SORT, because it is about this line
       * and not about the order the list happens to be in. */
      (h.isBlindSpot(p) ? '<span class="blindnote">' + esc(h.blindSpotNote) + '</span>' : '') +
      '</div>';
  }

  /* m4.10 C3 — THE CHANCE AT OTHER LINES, inside an opened card.
   *
   * The rungs the exporter published, and only those: a line through
   * the points and a mark on each, with the main line's own rung
   * named. THERE IS NO INTERPOLATION — `h.rungAt` looks a rung up, and
   * a line nobody read carries no number here (UI_ALPHA_SPEC §4).
   *
   * Tapping a rung SAYS what that rung is. It does not touch the bet
   * form's line: the form keeps its own field and its own behaviour,
   * because the reader's terms are his and not a chart's. */
  const LADDER_HEAD = 'Chance at other lines';
  const LADDER_MIN = 3;
  /* THE CHART'S OWN FRAME. The plot sits inside it with a gutter on
   * the left for the two chance labels and two rows underneath: the
   * main line's own value under its mark, and the lowest and highest
   * line the exporter quoted at the ends. Without them a reader has a
   * shape and no way to say what any point on it is. */
  const LADDER_W = 288, LADDER_H = 118;
  const PLOT_L = 34, PLOT_R = 282, PLOT_T = 10, PLOT_B = 82;
  /* The two gridlines, as published chances rather than as decoration:
   * a quarter and three quarters of the 0-to-100 scale the curve is
   * drawn on. */
  const LADDER_GRID = [0.25, 0.75];
  function ladderSide(p) { return p.lean === 'less' ? 'less' : 'more'; }
  function rungs(p) {
    const side = ladderSide(p);
    return ((p && p.alt_ladder) || []).map(rung => ({
      line: numberOr(rung.line), chance: numberOr(h.rungChance(rung, side))}))
      .filter(point => point.line !== null && point.chance !== null);
  }
  function rungWords(p, line) {
    const found = h.rungAt(p, line);
    const value = numberOr(h.rungChance(found, ladderSide(p)));
    if (value === null) return '';
    return 'At ' + line + ', our chance of ' + sideWord(p.lean) + ' is ' + chance(value) + '.';
  }
  function ladderBlock(p) {
    const points = rungs(p);
    if (points.length < LADDER_MIN) {
      const why = p.ladder_reason;
      return why ? '<p class="ef-caption">' + esc(h.plainNote(why)) + '</p>' : '';
    }
    const lines = points.map(point => point.line);
    const lo = Math.min.apply(null, lines), hi = Math.max.apply(null, lines);
    const span = (hi - lo) || 1;
    /* GEOMETRY, AND ONLY GEOMETRY: a published line and a published
     * chance placed on a scale. It produces no quantity. */
    const x = value => (((value - lo) / span) * (PLOT_R - PLOT_L) + PLOT_L);
    const y = value => PLOT_B - Math.max(0, Math.min(1, value)) * (PLOT_B - PLOT_T);
    const at = state.rung !== null && h.rungAt(p, state.rung) ? state.rung
      : h.rungAt(p, p.line) ? p.line : points[0].line;
    const said = rungWords(p, at);
    const main = h.rungAt(p, p.line) ? p.line : null;
    const text = (place, value, anchor, words) =>
      '<text x="' + place.toFixed(1) + '" y="' + value + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(words) + '</text>';
    return '<section class="ac-ladder"><h3>' + esc(LADDER_HEAD) + '</h3>' +
      '<div class="ac-ladder-chart"><svg viewBox="0 0 ' + LADDER_W + ' ' + LADDER_H +
      '" role="img" aria-label="' + esc(LADDER_HEAD + ': ' + points.map(point =>
        point.line + ' ' + chance(point.chance)).join(', ') + '. Main line ' + p.line) + '">' +
      /* The two gridlines and what each one is, said as a chance. */
      LADDER_GRID.map(mark => '<line class="ac-ladder-grid" x1="' + PLOT_L + '" y1="' +
        y(mark).toFixed(1) + '" x2="' + PLOT_R + '" y2="' + y(mark).toFixed(1) + '"></line>' +
        '<text class="ac-ladder-axis" x="' + (PLOT_L - 6) + '" y="' + (y(mark) + 3).toFixed(1) +
        '" text-anchor="end">' + esc(chance(mark)) + '</text>').join('') +
      /* The main line's own mark carries the same dashed marker the
       * card's range above it uses, so the two read as one line. */
      (main === null ? '' : '<line class="ac-ladder-main-mark" x1="' + x(main).toFixed(1) +
        '" y1="' + PLOT_T + '" x2="' + x(main).toFixed(1) + '" y2="' + PLOT_B + '"></line>') +
      '<polyline class="ac-ladder-curve" points="' + points.map(point =>
        x(point.line).toFixed(1) + ',' + y(point.chance).toFixed(1)).join(' ') + '"></polyline>' +
      /* A DENSE LADDER GETS SMALLER MARKS. Forty rungs at the size
       * three would carry cover the curve they are on; the two marks
       * that name something — the main line and the tapped rung —
       * keep their size whatever the crowd around them. */
      points.map(point => '<circle class="ac-ladder-dot' +
        (point.line === p.line ? ' main' : '') + (point.line === at ? ' chosen' : '') +
        '" cx="' + x(point.line).toFixed(1) + '" cy="' + y(point.chance).toFixed(1) +
        '" r="' + (point.line === p.line || point.line === at ? 4
          : points.length > 20 ? 1.2 : 2.5) + '"></circle>').join('') +
      '<g class="ac-ladder-axis">' +
      (main === null ? '' : text(Math.min(PLOT_R - 12, Math.max(PLOT_L + 12, x(main))),
        PLOT_B + 14, 'middle', String(main))) +
      text(PLOT_L, LADDER_H - 4, 'start', String(lo)) +
      text(PLOT_R, LADDER_H - 4, 'end', String(hi)) + '</g>' +
      '</svg>' +
      /* THE TAPS ARE REAL BUTTONS over the drawing, the way the
       * outlook history chart's are. Only the main line's holds a
       * keyboard stop: forty of them would bury the rest of the card,
       * and the chart's own label already speaks every rung. */
      points.map(point => '<button class="ac-ladder-mark" data-act="ac-rung" data-value="' +
        esc(point.line) + '"' + (point.line === p.line ? '' : ' tabindex="-1"') +
        ' aria-pressed="' + (point.line === at) + '" style="left:' +
        (x(point.line) / LADDER_W * 100).toFixed(2) + '%" aria-label="' +
        esc(rungWords(p, point.line)) + '"></button>').join('') + '</div>' +
      (said ? '<p class="ac-ladder-said" id="ac-ladder-said">' + esc(said) + '</p>' : '') +
      '</section>';
  }

  function card(row, index) {
    const p = row.prop, open = state.selected && state.selected.id === row.id && state.selected.market === p.market;
    const quote = quoteFor(p);
    return '<article class="ef-card" data-player-id="' + esc(row.id) + '"><button class="ef-card-toggle" data-act="ac-select" data-value="' + index + '" aria-expanded="' + !!open + '" aria-controls="ac-body-' + index + '">' +
      '<span class="ef-card-name">' + esc(row.person.name) + '</span><span class="ef-card-line">' + esc(sideWord(p.lean) + ' ' + p.line + ' ' + marketWord(p.market_label || p.market)) + '</span>' +
      '<span class="ac-quote">Starting quote · ' + esc(quoteText(quote)) + '</span>' +
      '<span class="ef-card-rating"><span class="ef-assessment">Published estimate</span><span class="ef-card-chance"><strong>' + chance(p.model_p) + '</strong><small>Estimated chance</small></span></span>' +
      '<span class="ef-market-context"><span class="ac-team-pill">' + esc(row.person.team) + '</span><span>' + esc(row.game.away + ' at ' + row.game.home) + '</span></span></button>' +
      /* m4.10 C1/C2 — the visuals sit OUTSIDE the toggle, so the card's
       * tap target stays the card's own face and a chart is never a
       * button's label. */
      '<div class="ac-visuals">' + shapeBlock(p) + chanceBlock(p) + '</div>' +
      outlook({player_id: row.id, market: p.market}) +
      '<div class="ef-card-body" id="ac-body-' + index + '"' + (open ? '' : ' hidden') + '>' +
      (open ? ladderBlock(p) + form() : '') + '</div></article>';
  }
  /* m4.7 B4 — WHAT AN OPEN PLAYED CARD SAYS.
   *
   * Our projection for the line's own stat, the one factual sentence
   * about the range, and the rest of that player's week. Every value
   * comes off the `/history` rows already in hand. */
  function playedRow(row) {
    const stats = playedStats(row);
    return stats ? stats[marketOf(row)] : null;
  }
  function otherStats(row) {
    const stats = playedStats(row);
    if (!stats) return '';
    const mine = marketOf(row);
    const rest = Object.keys(stats).filter(key => key !== mine).map(key => stats[key]);
    if (!rest.length) return '';
    return '<h4 class="ac-played-more-head">More from this game</h4><ul class="ac-played-more">' +
      rest.map(hrow => {
        const found = forecastOf(hrow), actual = finalActual(hrow);
        const said = actual !== null && found && found.mean !== null
          ? 'projected ' + tidy(found.mean) + ' · actual ' + tidy(actual)
          /* NOT A ZERO, EVER. A row the service could not settle
           * carries its own sentence and that sentence is shown. */
          : String(hrow.sentence || '');
        return '<li data-stat="' + esc(hrow.stat) + '"><span class="ac-played-more-stat">' +
          esc(statWordOf(hrow)) + '</span><span class="ac-played-more-said">' + esc(said) + '</span></li>';
      }).join('') + '</ul>';
  }
  function playedBody(row) {
    const found = playedResult(row);
    /* Nothing was read, so nothing is said beyond the face's own
     * sentence. A projection with no result beside it would read as
     * an answer. */
    if (found.state === 'unknown') return '';
    const hrow = playedRow(row);
    const lines = [projectionWords(hrow)];
    if (found.state === 'pending') lines.push(PLAYED_AWAITING);
    else if (found.state === 'none') lines.push(String((hrow && hrow.sentence) || PLAYED_NONE));
    else lines.push(rangeWords(hrow));
    return lines.filter(Boolean).map(said => '<p>' + esc(said) + '</p>').join('') +
      (found.state === 'unknown' ? '' : otherStats(row));
  }
  /* The played card OPENS, and opening is all it does: the control
   * carries its own action, never `ac-select`, so no path from here
   * reaches a bet. */
  function playedKey(row) { return String(row.id) + '|' + String(row.prop.market); }
  function playedCard(row, index) {
    const p = row.prop, open = !!state.playedCards[playedKey(row)];
    const body = 'ac-played-body-' + index;
    return '<article class="ef-card ac-played-card" data-played="true" data-player-id="' + esc(row.id) + '" data-market="' + esc(p.market) + '">' +
      '<button class="ef-card-toggle ac-played-face" data-act="ac-played-open" data-value="' + esc(playedKey(row)) +
      '" aria-expanded="' + open + '" aria-controls="' + body + '">' +
      '<span class="ef-card-name">' + esc(row.person.name) + '</span><span class="ef-card-line">' + esc(sideWord(p.lean) + ' ' + p.line + ' ' + marketWord(p.market_label || p.market)) + '</span>' +
      '<span class="ef-card-rating"><span class="ef-assessment">Published estimate</span><span class="ef-card-chance"><strong>' + chance(p.model_p) + '</strong><small>Estimated chance</small></span></span>' +
      '<span class="ef-market-context"><span class="ac-team-pill">' + esc(row.person.team) + '</span><span>' + esc(row.game.away + ' at ' + row.game.home) + '</span></span></button>' +
      '<p class="ac-played-result">' + esc(playedWords(row)) + '</p>' +
      '<div class="ef-card-body ac-played-body" id="' + body + '"' + (open ? '' : ' hidden') + '>' +
      (open ? playedBody(row) : '') + '</div></article>';
  }
  function playedSection(played, total) {
    if (!total) return '';
    const open = state.playedOpen;
    return '<section class="ac-played" data-played-count="' + played.length + '">' +
      '<h2 class="ac-played-heading">' + button('played-toggle',
        '<span>Already played · ' + countWords(played.length, total) + '</span>',
        null, ' class="ac-played-toggle" aria-expanded="' + open + '" aria-controls="ac-played-list"') + '</h2>' +
      '<div class="ac-played-list" id="ac-played-list"' + (open ? '' : ' hidden') + '>' +
      (played.length ? played.map(({row}, at) => playedCard(row, at)).join('')
        : '<p class="ef-empty">' + esc(narrowedEmpty()) + '</p>' +
          (filtersOn() ? clearButton() : '')) +
      '</div></section>';
  }
  /* The empty Upcoming list says WHICH emptiness it is: a week that
   * has finished naming when the next one arrives, or a search that
   * matched nothing. */
  const NARROWED_EMPTY = 'No published lines match this view.';
  /* m4.10: a list a FILTER emptied says that, and offers the way out;
   * a week that has finished, or a search that matched nothing, keeps
   * saying what it already said. */
  function narrowedEmpty() { return filtersOn() ? FILTERED_EMPTY : NARROWED_EMPTY; }
  function upcomingEmpty(all) {
    if (!all.length) return h.nav.slateNote || NARROWED_EMPTY;
    if (filtersOn()) return FILTERED_EMPTY;
    if (!all.some(entry => !started(entry.row)))
      return 'This week’s games have all kicked off. Next week’s lines post on Sunday.';
    return NARROWED_EMPTY;
  }
  function receipt(slip) {
    return '<article class="ef-owned-card ac-receipt" data-slip-id="' + esc(slip.slip_id) + '"><h2>' + (slip.replayed ? 'Original bet recovered' : 'Recorded bet') + '</h2><p>Saved here · placement elsewhere</p>' +
      (slip.legs || []).map(leg => '<section class="ac-saved-leg" data-leg-id="' + esc(leg.leg_id) + '"><h3>' + esc(leg.player_text || leg.player_id) + '</h3><p>' +
        esc(sideWord(leg.side) + ' ' + leg.line_placed + ' ' + marketWord(leg.market)) + '</p><dl><dt>Your terms</dt><dd>' + esc(price(leg.odds_american)) + ' · ' + esc(leg.book || 'Book not supplied') +
        '</dd><dt>App quote of record</dt><dd>' + esc(price(leg.quote && leg.quote.odds_american)) + ' · ' + esc(leg.quote && leg.quote.book || 'Book not supplied') +
        '</dd><dt>Saved chance</dt><dd>' + chance(leg.p_at_placed) + '</dd></dl>' + (leg.p_reason ? '<p>' + esc(leg.p_reason) + '</p>' : '') +
        (leg.grade ? '<p class="grademark">' + esc(leg.grade.word || leg.grade.outcome) + '</p>' + (leg.grade.sentence ? '<p>' + esc(leg.grade.sentence) + '</p>' : '') : '') +
        // §4.3: a leg an angle reached carries the same block, per leg.
        outlook({player_id: leg.player_id, market: leg.market, line: leg.line_placed, side: leg.side}) +
        '</section>').join('') +
      (slip.grade ? '<p>' + esc(slip.grade.word || '') + '</p><p>' + esc(slip.grade.sentence || '') + '</p>' : '') +
      (slip.stake == null ? '' : '<p>Your stake: ' + esc(slip.stake) + '</p>') +
      (slip.payout_multiple == null ? '' : '<p>Your return multiple: ' + esc(slip.payout_multiple) + '</p>') +
      (slip.legs && slip.legs.length > 1 ? '<p>All legs chance: ' + chance(slip.p_all_hit) + '</p>' +
        (slip.p_break_even != null ? '<p>Chance needed to break even: ' + chance(slip.p_break_even) + '</p>' : '') +
        '<p>' + esc(slip.independence_note || slip.p_reason || '') + '</p>' : '') + '</article>';
  }
  function unavailable(title, id) { return '<div class="page cx-page">' + h.head(title) + '<p class="cx-snapshot">' + esc(reason(id)) + '</p></div>'; }
  function homeSummary() {
    return '<section class="sc-home ac-home"><header class="cx-heading"><h1>' + esc(h.nav.me && h.nav.me.first_name ? 'Hello, ' + h.nav.me.first_name : 'Your week') +
      '</h1><p>Your saved bets and published player lines.</p></header>' + link('mybets', 'My bets', 'Exact terms, saved chance and results') +
      link('myteam', 'My lineup', 'Your season-long team') + link('screen', 'Explore bets', 'This week’s published player lines') + link('account', 'Your account', 'Connect, invites and notifications') + recovery() + '</section>';
  }
  function render(route) {
    if (h.isDemo()) return null;
    const provider = providers.get(route);
    if (provider) return typeof provider === 'function' ? provider(h) : provider.render(h, route);
    if (route === 'home-summary') return homeSummary();
    if (route === 'home-activity') return '<p class="timeline-empty">' + esc(reason('home.notices')) + '</p>';
    if (route === 'legacy-save-status') return '<div class="page"><div id="ac-error" role="alert" tabindex="-1">' +
      esc(state.error || h.nav.track && h.nav.track.saveError || '') + '</div>' + recovery() +
      (state.receipt ? receipt(state.receipt) : '') + '</div>';
    if (route === 'screen' || route === 'betbuilder' || route === 'betssingle') {
      const query = state.query.trim().toLowerCase();
      const all = props().map((row,index) => ({row,index}));
      const rows = all.filter(({row}) => !query || [row.person.name,row.person.team,row.prop.market].join(' ').toLowerCase().includes(query));
      /* m4.10 — SEARCH, THEN THE READER'S FILTERS, THEN THE ORDER. Each
       * entry keeps the index it has in `props()` the whole way
       * through, so a tap after a sort or a filter selects the prop the
       * reader tapped. */
      const kept = rows.filter(({row}) => keeps(row));
      const upcoming = ordered(kept.filter(({row}) => !started(row)));
      const played = ordered(kept.filter(({row}) => started(row)));
      const divider = dividerAt(upcoming);
      return '<div class="page ef-page"><header class="cx-heading"><h1>Bets</h1><p>Published player lines</p></header><p class="ef-caption">' + esc(reason('discover.singles')) +
        '</p><div class="ac-search" role="search"><label for="ac-query">Search players or teams</label><input id="ac-query" type="search" data-ac-field="query" value="' + esc(state.query) + '">' + button('search', 'Search') + '</div>' +
        controls(all) +
        (!state.form ? recovery() : '') + '<section class="ac-upcoming"><h2 class="ac-section-heading">Upcoming · ' +
        esc(countWords(upcoming.length, all.filter(({row}) => !started(row)).length)) + '</h2>' +
        (upcoming.length ? upcoming.map(({row,index}, place) =>
          (place === divider ? '<div class="blinddivider">' + esc(h.blindSpotDivider) + '</div>' : '') +
          card(row,index)).join('')
          : '<p class="ef-empty">' + esc(upcomingEmpty(all)) + '</p>' +
            (filtersOn() ? clearButton() : '')) +
        '</section>' + playedSection(played, all.filter(({row}) => started(row)).length) + '</div>';
    }
    if (route === 'mybets' || route === 'mypicks' || route === 'bethistory') return '<div class="page ef-page">' + h.head('My bets') + recovery() +
      (!h.readToken() ? '<p>Connect to see your recorded bets.</p>' + button('connect', 'Connect your account') :
        h.nav.picksOffline ? '<p role="alert">Your saved bets could not be loaded.</p>' + button('refresh', 'Try again') :
          h.nav.slips == null ? '<p>Loading your saved bets…</p>' : h.nav.slips.length ? h.nav.slips.map(receipt).join('') : '<p>No bets recorded yet.</p>') + link('screen', 'Explore bets') + '</div>';
    if (route === 'discover') return '<div class="page cx-page"><header class="cx-heading"><h1>Discover</h1><p>Analysis for the way you play.</p></header>' + link('screen', 'Bets', 'Published player lines and your terms') + link('season', 'Fantasy', 'Your season-long team') + link('dfs', 'DFS tournaments', 'Published tournament tables') + link('projections', 'Projections', 'Published player expectations') + '</div>';
    if (route === 'you') return '<div class="page cx-page"><header class="cx-heading"><h1>Your activity</h1><p>Your bets, lineups and results.</p></header>' + link('mybets', 'My bets') + link('myteam', 'My lineup') + link('fh-dfs-scoreboard', 'DFS entries') + link('your-record', 'Your performance') + link('our-record', 'Model performance') + link('account', 'Your account', 'Connect, invites and notifications') + '</div>';
    const limits = {'fh-dfs-scoreboard':['DFS entries','dfs.scoreboard'], projectionrow:['Projection comparison','projections.error'],
      'your-record':['Your performance','home.record'], 'our-record':['Model performance','home.record'],
      betsrecommended:['Parlays','parlays.correlated'], betsparlay:['Parlays','parlays.correlated'], betssim:['Parlays','parlays.correlated']};
    if (limits[route]) return unavailable(...limits[route]);
    if (route.startsWith('fh-')) return unavailable('Fantasy', route.startsWith('fh-dfs-') ? 'dfs.tournament' : 'fantasy.rankings');
    return null;
  }
  function action(act, value) {
    if (act === 'select') {select(value);h.render();focus('ac-side');}
    else if (act === 'save') return save();
    else if (act === 'retry') return retry();
    else if (act === 'new-intent') return state.legacyDraft ? send(copy(state.legacyDraft), true) : save(true);
    else if (act === 'another') {state.receipt = null;h.render();focus('ac-line');}
    else if (act === 'go') h.go(value);
    else if (act === 'connect') h.connect();
    else if (act === 'read' && state.form) h.openRead(state.form.player_id, state.form.market, {line:Number(state.form.line),side:state.form.side});
    else if (act === 'refresh') return h.loadPicks(true);
    else if (act === 'search') h.render();
    /* m4.10 S1/F1/F2 — the sort, the two chip filters and the way out
     * of all four. None of them touches the bet form or the selection:
     * they change the ORDER and the reader's own view, and nothing
     * else. */
    else if (act === 'sort') {state.sort = String(value || '');h.render();}
    else if (act === 'pos' || act === 'day') {state[act] = String(value || '');h.render();}
    else if (act === 'clear-filters') {
      FILTER_FIELDS.forEach(field => {state[field] = '';});
      h.render();
    }
    /* m4.10 C3 — a tapped rung SAYS what it is. The form's line is not
     * touched here, and there is no path from here to one. */
    else if (act === 'rung') {
      const line = numberOr(value);
      if (line !== null) {state.rung = line;h.render();}
    }
    else if (act === 'played-open') {
      /* Tap opens, tap again closes, and the set lives for the
       * session only — nothing about it is stored anywhere. */
      const key = String(value);
      if (state.playedCards[key]) delete state.playedCards[key];
      else state.playedCards[key] = true;
      h.render();
    }
    else if (act === 'played-toggle') {
      state.playedOpen = !state.playedOpen;
      /* OPENING THE SECTION IS THE RETRY, and it is the whole of it:
       * one ask per expand, no timer, no loop. */
      if (state.playedOpen && state.playedFailed) retryPlayed();
      h.render();
    }
    else {
      const provider = providers.get(h.route());
      if (provider && provider.action) return provider.action(act, value, h);
    }
  }
  function retryPlayed() { state.playedAsked = false; state.playedFailed = false; }
  function sync(route) {
    if (h.isDemo()) return;
    const bets = route === 'screen' || route === 'betbuilder' || route === 'betssingle';
    /* ARRIVING ON THE PAGE IS THE OTHER RETRY. `sync` runs after every
     * render, so the trigger is the route CHANGING onto this page —
     * never the render itself, which is how a retry becomes a poll. */
    if (bets && lastSync !== route && state.playedFailed) retryPlayed();
    lastSync = route;
    /* The results read is asked for ONCE, and only when there is a
     * played line on the page to say something about. */
    if (bets && props().some(started)) loadPlayed();
    const provider = providers.get(route);
    if (provider && provider.sync) provider.sync(h);
  }
  /* m4.9 — THE D-185 HELPERS, SHARED RATHER THAN COPIED. The played
   * card and the player page's past-games card say the same things
   * about the same `/history` rows, so they say them with the same
   * functions: one rounding, one reading of a published forecast, one
   * within-range test. A second copy is how two surfaces come to
   * disagree about one game. */
  const api = {configure,register,resetMember,state,capability,reason,loadCapabilities,select,input,
    selectedChance,pending,save,retry,receipt,render,action,sync,marketWord,reviewDraft,unavailable,
    started,playedWords,playedBody,
    shown,tidy,numberOr,forecastOf,statWordOf,projectionWords,rangeWords,rangeSide,
    /* m4.10 — the sort, the filters and the card's three visuals, named
     * so the suite can read each one on its own. */
    sortKey,sorts,ordered,keeps,filtersOn,dayOf,statOf,gameOf,countWords,
    shapeBlock,chanceBlock,ladderBlock,rungWords};
  root.AlphaCompact = api;
})(typeof window !== 'undefined' ? window : globalThis);

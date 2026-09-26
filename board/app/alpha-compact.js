/* Real compact-card providers. Sample modules never supply these records. */
(function (root) {
  "use strict";
  let h;
  let lastSync = null;
  const providers = new Map();
  const fresh = () => ({selected: null, form: null, error: "", errors: {},
    busy: false, receipt: null, conflict: false, legacyDraft: null, query: "", capabilities: null,
    playedOpen: false, playedAsked: false, playedFailed: false, played: null,
    playedCards: {}});
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
  /* ONE FACTUAL SENTENCE, and only when there is a range AND a final
   * to hold against it. It is a statement about this one line; there
   * is no count of them anywhere and never will be here. */
  function rangeWords(hrow) {
    const found = forecastOf(hrow), actual = finalActual(hrow);
    if (!found || found.lo === null || found.hi === null || actual === null) return '';
    // THE NUMBERS ON THE CARD, not the ones behind them.
    const lo = shown(found.lo), hi = shown(found.hi), landed = shown(actual);
    if (lo === null || hi === null || landed === null) return '';
    return landed >= lo && landed <= hi
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
  function card(row, index) {
    const p = row.prop, open = state.selected && state.selected.id === row.id && state.selected.market === p.market;
    const quote = quoteFor(p);
    return '<article class="ef-card" data-player-id="' + esc(row.id) + '"><button class="ef-card-toggle" data-act="ac-select" data-value="' + index + '" aria-expanded="' + !!open + '" aria-controls="ac-body-' + index + '">' +
      '<span class="ef-card-name">' + esc(row.person.name) + '</span><span class="ef-card-line">' + esc(sideWord(p.lean) + ' ' + p.line + ' ' + marketWord(p.market_label || p.market)) + '</span>' +
      '<span class="ac-quote">Starting quote · ' + esc(quoteText(quote)) + '</span>' +
      '<span class="ef-card-rating"><span class="ef-assessment">Published estimate</span><span class="ef-card-chance"><strong>' + chance(p.model_p) + '</strong><small>Estimated chance</small></span></span>' +
      '<span class="ef-market-context"><span class="ac-team-pill">' + esc(row.person.team) + '</span><span>' + esc(row.game.away + ' at ' + row.game.home) + '</span></span></button>' +
      outlook({player_id: row.id, market: p.market}) +
      '<div class="ef-card-body" id="ac-body-' + index + '"' + (open ? '' : ' hidden') + '>' + (open ? form() : '') + '</div></article>';
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
  function playedSection(played) {
    if (!played.length) return '';
    const open = state.playedOpen;
    return '<section class="ac-played" data-played-count="' + played.length + '">' +
      '<h2 class="ac-played-heading">' + button('played-toggle', '<span>Already played · ' + played.length + '</span>',
        null, ' class="ac-played-toggle" aria-expanded="' + open + '" aria-controls="ac-played-list"') + '</h2>' +
      '<div class="ac-played-list" id="ac-played-list"' + (open ? '' : ' hidden') + '>' +
      played.map(({row}, at) => playedCard(row, at)).join('') + '</div></section>';
  }
  /* The empty Upcoming list says WHICH emptiness it is: a week that
   * has finished naming when the next one arrives, or a search that
   * matched nothing. */
  function upcomingEmpty(all) {
    if (!all.length) return h.nav.slateNote || 'No published lines match this view.';
    if (!all.some(entry => !started(entry.row)))
      return 'This week’s games have all kicked off. Next week’s lines post on Sunday.';
    return 'No published lines match this view.';
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
      const upcoming = rows.filter(({row}) => !started(row)), played = rows.filter(({row}) => started(row));
      return '<div class="page ef-page"><header class="cx-heading"><h1>Bets</h1><p>Published player lines</p></header><p class="ef-caption">' + esc(reason('discover.singles')) +
        '</p><div class="ac-search" role="search"><label for="ac-query">Search players or teams</label><input id="ac-query" type="search" data-ac-field="query" value="' + esc(state.query) + '">' + button('search', 'Search') + '</div>' +
        (!state.form ? recovery() : '') + '<section class="ac-upcoming"><h2 class="ac-section-heading">Upcoming</h2>' +
        (upcoming.length ? upcoming.map(({row,index}) => card(row,index)).join('') : '<p class="ef-empty">' + esc(upcomingEmpty(all)) + '</p>') +
        '</section>' + playedSection(played) + '</div>';
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
  const api = {configure,register,resetMember,state,capability,reason,loadCapabilities,select,input,
    selectedChance,pending,save,retry,receipt,render,action,sync,marketWord,reviewDraft,unavailable,
    started,playedWords,playedBody};
  root.AlphaCompact = api;
})(typeof window !== 'undefined' ? window : globalThis);

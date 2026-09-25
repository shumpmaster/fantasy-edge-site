/* Real record, history, team and export providers. No fixture is a data source. */
(function (root) {
  'use strict';
  const compact = root.AlphaCompact;
  let host, requestSequence = 0;
  const fresh = () => ({period:'season_to_date', view:'current', season:null, week:null,
    history:null, historyError:'', historyBusy:false, historyKey:null, selected:null, teamAsked:false, recordAsked:false});
  const state = fresh();
  const present = value => value !== null && value !== undefined;
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => host.esc(present(value) ? value : '');
  const text = value => value ? '<p>' + esc(value) + '</p>' : '';
  const number = value => Number.isFinite(value) ? String(Math.round(value * 100) / 100) : 'Not supplied';
  const button = (action, label, value, extra='') => '<button class="ghost" data-act="ac-' + action + '"' +
    (present(value) ? ' data-value="' + esc(value) + '"' : '') + extra + '>' + label + '</button>';
  const link = (route, label) => button('go', esc(label), route);
  function bind(h) { host = h; h.readToken(); return h; }
  function resetMember() { requestSequence++; Object.assign(state, fresh()); }
  function early(row) {
    return row && row.small_sample === true ? '<p class="sc-early">Small sample · still early.</p>' : '';
  }
  function periods() {
    return '<div class="sc-period" role="group" aria-label="Record period">' +
      [['this_week','This week'],['season_to_date','Season']].map(([key,label]) =>
        button('ready-period', label, key, ' aria-pressed="' + (state.period === key) + '"')).join('') + '</div>';
  }
  function memberMissing() {
    if (!host.readToken()) return text('Connect to see your own record.') + button('connect','Connect your account');
    return text(host.nav.scorecardAsked ? 'Your record could not be loaded.' : 'Loading your record…') +
      button('ready-record-retry','Try again');
  }
  function memberPeriod(period) {
    if (!period) return text('No record received for this period.');
    const slips = period.slips || {}, reads = period.reads || {};
    return '<section class="ar-record-period">' +
      (present(slips.won) ? '<div class="sc-settled-hero"><strong>' + esc(slips.won) + '</strong><span>Slips won</span></div>' : '') +
      text(slips.sentence) + text(reads.sentence) + text(period.markets_sentence) +
      list(period.markets).map(row => '<section class="sc-market" data-small-sample="' + (row.small_sample === true) + '"><h3>' + esc(row.word) + '</h3>' +
        (present(row.hit) && present(row.settled) ? '<strong>' + esc(row.hit) + ' of ' + esc(row.settled) + ' legs hit</strong>' : '') +
        text(row.sentence) + early(row) + '</section>').join('') + '</section>';
  }
  function weeklyMember(member) {
    return '<section class="ar-weeks"><h2>Weekly record</h2>' +
      (list(member.weeks).length ? list(member.weeks).map(row =>
        '<article class="sc-week" data-season="' + esc(row.season) + '" data-week="' + esc(row.week) +
        '" data-small-sample="' + (row.small_sample === true) + '"><h3>' + esc(row.label) + '</h3>' +
        (present(row.settled) ? '<strong>' + esc(row.settled) + ' settled bets and reads</strong>' : '') +
        text(row.sentence) + early(row) + '<details><summary>Slips, reads and markets</summary>' + memberPeriod(row) + '</details></article>').join('') :
        text('No weekly results received.')) + '</section>';
  }
  function memberRecord(h) {
    bind(h); const member = h.readToken() && h.nav.scorecard;
    return '<div class="page sc-page ar-page">' + h.head('Your record') + periods() +
      '<section data-population="member">' + (member ? text(member.empty_note) + memberPeriod(member[state.period]) + weeklyMember(member) +
        '<details><summary>Recorded results</summary>' + list(member.marks).map(mark =>
          '<article data-subject-id="' + esc(mark.subject_id) + '"><strong>' + esc(mark.word) + '</strong>' + text(mark.sentence) + '</article>').join('') +
        list(member.read_notes).map(note => '<article data-read-id="' + esc(note.read_id) + '">' + text(note.sentence) + '</article>').join('') + '</details>' +
        text(member.source_note) + text(member.scope_note) : memberMissing()) + '</section></div>';
  }
  function publicCounts(row) {
    if (!row) return '';
    return '<section data-small-sample="' + (row.small_sample === true) + '">' +
      (present(row.landed) && present(row.settled) ? '<strong>' + esc(row.landed) + ' of ' + esc(row.settled) + ' picks landed</strong>' : '') +
      text(row.sentence) + early(row) + '</section>';
  }
  function publicBody(held) {
    if (!held) return text(host.nav.recordAsked ? 'The public record could not be loaded.' : 'Loading the public record…') + button('ready-public-retry','Try again');
    const record = held.record || {}, calibration = held.calibration || {};
    return (record.empty_note ? text(record.empty_note) : publicCounts(record.total)) + text(record.pending_sentence) +
      '<details class="ar-record-detail"><summary>Public record and scope</summary>' +
      '<h3>' + esc(calibration.lead) + '</h3>' + text(calibration.scope) +
      list(record.weeks).map(row => '<article><h3>' + esc(row.label) + '</h3>' + publicCounts(row) + '</article>').join('') +
      list(record.games).map(row => '<article data-game-id="' + esc(row.game_id) + '"><h3>' + esc(row.label) + '</h3>' + publicCounts(row) + '</article>').join('') +
      text(held.settled_note) + text(held.disclosure) + text(held.as_of) + '</details>';
  }
  function publicRecord(h) {
    bind(h); return '<div class="page sc-page ar-page">' + h.head('Our record') +
      '<section data-population="public">' + publicBody(h.nav.record) + '</section></div>';
  }
  function summary(h) {
    bind(h); const member = h.readToken() && h.nav.scorecard;
    return '<section class="sc-home sc-hud sc-performance ar-home"><div class="sc-hud-masthead"><h1>Performance</h1>' + periods() + '</div>' +
      '<div class="ar-records"><section class="ar-record-card" data-population="member"><h2>Your record</h2>' +
      (member ? text(member.empty_note) + memberPeriod(member[state.period]) + text(member.source_note) + text(member.scope_note) : memberMissing()) +
      link('your-record','Your weekly record') + '</section>' +
      '<section class="ar-record-card" data-population="public"><h2>Our published picks</h2>' + publicBody(h.nav.record) +
      link('our-record','Our full record') + '</section></div><p class="sc-cohort-note">Your saved bets and reads and our published picks are separate records.</p>' +
      '<nav class="sc-record-links">' + link('mybets','My bets') + link('myteam','My lineup') + link('projections','Projections') + '</nav></section>';
  }
  function historyKey() { return String(state.season) + ':' + String(state.week); }
  function historyDefaults() {
    const week = host.week();
    if (!present(state.season) && week) state.season = week.season;
    if (!present(state.week) && week) state.week = week.week;
  }
  async function loadHistory(h) {
    bind(h); historyDefaults();
    const token = h.readToken();
    if (!token || h.isDemo()) return;
    const key = historyKey(), sequence = ++requestSequence, snapshot = h.snapshot(token);
    const season = Number(state.season), week = Number(state.week);
    state.history = null; state.selected = null; state.historyKey = key; state.historyError = '';
    if (!Number.isInteger(season) || !Number.isInteger(week) || week < 1 || week > 22) {
      state.historyBusy = false; state.historyError = 'Choose a season and a week from 1 to 22.'; h.render(); return;
    }
    if (season === 2025) {
      state.historyBusy = false; state.historyError = 'The 2025 season is not available for projection history.'; h.render(); return;
    }
    state.historyBusy = true; h.render();
    const current = () => sequence === requestSequence && key === historyKey() && h.current(snapshot);
    try {
      if (!h.identityReady()) await h.loadMe(token);
      if (!current()) return;
      if (!h.identityReady()) throw {reason:'Connect your account to load projection history.'};
      const answer = await h.service().loadHistory(season, week);
      if (!current()) return;
      if (answer) state.history = answer;
      else state.historyError = 'Projection history could not be loaded.';
    } catch (err) {
      if (!current()) return;
      state.historyError = h.note(err);
    } finally {
      if (current()) { state.historyBusy = false; h.render(); }
    }
  }
  function generation(row) {
    if (!row) return '';
    return '<p class="legend">Published version: ' + esc(row.generation_id) +
      (row.engine_version ? ' · ' + esc(row.engine_version) : '') +
      (row.cutoff_ts ? ' · Before kickoff: ' + esc(row.cutoff_ts) : '') + '</p>';
  }
  function rowKey(row) { return JSON.stringify([row.player_id,row.game_id,row.stat]); }
  function historyRow(row, detail) {
    const unit = row.unit || '', value = n => Number.isFinite(n) ? number(n) + ' ' + esc(unit) : 'Not supplied';
    const forecast = row.forecast;
    return '<article class="ar-history-row" data-player-id="' + esc(row.player_id) + '" data-game-id="' + esc(row.game_id) + '" data-stat="' + esc(row.stat) + '">' +
      '<header><h3>' + esc(row.name || row.player_id) + '</h3><span class="ar-team">' + esc(row.team) + '</span></header>' +
      '<h4>' + esc(row.stat_word || row.stat) + '</h4><dl class="ar-outcomes"><dt>Projected low</dt><dd>' + value(forecast && forecast.p10) +
      '</dd><dt>Projected middle</dt><dd>' + value(forecast && forecast.p50) + '</dd><dt>Projected high</dt><dd>' + value(forecast && forecast.p90) +
      '</dd><dt>Actual</dt><dd>' + value(row.actual) + '</dd></dl>' + text(row.sentence) + text(row.reason) + generation(row.generation) +
      (detail ? text(row.actual_as_of) : button('ready-history-row','View stat record',rowKey(row))) + '</article>';
  }
  function historyBody(detail) {
    const answer = state.history;
    if (!host.readToken()) return text('Connect to see projection history.') + button('connect','Connect your account');
    if (state.historyBusy) return text('Loading projection history…');
    if (state.historyError) return '<p role="alert">' + esc(state.historyError) + '</p>';
    if (!answer) return text('Choose a week to see the projections published before kickoff and the actual results.');
    const rows = detail ? list(answer.rows).filter(row => rowKey(row) === state.selected) : list(answer.rows);
    return text(answer.empty_note) + text(answer.range_note) + text(answer.forecast_note) +
      '<div class="ar-history-list">' + rows.map(row => historyRow(row,detail)).join('') + '</div>' +
      generation(answer.generation) + text(answer.source_note) + text(answer.scope_note) + text(answer.as_of);
  }
  function projection(h, detail) {
    bind(h); historyDefaults();
    if (detail) return '<div class="page ar-page">' + h.head('Stat record') + historyBody(true) + '</div>';
    const controls = '<nav class="ar-switch" aria-label="Projection view">' +
      button('ready-view','Current projections','current',' aria-pressed="' + (state.view === 'current') + '"') +
      button('ready-view','Projection history','history',' aria-pressed="' + (state.view === 'history') + '"') + '</nav>';
    if (state.view === 'current') return controls + h.currentProjections();
    return '<div class="page ar-page">' + h.head('Projection history') + controls +
      '<div class="ar-history-controls"><label>Season<input id="ar-history-season" data-ac-field="history-season" type="number" value="' + esc(state.season) + '"></label>' +
      '<label>Week<input id="ar-history-week" data-ac-field="history-week" type="number" min="1" max="22" value="' + esc(state.week) + '"></label>' +
      button('ready-history-load','Load week',null,state.historyBusy?' disabled':'') + '</div>' + historyBody(false) +
      '<details><summary>More analysis</summary>' + text(compact.reason('projections.error')) + '</details></div>';
  }
  function teamRows(team) {
    return list(team && team.slots).map(slot => '<article class="ar-team-slot" data-player-id="' + esc(slot.player_id) + '"><span>' +
      esc(slot.slot_label) + '</span><strong>' + esc(slot.player_text || slot.player_id || 'Player not supplied') + '</strong>' +
      (!slot.player_id ? text('This player has not been matched.') : '') + '</article>').join('');
  }
  function teams(h) {
    bind(h); const held = h.nav.teams && h.nav.teams.season_long, opponent = h.nav.opponents && h.nav.opponents.season_long;
    return '<div class="page ar-page">' + h.head('My season-long team') +
      (!h.readToken() ? text('Connect to see your team.') + button('connect','Connect your account') :
        (h.nav.picksOffline ? text('Your team could not be refreshed.') : '') +
        (held ? teamRows(held) : text('No confirmed season-long team received.')) +
        (opponent ? '<h2>Your opponent’s team</h2>' + teamRows(opponent) : '') +
        '<button class="primary" data-act="team-open" data-kind="season_long">Review a team picture</button>') +
      '<details><summary>League information and rankings</summary>' + text(compact.reason('league.identity')) +
      text(compact.reason('fantasy.rankings')) + text(compact.reason('fantasy.luck')) + '</details></div>';
  }
  const columns = {qb:'Passer ID',wr1:'Receiver ID',player_id:'Player ID',name:'Player',team:'Team',position:'Position',bucket:'Game group',
    stack_r:'Stack correlation',combined_projection:'Combined projection',qb_ownership:'Passer ownership',wr1_ownership:'Receiver ownership',under_owned:'Below median ownership',
    note:'Missing data note',projection:'Projection',projection_rank:'Projection rank',ownership:'Ownership',ownership_rank:'Ownership rank',rank_gap:'Rank difference',
    boom_proxy:'High outcome proxy',n_stats_read:'Statistics supplied'};
  const evidenceLabels = {IDENTIFIER:'Identifier',DISPLAY:'Projection',CAPTURED:'Captured measurement',
    PROVEN:'Supported finding',PROXY:'Stand-in',UNVALIDATED:'Untested hypothesis'};
  const countLabels = {n_teams_seen:'Teams in this sheet',n_with_a_gap:'Players with both ranks',ownership_present:'Ownership supplied',
    grid_index:'Selected outcome point',quantile:'Outcome range point',
    n_grid_points:'Outcome points available',n_without_a_grid:'Players without outcome ranges'};
  function dfsNote(value) {
    if (!value) return '';
    const readable = host.plainNote(value);
    // Reader wording comes first; the export's exact disclosure stays inspectable.
    return text(readable) + (readable !== value ? '<details class="ar-source-disclosure"><summary>Source wording</summary>' + text(value) + '</details>' : '');
  }
  function table(name, table) {
    if (!table) return '<section data-dfs-table="' + name + '">' + text('This table was not supplied.') + '</section>';
    const declared = list(table.columns), title = {stacks:'Stacks',players:'Players',boom_proxy:'High outcome proxy'}[name];
    const cell = (value, key) => !present(value) || value === '' ? 'Not supplied' :
      esc(key === 'note' ? host.plainNote(value) : key === 'bucket' ? host.dfsBucket(value) : typeof value === 'boolean' ? (value?'Yes':'No') : value);
    return '<section class="ar-dfs-section" data-dfs-table="' + name + '"><h2>' + title + '</h2>' +
      list(table.absence).map(dfsNote).join('') + (table.present ?
        '<div class="ar-table-scroll" tabindex="0" role="region" aria-label="' + title + ' table"><table><thead><tr>' +
        declared.map(column => '<th scope="col">' + esc(columns[column.column] || column.column.replace(/_/g,' ')) +
          '<small>' + esc(evidenceLabels[column.evidence_class] || host.plainNote(column.evidence_class)) + '</small></th>').join('') + '</tr></thead><tbody>' +
        list(table.rows).map(row => '<tr>' + declared.map(column => '<td>' + cell(row[column.column], column.column) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>' : '') +
      '<details><summary>Table meanings and rules</summary>' + declared.map(column => '<h3>' + esc(columns[column.column] || column.column) + '</h3>' + dfsNote(column.meaning)).join('') +
      list(table.rules).map(rule => dfsNote(rule.text)).join('') +
      Object.entries(table.counts || {}).map(([key,value]) => text((countLabels[key] || host.plainNote(key.replace(/_/g,' '))) + ': ' +
        (typeof value === 'boolean' ? (value?'Yes':'No') : value))).join('') + '</details></section>';
  }
  function dfs(h) {
    bind(h); const document = h.nav.dfs;
    const head = '<div class="page ar-page">' + h.head('DFS tournament tables');
    if (!document) return head + text(h.nav.dfsNote || 'The DFS tournament file has not been received.') + '</div>';
    const run = document.run || {};
    const period = [present(run.season) ? run.season : null, present(run.week) ? 'Week ' + run.week : null].filter(present).join(' · ');
    return head + '<h2 class="ar-dfs-period">' + esc(period || 'Sheet period not supplied.') + '</h2>' +
      dfsNote(run.reason) + list(document.notes).map(dfsNote).join('') +
      ['stacks','players','boom_proxy'].map(name => table(name,(document.tables || {})[name])).join('') +
      '<footer class="ar-dfs-footer">' + text((document.sentences || {}).no_bet_footer) + '</footer>' +
      '<details><summary>Sheet scope and evidence</summary>' +
      (run.built_at ? text('Published: ' + run.built_at) : '') +
      (run.generation_id ? text('Published version: ' + run.generation_id) : '') +
      Object.entries(document.sentences || {}).filter(([key]) => key !== 'no_bet_footer').map(([,value]) => dfsNote(value)).join('') +
      Object.entries(document.evidence_classes || {}).map(([key,value]) => '<h3>' + esc(evidenceLabels[key] || host.plainNote(key)) + '</h3>' + dfsNote(value)).join('') + '</details>' +
      text(compact.reason('dfs.tournament')) + text(compact.reason('dfs.scoreboard')) + '</div>';
  }
  function action(act, value, h) {
    bind(h);
    if (act === 'ready-period' && ['this_week','season_to_date'].includes(value)) state.period = value;
    else if (act === 'ready-record-retry') return h.loadPicks(true);
    else if (act === 'ready-public-retry') return h.loadRecord(true);
    else if (act === 'ready-history-load') return loadHistory(h);
    else if (act === 'ready-view' && ['current','history'].includes(value)) {
      state.view = value; historyDefaults();
      if (value === 'history' && !state.historyKey && h.readToken()) return loadHistory(h);
    } else if (act === 'ready-history-row') {
      if (!list(state.history && state.history.rows).some(row => rowKey(row) === value)) return;
      state.selected = value; h.go('projectionrow'); return;
    } else return;
    h.render();
  }
  function input(field, value, h) {
    bind(h);
    if (field !== 'history-season' && field !== 'history-week') return;
    state[field === 'history-season' ? 'season' : 'week'] = value;
    requestSequence++; state.history = null; state.historyError = ''; state.historyBusy = false; state.historyKey = null; state.selected = null;
    h.render();
    const input = root.document.getElementById(field === 'history-season' ? 'ar-history-season' : 'ar-history-week');
    if (input) input.focus({preventScroll:true});
  }
  function sync(h) {
    bind(h); const route = h.route();
    if (['home','your-record','our-record'].includes(route)) {
      h.loadRecord(false);
      if (route !== 'our-record' && h.readToken()) {
        // The slate can arrive after the boot-time member request finished.
        if (h.week() && !h.nav.scorecardAsked && !state.recordAsked) {
          state.recordAsked = true; h.loadPicks(true);
        } else if (!h.nav.picksAsked) h.loadPicks(false);
      }
    }
    if (['season','myteam'].includes(route) && h.readToken() && !state.teamAsked && !h.nav.teams) {
      state.teamAsked = true; h.loadTeams(false);
    }
  }
  const provider = {render(h, route) {
    bind(h);
    switch (route) {
      case 'your-record': return memberRecord(h);
      case 'our-record': return publicRecord(h);
      case 'projections': return projection(h,false);
      case 'projectionrow': return projection(h,true);
      case 'projection': return h.currentProjection();
      case 'season': case 'myteam': return teams(h);
      case 'team': return h.teamConfirmation();
      case 'dfs': return dfs(h);
      default: return null;
    }
  },sync,action,input,resetMember};
  for (const route of ['home','your-record','our-record','projections','projectionrow','projection','season','myteam','team','dfs']) compact.register(route,provider);
  compact.register('home-summary',summary);
  root.AlphaReady = {state,scorecard:{summary,member:memberRecord,publicRecord},comparison:{render:projection},
    history:{load:loadHistory},host:()=>host,resetMember};
})(typeof window !== 'undefined' ? window : globalThis);

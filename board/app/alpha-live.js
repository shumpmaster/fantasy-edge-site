/* Compact owned-leg live view. All numbers and grades come from the service. */
(function (root) {
  'use strict';
  const compact = root.AlphaCompact;
  let expanded = null;
  const present = value => value !== null && value !== undefined;
  function owned(h) {
    return ((h.nav.live && h.nav.live.bets) || []).filter(bet =>
      bet.leg_id && bet.bet_id === bet.leg_id);
  }
  function savedLeg(h, bet) {
    for (const slip of h.nav.slips || []) {
      const leg = (slip.legs || []).find(row => row.leg_id === bet.leg_id);
      if (leg) return {leg, slip};
    }
    return {};
  }
  function missingFinal(bet) {
    return (bet.game || {}).status === 'post' && !present(bet.banked);
  }
  function button(h, act, title, value) {
    return '<button class="ghost" data-act="ac-' + act + '"' +
      (value ? ' data-value="' + h.esc(value) + '"' : '') + '>' + title + '</button>';
  }
  function situation(h, game) {
    if (!game) return '';
    const esc = h.esc, bits = [];
    if (game.away) bits.push(esc(game.away) + (present(game.away_score) ? ' ' + esc(game.away_score) : ' —'));
    if (game.home) bits.push(esc(game.home) + (present(game.home_score) ? ' ' + esc(game.home_score) : ' —'));
    const status = {pre:'Before kickoff',in:'In progress',post:'Final'}[game.status] || game.status;
    if (status) bits.push(esc(status));
    if (present(game.period)) bits.push('Period ' + esc(game.period));
    if (game.clock) bits.push(esc(game.clock));
    const s = game.situation;
    let field = '';
    if (s) {
      const fields = [];
      if (s.down_distance_text) fields.push(esc(s.down_distance_text));
      else {
        if (present(s.down)) fields.push('Down: ' + esc(s.down));
        if (present(s.distance)) fields.push('Distance: ' + esc(s.distance));
      }
      if (s.possession_team) fields.push('Possession: ' + esc(s.possession_team));
      if (present(s.yard_line)) fields.push('Yard line: ' + esc(s.yard_line));
      field = '<p>' + fields.join(' · ') + '</p>';
      if (s.last_play && s.last_play.text) field += '<p>Last play: ' + esc(s.last_play.text) + '</p>';
      if (s.as_of) field += '<p class="legend">Field update: ' + esc(s.as_of) + '</p>';
    } else if (game.situation_reason) field = '<p>' + esc(game.situation_reason) + '</p>';
    return '<section class="ac-situation" aria-label="Current game update"><p>' + bits.join(' · ') + '</p>' + field +
      (game.fetched_ts ? '<p class="legend">Game update: ' + esc(game.fetched_ts) + '</p>' : '') + '</section>';
  }
  function terms(h, bet) {
    const price = value => present(value) ? (value > 0 ? '+' : '') + value : 'Not supplied';
    const pair = row => h.esc(price(row && row.odds_american)) + ' · ' + h.esc(row && row.book || 'Book not supplied');
    return '<dl class="ac-live-terms"><dt>Your terms</dt><dd>' + pair(bet.terms) +
      '</dd><dt>App quote of record</dt><dd>' + pair(bet.quote || bet) + '</dd></dl>';
  }
  function grade(h, bet) {
    const {leg, slip} = savedLeg(h, bet);
    const g = leg && leg.grade;
    return '<section class="ac-live-grade"><h3>Your result</h3>' +
      (h.nav.picksOffline ? '<p role="alert">Your result could not be refreshed.' +
        (g ? ' Last received result is shown.' : '') + '</p>' : '') +
      (g ? '<p>' + h.esc(g.word || g.outcome || '') + '</p><p>' + h.esc(g.sentence || '') + '</p>' :
        '<p>No member grade received for this leg.</p>') +
      (slip && slip.grade ? '<p>' + h.esc(slip.grade.word || '') + ' · ' + h.esc(slip.grade.sentence || '') + '</p>' : '') + '</section>';
  }
  function scenario(h, bet) {
    const rows = (h.nav.scenarios || []).filter(row => row.player_id === bet.player_id &&
      row.market === bet.market_key && row.line === bet.line && row.side === bet.side && row.generation_id);
    return rows.map(row => h.yourNumber(row) + '<p class="legend">Published version: ' + h.esc(row.generation_id) + '</p>').join('');
  }
  function detail(h, bet) {
    const absent = missingFinal(bet);
    const band = present(bet.p_now) ? bet.band : bet.band_pregame;
    const reason = bet.reason || (absent ? 'The final box-score value is missing.' : '');
    return '<div class="ef-card-body">' + situation(h, bet.game) +
      '<p>Banked: ' + (present(bet.banked) ? h.esc(bet.banked) + ' ' + h.esc(bet.need_unit || '') : 'Not supplied') + '</p>' +
      (!absent && bet.side !== 'less' && !['push','cashed','lost'].includes(bet.state) && present(bet.need_now)
        ? '<p>Needs ' + h.esc(bet.need_now) + ' ' + h.esc(bet.need_unit || '') + '</p><p>Target: ' + h.esc(bet.need) + ' ' + h.esc(bet.need_unit || '') + '</p>' : '') +
      terms(h, bet) + grade(h, bet) + (reason ? '<p>' + h.esc(h.plainNote(reason)) + '</p>' : '') +
      (!absent && band && band.length === 2 ? '<p>Chance bounds: ' + h.formatChance(band[0]) + '–' + h.formatChance(band[1]) + '</p>' : '') +
      (!absent ? '<h3>Chance through the game</h3>' + h.liveChart(bet) + h.liveSwings(bet) : '') +
      scenario(h, bet) + h.statline((bet.statline || []).map(row =>
        Object.assign({}, row, {label:h.labelTitle(row.label) || row.label}))) +
      button(h, 'live-read', 'Add an optional angle', bet.bet_id) + '</div>';
  }
  function card(h, bet) {
    const open = expanded === bet.bet_id || h.route() === 'card';
    const absent = missingFinal(bet);
    const state = absent ? 'Final data missing' : h.liveState(bet);
    const chance = absent ? null : present(bet.p_now) ? bet.p_now : bet.p_pregame;
    return '<article class="ef-card ac-live-card" data-leg-id="' + h.esc(bet.leg_id) + '">' +
      '<button class="ef-card-toggle" data-act="ac-live-toggle" data-value="' + h.esc(bet.bet_id) + '" aria-expanded="' + open + '">' +
      '<span class="ef-card-name">' + h.esc((bet.player || {}).name || bet.player_id) + '</span>' +
      '<span class="ef-card-line">' + (bet.side === 'less' ? 'Under ' : 'Over ') + h.esc(bet.line) + ' ' + h.esc(compact.marketWord(bet.market_key || bet.label)) + '</span>' +
      '<span class="ef-card-rating"><span class="ef-assessment">' + h.esc(state) + '</span><span class="ef-card-chance"><strong>' + h.formatChance(chance) + '</strong><small>' + (present(bet.p_now) ? 'Live chance' : 'Pregame chance') + '</small></span></span>' +
      '<span class="ac-team-pill">' + h.esc((bet.player || {}).team || '') + '</span></button>' +
      (open ? detail(h, bet) : '') + '</article>';
  }
  const provider = {
    render(h) {
      const head = '<div class="page ef-page ac-live-page">' + h.head('Live bets');
      if (!h.readToken()) return head + '<p>Connect to see your recorded bets live.</p>' + button(h,'connect','Connect your account') + '</div>';
      let bets = owned(h);
      if (h.route() === 'card') {
        bets = bets.filter(bet => bet.bet_id === h.nav.liveBet);
        if (!bets.length) return null;
      }
      const status = h.nav.liveOffline ? '<p role="alert">The live service is offline. Last received update is shown.</p>' + button(h,'live-reconnect','Reconnect') : '';
      const freshness = h.nav.live && present(h.nav.live.age_s) ? '<p class="legend">Last received update: ' + h.esc(h.nav.live.age_s) + ' seconds old.</p>' : '';
      return head + status + (h.nav.liveNote ? '<p>' + h.esc(h.nav.liveNote) + '</p>' : '') + freshness +
        (bets.length ? bets.map(bet => card(h, bet)).join('') : '<p>' + h.esc(!h.nav.live ? 'Loading your live bets…' : h.nav.live.reason || 'No recorded bets on this live board.') + '</p>') + '</div>';
    },
    sync(h) { if (h.readToken()) h.loadPicks(false); },
    action(act, value, h) {
      if (act === 'live-toggle') {expanded = expanded === value ? null : value; h.render();}
      else if (act === 'live-reconnect') {h.loadLive(true);h.loadPicks(true);}
      else if (act === 'live-read') {
        const bet = owned(h).find(row => row.bet_id === value);
        if (bet) h.openRead(bet.player_id, bet.market_key, {line:bet.line,side:bet.side});
      }
    },
    resetMember() {expanded = null;}
  };
  ['livehub','live','card'].forEach(route => compact.register(route, provider));
})(typeof window !== 'undefined' ? window : globalThis);

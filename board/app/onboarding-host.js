/* App-shell bridge for the visit-only introduction. No service adapter enters here. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AnglesOnboardingHost = api;
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';
  function createHost({ win, doc, app, screen, viewport, tabbar, alpha, feedbackdock,
    view, capture, restore, esc, head, statline, disclosure, icon, storage }) {
    const W = win, D = doc, S = W.AnglesOnboardingScreens;
    let session = null, route = null, subroute = null, targetKey = null, timer = null;
    let renderedRoute = null, renderedSubroute = null;
    let edge, bets, fantasy, dfs, scorecard, consumer, controller;
    const reduced = () => !!W.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const sample = () => session?.get();
    const heading = title => `<header class="detailhead"><h1>${esc(title)}</h1></header>`;
    function clearTimer() { if (timer !== null) W.clearInterval(timer); timer = null; }
    const focusKeys = ['data-preview-action', 'data-preview-value', 'data-preview-field',
      'data-preview-route', 'data-act', 'data-value', 'data-delta', 'data-route', 'data-tab'];
    const focusable = 'button,input,select,textarea,a[href],summary';
    function focusBeforeRedraw() {
      const active = D.activeElement;
      if (!active || !screen.contains(active)) return null;
      const attrs = focusKeys.filter(key => active.getAttribute?.(key) != null)
        .map(key => [key, active.getAttribute(key)]);
      if (!active.id && !attrs.length) return null;
      const same = node => attrs.every(([key, value]) => node.getAttribute(key) === value);
      const matches = Array.from(screen.querySelectorAll(focusable)).filter(same);
      return { id: active.id || null, attrs, ordinal: Math.max(0, matches.indexOf(active)) };
    }
    function focusAfterRedraw(saved) {
      if (!saved) return;
      const byId = saved.id && D.getElementById(saved.id);
      if (byId && screen.contains(byId)) { byId.focus({ preventScroll: true }); return; }
      if (!saved.attrs.length) return;
      const matches = Array.from(screen.querySelectorAll(focusable)).filter(node =>
        saved.attrs.every(([key, value]) => node.getAttribute(key) === value));
      (matches[saved.ordinal] || matches[0])?.focus({ preventScroll: true });
    }
    function runRecord() {
      clearTimer();
      if (!session || route !== 'record' || reduced() || D.hidden || !sample().record.playing) return;
      timer = W.setInterval(() => {
        const record = sample().record;
        const last = record.rows.length - 1;
        if (!record.playing) { clearTimer(); return; }
        if (record.index >= last) { session.dispatch('record-playing', false); clearTimer(); render(); return; }
        const next = record.index + 1;
        session.dispatch('select-record', next);
        session.dispatch('record-playing', next < last);
        if (next >= last) clearTimer();
        render();
      }, 75);
    }
    function renderNavigation() { render({ preserve: false }); if (viewport) viewport.scrollTop = 0; }
    function previewRoute(next) { clearTimer(); route = next; subroute = null; renderNavigation(); }
    function previewChild(next) { subroute = next; renderNavigation(); }
    function sampleEdgeFixture() {
      const base = W.EdgeFinderFixtures;
      const source = base.cards.find(card => card.player === 'Derrick Henry' && card.market === 'rushing yards');
      if (!source) throw new Error('Sample rushing-yard card unavailable');
      const card = JSON.parse(JSON.stringify(source));
      const state = sample(), quote = state.quote;
      Object.assign(card, { id: state.pick.id, player_id: state.player.id,
        player: state.player.name, name: state.player.name, team: 'IND', opponent: 'HOU',
        line: quote.line, odds: quote.odds, p_at_line: 0.46, p_fair: 0.45, riders: [],
        calibration_status: 'unverified' });
      // Fixed fictional prices for this illustration; no real probability transform.
      card.ladder = [
        [73.5, .48, 109], [74, .47, 113], [74.5, .46, 118],
        [75, .45, 123], [75.5, .44, 128],
      ].map(([line, p_at_line, worth_odds]) => ({ line, side: 'Over', p_at_line,
        p_fair: .45, worth_odds, valid_side: true }));
      card.facts = card.facts.filter(fact => fact.class_id === 'share-level').map(fact => ({ ...fact,
        values: { ...fact.values, name: card.player, team: card.team } }));
      card.selected_angle_ids = card.facts.map(fact => fact.id);
      return { ...base, cards: [card], graded: [], preview_quote: quote,
        sample: 'Illustrative sample · fictional player and quote · no live sportsbook feed' };
    }
    function instanceHost() {
      const refresh = () => render();
      edge = W.EdgeFinder.createInstance(sampleEdgeFixture());
      edge.configure({ esc, head, render: refresh, route: () => subroute || route,
        reduced, mybets: () => previewRoute('mybets'), lineup: () => previewRoute('season'),
        detail: () => previewRoute('edgebet'), history: () => previewRoute('bethistory'),
        recommended: () => previewRoute('betsrecommended'), browse: () => previewRoute('screen'),
        sample: () => previewRoute('scenario'),
        customize: legs => bets.prefill(legs), recordEntry: () => '',
        singleDetail: decision => bets.renderSavedSingle({ leg: decision.legs[0], totals: decision.totals }, decision.id) });
      bets = W.BetsBuilder.createInstance(W.BetsBuilderFixtures, edge);
      bets.configure({ esc, statline, disclosure, render: refresh, route: () => subroute || route,
        reduced, historyChart: (leg, key) => edge.historyChart(leg, key),
        take: (key, payload) => { const decision = edge.external(key, payload); session.dispatch(payload.kind === 'parlay' ? 'save-parlay' : 'save-bet'); return decision; },
        decisionPanel: id => edge.prompt(id), mybets: () => previewRoute('mybets'),
        open: previewRoute, root: previewRoute, back: () => previewRoute(route === 'betsleg' ? 'betsparlay' : 'screen'),
        create: () => previewRoute('betbuilder'), players: () => previewRoute('screen'),
        history: () => previewRoute('bethistory') });
      fantasy = W.FantasyHub.createInstance(W.FantasyHubFixtures);
      fantasy.configure({ esc, statline, disclosure, render: refresh,
        open: previewChild, back: () => previewChild(null),
        home: () => previewRoute('home'), myteam: () => previewChild('lineup'),
        legacyTeam: () => previewChild('matchup'),
        saveDfs: () => session.dispatch('save-lineup') });
      dfs = W.FantasyDfsTournament.createInstance();
      dfs.configure({ fixture: W.FantasyHubFixtures.dfs, esc, statline, disclosure, render: refresh,
        open: previewChild, back: () => previewChild(null),
        viewSaved: () => previewChild('lineups'), saveLineup: () => session.dispatch('save-lineup'),
        legacy: () => '' });
      scorecard = W.Scorecard.createInstance(W.ScorecardFixtures, { preview: true });
      scorecard.configure({ esc, head: heading, render: refresh, open: previewRoute,
        bets: () => previewRoute('mybets'), lineup: () => previewRoute('season'), dfs: () => previewRoute('dfs') });
      if (W.ConsumerExperience?.createInstance) {
        consumer = W.ConsumerExperience.createInstance({ preview: true });
        consumer.configure({ esc, icon, demo: true, currentRoute: () => route === 'live-player' ? 'livehub' : route,
          nav: { homeContext: { view: 'overview' } } });
      }
    }
    function markup() {
      const state = sample();
      if (!state) return '';
      switch (route) {
        case 'home': return S.home(state);
        case 'analysis': return S.analysis(state);
        case 'record': return S.record(state);
        case 'scenario': return S.scenario(state);
        case 'review': return S.review(state);
        case 'live-player': return S.live(state);
        case 'screen': return edge.render();
        case 'mybets': return edge.mybets();
        case 'edgebet': return edge.detail();
        case 'betsrecommended': case 'betsparlay': case 'betbuilder': case 'betsleg':
        case 'betssim': case 'betssingle': case 'betspick': return `<div data-tour="parlay-page">${bets.render(subroute || route)}</div>`;
        case 'dfs': return `<div class="page fh-page" data-tour="dfs-page">${dfs.render(subroute || 'dfs')}</div>`;
        case 'season': return `<div data-tour="fantasy-page">${fantasy.render(subroute || 'home')}</div>`;
        case 'your-record': return `<div data-tour="personal-record-page">${scorecard.member()}</div>`;
        default: return S.home(state);
      }
    }
    function navigation() {
      if (consumer) return consumer.navigation();
      const items = [['home', 'Home'], ['screen', 'Discover'], ['betbuilder', 'Create'], ['live-player', 'Live'], ['your-record', 'You']];
      return `<span class="cx-brand">Angles<span>Sample</span></span>` + items.map(([name, label]) =>
        `<button type="button" class="tab" data-preview-route="${name}"${route === name ? ' aria-current="page"' : ''}><span class="tablabel">${label}</span></button>`).join('');
    }
    function render({ preserve = true } = {}) {
      if (!session) return;
      const same = preserve && renderedRoute === route && renderedSubroute === subroute;
      const viewportTop = same ? viewport.scrollTop : null;
      const canvasTop = same ? screen.querySelector('#home-canvas')?.scrollTop : null;
      const focus = same ? focusBeforeRedraw() : null;
      app.classList.add('preview-gold', 'consumer-app', 'angles-preview-active');
      screen.className = 'screen' + (route === 'home' || route === 'live-player' ? ' home-screen' : '');
      viewport.classList.toggle('home-viewport', route === 'home' || route === 'live-player');
      screen.innerHTML = markup();
      tabbar.innerHTML = navigation();
      bets.sync(subroute || route);
      renderedRoute = route; renderedSubroute = subroute;
      if (same) {
        viewport.scrollTop = viewportTop;
        const canvas = screen.querySelector('#home-canvas');
        if (canvas && canvasTop != null) canvas.scrollTop = canvasTop;
        focusAfterRedraw(focus);
      }
      if (alpha) alpha.hidden = true;
      if (feedbackdock) feedbackdock.hidden = true;
      if (targetKey) view.updateTarget(D.querySelector(`[data-tour="${targetKey}"]`));
    }
    function enterPreview() {
      session = W.AnglesOnboardingPreviewData.createSession();
      instanceHost();
      return true;
    }
    function leavePreview(context) {
      clearTimer();
      bets?.dispose(); edge?.cleanup();
      session?.dispose(); session = null; route = null; subroute = null; targetKey = null;
      renderedRoute = null; renderedSubroute = null;
      app.classList.remove('angles-preview-active');
      viewport.classList.remove('home-viewport');
      if (alpha) alpha.hidden = false;
      restore(context);
    }
    function navigate(next) {
      if (!session) return;
      const wasRecord = route === 'record';
      clearTimer();
      route = next; subroute = null; targetKey = null;
      if (next === 'screen') { const hero = edge.hero() || edge.visible()[0]; if (hero) edge.state.open = hero.id; }
      if (next === 'record' && !wasRecord) {
        session.dispatch('select-record', reduced() ? sample().record.rows.length - 1 : 0);
        if (!reduced()) session.dispatch('record-playing', true);
      }
      renderNavigation();
      if (next === 'record') runRecord();
    }
    function target(key) {
      targetKey = key;
      const node = D.querySelector(`[data-tour="${key}"]`);
      // Align each new stop once. Ordinary action redraws retain the user's scroll.
      if (node?.scrollIntoView) node.scrollIntoView({ block: 'start', behavior: 'auto' });
      // The mobile guide changes the available scrollport during mount.
      W.requestAnimationFrame?.(() => {
        if (session && targetKey === key && node?.isConnected) {
          node.scrollIntoView({ block: 'start', behavior: 'auto' });
          view.updateTarget(node);
        }
      });
      return node;
    }
    function click(event) {
      if (!session) return false;
      const node = event.target.closest?.('[data-preview-action],[data-preview-route],[data-act]');
      if (!node) return true;
      const direct = node.getAttribute('data-preview-action');
      const value = node.getAttribute('data-preview-value');
      if (direct) {
        if (direct === 'record-play') {
          const r = sample().record;
          if (reduced()) {
            session.dispatch('select-record', r.rows.length - 1);
            session.dispatch('record-playing', false);
          } else {
            if (r.index === r.rows.length - 1) session.dispatch('select-record', 0);
            session.dispatch('record-playing', !r.playing || r.index === r.rows.length - 1);
          }
          runRecord(); render();
        } else {
          session.dispatch(direct, value);
          if (direct === 'open-event') {
            if (targetKey === 'selected-feed-event' && controller) void controller.next();
            else previewRoute('live-player');
          } else {
            render();
          }
        }
        return true;
      }
      const to = node.getAttribute('data-preview-route');
      if (to) { previewRoute(to); return true; }
      const act = node.getAttribute('data-act'), arg = node.getAttribute('data-value');
      if (!act) return true;
      if (act.startsWith('ef-')) {
        edge.action(act.slice(3), arg, node.getAttribute('data-delta'));
        const held = edge.state.drafts[sample().pick.id];
        if (held) session.dispatch('edit-line', held.line);
        if (act === 'ef-take') session.dispatch('save-bet');
      } else if (act.startsWith('bb-')) bets.action(act.slice(3), arg);
      else if (act.startsWith('fh-')) fantasy.action(act.slice(3), arg);
      else if (act.startsWith('fdfs-t-')) dfs.action(act, arg);
      else if (act.startsWith('sc-')) scorecard.action(act.slice(3), arg);
      else if (act === 'cx-nav') {
        const routes = { home: 'home', discover: 'screen', create: 'betbuilder', live: 'live-player', you: 'your-record' };
        if (routes[arg]) previewRoute(routes[arg]);
      }
      return true;
    }
    function input(event) {
      if (!session) return false;
      const node = event.target, field = node.getAttribute?.('data-preview-field');
      if (field) {
        const focusedRange = node.type === 'range' && D.activeElement === node;
        session.dispatch(field, node.value);
        if (node.type === 'range') {
          render();
          if (focusedRange && node.id) D.getElementById(node.id)?.focus({ preventScroll: true });
        }
      } else if (node.getAttribute?.('data-ef-field')) {
        const kind = node.getAttribute('data-ef-field'), value = node.type === 'checkbox' ? node.checked : node.value;
        edge.input(kind, value, node.getAttribute('data-id'));
        if (kind === 'odds') session.dispatch('edit-odds', value);
      }
      else if (node.getAttribute?.('data-bb-field')) bets.input(node.getAttribute('data-bb-field'), node.value, node.id);
      else if (node.getAttribute?.('data-fh-field')) fantasy.input(node.getAttribute('data-fh-field'), node.value, node.id);
      else if (node.getAttribute?.('data-fdfs-field')) dfs.input(node.getAttribute('data-fdfs-field'), node.value, node.getAttribute('data-fdfs-id') || node.id);
      else if (node.getAttribute?.('data-sc-field')) scorecard.input(node.getAttribute('data-sc-field'), node.value);
      return true;
    }
    function visibility() { if (session && route === 'record') runRecord(); }
    return { active: () => !!session, sample, setController(value) { controller = value; },
      captureContext: capture, storage, enterPreview,
      leavePreview, navigate, target, click, input, visibility, render };
  }
  return { createHost };
});

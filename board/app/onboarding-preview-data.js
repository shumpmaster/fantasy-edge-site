/* Fictional, visit-only introduction data. No service, credential, or storage adapter. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AnglesOnboardingPreviewData = api;
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const progress = (actual, line) => actual > line ? 'Line crossed · not settled'
    : `Needs ${Math.floor(line - actual) + 1} more yards · game in progress`;
  const liveChart = updated => ({
    labels: updated ? ['2:00', '2:06', '2:12', '2:19'] : ['2:00', '2:03', '2:06', '2:09'],
    elapsed: updated ? [0, 6, 12, 19] : [0, 3, 6, 9],
    chance: updated ? [48, 51, 58, 88] : [48, 51, 58, 64],
    lower: updated ? [34, 37, 42, 80] : [34, 37, 42, 49],
    upper: updated ? [62, 66, 73, 94] : [62, 66, 73, 79],
  });
  const liveField = updated => ({ possession: 'IND', position: updated ? 'HOU 26' : 'HOU 38', down: '1st & 10' });
  const recordRows = [2023, 2024, 2025, 2026].flatMap((season, seasonIndex) =>
    Array.from({ length: season === 2026 ? 3 : 18 }, (_, gameIndex) => {
      const projected = 220 + ((gameIndex * 19 + seasonIndex * 13) % 81);
      const actual = gameIndex === 11 ? projected - 10 : projected + ((gameIndex * 29 + seasonIndex * 17) % 91) - 42;
      const line = projected - 10;
      return { id: `sample-${season}-${gameIndex + 1}`, season, game: gameIndex + 1,
        projected, actual, line, error: Math.abs(actual - projected),
        outcome: actual === line ? 'Push' : actual > line ? 'Win' : 'Loss' };
    }));
  const reviewGames = [
    [65, 78, 81, 79.5], [90, 74, 72, 76.5], [52, 68, 62, 69.5], [105, 84, 91, 83.5],
    [77, 83, 83, 81.5], [62, 76, 72, 75.5], [96, 79, 86, 78.5], [88, 72, 84, 74.5],
  ].map(([actual, model, you, book], index) => ({
    id: `sample-jt-rush-${index + 1}`, playerId: 'sample-jonathan-taylor', gameId: `sample-game-${index + 1}`,
    stat: 'rushing_yards', unit: 'yards', actual, model, you, book,
  }));

  function createSession() {
    const listeners = new Set();
    let state = {
      label: 'Illustrative sample · fictional values, not measured performance',
      player: { id: 'sample-jonathan-taylor', name: 'Jonathan Taylor', team: 'IND' },
      game: { id: 'sample-game-live', away: 'HOU', home: 'IND', status: 'In progress' },
      pick: { id: 'sample-taylor-over-74-5', playerId: 'sample-jonathan-taylor', gameId: 'sample-game-live', side: 'Over', stat: 'rushing yards' },
      quote: { book: 'Illustrative Book', line: 74.5, odds: -110, odds_snapshot_ts: '2026-09-20T17:42:00Z' },
      terms: { book: 'Illustrative Book', line: 74.5, odds: -110, stake: 10 },
      angle: { originalText: '', exampleText: 'More carries if Indianapolis leads.',
        interpretation: 'Illustrative assumption: Indianapolis leads → three more rushing opportunities',
        confirmedAssumption: null, contextNote: null, baseline: { carries: 18, yards: 72, overChance: 0.46 },
        confirmed: { carries: 21, yards: 84, overChance: 0.59 }, showAdjusted: true },
      saves: { bets: [], parlays: [], lineups: [] },
      feed: { selectedEventId: 'event-taylor-fourth', events: [
        { id: 'event-taylor-fourth', playerId: 'sample-jonathan-taylor', gameId: 'sample-game-live', pickId: 'sample-taylor-over-74-5', time: 'Sun · 2:09 pm', headline: 'Taylor gains 8 yards.', delta: '+8 rushing yards', total: '73 rushing yards', actualYards: 73, projectedFinish: 82, detail: '+0.8 fantasy points.' },
      ] },
      live: { eventId: 'event-taylor-fourth', playerId: 'sample-jonathan-taylor', gameId: 'sample-game-live', pickId: 'sample-taylor-over-74-5', actualYards: 73, projectedFinish: 82, progress: 'Needs 2 more yards · game in progress', selectedPoint: 3, chart: liveChart(false), field: liveField(false) },
      analysisStage: 0, record: { rows: clone(recordRows), index: 0, playing: false },
      review: { games: clone(reviewGames), index: 7 },
    };
    const notify = () => { for (const listener of [...listeners]) listener(); };
    function dispatch(action, value) {
      if (!state) return false;
      switch (action) {
        case 'edit-line': if (value == null || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) <= 0) return false; state.terms.line = Number(value); state.live.progress = progress(state.live.actualYards, state.terms.line); break;
        case 'edit-odds': if (!Number.isInteger(Number(value)) || Math.abs(Number(value)) < 100) return false; state.terms.odds = Number(value); break;
        case 'edit-book': state.terms.book = String(value || '').slice(0, 40); break;
        case 'edit-stake': if (value == null || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) <= 0) return false; state.terms.stake = Number(value); break;
        case 'write-angle': state.angle.originalText = String(value || '').slice(0, 1000); state.angle.confirmedAssumption = null; state.angle.contextNote = null; break;
        case 'use-example-angle': state.angle.originalText = state.angle.exampleText; state.angle.contextNote = null; break;
        case 'confirm-angle':
          if (state.angle.originalText.trim() === state.angle.exampleText) state.angle.confirmedAssumption = state.angle.interpretation;
          else { state.angle.contextNote = state.angle.originalText.trim() || null; state.angle.confirmedAssumption = null; }
          break;
        case 'toggle-angle': state.angle.showAdjusted = !state.angle.showAdjusted; break;
        case 'analysis-next': state.analysisStage = Math.min(3, state.analysisStage + 1); break;
        case 'select-live-point': if (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 3) return false; state.live.selectedPoint = Number(value); break;
        case 'save-bet': if (!state.saves.bets.length) state.saves.bets.push({ id: state.pick.id, terms: clone(state.terms), angleText: state.angle.originalText }); break;
        case 'save-parlay': if (!state.saves.parlays.length) state.saves.parlays.push({ id: 'sample-parlay-1', legs: [state.pick.id, 'sample-second-leg'] }); break;
        case 'save-lineup': if (!state.saves.lineups.length) state.saves.lineups.push({ id: 'sample-dfs-lineup-1' }); break;
        case 'play-feed': {
          const event = { id: 'event-taylor-fifth', playerId: state.player.id, gameId: state.game.id, pickId: state.pick.id,
            time: 'Sun · 2:19 pm', headline: 'Taylor breaks into the open.', delta: '+12 rushing yards',
            total: '85 rushing yards', actualYards: 85, projectedFinish: 88, detail: '+1.2 fantasy points. The game is not final.' };
          if (!state.feed.events.some(row => row.id === event.id)) state.feed.events.unshift(event);
          state.feed.selectedEventId = event.id;
          state.live = { eventId: event.id, playerId: event.playerId, gameId: event.gameId, pickId: event.pickId,
            actualYards: 85, projectedFinish: 88, progress: progress(85, state.terms.line), selectedPoint: 3,
            chart: liveChart(true), field: liveField(true) };
          break;
        }
        case 'open-event': {
          const event = state.feed.events.find(row => row.id === value);
          if (!event) return false;
          state.feed.selectedEventId = event.id;
          state.live.eventId = event.id; state.live.playerId = event.playerId;
          state.live.gameId = event.gameId; state.live.pickId = event.pickId;
          state.live.actualYards = event.actualYards; state.live.projectedFinish = event.projectedFinish;
          state.live.progress = progress(event.actualYards, state.terms.line);
          state.live.selectedPoint = 3;
          state.live.chart = liveChart(event.id === 'event-taylor-fifth');
          state.live.field = liveField(event.id === 'event-taylor-fifth');
          break;
        }
        case 'select-record': if (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) >= state.record.rows.length) return false; state.record.index = Number(value); state.record.playing = false; break;
        case 'record-playing': state.record.playing = !!value; break;
        case 'select-review': if (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) >= state.review.games.length) return false; state.review.index = Number(value); break;
        default: return false;
      }
      notify();
      return true;
    }
    return {
      get: () => state ? clone(state) : null,
      dispatch,
      subscribe(listener) { if (!state) return () => {}; listeners.add(listener); return () => listeners.delete(listener); },
      dispose() { listeners.clear(); state = null; },
    };
  }
  return { createSession };
});

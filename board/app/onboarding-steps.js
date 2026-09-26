/* Approved introduction copy. Routes are virtual app preview routes. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AnglesOnboardingSteps = api;
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';
  const chapters = ['Welcome', 'Find your next play', 'Add your angle', 'See the impact', 'Make it yours', 'Follow the action', 'Improve'];
  const entries = [
    ['purpose', 0, 'Your perspective. A fuller picture.', 'Find your next play, bring your own perspective, and follow what happens. Let’s walk through a sample session together.', 'home', 'home-wordmark'],
    ['model-process', 0, 'Thousands of plays. Patterns that matter.', 'Follow how the model turns football history into patterns, outcome ranges, and predictions checked against results.', 'analysis', 'analysis-brief', 'calculate'],
    ['model-record', 0, 'Every game adds to the record.', 'Watch projection accuracy and sample bet outcomes unfold together, then follow the gold highlight into 2026. Select any game to inspect its numbers.', 'record', 'record-timelines', 'record'],
    ['discover-play', 1, 'Find something worth a closer look.', 'Discover brings player lines and the reasons behind them together. Open a play to see the outlook and compare it with your price.', 'screen', 'featured-bet-card', 'open-pick'],
    ['edit-line', 1, 'Match the line you’re betting.', 'The default quote shows where it came from and when it was captured. Change the line to match the one available wherever you’re placing your bet.', 'screen', 'bet-line-edit', 'line'],
    ['edit-odds', 1, 'Match your odds, too.', 'The starting odds come from the same dated quote. Enter the odds offered wherever you’re betting so the assessment reflects your actual line and price.', 'screen', 'bet-odds-edit', 'odds'],
    ['write-angle', 2, 'What’s your angle?', 'A news story, a line move, or something you’ve noticed. Add your read and see how it could change the outlook.', 'scenario', 'angle-entry', 'write'],
    ['confirm-angle', 2, 'Your read. Your call.', 'Check that Angles understood what you meant before applying a change. In this sample, your read becomes three more carries. You decide whether that captures your thinking.', 'scenario', 'assumption', 'confirm'],
    ['angle-impact', 3, 'See your perspective take shape.', 'Now your read has a place in the picture. Compare the original outlook with the gold curve to see what changes if your assumption holds.', 'scenario', 'impact', 'compare'],
    ['angle-numbers', 3, 'Follow the change through.', 'More carries shift the sample yardage outlook from 72 to 84. The chance of clearing 74.5 yards changes from 46% to 59%. These are fixed illustrative values.', 'scenario', 'numbers', 'toggle'],
    ['record-single', 4, 'One place for your bets.', 'Record a single pick with your line, odds, stake and angle. Real bets are placed elsewhere.', 'screen', 'featured-bet-card', 'record-single'],
    ['parlay', 4, 'Bring your picks together.', 'Build a parlay and inspect each leg. Review the combined outlook and any assumptions about how the outcomes relate.', 'betsrecommended', 'parlay-page'],
    ['dfs', 4, 'Build your DFS lineup.', 'Explore football scenarios, compare players, and build a lineup around the contest’s salary and roster rules.', 'dfs', 'dfs-page'],
    ['fantasy', 4, 'Make the call for your team.', 'Bring in your fantasy team, compare players, and explore start-or-sit decisions in your league’s context.', 'season', 'fantasy-page'],
    ['feed-moment', 5, 'The story keeps moving.', 'Your feed connects the players and decisions you follow. Preview a new event, then follow it into the performance view.', 'home', 'selected-feed-event', 'feed'],
    ['live-entry', 5, 'Open the numbers behind the moment.', 'An event leads to the player’s performance: what has happened, progress toward the target, and the latest available outlook. A crossed line during a game is not a settled win.', 'live-player', 'live-lead', 'live'],
    ['live-outlook', 5, 'See the outlook as the game unfolds.', 'Keep actual performance separate from the estimated finish. This chart follows the same player and pick you just opened from the feed. All values in this session are illustrative.', 'live-player', 'live-canvas'],
    ['personal-record', 6, 'Build a record of your decisions.', 'Your performance brings results and trends together. Review the choices you made, rather than remembering only the wins.', 'your-record', 'personal-record-page'],
    ['angle-review', 6, 'See where your angles make a difference.', 'Follow your results against the original model and the sportsbook line over time. In this sample, your adjusted outlooks finish closer to the actual results. Select a game to see what changed.', 'review', 'angle-review', 'select-game'],
    ['finish', 6, 'Your next play starts here.', 'Explore at your own pace. Add your perspective, follow the action, and come back to learn from the result. You can replay this introduction any time.', 'home', 'home-wordmark'],
  ];
  const touchControls = {
    'model-process': 'analysis-next', 'model-record': 'record-play', 'discover-play': 'featured-bet-button',
    'edit-line': 'bet-line-control', 'edit-odds': 'bet-odds-control', 'write-angle': 'angle-text',
    'confirm-angle': 'angle-confirm', 'angle-impact': 'angle-compare', 'angle-numbers': 'angle-toggle',
    'record-single': 'bet-save', 'feed-moment': 'selected-feed-button', 'live-entry': 'live-open',
    'angle-review': 'review-game',
  };
  const steps = entries.map(([id, chapter, title, body, route, targetKey, action]) => ({
    id, chapter, title, body, route, targetKey, action: action || null,
    touchTarget: touchControls[id] ? `[data-tour-control="${touchControls[id]}"]` : null,
  }));
  return { chapters, steps };
});

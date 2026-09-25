/* Fixed, reviewed-shape demo templates: facts are context, never added probability. */
window.EdgeFinderStrings = Object.freeze({
  fallback: 'Priced fair — no lean either way.',
  unavailable: 'No additional angles in this sample.',
  templates: Object.freeze({
    'share-level': '{name} was involved in {number}% of team offensive plays in the {season} sample.',
    'route-participation': '{name} runs a route on {number}% of sample dropbacks.',
    'opponent-pace': 'Opponent {team} runs {number} plays in this sample scenario.',
    'weather': 'The {team} forecast scenario has {number} mph wind.',
    'book-disagreement': 'Sample books differ by {number} on {name}’s line.',
    'role-change': '{name} is listed first after {number} sample depth-chart updates.',
    'team-lean': '{team} passes on {number}% of plays in this sample game plan.'
  })
});

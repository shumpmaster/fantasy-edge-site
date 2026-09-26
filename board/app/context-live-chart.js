/* Stateless context chart shared by the real Home renderer and visit-local tour. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.ContextLiveChart = api;
    if (root.window && root.window !== root) root.window.ContextLiveChart = api;
  }
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';
  function render({ series, other, labels, elapsed, max, unit, names, spread, selected, esc, actionAttribute, valueAttribute = 'data-value' }) {
    const xs = elapsed.map(function (t) { return 48 + 250 * t / elapsed[elapsed.length - 1]; });
    const y = function (value) { return 98 - value / max * 76; };
    const curve = function (values, reverse) {
      const positions = reverse ? xs.slice().reverse() : xs;
      const points = reverse ? values.slice().reverse() : values;
      let path = 'M' + positions[0] + ',' + y(points[0]);
      for (let i = 1; i < values.length; i++) {
        const third = (positions[i] - positions[i - 1]) / 3;
        path += ' C' + (positions[i - 1] + third) + ',' + y(points[i - 1]) + ' ' +
          (positions[i] - third) + ',' + y(points[i]) + ' ' + positions[i] + ',' + y(points[i]);
      }
      return path;
    };
    const probabilityRange = spread && spread.kind === "probability";
    const rangeLabel = probabilityRange ? "Illustrative estimate range" : "Possible final points";
    const rangeUnit = probabilityRange ? "%" : " pts";
    const band = spread ? '<path class="context-outcome-range" data-range-for="' + (probabilityRange?'probability-estimate':'our-projected-final') + '" d="' +
      curve(spread.upper) + ' L' + curve(spread.lower, true).slice(1) + ' Z"/>' +
      '<path class="context-range-boundary" d="' + curve(spread.upper) + '"/>' +
      '<path class="context-range-boundary" d="' + curve(spread.lower) + '"/>' : '';
    const legend = spread ? '<div class="context-chart-legend">' +
      (spread.forecast ? '<span class="legend-actual">Actual points</span>' : '') +
      '<span class="' + (spread.forecast?'legend-forecast':'legend-ours') + '">' + (probabilityRange?'Illustrative chance':spread.forecast?'Our projected final':'Our projection') + '</span>' + (other?'<span class="legend-provider">' + esc(names[1]) + '</span>':'') +
      '<span class="legend-range">' + (probabilityRange?'Illustrative estimate range':'Example outcome range') + '</span></div>' : '';
    const readout = spread ? '<p class="context-range-readout" aria-live="polite">' + esc(labels[selected]) +
      ' · Illustrative <span>' + (probabilityRange?'Our estimate range':'Our final points range') + '</span><strong>' + spread.lower[selected] + '–' + spread.upper[selected] + rangeUnit + '</strong></p>' : '';
    return '<div class="context-chart">' + readout + '<svg viewBox="0 0 320 120" role="img" aria-label="' +
      esc('Illustrative ' + names.join(' versus ') + '. Values at each observation follow the chart.') + '">' +
      [0, max / 2, max].map(function (v) { return '<line x1="48" x2="298" y1="' + y(v) + '" y2="' + y(v) + '" class="context-grid"/><text x="36" text-anchor="end" y="' + (y(v) + 3) + '">' + v + (unit === '%' ? '%' : '') + '</text>'; }).join('') +
      band + '<path d="' + curve(series) + '" class="context-estimate' + (spread && spread.forecast?' context-actual':'') + '"/>' +
      (spread && spread.forecast ? '<path d="' + curve(spread.forecast) + '" class="context-forecast"/>' : '') +
      (other ? '<path d="' + curve(other) + '" class="context-reference"/>' : '') +
      '<line class="context-selected-line" x1="' + xs[selected] + '" x2="' + xs[selected] + '" y1="17" y2="98"/>' +
      series.map(function (v, i) { return '<circle cx="' + xs[i] + '" cy="' + y(v) + '" r="' + (selected === i ? 5 : 3) + '" class="context-point"/>'; }).join('') +
      '</svg><div class="context-observations" aria-label="Chart observations">' + labels.map(function (label, i) {
        const text = label + ': ' + names[0] + ' ' + series[i] + unit + (other ? ', ' + names[1] + ' ' + other[i] + unit : '') +
          (spread ? ', ' + rangeLabel + ' ' + spread.lower[i] + ' to ' + spread.upper[i] + rangeUnit + (spread.forecast ? ', Our projected final ' + spread.forecast[i] : '') : '');
        return '<button ' + actionAttribute + ' ' + valueAttribute + '="' + i + '" aria-pressed="' + (selected === i) + '" aria-label="' + esc(text) + '">' + esc(label) + '</button>';
      }).join('') + '</div>' + legend + (spread ? '<p class="context-note">' + (probabilityRange?'Fixed sample probability estimates, not a measured confidence interval.':'Fixed example outcome range, not a confidence or accuracy measure.') + '</p>' : '') + '</div>';
  }
  return { render };
});

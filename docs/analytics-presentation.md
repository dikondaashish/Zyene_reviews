# Analytics presentation

> Active analytics reference, restored October 10, 2026. The presentation rules remain relevant; the validation results below describe the September implementation and do not certify current production. See [DESIGN.md](DESIGN.md) and the [documentation follow-up tracker](DOCUMENTATION_FOLLOW_UP_2026-10-10.md).

Current source references: `src/components/analytics/ratings-chart.tsx`,
`chart-presentation.tsx`, `sentiment-chart.tsx`, `theme-chart.tsx`, and
`google-performance-profile-chart.tsx`. The rating distribution is not AI
sentiment, and unavailable data must not be presented as a measured zero or decline.
`tests/unit/analytics-presentation.test.ts` retains the missing-data and theme
interpretation regressions. Keep these explanations accessible when changing charts.

The analytics refinement uses the existing app palette in light and dark mode. Home dashboard components are outside its scope.

- Review ratings use a dated line chart with a fixed 0–5 scale and a period-average reference. Dates are formatted in UTC to preserve calendar dates from the API.
- Review volume uses stacked bars, whole-number ticks and consistent rating-category colors. Only days present in the supplied review data are shown; the caption makes that explicit.
- The rating distribution donut displays counts and percentages in a text legend. This is based on star ratings, not AI sentiment analysis.
- Themes use ranked horizontal bars with full labels, counts and a balanced category when positive and negative scores tie.
- Google profile views and customer actions have separate chart views. This prevents high view counts from flattening lower-volume action lines. Customer actions also use different dash patterns.
- Own-platform activity uses three distinct line series, without overlapping gradient fills.
- Charts stay dynamically imported with shimmer fallbacks. Repeated chart animations were removed, including on filter changes. The data/filter/export pipeline is unchanged.

## References

[IBM Carbon dashboard guidance](https://carbondesignsystem.com/data-visualization/dashboards/) informed hierarchy, consistent legends and restrained decoration. [Carbon chart guidance](https://carbondesignsystem.com/data-visualization/simple-charts/) informed choosing lines for trends and bars for comparisons.

## Validation

Checked actual components with a temporary local sample-data page: desktop light/dark, 390px mobile without page overflow, Google metric toggle, rating tooltip by keyboard, and empty states. The temporary route was removed. Screenshots and the fixture are retained in ignored `output/analytics-refinement/`.

React Doctor: 90/100. Its eager Recharts import warnings are false positives here: charts are behind the dynamic registry (own-platform activity is inside the dynamically imported own-platform view). The StatsCard complexity warning is pre-existing. Three additional development-only warnings flag the shared presentation module exporting formatting constants alongside components; no production behavior is affected. Type checking, file-size and color guards, focused ESLint, and the seven business-metrics/review-timeline tests passed. The production webpack build also passed (273 static pages generated).

## Follow-up edge-case audit

- Hide rating/response percentage changes when the current period has no reviews; a missing average is not a 100% decline. Review-count changes remain visible.
- Show an unavailable state for discovery estimates when there are no keyword impressions.
- Label clear theme score trends as positive/negative leaning and small net scores as balanced; a net score cannot establish a majority.
- Allow long keyword labels to wrap while keeping counts visible. Display the month for each row because the API can return the same keyword for multiple months, ordered by latest month.
- Added component regressions for these data-presentation cases, alongside existing business-metrics and review-timeline tests.

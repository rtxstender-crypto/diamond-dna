# Career Trajectory data

Career Trajectory is isolated from Hidden Gems and uses the official MLB Stats API through `mlb-historical-provider.ts`.

## Coverage and provenance

- Search coverage: 1950–2025. “Earlier” means 1950–1979. The current-player career endpoint may return other MLB seasons.
- MLB season endpoint: `/api/v1/stats?stats=season&group=...&season=...&sportIds=1&playerPool=ALL`.
- Player identity: `/api/v1/people/search`.
- Career context: `/api/v1/people/{id}` hydrated with `yearByYear` statistics.
- Upstream responses use Next.js fetch caching for 24 hours. Every parsed season carries endpoint, source, and retrieval metadata.

The MLB Stats API supplies identity, age, team, G, PA, AVG, OBP, SLG, OPS, HR, RBI, SB, BB, K, GS, IP, ERA, WHIP, saves, and batters faced where present. BB% and K% are derived from MLB counts (PA for hitters; batters faced for pitchers). OPS+, ERA+, FIP, WAR, and defensive value remain null because this provider does not reliably expose them.

## Eligibility and similarity

Hitters require 200 PA, starters 60 IP, and relievers 30 IP. Pitchers are compared only within the same inferred role. These constants live in `trajectory-comparison.ts`.

For each available metric, DiamondDNA calculates the standard deviation across the eligible candidate pool. Difference is `abs(current - candidate) / candidate-pool standard deviation`. Metric closeness is `max(0, 1 - normalizedDifference / 3)`. The final score is the weighted mean of those closeness values. At least five comparable metrics are required. Evidence rows, strongest similarities, biggest differences, ranking, and summary all come from the same normalized differences.

OPS is weighted most heavily for hitters and ERA for pitchers. Because OPS+ and ERA+ are unavailable, comparisons are not fully league- or park-adjusted; the UI states this limitation. Career charts use real OPS (hitters) or ERA (pitchers), never invented WAR.

## Operational limits

The public MLB Stats API is not a versioned contract, and “All Years” requires many cached year requests on first load. Provider failures return a visible unavailable state; mock statistics are not silently substituted on this page.

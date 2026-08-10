# Minor League data and refresh architecture

DiamondDNA uses official MLB Stats API sport IDs 11 (Triple-A), 12 (Double-A), 13 (High-A), 14 (Single-A), and 16 (Rookie). One teams request discovers affiliates and parent organizations. Five sport-player requests discover official person IDs and current assignments. Ten level/group season-stat requests retrieve hitting and pitching data in batches.

The official person ID is the primary identity across every level and MLB. Statistics remain keyed by player, season, level, and team, so promotions do not merge unlike contexts. A player whose current team changes keeps the same profile and prior level lines. A shared ID can link to an MLB profile.

Central refresh intervals are six hours for identities/assignments, two hours for current-season statistics, and seven days for completed historical seasons. Next.js provides server-side fetch caching. A process-local last-valid snapshot is also retained; if refresh fails, that snapshot is served with `stale: true`. On a cold start with no valid cache, the UI displays an explicit unavailable state rather than mock data.

The browser receives one indexed dataset and performs search, filtering, sorting, and 60-record progressive rendering locally. There is no per-player browser request. A future database is advisable for durable stale snapshots, cross-season MiLB history, and larger longitudinal analysis, but is not required for this cached current-season version.

No prospect rankings or Prospect Gem Score are fabricated. The reserved future model should normalize separately by level and role, incorporate age relative to level, minimum PA/IP, K/BB shape, power or run prevention, and promotion velocity. MLB Gem Score v1 remains isolated and unchanged.

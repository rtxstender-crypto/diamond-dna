# DiamondDNA player data sources

DiamondDNA now attempts the live MLB Stats API provider first and automatically uses the development fallback provider if the live request, HTTP status, or response validation fails. Every fallback value is marked `mock-fallback` and must never be represented as verified MLB data.

All canonical metric fields are nullable. A provider must return `null` when a source does not supply a value or when its meaning cannot be verified. The UI renders those values as `N/A`.

## Intended source map

| Metric group | Intended source | Integration status | Notes |
| --- | --- | --- | --- |
| MLB player ID, name, team, position, age | MLB Stats API season stat splits hydrated with `person,team` | Live | Required identity fields are runtime-validated; malformed splits are skipped. |
| Games, PA, AVG, OBP, SLG, OPS, HR, RBI, SB, BB, K | MLB Stats API current-season hitting stats | Live | Only keys observed and covered by fixtures are mapped. |
| Pitching G, GS, IP, ERA, WHIP, K, BB, saves | MLB Stats API current-season pitching stats | Live | Innings are preserved in MLB's displayed decimal notation; no arithmetic is performed on them yet. |
| Fielding position, games, innings, errors, fielding percentage | MLB Stats API current-season fielding stats | Live when a player-ID match exists | Multiple position splits select the split with the most innings. Missing matches remain null. |
| BB% and K% | Derived from verified MLB Stats API totals, or a vetted advanced-stat provider | Not enabled | Store percentages in 0–100 units. Define pitcher denominator explicitly (batters faced). |
| OPS+ and ERA+ | Vetted advanced-stat provider; MLB Stats API only if the exact returned field is validated | Not enabled | Do not derive without park and league adjustment inputs. |
| OAA | Baseball Savant / Statcast fielder leaderboard export | Not enabled | Statcast metric; coverage varies by season and position. |
| DRS | Sports Info Solutions licensed data | No source/license | DRS is not a Statcast metric. Keep null until a reliable licensed feed exists. |
| WAR and defensive WAR | FanGraphs or Baseball-Reference under an approved data/license agreement | No source/license | Never combine WAR variants silently; record the system in provenance. |
| FIP | FanGraphs feed or locally derived from verified components and the season-specific constant | Not enabled | The constant and formula version must be recorded. |
| Gold Glove, All-Star, Silver Slugger, MVP, Cy Young | MLB Stats API awards/recognition endpoint plus validated award-ID mapping | Not enabled | Career counts require deduplication and tests. Voting finishes may need a separate historical source. |
| Platinum Glove | Rawlings award records or another vetted structured source | No structured source | Keep null until coverage can be verified. |
| MVP/Cy Young voting finishes | BBWAA historical voting data or vetted historical dataset | No adapter | Store season, finish, and points when available. |
| Salary | Licensed compensation source such as Spotrac, Cot's Contracts, or MLBPA data | No source/license | Salary definitions differ; model should distinguish base, luxury-tax, and total compensation later. |

## Provider rules

1. Convert provider payloads into `PlayerRecord`; UI components never consume raw API responses.
2. Attach provenance and retrieval time to each metric group.
3. Keep season and career records separate through `StatContext`.
4. Use MLB player ID as the cross-provider join key, with explicit handling for missing or changed IDs.
5. Validate all external payloads at runtime before mapping them.
6. Cache responsibly, add retry/backoff, and retain the mock provider as a development fallback.
7. Never replace missing values with zero. Zero is a verified result; `null` means unavailable.

## Recommended integration order

1. Add single-player and career-scope MLB Stats API mappings, pagination, and more response fixtures.
2. Add award-ID mapping from MLB Stats API with fixture coverage.
3. Add Baseball Savant OAA import keyed by MLB player ID and season.
4. Add a licensed WAR/FIP provider with explicit bWAR/fWAR provenance.
5. Add voting history and salary only after source reliability and usage rights are settled.

## Live request behavior

- Hitting: `/api/v1/stats?stats=season&group=hitting&season={season}&sportIds=1&playerPool=QUALIFIED&hydrate=person,team`
- Pitching: `/api/v1/stats?stats=season&group=pitching&season={season}&sportIds=1&playerPool=QUALIFIED&hydrate=person,team`
- Fielding: `/api/v1/people?personIds={displayedPlayerIds}&hydrate=stats(group=[fielding],type=[season],season={season})`
- Next.js caches successful requests for one hour (`revalidate: 3600`).
- Any request failure or an empty validated player set activates the mock fallback for the whole board.

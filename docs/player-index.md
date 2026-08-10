# Active MLB player index and profiles

DiamondDNA discovers active players from official MLB sources. It requests `/api/v1/sports/1/players?season=...` once for identity and handedness, `/api/v1/teams?sportIds=1&season=...` once for team metadata, and each of the 30 teams' `/roster?rosterType=active` endpoints in parallel. Active roster membership is the inclusion rule, so Minor League-only and inactive historical players are excluded.

Index requests use Next.js fetch caching with six-hour revalidation. Current-season statistics retain their one-hour cache, while year-by-year career responses retain their 24-hour cache. Identity, current statistics, historical seasons, and Gem Score remain separate so a database can replace the cached index later.

The Players page receives one indexed dataset and performs partial-name search, filters, and sorting locally. It renders 60 results initially and adds results in batches of 60, with no network request per keystroke.

Profiles resolve identity by MLB player ID, combine it with the current-season provider, reuse the unchanged Gem Score v1 engine and ranking, and load season history through the historical provider. If current statistics fail, verified roster identity remains visible and stat sections show N/A. Mock data is never substituted into a real profile.

Limitations: roster transactions can remain stale for six hours. Pitcher role requires current workload and may be N/A. Two-way-player classification follows MLB's primary position. Photos, Minor League players, inactive historical players, favorites, and watchlists are deferred.

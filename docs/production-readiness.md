# DiamondDNA V1 production-readiness audit

Audit date: 2026-08-10

Target: current local `main` working tree

Verdict: **Ready with minor warnings**

DiamondDNA builds cleanly and its primary pages, API routes, fallbacks, validation, and security baseline are suitable for an initial production deployment. The remaining warnings are operational: refreshes are request-driven rather than scheduled, rate limiting is process-local, some MLB/MiLB status overlap needs product-level handling, and a stronger nonce-based Content Security Policy should follow deployment.

## Validation results

- TypeScript: passed (`tsc --noEmit`).
- ESLint: passed with zero warnings/errors.
- Tests: 9 files and 46 tests passed, including provider parsing/fallback, Gem Score, trajectory comparison/request validation, prospect/index logic, assistant validation, and rate limiting.
- Production build: passed on Next.js 16.3.0 with all routes generated and no build warnings.
- Production dependency audit: 0 known vulnerabilities across 130 production/optional packages.
- Secret/artifact review: no tracked `.env`, private key, certificate, log, `.next`, or `node_modules` artifacts found. `.env.example` contains placeholders only.

## Live-data coverage

The reproducible audit command is `node scripts/production-data-audit.mjs --season=2026 --historical`. Results below were retrieved from the official MLB Stats API on the audit date.

| Dataset | Coverage |
| --- | ---: |
| Active MLB roster identities | 778 (389 hitters, 389 pitchers) |
| Active players with role-appropriate current stats | 389 hitters, 387 pitchers |
| Current MLB stat pool | 696 hitter rows, 794 pitcher rows |
| Current MLB roles | 200 starters, 594 relievers |
| Deduplicated MiLB index | 8,210 players across 30 organizations / 201 affiliates |
| MiLB role split | 3,611 hitters, 4,599 pitchers |
| MiLB levels | 1,879 AAA; 1,050 AA; 1,071 High-A; 1,181 Single-A; 3,029 Rookie |
| MiLB stat rows | 4,785 hitter rows; 6,216 pitcher rows |
| Historical seasons, 1950–2025 | 102,266 player-season-role rows |

MLB hitter rows have complete PA, AVG, OBP, SLG, OPS, HR, RBI, SB, walks, and strikeouts. Calculated BB% and K% are available for 627/696 rows. MLB pitcher rows have complete games, starts, innings, strikeouts, walks, saves, K%, and BB%; ERA and WHIP are present for 793/794. Basic MLB fielding is currently requested for only the first 300 player IDs and all 300 parsed successfully. MiLB standard hitting and pitching coverage is similarly strong; MiLB fielding is not currently populated.

WAR, OPS+, ERA+, FIP, OAA, DRS, salary, and awards remain unavailable/inactive and correctly render as N/A rather than fabricated values.

## Integrity findings

- No duplicate final MLB roster IDs, duplicate final MiLB stat-line keys, missing names, missing organizations, impossible ages, negative counting stats, or invalid hitting rates were found.
- 119 player IDs appear in both the hitting and pitching feeds. These are legitimate two-way/cross-role records, but consumers must not assume one stat row per player ID.
- 2,434 MiLB players have season rows at multiple levels. The UI intentionally does not blend those lines.
- 399 IDs appear in both MLB and MiLB-derived indexes. This likely reflects season-derived MiLB participation versus current MLB roster status and should be modeled explicitly before presenting a single universal status label.
- Two extreme ERA values (108.00 and 162.00) were retained because they are source values consistent with tiny samples; the application does not silently rewrite valid outliers.

## Refresh and cache behavior

| Data | TTL | Trigger |
| --- | ---: | --- |
| MLB/MiLB roster identity | 6 hours | Next request/build after expiry |
| Current MLB/MiLB statistics | 2 hours | Next request/build after expiry |
| Historical comparison pool | 24 hours | Next trajectory request after expiry |
| Completed-history configuration | 7 days | Available policy; historical provider currently uses 24 hours |

This is **not real-time data**. Normal revalidation remains traffic/build driven. A Vercel Hobby-compatible scheduler now warms current MLB statistics, combined MiLB identity/statistics, and MLB identity once daily through the existing providers. On Vercel, the underlying `fetch` responses use the shared Data Cache, so the jobs improve freshness even without visitor traffic. Hobby cannot run the jobs every two or six hours; normal traffic still applies those shorter TTLs. The MiLB aggregated stale fallback is process-memory only and will not persist across serverless cold starts.

## Security and resilience

Implemented and verified:

- Strict request parsing, content-type checks, 20 KB assistant body limit, and trajectory parameter allowlisting/range validation.
- Rate limits on assistant and expensive trajectory endpoints, with bounded in-memory key storage.
- Generic public errors and sanitized structured server logs.
- Same-origin API behavior; no permissive CORS headers.
- Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict referrer policy, restrictive permissions policy, and a compatible baseline CSP blocking framing, plugins, foreign base URLs, and foreign form targets.
- No `dangerouslySetInnerHTML`, `eval`, user-controlled redirects, remote image configuration, or obvious path traversal surface found.
- Hidden Gems retains an explicitly labeled mock fallback when live MLB data fails. Unsupported assistant questions refuse rather than inventing game data.

Remaining warnings:

- Rate limiting is per process and trusts proxy forwarding headers. Before multi-instance/public AI usage, use a shared Redis/KV limiter and configure a trusted proxy boundary.
- The assistant's deterministic paths are constrained to stored statistics, but an optional external model rewrite cannot offer a mathematical guarantee against unsupported language. Keep the provider disabled unless needed and monitor outputs.
- The CSP is intentionally deployment-compatible rather than a full nonce-based script/style policy. Add nonces after the hosting platform and analytics requirements are known.
- `DIAMONDDNA_SITE_URL` must be set to the canonical HTTPS production URL.

## Accessibility and responsive review

Keyboard-visible focus styles, reduced-motion behavior, dialog focus trapping/restoration, Escape dismissal, scroll locking, ARIA dialog/status/error state, expanded/control relationships, and accessible labels for search/filter controls were added. Long profile names now wrap safely. Source-level responsive rules remain intact; automated in-app visual traversal was unavailable in the audit environment, so a final manual pass at 320, 375, 768, 1024, and 1440 px is recommended before launch.

## Performance

Measured from the optimized local production server (first request shown):

| Route | HTML response | Response time |
| --- | ---: | ---: |
| `/` | 305,308 B | 264 ms |
| `/players` | 307,061 B | 142 ms |
| `/prospects` | 693,622 B | 304 ms |
| `/hidden-gems` | 218,382 B | 107 ms |
| `/career-trajectory` | 22,434 B | 94 ms |
| `/methodology` | 24,186 B | 24 ms |

The prospects directory was the primary bottleneck. Compact tuple projection and an organization dictionary reduced its HTML from 8,167,544 B / roughly 3.55 s to 693,622 B / 304 ms (about 91.5% smaller). Further pagination or server-side search would be worthwhile as the MiLB population grows.

## Changes made during the audit

- Added production security headers and canonical metadata configuration.
- Hardened assistant/trajectory input handling, timeouts, rate limits, errors, and logging.
- Reduced MLB response/cache payloads with explicit API field selection and aligned current-stat caching to two hours.
- Added accessibility behavior and labels across navigation, directories, filters, and the assistant modal.
- Corrected public data labels and historical coverage wording.
- Reduced the prospects page payload without changing its design or filters.
- Pinned dependency versions and added validation tests plus the reproducible data audit script.

## Deployment checklist

1. Set `DIAMONDDNA_SITE_URL` to the canonical HTTPS URL.
2. Keep any optional AI provider key server-only; never prefix it with `NEXT_PUBLIC_`.
3. Run `pnpm install --frozen-lockfile`, `pnpm test`, and `pnpm build` in CI.
4. Perform the manual responsive/browser matrix noted above.
5. Add uptime/error monitoring and verify the registered cron jobs in Vercel after deployment.
6. Add shared rate limiting before enabling an external AI provider at public scale.
7. Re-run the production data audit after deployment and on MLB/MiLB season-boundary changes.

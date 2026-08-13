# DiamondDNA Trade Value V1 Beta

Trade Value answers: **How valuable is this player as an organizational asset?** It is separate from Gem Score (current performance and undervaluation) and Similarity Score (statistical resemblance between player-seasons).

## MLB formula and weights

MLB values are a weighted 0–100 model: expected future production 32%, contract efficiency 23%, performance-conditioned controlled future value 25%, age curve 8%, position/role scarcity 4%, and stability/evidence confidence 8%. Hitters, starters, and relievers use separate production pools and age/workload curves. Current, previous, and two-seasons-prior inputs are weighted 50/30/20 when present.

Stability evaluates the combined role score across available seasons rather than one statistic. Dispersion, direction, season count, and playing-time/workload samples classify a player as improving, stable, mildly declining, materially declining, or uncertain. Material decline reduces expected future performance to 72% of its weighted observation; mild decline retains 88%; improvement receives only a modest 4% lift. A one-season or small-sample player is uncertain and receives reduced confidence.

Controlled future value is `expected future performance × controlled seasons × evidence confidence`, with pre-arbitration/arbitration cost mix as a modest modifier. Control cannot generate a large score for weak production. Age changes the future-performance curve, control determines how many projected seasons are received, and verified salary determines cost efficiency; youth no longer earns several independent flat bonuses.

- Hitters: OPS, OBP, SLG, BB%, K%, HR, SB, and PA confidence.
- Starters: ERA, WHIP, K%, BB%, innings, starts, and workload confidence.
- Relievers: ERA, WHIP, K%, BB%, innings, saves, and a higher-volatility age/sample curve.

Each metric is normalized to a bounded role-appropriate 0–100 scale. Position is deliberately modest: catcher, shortstop, center field, and starting pitching receive the highest scarcity scores; first base and DH the lowest.

## Contract and control provider

`ContractData` is the integration boundary for current salary, guaranteed money, years remaining, pre-arbitration and arbitration years, options, opt-outs, and free-agent year. Only records marked `verified-provider` are scored. Missing inputs remain null, contribute no hidden points, display `N/A – awaiting verified data`, reduce the visible maximum available score, and cause the result to be called **Provisional Trade Value**.

No restricted salary site is scraped and no term is fabricated. A licensed/authorized structured salary and service-time feed is still required before this beta can be described as fully realistic. The feed must include stable MLB player IDs, transaction-effective dates, retained salary, option terms, and service-time/control status. The model already supports zero contract-efficiency scores for internally negative-value contracts; the public UI labels the overall asset without exposing invented negative dollar surplus.

## Prospect model

**DiamondDNA Statistical Prospect Value** uses verified MiLB statistics and does not imply an industry scouting grade. Pre-risk talent weights are performance 32%, age relative to level 23%, proximity 20%, position 8%, consistency 7%, and sample confidence 10%. That talent is then multiplied by a calibrated development-risk retention factor based on level, sample, consistency, and hitter/pitcher role. Pitchers retain 86% of the otherwise comparable risk factor. Rookie through Triple-A base retention rises from 36% to 77%, then sample and consistency modify it within a bounded 25–88% range.

Prospect tiers are Elite (68+), Premium (58–67.9), Strong (48–57.9), Top-100 Caliber (38–47.9), Interesting Non-Top-100 (24–37.9), Depth (10–23.9), and Organizational Depth (below 10). These are model calibration bands, not claims of inclusion on an external list.

## Package and decision logic

Raw package value is shown alongside adjusted value. Values of 70+ receive an increasing elite-asset consolidation premium. Every piece after the best asset receives diminishing marginal credit; sub-15 pieces are discounted more sharply. This prevents several marginal players from automatically equaling one star.

Each team is judged on `(adjusted value received - adjusted value sent) / larger package`:

- above 12%: Strong Accept
- above 5%: Lean Accept
- -5% through 5%: Fair / Likely Considered
- -12% through -5%: Lean Decline
- below -12%: Strong Decline

Rejected trades report the approximate adjusted-value gap. This is a deterministic balancing target, not a claim that either real club would make the trade.

## Context, performance, and security

Competitive team context is neutral in V1 because no verified standings/roster-needs classifier is connected; every verdict says so. Search is query- and organization-scoped, returns at most 20 compact candidates, and computes values on demand. Provider fetches use existing Next.js caching. Evaluation rejects invalid/same team IDs, empty or over-eight-player packages, duplicate players, wrong-team assets, malformed JSON, bodies over 40 KB, and excessive request rates.

## Current limitations

- No verified contract, service-time, option, retained-salary, injury, transaction, or roster-depth feed is integrated.
- The live UI currently receives the current MLB season from the existing provider; the model and tests support three seasons, but historical season hydration must be connected for live multi-year values.
- MiLB values are statistical only and omit verified scouting grades/rankings.
- Team competitive context and salary-retention mechanics are not applied.
- Balancing reports a value target; organization-player add/replace recommendations are not yet ranked automatically.
- In-memory rate limiting is instance-local on serverless deployments.

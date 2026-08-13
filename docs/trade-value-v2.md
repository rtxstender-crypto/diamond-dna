# Trade Value V2 methodology

Trade Value V2 remains deterministic and is not fantasy value. MLB inputs combine recent three-season production (50/30/20), sample-aware trend regression, age curve, role/position scarcity, evidence confidence, verified cost efficiency, and verified team control. Weights are production 30%, contract 24%, control 28%, age 7%, scarcity 3%, confidence/stability 8%. Missing contract or control inputs are unscored and make the result provisional; they are never guessed.

Trend labels require at least two usable seasons and a minimum workload score. `improving` requires a mean score increase of at least seven points. `materially declining` requires a fall of at least fourteen; noisy or insufficient samples remain `uncertain`. Control value is conditioned on future production and evidence, so control alone cannot make a weak player elite.

Prospects use statistical performance, age relative to level, proximity, position, multi-season movement, workload, and a post-score development-risk multiplier. Lower-level and pitching prospects retain less pre-risk talent. Labels are calibration tiers, not third-party rankings or scouting grades. No Baseball America rank is stored or inferred.

Package evaluation applies an elite-asset scarcity premium (16% at 70+, 28% at 85+) and increasingly discounts secondary assets, especially values below 15. Thus quantity does not automatically replace quality. The best-player/consolidation effect is deterministic. Team competitive context remains neutral until verified data exists.

Limitations: the MLB Stats API does not supply comprehensive contract/service-time data. Those components stay provisional until a verified provider is connected. No player receives a name-based override.

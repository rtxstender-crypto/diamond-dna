# AI Trade Builder

The builder separates language understanding from baseball truth:

1. A bounded parser extracts acquiring team, target, package style/count, and exclusions.
2. DiamondDNA loads verified MLB/MiLB assets and resolves the target.
3. Candidate assets are filtered by verified organization membership and user constraints.
4. Trade Value V2 computes every asset value.
5. The existing validator rejects wrong-team, duplicate, empty, oversized, or self-trade packages.
6. The deterministic evaluation engine supplies totals and verdicts.

The current implementation does not require a model call for common trade requests, which controls cost and prevents hallucinated assets. A future LLM intent adapter may emit only the same constrained intent object; it must never emit authoritative IDs, values, teams, or verdicts. Every package shown to a user is recomputed and validated server-side. Generated packages can be loaded into the simulator for manual refinement.

Limitations: team need, competitive window, payroll, and farm strength are neutral. Conversation context is bounded and must resolve again against current verified data. Missing contract/control data is surfaced as provisional.

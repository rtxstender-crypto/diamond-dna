# Performance and interaction audit

The application already uses server components for route shells and small client islands for search, charts, milestones, Ask DiamondDNA, and trades. Independent homepage and builder data loads run in parallel. MLB/MiLB providers use Next revalidation and stale fallbacks; expensive assistant/trade routes are rate-limited.

Low-risk work in this phase:

- article archive/detail rendering stays server-side;
- metadata and page content share React-cached repository reads;
- theme selection is applied before paint and does not wait for hydration;
- trade search debounces and aborts superseded requests;
- builder feedback is real request state, not fake progress;
- mobile layouts collapse article, editor, package, and simulator grids;
- reduced-motion and visible focus rules remain global.

Deferred larger work: global roster assembly in AI Trade Builder should move to a persisted, scheduled player-value index before high traffic. The current in-memory API rate limiter is per instance; production abuse protection should use a shared store. A formal bundle analyzer and browser performance trace should be run against a deployed preview with production data.

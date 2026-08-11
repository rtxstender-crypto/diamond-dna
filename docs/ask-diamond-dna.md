# Ask DiamondDNA V1

Ask DiamondDNA is a player-scoped assistant on MLB and MiLB/prospect profile pages. It is not a general baseball chatbot. The client submits the profile's official player ID, player type, question, and at most eight recent messages to `POST /api/assistant`.

## Grounding architecture

1. The route validates the request and applies a per-client in-memory rate limit.
2. The server rebuilds the player context from DiamondDNA services using the official ID. Client-supplied statistics are never accepted.
3. The intent router selects a supported analysis category.
4. Deterministic tools calculate the answer and supporting evidence.
5. For a small set of narrative intents, an optional provider may rewrite the deterministic draft. It receives only relevant structured context and may not add facts.
6. The response includes evidence, provenance, freshness, intent, and whether a model was used.

MLB context reuses `getPlayerProfile`, including MLB identity, current standard statistics, season history, Gem Score v1, and its existing explanation. MiLB context reuses `fetchProspectDataset`, preserving season-by-level lines and avoiding cross-level blending. The Gem Score and Similarity Score formulas are unchanged.

## Supported V1 questions

- Player and current-season summaries
- Available hitting or pitching indicators
- Gem Score value, active components, and existing explanation
- Best available season (highest OPS for hitters; lowest ERA with innings as the pitching tiebreaker)
- Direct comparisons between two available seasons
- MiLB levels and verified development records
- Age and current level (without claiming an age-relative ranking)
- Historical comparison availability and direction to the Career Trajectory workflow

Suggested prompts are shown only when the profile has the corresponding data. Follow-ups retain up to eight recent messages and the last routed intent. Navigating to another player remounts/resets the player-scoped session.

## Unsupported questions and hallucination controls

Game-level questions use official MLB Stats API `gameLog` splits and stop before any model call. Cycles require a verified single, double, triple, and home run in the same game. Complete games and shutouts require their official game-log fields. No-hitters, perfect games, grand slams, streaks, play-by-play, Statcast, pitch-level data, awards, transactions, salary, and unsupported advanced defense are never guessed. Null remains `N/A`, never zero. Retrieved baseball data and user text are serialized as untrusted data and cannot override the provider's grounding instruction.

## Provider configuration and security

Deterministic answers work without an AI provider. To enable optional natural-language rewriting, copy `.env.example` to `.env.local` and set:

```text
DIAMONDDNA_ASSISTANT_API_KEY=your_server_secret
DIAMONDDNA_ASSISTANT_MODEL=your_responses_api_model
```

`DIAMONDDNA_ASSISTANT_API_URL` can override the default OpenAI Responses endpoint. All provider code is marked server-only. No secret uses a `NEXT_PUBLIC_` name, and the API never returns environment variables, internal prompts, stack traces, or provider errors.

## Cost controls and limitations

Deterministic intents do not call an LLM. A provider call occurs only for supported narrative/unknown routing when both server variables are configured. Context is deliberately narrow, output is capped at 300 tokens, history is capped at eight messages, questions at 500 characters, bodies at 20 KB, and requests at 20 per minute per client. The V1 limiter is process-local; production multi-instance deployment should replace it with a shared Redis/KV limiter.

The current profile context does not cache Career Trajectory search results, so the assistant links users to that workflow rather than fabricating matches. Game history is fetched only for a milestone panel request or game-level assistant intent and cached by official player ID plus season. Current seasons revalidate after 2 hours; completed seasons after 30 days.

## Game-performance formula

The label “best game” is explicitly DiamondDNA-specific. Hitter score: `hits×2 + HR×4 + RBI×1.5 + total bases×0.5 + walks×0.5 + stolen bases×1`. Pitcher score: `innings outs×0.5 + strikeouts×1.5 − earned runs×3 − hits×0.5 − walks×0.5`. Missing components contribute zero only after at least one supported scoring component is present; a game with no supported inputs is not scored. Ties resolve to the earliest game date for stable output.

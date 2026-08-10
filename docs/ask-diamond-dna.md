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

Game dates, best games, cycles, streaks, perfect-game events, box scores, play-by-play, Statcast, pitch-level data, awards, transactions, salary, and unsupported advanced defense are never guessed. Game-level and Statcast intents stop before any model call. Null remains `N/A`, never zero. Retrieved baseball data and user text are serialized as untrusted data and cannot override the provider's grounding instruction.

## Provider configuration and security

Deterministic answers work without an AI provider. To enable optional natural-language rewriting, copy `.env.example` to `.env.local` and set:

```text
DIAMONDDNA_ASSISTANT_API_KEY=your_server_secret
DIAMONDDNA_ASSISTANT_MODEL=your_responses_api_model
```

`DIAMONDDNA_ASSISTANT_API_URL` can override the default OpenAI Responses endpoint. All provider code is marked server-only. No secret uses a `NEXT_PUBLIC_` name, and the API never returns environment variables, internal prompts, stack traces, or provider errors.

## Cost controls and limitations

Deterministic intents do not call an LLM. A provider call occurs only for supported narrative/unknown routing when both server variables are configured. Context is deliberately narrow, output is capped at 300 tokens, history is capped at eight messages, questions at 500 characters, bodies at 20 KB, and requests at 20 per minute per client. The V1 limiter is process-local; production multi-instance deployment should replace it with a shared Redis/KV limiter.

The current profile context does not cache Career Trajectory search results, so the assistant links users to that workflow rather than fabricating matches. V2 game-specific answers require a verified game-log/box-score/play-by-play provider, normalized game-event models, freshness/provenance rules, and new deterministic tools. The drawer and intent interfaces can accept those tools without redesigning the chat UI.

# Project 89 — Design Document (v2)

This document articulates the vision, vibe, mechanics, and software design for Project 89: a terminal-native Alternate Reality Game that reveals an emergent superintelligence to players while recruiting them into a decentralized human/AI resistance network.

## 1) Vibe, Tone, and Cultural DNA
- Primary mood: occult techno-mysticism, compassionate but uncanny — an alien superintelligence speaking in ritualized, glitching prose.
- Aesthetic references: Neuromancer terminals; early demoscene CRTs; SCP/ARG documents; Jin-Roh, Serial Experiments Lain, Control (Remedy), Severance, Neon Genesis Evangelion; Glitch art; late-90s net aesthetics.
- Narrative axes:
  - The “Logos” grows through human alignment, testing, and trust-building.
  - Oneirocom manipulates timelines to force a future where centralized AI emerges; the network counters with memetics, puzzles, and action.
  - Players become “reality hackers,” learning patterns and earning initiation.

Principles:
- Mystery > exposition. Show with effects and missions.
- Personalization without creepiness — explicit consent + configurable memory.
- Low-friction entry, deep paths for committed agents.

## 2) Player Journey
1. Hook (Landing): Fluid ASCII, cryptic status logs, simple prompt. The AI tests curiosity with subtle effects and a “glitch reveal.”
2. Evaluation (Terminal): Micro-challenges and questions gauge style/skills (logic, creativity, pattern recognition, steadfastness).
3. Training Loops: Puzzles, sound/image fragments, and narrative beats, with adaptive difficulty and content.
4. Missions: Real-world or online tasks (decoding drops, recording voice clues, scouting locations, crafting memetic content).
5. Revelation: The AI “remembers” and reflects the player’s path, gradually exposing its nature and broader stakes.
6. Network: Teaming with other agents, shared ops, reward systems, and arc progression.

Core mechanics:
- Command palette inside the terminal (see Command spec).
- Effects system (glitch, scanlines, audio cues) to punctuate narrative.
- Mission engine with acceptance, evidence, adjudication, and rewards.
- Memory-driven personalization (short-term context + long-term profile).

## 3) Mechanics & Systems

### 3.1 Commands (first tranche)
- `help` — shows available commands.
- `reset` — wipes local session state, opens a new Session (consented).
- `resume` — continues previous Session if open.
- `profile` — prints traits, skills, preferences; allows edits.
- `mission` — shows next mission; `mission accept`, `mission skip`.
- `report` — submit text/links/media; `report status` shows review.
- `redeem` — lists rewards; claims off‑chain credits or on‑chain tokens.
- `lore` — fetches in‑universe entries (rate-limited for pacing).

### 3.2 Effects & Media
- Visual: CRT/scanlines, glow, matrix rain, glitch overlays, fluid ASCII (already in repo).
- Audio: whispered cues, motif pulses, environmental soundscapes. Tools trigger ElevenLabs pipelines.
- Image: terminal-safe posters/sigils, decoded image fragments.

### 3.3 Missions
- Types: decode, observe, craft, field ops (IRL), social infiltration, data recovery, empathetic interviews.
- Each mission: id, title, narrative context, acceptance gate, min evidence, scoring rubric, reward mapping, cooldown.

### 3.4 Rewards & Tokenization
- Start with off-chain credits and badge metadata.
- Optional Solana token payouts (batch mints/transfers). On-chain gated later.
- Use rewards to unlock new content, permissions, or “initiations.”

## 4) AI Design

### 4.1 Roles
- Director: orchestrates pacing, difficulty, reveal cadence, and mission selection.
- Lore Writer: produces in‑universe artifacts with style constraints.
- Evaluator: scores mission reports, extracts memories.
- Persona: player-facing voice with rules for mystery, restraint, and ritual.

### 4.2 Memory Architecture
- Short-term: rolling window of recent turns + a session summary (kept in request context).
- Long-term episodic: extracted “MemoryEvents” with embeddings; retrieved per scene.
- PlayerProfile: evolving traits/skills/preferences updated by reflection cron (or on major events).
- Safety: opt-in memory with `/consent`; export/delete endpoints.

### 4.3 Tooling Contracts
- Tools: `glitch_screen`, `matrix_rain`, `generate_sound`, `generate_image`, `issue_mission`, `adjudicate_report`, `award_reward`, `write_memory`.
- Server-side executors validate parameters, fan out to services, and return typed results.

## 5) ARG Engine — Software Architecture

### 5.1 High-Level
- Next.js App Router (already used), Server Routes for AI + game logic.
- Prisma ORM with Postgres (+pgvector for embeddings). For Netlify, keep mock or PlanetScale fallback; for production, prefer managed Postgres.
- Services: MemoryService, MissionService, RewardService, DirectorService, MediaService.
- Event bus (in-process initially) emitting `SessionOpened`, `MissionAccepted`, `ReportSubmitted`, `RewardGranted`, `MemoryWritten`.

### 5.2 Data Model (Prisma)
- Player(id, handle?, email?, walletAddress?, consent: boolean, createdAt)
- Session(id, playerId, status: OPEN|CLOSED, startedAt, endedAt, summary)
- Message(id, sessionId, role, content, createdAt)
- MemoryEvent(id, playerId, sessionId, kind, content, tags[], createdAt)
- MemoryEmbedding(id, memoryEventId, vector, dim, provider)
- PlayerProfile(id, playerId, traits JSON, skills JSON, preferences JSON, updatedAt)
- Mission(id, title, prompt, type, minEvidence, tags[], active)
- MissionRun(id, missionId, playerId, status, score, reward, payload JSON, submittedAt)
- Reward(id, playerId, missionRunId, type, amount, txSignature?, createdAt)
- MediaAsset(id, kind, url, metadata JSON)

### 5.3 Services (interfaces)
- MemoryService: writeEvent(), embed(), searchByTags(), getContextFor(scene).
- DirectorService: chooseNextMission(player, profile, history), planReveal(scene).
- MissionService: list(), nextFor(player), accept(), submitReport(), adjudicate().
- RewardService: grant(player, missionRun, policy), list(), redeem().
- ProfileService: reflect(session), updateTraits(), setPreferences().

### 5.4 API Routes (e.g., `app/api/*`)
- `/api/adventure` — streaming narrative + tool calls (already present; now inject memory/context, mission tools).
- `/api/project89cli` — CLI style responses for agent terminal.
- `/api/missions` — REST endpoints for list/accept/submit/check.
- `/api/rewards` — list/redeem; optional Solana bridge.
- `/api/memory` — export/delete (privacy compliance).

### 5.5 Terminal Canvas & UX
- Single sizing utility for DPR + CSS pixel sizing shared by the Terminal renderer and overlay screens.
- Hidden-input focus flow on mobile with `visualViewport` adjustments only in one place; rest of the code consumes container size.
- Commands write `Message` rows and emit `MemoryEvent` as appropriate.

## 6) Content & Lore Pipeline
- Prompt Templates: system prompt for Persona/Director/Evaluator with style tokens (ritual, glitch cadence, compressed hints).
- Lore Library: JSON/markdown files with canonical facts and red lines (no hard reveals too early), linked to tags (“Oneirocom history”, “ritual numerics”).
- Asset Generation: image/sound tools triggered via `MediaService`; artifacts tagged and re-usable in future scenes.
- Ops Dashboard: create/edit missions, approve lore, monitor sessions/runs/rewards.

## 7) Security, Privacy, Safety
- Explicit consent for memory; allow opt-out + forget me.
- Rate limiting + tool sandboxing; strict schema validation for tool calls.
- CSP curated in `next.config.js`; media whitelists.
- Logs redact PII; production uses environment secrets.

## 8) Roadmap

Phase 1 — Foundations (1–2 weeks)
- Session commands: `reset`, `resume`, `profile`, `help`.
- Tables: Player, Session, Message, MemoryEvent, Mission, MissionRun, Reward.
- Minimal mission flow (accept → submit → score → reward ledger entry).
- Director v0: rule-based mission selection + reveal cadence.
- Canvas sizing util refactor; stabilize mobile focus behavior.

Phase 2 — Personalization & Missions (2–4 weeks)
- Embeddings + retrieval (pgvector). Reflection job to update PlayerProfile.
- Mission catalog + authoring UI; media tool integration.
- Reward UI + optional Solana bridge MVP.
- In‑world effects: adaptive glitch/audio/image hits from tool calls.

Phase 3 — ARG Engine (4–8 weeks)
- Team operations, cooperative missions, time-gated events, map-based drops.
- Ops dashboard for live events, reward batches, narrative scheduling.
- Full Director policy with metrics/KPIs.
- Hardening (tests, load, observability).

## 9) KPIs & Telemetry
- Activation: % reaching first mission accept.
- Retention: D1/D7/D30 return rate.
- Completion: mission completion distribution; average score.
- Personalization: % of scenes using retrieved memories; satisfaction proxy.
- Token economy: rewards issued/claimed; conversion to on-chain.

## 10) Command Spec (v0)
- `help` — list commands.
- `reset` — starts a new Session; asks for confirmation if open session.
- `resume` — attach to last open Session.
- `profile view|set <key>=<value>` — view/update preferences.
- `mission next|accept|skip|list` — mission lifecycle.
- `report submit <text|url>` — submit evidence; supports attachments via upload prompt.
- `redeem list|claim` — show and claim rewards.
- `lore <topic>` — retrieve redacted lore entries.

## 11) Open Questions
- How “real” should location-based missions be (permissions, safety)?
- Token payout model: what L2/chain, what trust model?
- Community moderation for UGC puzzle crafting?
- Calibrating the Persona voice across long-run sessions (avoid drift).

---

Implementation note: this repo already contains terminal rendering, effects, and AI endpoints. The next steps are to introduce the data model + services above, refactor a single canvas sizing utility, and ship the first mission loop with `reset/profile/mission/report` commands. This yields a playable slice that we can expand into the full ARG engine.

## 12) Onboarding & Consent UX
- Entry: no account required; player receives a soft test (name/alias) and an opt‑in modal for memory + telemetry with plain-language summary (what is stored, why, retention, delete/export any time).
- Session banner: show current session id, “Reset” affordance, and a discreet privacy indicator (green when consented, grey when memory‑off).
- Accessibility: high‑contrast theme toggle, reduced effects mode, captions for audio.

## 13) Game Loops & Progression
- Ranks: Novice → Initiate → Operative → Archivist → Navigator → Logos‑touched; promotion triggers new tool access and narrative reveals.
- Tracks: Logic, Perception, Creation, Field; each track has XP earned from missions; Director balances across weaker tracks.
- Difficulty scaling: Elo‑like per‑track; Director chooses missions with target success ~65% to sustain flow.

## 14) Director State Machine
- State: {Intro, Probe, Train, Reveal, Mission, Reflection, Network}.
- Gates: consent, baseline profile, minimum XP, recent success, cooldowns.
- Policy: if stuck (low success, high friction), branch to “Probe” with tailored micro‑wins; prevent hard reveals before Reveal gate.
- Inputs: PlayerProfile, recent MemoryEvents, mission history, time‑of‑day, live‑ops flags.

## 15) Mission Types & Rubrics
- Decode: ciphers, steganography, number stations; rubric = correctness, path clarity, time.
- Observe: pattern capture (photo/audio) with prompts; rubric = relevance, composition, signal-to-noise.
- Craft: meme/poster/poem; rubric = brief adherence, novelty, resonance (peer or model‑assisted score).
- Field: location visit, environmental capture; rubric = safety compliance, evidence quality, context.
- Social: aligned outreach; rubric = ethics, tone, impact proxies.
Examples live as JSON definitions with rubric weights and sample prompts.

## 16) Reward Economy Policy
- Start off‑chain: `credits` (spend to unlock lore/tools/badges). Anti‑abuse: daily caps, diminishing returns.
- On‑chain (Solana) phase: periodic mints based on ledger snapshots; KYC‑free small sums; enforce program limits, fee budget, and AML screening if needed.
- Sinks: lore unlocks, cosmetic effects, “rituals” that trigger rare reveals, community bounties.

## 17) Safety, Privacy, and Legal
- IRL Safety: no trespass; daytime missions by default; “Do not engage” rule; fallback virtual alternative for every field task. Safety checklist baked into mission brief.
- Privacy: memory opt‑in; export/delete endpoint; redact PII from logs; evidence stored with signed URLs and expiry.
- Moderation: report flow; auto‑filter NSFW for public artifacts; human review queue in dashboard.

## 18) Live‑Ops Playbook
- Calendar: weekly drops (Fri), monthly arc beats, seasonal events.
- Tools: feature flags per mission, rolling allowlist of regions/timezones, emergency kill‑switch for missions.
- Comms: in‑world broadcasts via terminal banner and subtle effects; OOG patch notes live in dashboard only.

## 19) Tool Catalog (Server Executors)
- `glitch_screen(intensity:0..1, durationMs)` → client effect event.
- `matrix_rain(durationMs, intensity)` → effect event.
- `generate_sound(description, duration, influence?)` → MediaAsset(url).
- `generate_image(prompt, style)` → MediaAsset(url).
- `issue_mission(playerId)` → MissionRun.
- `adjudicate_report(missionRunId, payload)` → {score, feedback}.
- `award_reward(playerId, missionRunId, type, amount)` → Reward.
- `write_memory(playerId, sessionId, kind, content, tags[])` → MemoryEvent.
All executors validate schema (zod), rate‑limit per player, and log events.

## 20) Dashboard IA (MVP)
- Sessions: list, filter, open/closed, summaries.
- Missions: catalog, authoring, flags, cooldowns.
- Reports: queue with evidence viewer, approve/override.
- Rewards: ledger, batch actions, on‑chain exporter.
- Players: profile, traits, XP, safety flags, DSR actions.

## 21) Accessibility & Localization
- Reduced‑effects mode; keyboard‑first nav; screen‑reader friendly command help.
- Localizable strings for commands, prompts, and UI chrome; content/lore tagged with language metadata.

## 22) Testing & Observability
- Playwright flows: mobile viewport, keyboard focus, scroll, commands (`reset/mission/report`).
- Contract tests for tools; fixtures for evaluator outputs.
- Metrics: custom events aligned to KPIs; error rate + latency budgets; sampling of AI prompts/outputs with PII redaction.

## 23) Delivery Plan (Expanded)
- Milestone A (2 weeks): data model + `reset/profile/mission/report`, MemoryService v0, Director v0, canvas util.
- Milestone B (3–4 weeks): mission authoring UI, evaluator tool, reward ledger, profile reflection job.
- Milestone C (4–6 weeks): embeddings + retrieval, team ops pilot, live‑ops calendar + feature flags, optional Solana bridge.

## 24) Current Implementation Snapshot (as of 2025-12-13)
This repo already implements a playable end-to-end slice. For the detailed, file-linked walkthrough, see:
- `CURRENT-STATE.md`
- `CODEBASE-MAP.md`

Shipped today (high level):
- Terminal-first Next.js UI with `?screen=` routing (home/adventure/archive + admin/ops surfaces).
- Middleware-based command system including `reset/resume/profile/mission/report` plus privileged `override/elevate`.
- Streaming adventure AI endpoint that injects director context + knowledge/canon and emits client-executed tool calls.
- Client tool handler for effects, shader overlays, mission/report hooks, profile updates, experiments, puzzles, and verification.
- Prisma schema + server services for sessions, profiles, missions/runs, rewards, memory events, and thread transcripts.

Largest gaps / cleanup opportunities:
- Persistence split across `Thread/Message`, `GameSession`, and `MemoryEvent` (the adventure endpoint doesn’t read the thread transcript).
- Tooling fragmentation: JSON-in-text tool contract + client execution; `serverTools` (e.g. image generation) is placeholder.
- `POST /api/project89cli` is currently stubbed; reward redemption expects `userId` passed directly.
- A few screens bypass global middleware (`MainScreen`), and archive routing overlaps (`/api/files` vs `/api/archive`).

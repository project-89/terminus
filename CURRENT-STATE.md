# Project 89 Terminus — Current Codebase State (Snapshot)

Last audited: 2025-12-13

This document describes what is implemented *today* in this repo (vs. the target vision in `designDoc.md`). It focuses end‑to‑end on the shipped UX: terminal UI → command/middleware pipeline → API routes → prompting/tools → missions/rewards/persistence.

## 1) Player UX: Terminal Surfaces

**Entry**
- `/` renders `TerminalCanvas` (`app/page.tsx`, `app/components/TerminalCanvas.tsx`) and chooses the initial surface via `?screen=<name>` using `ScreenRouter` (`app/lib/terminal/ScreenRouter.ts`).
- Mobile UX is heavily optimized: hidden input to summon keyboards, `visualViewport` resize handling, dynamic bottom padding, and tap‑to‑focus behaviors (`app/components/TerminalCanvas.tsx`).

**Primary screens (ScreenManager)**
- `home` → `FluidScreen`: animated “fluid ASCII” background with an overlay menu (`app/lib/terminal/screens/FluidScreen.ts`).
- `adventure` → `AdventureScreen`: the main narrative loop (boot sequence, then chat/command turns) (`app/lib/terminal/screens/AdventureScreen.ts`).
- `archive` → `ArchiveScreen`: full‑screen canvas file browser / artifact viewer (`app/lib/terminal/screens/ArchiveScreen.ts`).

**Privileged / internal screens**
- `scanning` → `ScanningScreen` and `consent` → `ConsentScreen`: part of the privileged “identify” flow (requires full access in `systemCommandsMiddleware`) (`app/lib/terminal/screens/ScanningScreen.ts`, `app/lib/terminal/screens/ConsentScreen.ts`).
- `main` → `MainScreen`: internal tool hub / operator interface (`app/lib/terminal/screens/MainScreen.ts`).
- `dashboard` → `AdminDashboardScreen`: canvas-based admin surface inside the terminal router (`app/lib/terminal/screens/AdminDashboardScreen.ts`).
- `archives` → `ArchivesDashboardScreen`: placeholder-style archives dashboard surface (`app/lib/terminal/screens/ArchivesDashboardScreen.ts`).
- Ops tool “surfaces” (specialized screens): `hyperstition`, `scanner`, `sigils`, `consciousness`, `dreamscape` (`app/lib/terminal/ScreenManager.ts`).

## 2) Terminal Engine: Rendering, Input, Streaming, Tool Calls

**Terminal core**
- `Terminal` is the singleton engine: maintains the render loop, buffer, scrolling, input handling, and stream parsing (`app/lib/terminal/Terminal.ts`).
- Screens are instantiated and swapped by `ScreenManager` (`app/lib/terminal/ScreenManager.ts`) via the URL-aware `ScreenRouter` (`app/lib/terminal/ScreenRouter.ts`).

**Command dispatch**
- Typical screens extend `BaseScreen`, which composes a middleware chain around `handleCommand` (`app/lib/terminal/screens/BaseScreen.ts`).
- Notable exception: `MainScreen` overrides `handleCommand` and bypasses the `BaseScreen` middleware chain (important for global commands consistency) (`app/lib/terminal/screens/MainScreen.ts`).

**How tool calls work today**
- Tool calls are executed client-side by parsing streamed text for standalone JSON tool lines (and additionally ` ```json` / ` ```tool` fenced blocks) in `Terminal.processAIStream()` (`app/lib/terminal/Terminal.ts`).
- Expected format (single line):
  - `{"tool":"<name>","parameters":{...}}`
- Parsed tool calls emit `tool:<name>` via `toolEvents` (`app/lib/terminal/tools/registry.ts`) and are handled by `ToolHandler` (`app/lib/terminal/components/ToolHandler.ts`).

## 3) Command + Middleware Pipeline (What commands exist)

**Global middleware chain (BaseScreen)**
1. `overrideMiddleware` (`app/lib/terminal/middleware/override.ts`)
2. `systemCommandsMiddleware` (`app/lib/terminal/middleware/system.ts`)
3. `navigationMiddleware` (`app/lib/terminal/middleware/navigation.ts`)
4. Screen-specific middleware (varies by screen)

**Key command surfaces**
- `override <code>` / `elevate <code>` → POST `/api/override`, sets `TerminalContext.hasFullAccess` and `accessTier` (1 or 2), then streams an in-world “access granted” response (`overrideMiddleware`).
- `dashboard` → opens `/dashboard` in a new tab when `hasFullAccess` is true (`overrideMiddleware` + Next page at `app/dashboard/page.tsx`).
- Non-privileged, core loop commands (available without override): `help`, `reset/new`, `resume`, `profile`, `mission`, `report` (`systemCommandsMiddleware`).
- Privileged commands (require `hasFullAccess` in `systemCommandsMiddleware`): wallet actions (`connect`, `disconnect`, `identify`) and effect triggers (`glitch`, `rain`, `sound`), plus operator tooling (`oracle`, `ops …`).
- Navigation shortcuts: `main` (→ `home`), `archive` (→ `archives`) (`navigationMiddleware`).

## 4) API Routes: Endpoints That Power the Experience

**Narrative + tools**
- `POST /api/adventure` (`app/api/adventure/route.ts`): streaming model output for Adventure; builds a system prompt from director context + local knowledge + IF canon; defines tool schemas (zod) and gates tools by trust/access; records MemoryEvents on completion.
- `POST /api/tools` (`app/api/tools/route.ts`): list/run “ops tools” loaded from `app/ops-tools/*.md`; streams model output (used by `ops …` and admin surfaces).

**Sessions, profile, missions, reports**
- `POST /api/session` (`app/api/session/route.ts`): reset or resume a `GameSession` by handle.
- `GET/PATCH /api/profile` (`app/api/profile/route.ts`): fetch/update `PlayerProfile` (traits/skills/preferences).
- `GET/POST /api/mission` (`app/api/mission/route.ts`): fetch “next mission” or accept a mission (creates a `MissionRun`).
- `POST /api/report` (`app/api/report/route.ts`): submit mission evidence; adjudication happens in `missionService`; records mission reports as MemoryEvents.
- `GET/POST /api/rewards` (`app/api/rewards/route.ts`): reward balance + catalog; redemption (currently expects `userId` provided directly).

**Conversation persistence**
- `GET/POST/PATCH /api/thread` (`app/api/thread/route.ts`): thread + message persistence; used by `AdventureScreen` to hydrate recent history. (The adventure AI endpoint does not currently read from thread history; it relies on the client’s `messages` payload + director context.)

**Media + archive**
- `POST /api/sound` (`app/api/sound/route.ts`): ElevenLabs TTS/SFX generation; consumed by `generate_sound` tool.
- `GET /api/media` (`app/api/media/route.ts`): returns a static list of “base tracks” from `public/media/*`.
- `GET /api/archive` (`app/api/archive/route.ts`): archive listing + content via a `fileProvider` abstraction (`app/lib/files/*`).
- `GET /api/files` (`app/api/files/route.ts`): archive browsing via direct FS reads under `public/archive` (overlaps conceptually with `/api/archive`).

**Admin + misc**
- `POST /api/admin/analyze` (`app/api/admin/analyze/route.ts`): streaming “Architect” analysis channel used by the `/dashboard` UI.
- `POST /api/verify` (`app/api/verify/route.ts`): server-side verification for `verify_protocol_89`.
- `POST /api/notes` (`app/api/notes/route.ts`): agent notes persistence (used by puzzle tools).
- `GET/POST /api/experiments` + `POST /api/experiment` (`app/api/experiments/route.ts`, `app/api/experiment/route.ts`): experiment log APIs (used by experiment tools).
- `POST /api/project89cli` (`app/api/project89cli/route.ts`): currently a stub/placeholder.
- `POST /api/save-content` / `POST /api/generate-content` / `POST /api/generate-items`: content utilities used by internal flows and archive tooling.
- `GET/POST /api/graphql`: Apollo server wrapper over `app/graphql/schema.graphql` + resolvers.

## 5) Prompting: Director Context, Knowledge, Canon

**Prompt assembly**
- `buildAdventureSystemPrompt()` (`app/lib/ai/promptBuilder.ts`) produces the “LOGOS” system prompt and explicitly documents the JSON tool line contract.
- `buildDirectorContext()` (`app/lib/server/directorService.ts`) injects dynamic state (phase, trust score, success rate, mission/puzzle state, experiments, and recent memory).
- `loadKnowledge()` (`app/lib/ai/knowledge.ts`) reads from `app/knowledge/*` and includes a small snippet set (currently a simple slice, not semantic retrieval).
- `loadIFCanon()` (`app/lib/ai/canon.ts`) prefers `app/knowledge/if-canon.txt` when populated; otherwise falls back to the legacy `app/lib/prompts/adventure.txt`.

**Model wiring**
- Model selection is centralized in `app/lib/ai/models.ts` (Gemini defaults with env overrides like `PROJECT89_ADVENTURE_MODEL`).
- Streaming is via the Vercel AI SDK (`ai`), returning a streamed text response to the client.

## 6) Tools: Effects, Missions, Profile, Experiments, Puzzles

Tools are executed client-side by `ToolHandler` (`app/lib/terminal/components/ToolHandler.ts`) in response to `toolEvents` emitted by `Terminal.processAIStream()`.

**Implemented tool names**
- Visual/audio: `glitch_screen`, `matrix_rain`, `generate_sound`, `generate_shader`
- Persona/navigation: `persona_set`, `screen_transition`
- Mission flow: `mission_request`, `mission_expect_report`
- Profile: `profile_set`
- Experiments: `experiment_create`, `experiment_note`
- Puzzles: `puzzle_create`, `puzzle_solve`
- Verification: `verify_protocol_89`

**Notable tool behaviors**
- `generate_shader` is routed through the UI overlay layer (`app/components/ShaderOverlay.tsx`) to render a fragment shader on top of the terminal canvas.
- `puzzle_create` / `puzzle_solve` persist state via `POST /api/notes` (`key: "puzzle:active"`); the Director reads this via `directorService` to constrain the narrative.
- `mission_expect_report` sets `TerminalContext.expectingReport`, which causes the adventure middleware to interpret the next user input as a report submission.

## 7) Missions, Reports, Rewards: What’s Actually Live

**Mission definitions**
- Canonical mission catalog lives in `app/lib/missions/catalog.ts` and is served/used by `app/lib/server/missionService.ts`.

**Lifecycle (current)**
1. `mission` command or `mission_request` tool → `POST /api/mission` → creates a `MissionRun` in `ACCEPTED` state.
2. User submits evidence via:
   - `report <text>` command (system middleware), or
   - freeform chat while `expectingReport` is true (adventure middleware auto-submits to `/api/report`).
3. `POST /api/report` → `submitMissionReport()` adjudicates + updates run status/score and grants rewards (via `rewardService`); report text is recorded as a MemoryEvent.

## 8) Persistence + Data Model (Prisma)

**Schema**
- Data model lives in `prisma/schema.prisma` (Prisma client in `app/lib/prisma.ts`).
- The schema includes (non-exhaustive): `User`, `GameSession`, `Thread`, `Message`, `PlayerProfile`, `MemoryEvent` (+ embeddings), `MissionDefinition`, `MissionRun`, `Reward`, `Experiment` (+ events), `AgentNote`.

**Runtime state**
- Client state is cached in `TerminalContext` and persisted in `localStorage` under `terminalState` (`app/lib/terminal/TerminalContext.ts`).
- Server persistence is split across:
  - `Thread/Message` (conversation transcript for AdventureScreen hydration)
  - `GameSession` (session identity + mission linkage)
  - `MemoryEvent` (episodic memory used by Director context)

## 9) Ops/Admin UX

**Two dashboards exist**
- `/dashboard` (React UI): web dashboard that calls `POST /api/admin/analyze` for an “Architect” assistant channel (`app/dashboard/page.tsx`).
- `?screen=dashboard` (terminal screen): canvas-based AdminDashboardScreen for running ops tools and showing streamed output (`app/lib/terminal/screens/AdminDashboardScreen.ts`).

**Ops tools**
- `app/ops-tools/*.md` defines operator prompts; `loadOpsTools()` parses frontmatter-ish metadata and content (`app/lib/opsTools/loader.ts`).
- `ops list` / `ops run <name>` in the terminal calls `POST /api/tools`.

## 10) Notable Gaps / Inconsistencies (Good targets for cleanup)

- **Persistence split-brain:** `Thread/Message` (adventure transcript) vs `GameSession` (mission loop) vs `MemoryEvent` (director context). These are all real, but not yet unified into a single “source of truth” for prompting and replay.
- **Tooling fragmentation:** multiple “tool registries” exist (`ToolHandler` + `app/lib/terminal/tools/*` + `serverTools` placeholder). The runtime contract relies on streamed JSON lines rather than server-side execution.
- **`/api/project89cli` is stubbed:** client codepaths exist, but the endpoint currently returns a placeholder.
- **Global command consistency:** most screens use `BaseScreen` middleware, but `MainScreen` bypasses it, so global commands can behave differently there.
- **Overlapping archive endpoints:** `/api/files` and `/api/archive` overlap in responsibility.

If you want, the next natural documentation step is a “trace map” per feature (mission/report, tool execution, ops tools) with sequence diagrams; this snapshot is meant to be the shared baseline.


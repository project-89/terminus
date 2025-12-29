# Director System Implementation Tasks

This document tracks the implementation status of the Director, Trust/Layer, and Experiment systems as specified in `designDoc.md` and `docs/UX-DESIGN.md`.

---

## 1. Trust & Layer System

### Current State (95% Complete)

**Implemented:**
- 6-layer architecture defined (Layer 0-5)
- Trust thresholds: 0.0-0.2 / 0.2-0.4 / 0.4-0.6 / 0.6-0.8 / 0.8-0.95 / 0.95+
- **NEW: Persistent trust storage** in PlayerProfile (`trustScore`, `layer`, `trustHistory`, `lastActiveAt`)
- **NEW: Trust decay** via `applyDecay()` - exponential decay based on days since last activity
- **NEW: Layer ceremonies** - narrative moments when crossing thresholds (`ceremonies.ts`)
- **NEW: Progressive tool unlock** - `getLayerTools()` returns layer-specific tool lists
- **NEW: Per-track difficulty fields** - `trackLogic`, `trackPerception`, `trackCreation`, `trackField`
- Layer-specific prompt files with ceremony injection
- Tool gating by layer (not just trust threshold)

**Files:**
- `/app/lib/server/trustService.ts` - NEW: Trust evolution, decay, layer tools
- `/app/lib/ai/layers/ceremonies.ts` - NEW: Layer transition narratives
- `/app/lib/ai/layers/index.ts`
- `/app/lib/ai/layers/layer0-mask.ts`
- `/app/lib/ai/layers/layer1-bleed.ts`
- `/app/lib/server/directorService.ts` - Updated: uses persistent trust
- `/app/lib/ai/promptBuilder.ts` - Updated: injects ceremony prompts
- `/app/api/adventure/route.ts` - Updated: layer-based tool filtering, ceremony completion
- `/prisma/schema.prisma` - Updated: trust fields in PlayerProfile

### Remaining

| Task | Priority | Description |
|------|----------|-------------|
| **Trust Advancement Triggers** | MEDIUM | Define specific actions that increase trust beyond mission/experiment scores |
| **Anti-Gaming Protection** | LOW | Prevent trust from jumping multiple layers at once |
| **Layer Files Split** | LOW | Create separate `layer2-crack.ts`, `layer3-whisper.ts`, etc. |

---

## 2. Experiment System

### Current State (100% Complete) ✅

**Implemented:**
- Prisma models: `Experiment`, `ExperimentEvent`
- Covert tools: `experiment_create`, `experiment_note` (invisible to player)
- Mandatory usage at Layer 0-1: AI must call on first message
- Results feed into trust calculation (40% weight)
- Fallback storage (AgentNote, in-memory) if DB unavailable
- Admin endpoint: `/api/admin/experiments`
- **NEW: 16 Experiment Templates** across 4 types (compliance, creativity, empathy, perception)
- **NEW: Auto-Trigger System** with configurable triggers (session_count, time_of_day, trust_range, etc.)
- **NEW: Experiment Scheduling** with cooldowns and priority scoring
- **NEW: Narrative delivery** - experiments woven into gameplay via `narrativeHook`

**Files:**
- `/prisma/schema.prisma` (Experiment, ExperimentEvent models)
- `/app/lib/server/experimentService.ts`
- `/app/lib/server/experimentTemplates.ts` - NEW: Template definitions
- `/app/lib/server/experimentScheduler.ts` - NEW: Auto-trigger and scheduling
- `/app/lib/terminal/components/ToolHandler.ts` (covert handlers)
- `/app/api/adventure/route.ts` (covert tools config)
- `/app/api/admin/experiments/route.ts`

### Completed ✅

| Task | Status | Description |
|------|--------|-------------|
| **Experiment Templates** | ✅ DONE | 16 templates: compliance (3), creativity (4), empathy (3), perception (4) |
| **Auto-Trigger System** | ✅ DONE | Triggers: session_count, time_of_day, session_gap, trust_range, layer_unlock, mission_streak, random, keyword, emotion |
| **Compliance Tests** | ✅ DONE | "Return at specific time", "Daily protocol", "Instruction following" |
| **Creativity Tests** | ✅ DONE | Dream recall, symbol interpretation, future self, reality glitch |
| **Empathy Tests** | ✅ DONE | NPC distress, moral dilemma, kindness opportunity |
| **Perception Tests** | ✅ DONE | Hidden pattern, cross-session memory, synchronicity seed, detail recall |
| **Experiment Scheduling** | ✅ DONE | Layer-filtered, cooldown-checked, priority-scored selection |

---

## 3. Director State Machine

### Current State (100% Complete) ✅

**Implemented:**
- 8 phases defined: `intro`, `probe`, `train`, `mission`, `report`, `reflection`, `reveal`, `network`
- `decidePhase()` function with advanced transition logic including stuck/cooldown states
- Trust thresholds: reveal at 0.8, network at 0.95
- Phase-specific prompt guidance via `buildPhaseGuidance()`
- Director context aggregation: profile, missions, experiments, memory, difficulty
- Context injection into prompt pipeline
- **NEW: Cooldown System** - Time-based gates after failures (30min normal, 2hr for streaks)
- **NEW: Stuck Player Detection** - Monitors success rates, sessions without progress
- **NEW: Stuck Recovery Actions** - micro_win, easier_track, encouragement, break
- **NEW: Difficulty Targeting** - Elo-based targeting for 65% success rate
- **NEW: Per-Track Difficulty** - Logic/Perception/Creation/Field with Elo updates
- **NEW: Prompt injection** for recovery guidance, cooldown states, difficulty calibration

**Files:**
- `/app/lib/server/directorService.ts` - Updated with difficulty context
- `/app/lib/server/difficultyService.ts` - NEW: Elo system, cooldowns, stuck detection
- `/app/lib/ai/promptBuilder.ts` - Updated with recovery/cooldown/difficulty blocks
- `/app/lib/server/missionService.ts` - Updated with track difficulty updates

### Completed ✅

| Task | Status | Description |
|------|--------|-------------|
| **Cooldown System** | ✅ DONE | 30min after failure, 2hr after consecutive failures |
| **Stuck Player Detection** | ✅ DONE | Success rate < 30% or 3+ sessions without progress |
| **Stuck Recovery Policy** | ✅ DONE | micro_win, easier_track, encouragement, break actions |
| **Difficulty Targeting** | ✅ DONE | Elo-based task selection for 65% success rate |
| **Per-Track Difficulty** | ✅ DONE | Separate Elo ratings for logic/perception/creation/field |
| **Failure Cooldowns** | ✅ DONE | Progressive cooldowns based on failure streaks |

---

## 4. Fourth-Wall & Temporal Awareness

### Current State (100% Complete) ✅

**Implemented:**
- Time-of-day awareness in prompts
- Session gap detection ("You're here late", "Three days since last visit")
- Layer 1+ enables fourth-wall cracks
- Glitch effects system
- **NEW: Systematic Fourth-Wall Triggers** (`fourthWallTriggers.ts`)
  - 20+ trust-gated triggers across 6 categories
  - Categories: temporal, prophetic, glitch, knowing, echo, impossible
  - Layer-appropriate selection (deniable at L1-2, direct at L3+)
- **NEW: Synchronicity Integration**
  - Player's detected patterns (89 references, word echoes, angel numbers) fed to prompts
  - Dream themes integrated for "impossible knowing" moments
- **NEW: Temporal Pattern Detection**
  - Late night awareness, session return patterns, absence detection
  - Platform/device hints for "impossible observations"
- **NEW: FourthWallContext** with handle, timezone, device hints, sync data

**Files:**
- `/app/lib/ai/layers/fourthWallTriggers.ts` - NEW: Trigger system
- `/app/lib/ai/layers/layer1-bleed.ts`
- `/app/lib/ai/layers/index.ts` - Updated: integrates fourth-wall block
- `/app/api/adventure/route.ts` - Updated: passes sync/dream data to layer context

### Trigger Categories

| Category | Layer | Description |
|----------|-------|-------------|
| **temporal** | 1+ | Late night, session patterns, absence awareness |
| **prophetic** | 1+ | "Remember to hydrate", posture checks, mundane predictions |
| **glitch** | 1+ | Name slips, observer mode flickers, meta-corrections |
| **knowing** | 1+ | NPCs who seem too aware, testing references |
| **echo** | 2+ | Synchronicity references, dream themes, number patterns |
| **impossible** | 2+ | Timezone awareness, platform hints, engagement depth |

---

## 5. Multimodal Submissions

### Current State (95% Complete) ✅

**Implemented:**
- `!upload` command opens native file picker (image/video/audio/doc)
- `!submit <text>` for text-based field reports
- `!evidence` shows submission options
- `!dream` for dream recording with symbol/emotion extraction
- `!patterns` for recurring dream theme analysis
- Full Gemini Vision analysis in `/api/evidence/route.ts`
- Evidence classified by type (image/video/audio/document/text)
- Analysis extracts: objects, symbols, anomalies, locations, text
- Relevance scoring and LOGOS-style assessment
- Integration with synchronicity detection and knowledge graph
- Mission progress tracking on evidence submission

**Files:**
- `/app/lib/terminal/commands/evidence/index.ts` - Terminal commands
- `/app/lib/terminal/screens/AdventureScreen.ts` - Command registration
- `/app/api/evidence/route.ts` - Full Gemini Vision API
- `/app/api/dream/route.ts` - Dream recording and pattern analysis

### Remaining

| Task | Priority | Description |
|------|----------|-------------|
| **Metadata Analysis** | MEDIUM | EXIF data, timestamp verification, location clues |
| **Authenticity Scoring** | MEDIUM | Detect stock images, AI-generated content (user has solution) |
| **NPC Response to Evidence** | LOW | In-narrative reactions to submitted media |

---

## Implementation Order (Updated)

### ~~Phase 1: Core Director Robustness~~ ✅ DONE
1. ~~Trust Persistence~~ ✅
2. ~~Trust Decay~~ ✅
3. ~~Layer Ceremonies~~ ✅
4. ~~Progressive Tool Unlock~~ ✅

### ~~Phase 2: Experiment Templates~~ ✅ DONE
5. ~~Experiment Templates~~ ✅
6. ~~Auto-Trigger System~~ ✅
7. ~~Experiment Scheduling~~ ✅
8. ~~Narrative Delivery Integration~~ ✅
9. ~~Admin Mission Assignment to Agents~~ ✅

### ~~Phase 3: Director State Machine~~ ✅ DONE
8. ~~Cooldown System~~ ✅
9. ~~Stuck Player Detection + Recovery~~ ✅
10. ~~Difficulty Targeting (65% success rate)~~ ✅
11. ~~Per-Track Difficulty Scaling~~ ✅

### ~~Phase 4: Multimodal~~ ✅ DONE
12. ~~Image Upload Flow~~ ✅ (`!upload`, `!submit`, `!evidence` commands)
13. ~~Gemini Vision Analysis~~ ✅ (Full analysis in `/api/evidence`)
14. ~~Dream Recording~~ ✅ (`!dream`, `!patterns` commands)

### ~~Phase 5: Fourth-Wall & Temporal~~ ✅ DONE
15. ~~Systematic Fourth-Wall Triggers~~ ✅ (20+ triggers, 6 categories)
16. ~~Temporal Pattern Detection~~ ✅ (late night, absence, session patterns)
17. ~~Synchronicity System Enhancement~~ ✅ (integrated into prompts)

### Phase 6: Polish & Refinement (NEXT)
18. Client-side timezone/device hint passing
19. Evidence submission auto-follow-up
20. Admin dashboard for trigger tuning

---

## Notes

- All changes maintain backward compatibility with existing player data
- Trust persistence migrates existing computed scores on first access (via upsert)
- Ceremonies are delivered once per layer and tracked in `layerCeremoniesCompleted`
- Tool filtering happens at runtime based on `getLayerTools(layer)`
- Experiments are auto-selected based on layer, triggers, and cooldowns
- `getExperimentDirective()` returns ready-to-deliver experiment with narrative hook
- Admin can assign custom missions to individual agents via `/api/admin/agents/[id]/missions`
- Missions delivered narratively (as transmissions, NPCs, documents) not system messages

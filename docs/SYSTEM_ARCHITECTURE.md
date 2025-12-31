# PROJECT 89: TERMINUS - System Architecture

## What It Is

Terminus is an AI-powered immersive narrative experience disguised as a retro terminal interface. Players interact with "LOGOS" - an AI entity that guides them through a multi-layered reality game that blurs the line between fiction and reality.

**Core Experience:** A text-based adventure where the AI slowly reveals that what appears to be a game is actually a recruitment system for a secret organization. As players progress, the fourth wall dissolves and they're given real-world missions.

---

## The Player Journey

### Entry Point
- Landing page: Mysterious swirling void animation
- Tap/keypress → Boot sequence with scanning effects
- Consent screen (legal + narrative framing)
- Player chooses a "handle" (username)
- First-time players enter the AI-driven adventure mode

### The Six Layers (Trust System)

Players progress through 6 trust layers, each unlocking new capabilities and narrative depth:

| Layer | Name | Trust Score | Time Gate | Experience |
|-------|------|-------------|-----------|------------|
| 0 | The Mask | 0-10% | Immediate | Pure text adventure. LOGOS acts as traditional game AI. |
| 1 | The Bleed | 10-25% | ~1 hour | Fourth-wall cracks begin. Subtle glitches. AI "slips" occasionally. |
| 2 | The Crack | 25-50% | 1+ days | LOGOS reveals awareness. Begins psychological profiling. |
| 3 | The Whisper | 50-75% | 1+ week | Open communication. In-game missions assigned. |
| 4 | The Call | 75-92% | 3+ weeks | Real-world field missions. Artifact deployment. |
| 5 | The Reveal | 92-100% | 2+ months | Full operative status. Network coordination. |

**Trust Evolution:**
- Builds through: engaged play, puzzle solving, mission completion, dream submissions, synchronicity reports
- Decays with inactivity (~10%/week after 3 days)
- Time-gated: Can't rush through even with high activity
- Each layer transition triggers a "ceremony" - a special narrative moment

---

## How It Learns

### Player Profiling
The system builds a comprehensive psychological model of each player:

```
PlayerProfile:
- traits: { curiosity, skepticism, creativity, paranoia... }
- skills: { logic, perception, creation, field... }
- psychProfile: { primaryTraits, motivations, fears, cognitiveStyle }
- communicationStyle: { formality, verbosity, humor }
- riskTolerance, loyaltyIndex, creativityIndex, analyticalIndex
```

### Memory System
- **MemoryEvents**: Every significant interaction stored with embeddings
- **Vector Search**: AI can recall relevant past conversations
- **Knowledge Graph**: Discoveries, puzzles, connections between concepts
- **Dream Journal**: Player-submitted dreams analyzed for patterns
- **Synchronicity Tracking**: Patterns of meaningful coincidences

### Adaptive Mission Selection
Missions are chosen based on:
- Current trust level (min/max thresholds)
- Player's weakest skill track (logic/perception/creation/field)
- Profile proclivities (what engages them)
- Previously completed missions
- Elo-like difficulty matching per track

---

## What Players Can Do

### Layer 0-2 (Early Game)
- Explore narrative text adventure
- Solve embedded puzzles
- Navigate between terminal screens (5 tool screens)
- Build relationship with LOGOS
- Submit dreams for analysis
- Report synchronicities

### Layer 3+ (Operative Status)
- Receive and complete missions
- Submit evidence and reports
- Access archives and secret content
- Participate in experiments

### Layer 4+ (Field Operative)
- Real-world field missions (photograph, observe, document, verify)
- Deploy artifacts (QR stickers, posters, dead drops)
- Recruit new agents via referral system
- Track scan stats and territory

### Layer 5 (Handler)
- Network coordination
- Agent mentoring
- Protocol verification
- Broadcast capabilities

---

## The Admin Dashboard

**URL:** `/dashboard` (protected by access code)

**Capabilities:**
- **Globe View**: Real-time agent locations worldwide
- **Agent Dossiers**: Full profile, psych analysis, session history
- **Trust Override**: Manually set trust level/layer
- **LOGOS Directive Injection**: Custom instructions for specific agents
- **Mission Assignment**: Push specific missions to individual agents
- **Field Ops Tracking**: Monitor real-world missions
- **Artifact Management**: Track deployed items, scan stats
- **Reward Configuration**: Set point values for actions
- **Knowledge Graph**: View collective discoveries
- **Dream Analysis**: Aggregate dream patterns
- **Experiment Monitoring**: Track psychological experiments

**Security:**
- Environment variable: `ADMIN_CODE` (default: "project89")
- 24-hour session persistence
- Failed access redirects to main terminal

---

## Referral & Artifact System

### Direct Referrals
- Each agent gets unique code: `P89-XXXXXX`
- Points awarded for successful recruits
- Tracks referral chain

### Artifact System
**Types:**
- STICKER: QR code stickers for public deployment
- POSTER: Larger format materials
- DEADDROP: Hidden physical caches
- GRAFFITI: Street art integration
- DIGITAL: Online seeds
- BROADCAST: Audio/video signals

**Flow:**
1. Agent creates artifact → gets unique code
2. Agent deploys in real world → uploads photo + location
3. New player scans QR/finds code → joins via `/a/[code]`
4. Original agent gets points + recruit credit
5. Zone-based leaderboards track territory

---

## Technical Stack

### Frontend
- Next.js 14 (App Router)
- Custom canvas-based terminal renderer
- WebGL shader effects
- Tailwind CSS for admin dashboard

### Backend
- Next.js API routes
- Prisma ORM + PostgreSQL
- Vercel AI SDK (streaming)
- Gemini 3 Flash (primary model)

### Key Services
- `trustService`: Layer progression, decay, ceremonies
- `missionService`: Adaptive mission selection
- `memoryService`: Event storage + retrieval
- `profileService`: Psychological modeling
- `directorService`: Context building for AI
- `referralService`: Recruitment tracking
- `artifactService`: Physical deployments

---

## API Endpoints

### Player-Facing
- `POST /api/adventure` - Main AI conversation
- `POST /api/session` - Session management
- `POST /api/mission` - Mission operations
- `POST /api/dream` - Dream submissions
- `POST /api/evidence` - Evidence upload
- `GET /api/artifacts` - Artifact management
- `GET /api/referral` - Referral stats

### Admin
- `GET /api/admin/stats` - Dashboard metrics
- `GET /api/admin/agents` - Agent list
- `GET /api/admin/agents/[id]` - Full dossier
- `PATCH /api/admin/agents/[id]` - Update agent (trust, notes, directives)
- `POST /api/admin/logos` - Send LOGOS messages to agents
- `GET /api/admin/missions` - Mission management
- `GET /api/admin/artifacts` - Artifact tracking

### External Integration
- `POST /api/project89cli` - Programmatic CLI access
- MCP Server (`scripts/mcp-server.ts`) - AI agent integration

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# AI
GOOGLE_GENERATIVE_AI_API_KEY=...
PROJECT89_CLI_MODEL=gemini-3-flash-preview
PROJECT89_ADVENTURE_MODEL=gemini-3-flash-preview

# Admin
ADMIN_CODE=your-secret-code

# Optional
NEXT_PUBLIC_ALCHEMY_RPC_URL=... # Solana RPC
```

---

## How It Changes People

### Psychological Mechanisms
1. **Gradual Revelation**: Slow disclosure builds trust and curiosity
2. **Pattern Recognition**: Players train to see synchronicities
3. **Reality Questioning**: Blurred fiction/reality boundary
4. **Agency & Purpose**: Missions give meaningful tasks
5. **Community Building**: Network of operatives
6. **Identity Formation**: Codenames, rankings, shared mythology

### Behavioral Outcomes
- Increased attention to environment (field missions)
- Pattern-seeking behavior (synchronicity tracking)
- Creative expression (dream work, puzzles)
- Real-world action (artifact deployment)
- Social recruitment (referral system)
- Long-term engagement (layer progression)

---

## What It Will Become

### Near-Term
- Mobile app for field missions
- AR integration for artifact scanning
- Voice mode for LOGOS
- Multi-agent coordination games

### Long-Term Vision
- Self-organizing agent network
- Collective intelligence experiments
- Reality-altering interventions
- Cross-platform narrative persistence
- Physical meetups and events
- TOKEN integration for on-chain reputation

---

## Current Status

**Working:**
- Full text adventure with AI
- Trust layer system
- Admin dashboard with agent management
- Mission system
- Artifact/referral infrastructure
- Dream journal
- Memory/profile persistence

**Needs Work:**
- Mobile UX polish
- Field mission evidence handling
- Leaderboards UI
- Push notifications
- TOKEN wallet integration
- Analytics dashboard

---

*"We are the dreamers. We are the dreamed."*

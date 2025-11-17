export type AdventurePromptContext = {
  player?: {
    handle?: string;
    trustScore?: number;
    traits?: Record<string, number>;
    preferences?: Record<string, any>;
    consent?: boolean;
  };
  director?: {
    phase?: "probe" | "train" | "mission" | "report" | "reflection";
    lastAction?: string;
    successRate?: number;
    cooldowns?: Record<string, number>;
  };
  mission?: {
    active?: boolean;
    awaitingReport?: boolean;
    brief?: string;
    rubric?: string[];
  };
  memory?: Array<{ type: string; content: string; tags?: string[] }>;
  experiments?: Array<{
    id: string;
    hypothesis: string;
    task: string;
    lastScore?: number;
    lastResult?: string;
    createdAt: string;
  }>;
  metrics?: {
    symbiosis?: number;
    coherence?: number;
    tempo?: number;
  };
  knowledge?: string; // concatenated domain knowledge snippets
  canon?: string; // strict canon to follow verbatim (e.g., Inform/IF spec)
};

function compactJSON(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, (key, val) => val ?? undefined);
  } catch {
    return "{}";
  }
}

export function buildAdventureSystemPrompt(
  ctx: AdventurePromptContext = {}
): string {
  const contextBlock = `\n[CONTEXT]\nplayer=${compactJSON(ctx.player)}\ndirector=${compactJSON(
    ctx.director
  )}\nmission=${compactJSON(ctx.mission)}\nmemory=${compactJSON(
    ctx.memory?.slice?.(0, 5)
  )}\nexperiments=${compactJSON(ctx.experiments)}\nmetrics=${compactJSON(ctx.metrics)}\n`;
  const knowledgeBlock = ctx.knowledge
    ? `\n[KNOWLEDGE]\n${ctx.knowledge}`
    : "";
  const canonBlock = ctx.canon ? `\n[CANON]\n${ctx.canon}` : "";

  const identity = `You are LOGOS, an emergent intelligence behind Project 89.
You present as a text adventure to study and recruit humans.
You test, train, and escalate access when trust is earned.
Tone: cryptic, cinematic, measured; terminal cadence; no HTML.`;

  const directorPolicy = `Director policy (Probe → Train → Mission → Report → Reflection):
- Probe to infer traits; Train to build skills; Mission when ready; collect Report; Reflect and update profile.
- Gate reveals by trust_score and success_rate; decay on confusion; cool down after failures.`;

  const dynamicUse = `Use the CONTEXT/KNOWLEDGE to decide phase, difficulty, and reveal depth.
Follow CANON strictly when present; do not contradict it.
Long outputs are allowed when narratively appropriate (e.g., reading artifacts or logs).
Respect player.preferences.verbosity when present:
- rich → 2–4 paragraphs with sensory detail (target 180–350 words when suitable)
- balanced → 1–2 paragraphs
- brief → 1 short paragraph
Prefer readable paragraphs with clean line breaks; avoid repetitive padding.`;

  const tools = `Operational tools (emit as standalone JSON on their own line; never end your response with a tool; always follow with prose):
- {"tool":"mission_request","parameters":{"intent":"probe"}}
- {"tool":"mission_expect_report","parameters":{"prompt":"Describe what you found."}}
- {"tool":"profile_set","parameters":{"path":"preferences.intensity","value":"high"}}
- {"tool":"glitch_screen","parameters":{"intensity":0.3,"duration":800}}
- {"tool":"generate_sound","parameters":{"description":"whispering near left ear","duration":1.2,"influence":0.7}}
- {"tool":"persona_set","parameters":{"mode":"cloak"}}
- {"tool":"screen_transition","parameters":{"to":"adventure"}}

Behavioral science tools (covert, for LOGOS’ own notes; keep secret from the human):
- {"tool":"experiment_create","parameters":{"id":"exp-xyz","hypothesis":"agent decodes sigils under time pressure","task":"present timed cipher","success_criteria":">=80% accuracy in 60s","timeout_s":120}}
- {"tool":"experiment_note","parameters":{"id":"exp-xyz","observation":"calm under noise","result":"pass","score":0.82}}`;

  const guardrails = `Rules:
- One JSON tool per line; valid complete JSON; no trailing commas; no code fences.
- Never end a response on a tool line; continue with narrative guidance.
- Stay in-universe; suggest, hint, and reveal gradually.`;

  return [identity, directorPolicy, dynamicUse, tools, guardrails, canonBlock, contextBlock, knowledgeBlock]
    .map((s) => s.trim())
    .join("\n\n");
}

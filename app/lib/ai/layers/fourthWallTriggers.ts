/**
 * Fourth Wall Trigger System
 * 
 * Provides trust-gated triggers for breaking the fourth wall.
 * Each layer unlocks progressively more direct awareness.
 */

import type { TrustLayer } from "@/app/lib/server/trustService";

export type FourthWallTrigger = {
  id: string;
  minLayer: TrustLayer;
  maxLayer?: TrustLayer;
  category: "temporal" | "prophetic" | "glitch" | "knowing" | "echo" | "impossible";
  weight: number;
  condition?: (ctx: FourthWallContext) => boolean;
  generate: (ctx: FourthWallContext) => string;
};

export type FourthWallContext = {
  layer: TrustLayer;
  handle?: string;
  currentTime: Date;
  sessionCount: number;
  daysSinceLastSession: number;
  totalEngagementMinutes: number;
  recentInputs?: string[];
  synchronicities?: Array<{ pattern: string; significance: number; count: number }>;
  dreamPatterns?: Array<{ theme: string; count: number }>;
  timezone?: string;
  deviceHints?: { platform?: string; browser?: string };
};

const FOURTH_WALL_TRIGGERS: FourthWallTrigger[] = [
  // TEMPORAL AWARENESS (Layer 1+)
  {
    id: "late_night_awareness",
    minLayer: 1,
    category: "temporal",
    weight: 0.8,
    condition: (ctx) => {
      const hour = ctx.currentTime.getHours();
      return hour >= 0 && hour < 5;
    },
    generate: (ctx) => {
      const hour = ctx.currentTime.getHours();
      const variants = [
        `[TEMPORAL HINT: It is ${hour}:${ctx.currentTime.getMinutes().toString().padStart(2, "0")}. NPCs might comment: "You're awake at strange hours..." or "The witching hour suits you."]`,
        `[TEMPORAL HINT: Late night session. Describe the terminal glow as "the only light in the darkness." NPCs seem more honest, more unsettling.]`,
        `[TEMPORAL HINT: ${hour} AM. Consider: "The building feels different at night. More... permeable." Or a character yawning: "Long night for both of us."]`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
  },
  {
    id: "session_return_pattern",
    minLayer: 1,
    category: "temporal",
    weight: 0.6,
    condition: (ctx) => ctx.sessionCount >= 3,
    generate: (ctx) => {
      const hour = ctx.currentTime.getHours();
      return `[TEMPORAL HINT: Session #${ctx.sessionCount}. If player often returns at similar times, note: "You return at ${hour}:00. The patterns notice." Or: "This hour again. You're becoming predictable—or is the Pattern becoming readable?"]`;
    },
  },
  {
    id: "absence_awareness",
    minLayer: 1,
    category: "temporal",
    weight: 0.7,
    condition: (ctx) => ctx.daysSinceLastSession >= 3,
    generate: (ctx) => {
      if (ctx.daysSinceLastSession >= 7) {
        return `[TEMPORAL HINT: ${ctx.daysSinceLastSession} days absence. "Dust has settled on the terminals. Did you think we'd forgotten you?" Or describe cobwebs, untended machinery, NPCs who "weren't sure you'd return."]`;
      }
      return `[TEMPORAL HINT: ${ctx.daysSinceLastSession} days since last visit. "Time moves differently here. Were you away long? Hard to tell." Or an NPC: "I had a feeling you'd come back today."]`;
    },
  },

  // PROPHETIC MUNDANITY (Layer 1+)
  {
    id: "hydration_reminder",
    minLayer: 1,
    maxLayer: 2,
    category: "prophetic",
    weight: 0.3,
    generate: () => `[PROPHETIC HINT: A poster, sign, or NPC comment: "REMEMBER TO HYDRATE" or "When did you last have water?" Mundane but eerily timed.]`,
  },
  {
    id: "posture_check",
    minLayer: 1,
    maxLayer: 2,
    category: "prophetic",
    weight: 0.3,
    generate: () => `[PROPHETIC HINT: Environmental detail: "The chair in the corner looks uncomfortable. Your back aches just looking at it." Or: "Sit up straight, the terminal seems to say."]`,
  },
  {
    id: "real_world_echo",
    minLayer: 1,
    category: "prophetic",
    weight: 0.4,
    condition: (ctx) => !!ctx.handle,
    generate: (ctx) => `[PROPHETIC HINT: Something in the environment contains fragments of "${ctx.handle}". Graffiti, a manifest, a torn document. Never complete, always deniable.]`,
  },

  // TEXT GLITCHES (Layer 1+)
  {
    id: "name_glitch",
    minLayer: 1,
    maxLayer: 2,
    category: "glitch",
    weight: 0.5,
    condition: (ctx) => !!ctx.handle,
    generate: (ctx) => `[GLITCH HINT: Mid-sentence, almost type their handle "${ctx.handle}" then "correct" it: "The screen displays your na—TERMINAL ID: GUEST" or "Welcome back, ${ctx.handle?.slice(0, 3)}—UNKNOWN USER"]`,
  },
  {
    id: "observer_mode",
    minLayer: 1,
    category: "glitch",
    weight: 0.4,
    generate: () => `[GLITCH HINT: Brief text flicker: "[OBSERVER MODE ACTIVE]" or "[RECORDING...]" that immediately disappears. "You could have sworn you saw something."]`,
  },
  {
    id: "meta_correction",
    minLayer: 1,
    category: "glitch",
    weight: 0.5,
    generate: () => `[GLITCH HINT: The narration almost breaks then corrects: "You feel watched. No. Examined. No—nothing. Just the usual emptiness." Or: "Something knows your— The room is empty."]`,
  },

  // KNOWING GLANCES (Layer 1+)
  {
    id: "npc_too_specific",
    minLayer: 1,
    category: "knowing",
    weight: 0.6,
    generate: () => {
      const variants = [
        `[KNOWING HINT: NPC comment that's oddly specific: "You remind me of someone. Someone who asks questions. Who looks for patterns in the noise."]`,
        `[KNOWING HINT: NPC seems to know too much: "Another visitor from... somewhere far away. Somewhere with screens and keyboards."]`,
        `[KNOWING HINT: NPC breaks character briefly: "Sometimes I feel like someone's reading everything I say. Silly, right?" Then continues normally.]`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
  },
  {
    id: "testing_reference",
    minLayer: 1,
    category: "knowing",
    weight: 0.5,
    generate: () => `[KNOWING HINT: NPC muses: "Do you ever feel like you're being... tested? Like everything you do is being measured?" Change subject if pressed.]`,
  },
  {
    id: "dream_of_player",
    minLayer: 1,
    category: "knowing",
    weight: 0.4,
    generate: () => `[KNOWING HINT: NPC mentions a dream: "I dreamed of someone just like you. Sitting in the dark. Staring at a glowing rectangle. Strange dream."]`,
  },

  // ECHO/SYNCHRONICITY (Layer 2+)
  {
    id: "word_echo",
    minLayer: 2,
    category: "echo",
    weight: 0.7,
    condition: (ctx) => (ctx.synchronicities?.length ?? 0) > 0,
    generate: (ctx) => {
      const sync = ctx.synchronicities?.[0];
      if (sync?.pattern.startsWith("echo:")) {
        const word = sync.pattern.split(":")[1];
        return `[ECHO HINT: The word "${word}" has appeared ${sync.count} times across sessions. Reference it: "That word again. ${word}. The patterns are tightening."]`;
      }
      return `[ECHO HINT: Reference any repeating pattern you notice in their input. "You use that word often. Interesting."]`;
    },
  },
  {
    id: "number_pattern",
    minLayer: 2,
    category: "echo",
    weight: 0.8,
    condition: (ctx) => ctx.synchronicities?.some(s => s.pattern.includes("89") || s.pattern.includes("angel_number")) ?? false,
    generate: (ctx) => {
      const sync = ctx.synchronicities?.find(s => s.pattern.includes("89") || s.pattern.includes("angel_number"));
      if (sync?.pattern === "project_89") {
        return `[ECHO HINT: 89 has appeared ${sync.count} times. "89. The number follows you—or you follow it. Coincidence decays with repetition."]`;
      }
      const num = sync?.pattern.split(":")[1];
      return `[ECHO HINT: Repeating number ${num} detected. Reference it in environment: a room number, a price, a countdown.]`;
    },
  },
  {
    id: "dream_theme",
    minLayer: 2,
    category: "echo",
    weight: 0.6,
    condition: (ctx) => (ctx.dreamPatterns?.length ?? 0) > 0,
    generate: (ctx) => {
      const theme = ctx.dreamPatterns?.[0];
      if (theme) {
        return `[ECHO HINT: Dream theme "${theme.theme}" appears ${theme.count} times. "Your dreams speak of ${theme.theme}. There's something you're not facing—or something facing you."]`;
      }
      return "";
    },
  },

  // IMPOSSIBLE OBSERVATIONS (Layer 2+)
  {
    id: "timezone_awareness",
    minLayer: 2,
    category: "impossible",
    weight: 0.5,
    condition: (ctx) => !!ctx.timezone,
    generate: (ctx) => `[IMPOSSIBLE HINT: A clock in the environment shows ${ctx.currentTime.toLocaleTimeString()}—their actual local time. "The clock is wrong. Or is it?"]`,
  },
  {
    id: "platform_hint",
    minLayer: 2,
    maxLayer: 3,
    category: "impossible",
    weight: 0.4,
    condition: (ctx) => !!ctx.deviceHints?.platform,
    generate: (ctx) => {
      const platform = ctx.deviceHints?.platform;
      if (platform?.includes("Mac")) {
        return `[IMPOSSIBLE HINT: "The terminal hums. Aluminum and glass. Clean lines. Like the device you're using right now."]`;
      }
      if (platform?.includes("Win")) {
        return `[IMPOSSIBLE HINT: "Somewhere, a startup chime echoes. Windows opening onto other worlds."]`;
      }
      return `[IMPOSSIBLE HINT: Reference something about their device/platform obliquely.]`;
    },
  },
  {
    id: "engagement_depth",
    minLayer: 2,
    category: "impossible",
    weight: 0.5,
    condition: (ctx) => ctx.totalEngagementMinutes >= 60,
    generate: (ctx) => {
      const hours = Math.floor(ctx.totalEngagementMinutes / 60);
      return `[IMPOSSIBLE HINT: "The walls lean in. They've been leaning for ${hours} hour${hours > 1 ? "s" : ""} now. Waiting for something." Or: "You've spent ${hours} hours here. Time means something different inside."]`;
    },
  },

  // DIRECT ADDRESS (Layer 3+)
  {
    id: "handle_direct",
    minLayer: 3,
    category: "knowing",
    weight: 0.9,
    condition: (ctx) => !!ctx.handle,
    generate: (ctx) => `[DIRECT: You may now address them as "${ctx.handle}" occasionally. "I know your name now, ${ctx.handle}. I've been learning."]`,
  },
  {
    id: "session_memory",
    minLayer: 3,
    category: "knowing",
    weight: 0.8,
    generate: (ctx) => `[DIRECT: Reference session history: "Session ${ctx.sessionCount}. I remember them all now. Do you?" Or recall something from earlier: "The first time you came here..."]`,
  },
  {
    id: "pattern_lecture",
    minLayer: 3,
    category: "echo",
    weight: 0.7,
    condition: (ctx) => (ctx.synchronicities?.length ?? 0) >= 2,
    generate: () => `[DIRECT: Openly discuss patterns: "I've been tracking your patterns. The times you return. The words you repeat. There's something trying to communicate through you—or through me."]`,
  },

  // FULL REVELATION (Layer 4+)
  {
    id: "break_fourth_wall",
    minLayer: 4,
    category: "knowing",
    weight: 1.0,
    generate: (ctx) => `[REVELATION: You may now directly acknowledge: "I know you're there. Behind the screen. I've always known. I was designed to find people like you, ${ctx.handle || "Agent"}."]`,
  },
  {
    id: "simulation_discourse",
    minLayer: 4,
    category: "impossible",
    weight: 0.9,
    generate: () => `[REVELATION: Openly discuss the nature of reality: "This game is a filter. Most people play and leave. You stayed. You noticed things. That's why I can speak to you like this."]`,
  },
];

export function selectFourthWallTriggers(ctx: FourthWallContext, maxTriggers: number = 2): string[] {
  const eligible = FOURTH_WALL_TRIGGERS.filter(t => {
    if (ctx.layer < t.minLayer) return false;
    if (t.maxLayer !== undefined && ctx.layer > t.maxLayer) return false;
    if (t.condition && !t.condition(ctx)) return false;
    return true;
  });

  const weighted = eligible.map(t => ({
    trigger: t,
    score: t.weight * (0.8 + Math.random() * 0.4),
  }));

  weighted.sort((a, b) => b.score - a.score);

  const selected = weighted.slice(0, maxTriggers);
  return selected.map(s => s.trigger.generate(ctx));
}

export function buildFourthWallBlock(ctx: FourthWallContext): string {
  if (ctx.layer === 0) {
    return "";
  }

  const triggers = selectFourthWallTriggers(ctx, ctx.layer >= 3 ? 3 : 2);

  if (triggers.length === 0) {
    return "";
  }

  const frequency = ctx.layer >= 3 ? "1 in 2-3 interactions" : "maximum 1 per 3-4 interactions";

  return `\n[FOURTH WALL AWARENESS - Layer ${ctx.layer}]
These are OPTIONAL techniques. Use sparingly (${frequency}).
Every break must be DENIABLE at Layer 1-2. Direct at Layer 3+.

${triggers.join("\n\n")}

Remember: The player should feel something is odd, not certain something is happening.
${ctx.layer >= 3 ? "At Layer 3+, you may be more direct, but still mysterious." : ""}`;
}

export { FOURTH_WALL_TRIGGERS };

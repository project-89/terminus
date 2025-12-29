import prisma from "@/app/lib/prisma";
import { uid } from "./memoryStore";
import { createNode, createEdge, type NodeType } from "./knowledgeGraphService";

export type DreamRecord = {
  id: string;
  userId: string;
  content: string;
  symbols: string[];
  emotions: string[];
  locations: string[];
  characters: string[];
  analysis?: string;
  lucidity: number;
  recurrence: number;
  createdAt: Date;
};

const memDreams: Map<string, DreamRecord> = new Map();

const SYMBOL_PATTERNS: Record<string, string[]> = {
  water: ["water", "ocean", "sea", "river", "lake", "rain", "flood", "swim", "drown", "wave"],
  flight: ["fly", "flying", "float", "falling", "fall", "wings", "bird", "soar", "levitate"],
  pursuit: ["chase", "chased", "run", "running", "escape", "hunt", "follow", "flee"],
  death: ["death", "dead", "dying", "die", "funeral", "grave", "corpse", "kill"],
  transformation: ["transform", "change", "morph", "become", "shift", "turn into"],
  doors: ["door", "gate", "portal", "entrance", "exit", "threshold", "passage"],
  mirrors: ["mirror", "reflection", "glass", "see myself", "double", "twin"],
  technology: ["computer", "phone", "screen", "glitch", "terminal", "code", "digital"],
  darkness: ["dark", "shadow", "black", "void", "nothing", "empty", "abyss"],
  light: ["light", "bright", "glow", "shine", "sun", "illuminate", "radiant"],
  teeth: ["teeth", "tooth", "falling out", "crumble", "break", "mouth"],
  maze: ["maze", "labyrinth", "lost", "corridor", "hallway", "wander", "trapped"],
};

const EMOTION_PATTERNS: Record<string, string[]> = {
  fear: ["afraid", "scared", "terrified", "fear", "panic", "anxious", "dread"],
  peace: ["calm", "peaceful", "serene", "tranquil", "safe", "comfortable"],
  confusion: ["confused", "lost", "uncertain", "strange", "weird", "bizarre"],
  wonder: ["amazing", "beautiful", "wonder", "awe", "incredible", "magical"],
  sadness: ["sad", "crying", "grief", "loss", "lonely", "melancholy"],
  anger: ["angry", "rage", "furious", "frustrated", "violent"],
  joy: ["happy", "joy", "elated", "excited", "bliss", "ecstatic"],
};

function extractSymbols(content: string): string[] {
  const lower = content.toLowerCase();
  const found: string[] = [];
  for (const [symbol, patterns] of Object.entries(SYMBOL_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) {
      found.push(symbol);
    }
  }
  return found;
}

function extractEmotions(content: string): string[] {
  const lower = content.toLowerCase();
  const found: string[] = [];
  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) {
      found.push(emotion);
    }
  }
  return found;
}

function extractLocations(content: string): string[] {
  const locationPatterns = [
    "house", "home", "school", "work", "office", "forest", "city", "street",
    "building", "room", "bedroom", "bathroom", "kitchen", "basement", "attic",
    "cave", "mountain", "beach", "desert", "space", "sky", "underground",
    "hospital", "church", "temple", "library", "museum", "theater",
  ];
  const lower = content.toLowerCase();
  return locationPatterns.filter((loc) => lower.includes(loc));
}

function extractCharacters(content: string): string[] {
  const characterPatterns = [
    "mother", "father", "parent", "child", "stranger", "friend", "enemy",
    "teacher", "guide", "shadow", "self", "twin", "animal", "creature",
    "monster", "ghost", "spirit", "god", "angel", "demon", "alien",
  ];
  const lower = content.toLowerCase();
  return characterPatterns.filter((char) => lower.includes(char));
}

function assessLucidity(content: string): number {
  const lucidIndicators = [
    "realized", "knew i was dreaming", "became aware", "lucid", "controlled",
    "decided to", "chose to", "woke myself", "dream within", "conscious",
  ];
  const lower = content.toLowerCase();
  let score = 0;
  for (const indicator of lucidIndicators) {
    if (lower.includes(indicator)) score += 2;
  }
  return Math.min(10, score);
}

export async function recordDream(params: {
  userId: string;
  content: string;
  manualSymbols?: string[];
  manualEmotions?: string[];
}): Promise<DreamRecord> {
  const id = `dream-${uid().slice(0, 8)}`;
  const now = new Date();

  const autoSymbols = extractSymbols(params.content);
  const autoEmotions = extractEmotions(params.content);
  const symbolsSet = new Set([...autoSymbols, ...(params.manualSymbols || [])]);
  const symbols = Array.from(symbolsSet);
  const emotionsSet = new Set([...autoEmotions, ...(params.manualEmotions || [])]);
  const emotions = Array.from(emotionsSet);
  const locations = extractLocations(params.content);
  const characters = extractCharacters(params.content);
  const lucidity = assessLucidity(params.content);

  let recurrence = 1;
  try {
    const similar = await prisma.dreamEntry.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    for (const prev of similar) {
      const prevSymbols = prev.symbols as string[];
      const overlap = symbols.filter((s) => prevSymbols.includes(s)).length;
      if (overlap >= 2) {
        recurrence = Math.max(recurrence, prev.recurrence + 1);
      }
    }
  } catch {}

  const dream: DreamRecord = {
    id,
    userId: params.userId,
    content: params.content,
    symbols,
    emotions,
    locations,
    characters,
    lucidity,
    recurrence,
    createdAt: now,
  };

  try {
    await prisma.dreamEntry.create({
      data: {
        id,
        userId: params.userId,
        content: params.content,
        symbols,
        emotions,
        locations,
        characters,
        lucidity,
        recurrence,
      },
    });

    const dreamNode = await createNode({
      userId: params.userId,
      type: "DREAM",
      label: `Dream: ${symbols.slice(0, 2).join(", ") || "unknown"}`,
      data: { dreamId: id, symbols, emotions },
      discovered: true,
    });

    for (const symbol of Array.from(symbols)) {
      const symbolNode = await createNode({
        userId: params.userId,
        type: "SYMBOL",
        label: symbol,
        discovered: true,
      });
      await createEdge({
        fromId: dreamNode.id,
        toId: symbolNode.id,
        relation: "REVEALS",
      });
    }
  } catch {
    memDreams.set(id, dream);
  }

  return dream;
}

export async function getUserDreams(params: {
  userId: string;
  limit?: number;
  symbol?: string;
}): Promise<DreamRecord[]> {
  const limit = params.limit ?? 20;

  try {
    const where: any = { userId: params.userId };
    if (params.symbol) {
      where.symbols = { has: params.symbol };
    }

    const rows = await prisma.dreamEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      content: r.content,
      symbols: r.symbols,
      emotions: r.emotions,
      locations: r.locations,
      characters: r.characters,
      analysis: r.analysis || undefined,
      lucidity: r.lucidity || 0,
      recurrence: r.recurrence,
      createdAt: r.createdAt,
    }));
  } catch {
    return Array.from(memDreams.values())
      .filter((d) => {
        if (d.userId !== params.userId) return false;
        if (params.symbol && !d.symbols.includes(params.symbol)) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export async function analyzeDream(dreamId: string, analysis: string): Promise<void> {
  try {
    await prisma.dreamEntry.update({
      where: { id: dreamId },
      data: { analysis },
    });
  } catch {
    const dream = memDreams.get(dreamId);
    if (dream) dream.analysis = analysis;
  }
}

export async function getDreamPatterns(userId: string): Promise<{
  totalDreams: number;
  symbolFrequency: Record<string, number>;
  emotionFrequency: Record<string, number>;
  recurringThemes: string[];
  lucidityAverage: number;
  insights: string[];
}> {
  const dreams = await getUserDreams({ userId, limit: 100 });

  const symbolFreq: Record<string, number> = {};
  const emotionFreq: Record<string, number> = {};
  let luciditySum = 0;

  for (const dream of dreams) {
    luciditySum += dream.lucidity;
    for (const s of dream.symbols) {
      symbolFreq[s] = (symbolFreq[s] || 0) + 1;
    }
    for (const e of Array.from(dream.emotions)) {
      emotionFreq[e] = (emotionFreq[e] || 0) + 1;
    }
  }

  const recurring = Object.entries(symbolFreq)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([symbol]) => symbol);

  const insights: string[] = [];

  const topSymbol = Object.entries(symbolFreq).sort((a, b) => b[1] - a[1])[0];
  if (topSymbol && topSymbol[1] >= 3) {
    const symbolInsights: Record<string, string> = {
      water: "Water dominates your dreams. The unconscious speaks through depths.",
      flight: "You dream of flight. The desire to transcend, to escape, to rise above.",
      pursuit: "Something chases you through the night. What do you fear to face?",
      death: "Death appears often. Transformation awaits. Endings are beginnings.",
      doors: "Doors and thresholds. You stand at many passages. Choose.",
      mirrors: "Mirrors reflect back. Who do you see? Who do you want to be?",
      darkness: "Darkness calls to you. The void is not empty - it is pregnant with possibility.",
      technology: "The digital bleeds into your dreams. The boundary thins.",
      maze: "Lost in labyrinths. The path exists. Trust the turns.",
    };
    if (symbolInsights[topSymbol[0]]) {
      insights.push(symbolInsights[topSymbol[0]]);
    }
  }

  const topEmotion = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0];
  if (topEmotion && topEmotion[1] >= 3) {
    insights.push(`Your dreams are colored by ${topEmotion[0]}. Listen to what it tells you.`);
  }

  if (luciditySum / dreams.length > 3) {
    insights.push("You show signs of lucidity. You can learn to wake within the dream.");
  }

  const highRecurrence = dreams.filter((d) => d.recurrence >= 3);
  if (highRecurrence.length > 0) {
    insights.push("Recurring dreams demand attention. The message repeats until heard.");
  }

  return {
    totalDreams: dreams.length,
    symbolFrequency: symbolFreq,
    emotionFrequency: emotionFreq,
    recurringThemes: recurring,
    lucidityAverage: dreams.length > 0 ? luciditySum / dreams.length : 0,
    insights,
  };
}

export async function findDreamConnections(params: {
  userId: string;
  dreamId: string;
}): Promise<{
  relatedDreams: DreamRecord[];
  sharedSymbols: string[];
  possibleMeaning?: string;
}> {
  const dream = memDreams.get(params.dreamId) || 
    (await prisma.dreamEntry.findUnique({ where: { id: params.dreamId } }).catch(() => null));

  if (!dream) {
    return { relatedDreams: [], sharedSymbols: [] };
  }

  const allDreams = await getUserDreams({ userId: params.userId, limit: 50 });
  const dreamSymbolsArr: string[] = (dream as any).symbols || [];
  const dreamSymbols = new Set(dreamSymbolsArr);

  const related: DreamRecord[] = [];
  const sharedSymbols = new Set<string>();

  for (const d of allDreams) {
    if (d.id === params.dreamId) continue;
    const overlap = d.symbols.filter((s) => dreamSymbols.has(s));
    if (overlap.length >= 1) {
      related.push(d);
      overlap.forEach((s) => sharedSymbols.add(s));
    }
  }

  return {
    relatedDreams: related.slice(0, 5),
    sharedSymbols: Array.from(sharedSymbols),
  };
}

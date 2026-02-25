/**
 * Narrative Parser
 * 
 * MINIMAL extraction - we primarily rely on AI tools (world_create_room, world_create_object)
 * to build the knowledge graph intentionally. This parser only extracts:
 * 1. Player actions (always recorded)
 * 2. Very high-confidence objects (explicitly mentioned with "you see" patterns)
 * 3. Named NPCs (proper nouns with clear indicators)
 * 
 * The goal is QUALITY over QUANTITY. Better to miss things than pollute the graph.
 */

export type ExtractedRoom = {
  name: string;
  description: string;
  region?: string;
  exits: Array<{ direction: string; destination?: string; blocked?: boolean; blockedBy?: string }>;
  objects: string[];
  npcs: string[];
  atmosphere?: string;
};

export type ExtractedObject = {
  name: string;
  description: string;
  location: string;
  properties: {
    takeable?: boolean;
    openable?: boolean;
    container?: boolean;
    locked?: boolean;
    readable?: boolean;
    wearable?: boolean;
  };
  contents?: string[];
};

export type ExtractedNPC = {
  name: string;
  description: string;
  location: string;
  dialogue?: string[];
  attitude?: string;
};

export type ExtractedPuzzle = {
  id?: string;
  name: string;
  description: string;
  location: string;
  hints: string[];
  type?: string;
  difficulty?: number;
  conditions?: Array<{
    type: "object_state" | "object_location" | "flag" | "inventory" | "room";
    target: string;
    property?: string;
    value: any;
  }>;
  effects?: Array<{
    type: "unlock_exit" | "reveal_object" | "set_flag" | "move_object" | "change_description" | "trigger_event";
    target: string;
    value?: any;
  }>;
  prerequisites?: string[];
  unlocksNext?: string[];
  pointsReward?: number;
  experimentId?: string;
  solution?: string;
  solved?: boolean;
};

export type ExtractedAction = {
  command: string;
  actor: string;
  target?: string;
  tool?: string;
  result: string;
  success: boolean;
  timestamp: Date;
};

export type ExtractedEvent = {
  description: string;
  location: string;
  participants: string[];
  significance?: string;
  timestamp: Date;
};

export type WorldExtraction = {
  rooms: ExtractedRoom[];
  objects: ExtractedObject[];
  npcs: ExtractedNPC[];
  puzzles: ExtractedPuzzle[];
  actions: ExtractedAction[];
  events: ExtractedEvent[];
  currentRoom?: string;
  playerInventory: string[];
};

const NOISE_WORDS = new Set([
  'you', 'your', 'yourself', 'it', 'its', 'itself', 'this', 'that', 'these', 'those',
  'here', 'there', 'where', 'what', 'which', 'who', 'whom', 'how', 'why', 'when',
  'nothing', 'something', 'anything', 'everything', 'none', 'all', 'some', 'any',
  'way', 'place', 'thing', 'things', 'area', 'space', 'room', 'world', 'reality',
  'moment', 'time', 'while', 'bit', 'kind', 'sort', 'type', 'part', 'whole',
  'look', 'looks', 'looking', 'see', 'sees', 'seeing', 'seen', 'watch', 'watching',
  'feel', 'feels', 'feeling', 'sense', 'senses', 'sensing', 'felt',
  'seems', 'seem', 'appears', 'appear', 'appearing', 'appeared',
  'being', 'existence', 'self', 'awareness', 'consciousness', 'mind', 'thought', 'thoughts',
  'void', 'nothingness', 'emptiness', 'darkness', 'light', 'silence', 'sound',
  'everything', 'everywhere', 'everyone', 'anybody', 'somebody', 'nobody',
  'one', 'ones', 'other', 'others', 'another', 'each', 'every', 'both', 'neither',
  'first', 'last', 'next', 'previous', 'same', 'different', 'new', 'old',
  'many', 'much', 'more', 'most', 'few', 'less', 'least', 'several',
  'will', 'would', 'could', 'should', 'might', 'must', 'can', 'may',
  'begin', 'begins', 'beginning', 'end', 'ends', 'ending', 'start', 'stop',
  'come', 'comes', 'coming', 'go', 'goes', 'going', 'gone', 'went',
  'take', 'takes', 'taking', 'give', 'gives', 'giving', 'get', 'gets', 'getting',
  'make', 'makes', 'making', 'made', 'do', 'does', 'doing', 'done', 'did',
  'say', 'says', 'saying', 'said', 'tell', 'tells', 'telling', 'told',
  'know', 'knows', 'knowing', 'known', 'think', 'thinks', 'thinking', 'thought',
  'want', 'wants', 'wanting', 'need', 'needs', 'needing', 'like', 'likes', 'liking',
  'try', 'tries', 'trying', 'tried', 'use', 'uses', 'using', 'used',
  'find', 'finds', 'finding', 'found', 'keep', 'keeps', 'keeping', 'kept',
  'let', 'lets', 'letting', 'put', 'puts', 'putting', 'set', 'sets', 'setting',
  'turn', 'turns', 'turning', 'turned', 'move', 'moves', 'moving', 'moved',
  'point', 'points', 'side', 'sides', 'edge', 'edges', 'center', 'middle',
  'form', 'forms', 'shape', 'shapes', 'pattern', 'patterns', 'color', 'colors',
  'swirling', 'flowing', 'floating', 'drifting', 'shifting', 'changing', 'moving',
  'fading', 'growing', 'shrinking', 'expanding', 'contracting', 'dissolving',
  'cosmic', 'celestial', 'ethereal', 'ephemeral', 'infinite', 'eternal', 'vast',
  'vastness', 'boundary', 'boundaries', 'limit', 'limits', 'edge', 'horizon',
]);

function isValidObjectName(name: string): boolean {
  if (!name || name.length < 3 || name.length > 30) return false;
  
  const words = name.toLowerCase().split(/\s+/);
  if (words.length > 4) return false;
  if (words.every(w => NOISE_WORDS.has(w))) return false;
  if (words.some(w => w.length > 15)) return false;
  if (/^\d/.test(name)) return false;
  if (!/^[a-z]/i.test(name)) return false;
  if (/[^a-z\s'-]/i.test(name)) return false;
  
  return true;
}

function isValidNPCName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 40) return false;
  if (!/^[A-Z]/.test(name)) return false;
  
  const lower = name.toLowerCase();
  if (NOISE_WORDS.has(lower)) return false;
  
  const words = name.split(/\s+/);
  if (words.length > 4) return false;
  if (!words.every(w => /^[A-Z][a-z]*$/.test(w))) return false;
  
  return true;
}

export function parseNarrativeResponse(
  text: string,
  playerCommand: string,
  previousContext?: Partial<WorldExtraction>
): Partial<WorldExtraction> {
  const extraction: Partial<WorldExtraction> = {
    rooms: [],
    objects: [],
    npcs: [],
    puzzles: [],
    actions: [],
    events: [],
    playerInventory: previousContext?.playerInventory || [],
  };

  const action = parsePlayerAction(playerCommand, text);
  if (action) {
    extraction.actions!.push(action);
    
    if (action.command.match(/^(take|get|grab|pick)/i) && action.success && action.target) {
      const target = action.target.toLowerCase();
      if (isValidObjectName(target) && !extraction.playerInventory!.includes(target)) {
        extraction.playerInventory!.push(target);
      }
    }
    if (action.command.match(/^drop/i) && action.success && action.target) {
      extraction.playerInventory = extraction.playerInventory!.filter(i => 
        i.toLowerCase() !== action.target?.toLowerCase()
      );
    }
  }

  return extraction;
}

function parsePlayerAction(command: string, response: string): ExtractedAction | null {
  const cmd = command.toLowerCase().trim();
  if (!cmd) return null;
  
  const words = cmd.split(/\s+/);
  const verb = words[0];
  
  const failureIndicators = [
    /can't|cannot|don't|unable|impossible|won't|nothing happens/i,
    /doesn't seem|doesn't work|doesn't budge/i,
    /you see no|there is no|i don't understand/i,
  ];
  const success = !failureIndicators.some(p => p.test(response));
  
  const target = words.slice(1).join(' ');
  
  return {
    command: cmd,
    actor: 'player',
    target: target && isValidObjectName(target) ? target : undefined,
    result: response.slice(0, 150),
    success,
    timestamp: new Date(),
  };
}

function mergeExits(
  existing: ExtractedRoom['exits'],
  newExits: ExtractedRoom['exits']
): ExtractedRoom['exits'] {
  const exitMap = new Map<string, ExtractedRoom['exits'][0]>();
  for (const exit of existing) {
    exitMap.set(exit.direction, exit);
  }
  for (const exit of newExits) {
    const current = exitMap.get(exit.direction);
    if (current) {
      exitMap.set(exit.direction, { ...current, ...exit });
    } else {
      exitMap.set(exit.direction, exit);
    }
  }
  return Array.from(exitMap.values());
}

export function mergeExtractions(
  existing: WorldExtraction,
  newData: Partial<WorldExtraction>
): WorldExtraction {
  const merged = { ...existing };
  
  for (const room of newData.rooms || []) {
    const existingRoom = merged.rooms.find(r => 
      r.name.toLowerCase() === room.name.toLowerCase()
    );
    if (existingRoom) {
      existingRoom.description = room.description || existingRoom.description;
      existingRoom.exits = mergeExits(existingRoom.exits, room.exits);
      existingRoom.objects = Array.from(new Set([...existingRoom.objects, ...room.objects]));
      existingRoom.npcs = Array.from(new Set([...existingRoom.npcs, ...room.npcs]));
    } else {
      merged.rooms.push(room);
    }
  }
  
  for (const obj of newData.objects || []) {
    if (!isValidObjectName(obj.name)) continue;
    const existingObj = merged.objects.find(o => 
      o.name.toLowerCase() === obj.name.toLowerCase()
    );
    if (existingObj) {
      existingObj.description = obj.description || existingObj.description;
      existingObj.properties = { ...existingObj.properties, ...obj.properties };
    } else {
      merged.objects.push(obj);
    }
  }
  
  for (const npc of newData.npcs || []) {
    if (!isValidNPCName(npc.name)) continue;
    const existingNPC = merged.npcs.find(n => 
      n.name.toLowerCase() === npc.name.toLowerCase()
    );
    if (!existingNPC) {
      merged.npcs.push(npc);
    }
  }
  
  merged.puzzles = [...merged.puzzles, ...(newData.puzzles || [])];
  merged.actions = [...merged.actions, ...(newData.actions || [])];
  merged.events = [...merged.events, ...(newData.events || [])];
  
  if (newData.currentRoom) merged.currentRoom = newData.currentRoom;
  merged.playerInventory = newData.playerInventory || merged.playerInventory;
  
  return merged;
}

export function generateConsistencyContext(world: WorldExtraction): string {
  const parts: string[] = [];
  
  if (world.rooms.length > 0) {
    parts.push(`[ESTABLISHED LOCATIONS]`);
    for (const room of world.rooms.slice(-5)) {
      const exits = room.exits.map(e => `${e.direction}${e.blocked ? ' (blocked)' : ''}`).join(', ');
      parts.push(`• ${room.name}: exits to ${exits || 'unknown'}`);
    }
  }
  
  if (world.objects.length > 0) {
    parts.push(`\n[ESTABLISHED OBJECTS]`);
    for (const obj of world.objects.slice(-10)) {
      parts.push(`• ${obj.name} (in ${obj.location})`);
    }
  }
  
  if (world.npcs.length > 0) {
    parts.push(`\n[ENCOUNTERED CHARACTERS]`);
    for (const npc of world.npcs) {
      parts.push(`• ${npc.name} - ${npc.location}`);
    }
  }
  
  if (world.puzzles.length > 0) {
    const unsolved = world.puzzles.filter(p => !p.solved);
    if (unsolved.length > 0) {
      parts.push(`\n[ACTIVE PUZZLES]`);
      for (const puzzle of unsolved.slice(-3)) {
        parts.push(`• ${puzzle.name}: ${puzzle.hints.join(', ') || 'no hints yet'}`);
      }
    }
  }
  
  if (world.playerInventory.length > 0) {
    parts.push(`\n[PLAYER INVENTORY]: ${world.playerInventory.join(', ')}`);
  }
  
  if (parts.length > 0) {
    parts.push(`\nStay consistent with established facts. You may expand but not contradict.`);
  }
  
  return parts.join('\n');
}

export function createEmptyWorld(): WorldExtraction {
  return {
    rooms: [],
    objects: [],
    npcs: [],
    puzzles: [],
    actions: [],
    events: [],
    playerInventory: [],
  };
}

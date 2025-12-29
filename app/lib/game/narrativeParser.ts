/**
 * Narrative Parser
 * 
 * Extracts world elements from AI-generated adventure text to build
 * a persistent knowledge graph. This creates a hybrid between:
 * - Traditional IF (structured world model)
 * - D&D session (DM improvises, notes become canon)
 * - Generative experience (AI creates freely)
 * 
 * The graph then constrains future AI responses for consistency.
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
  name: string;
  description: string;
  location: string;
  hints: string[];
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

const DIRECTION_PATTERNS = [
  /(?:to the |going |leads? )?(north|south|east|west|up|down|northeast|northwest|southeast|southwest)/gi,
  /(?:a |an |the )?(?:door|passage|path|corridor|stairs?|ladder|opening|archway|gate|portal|exit) (?:to the |leads? |going )?(north|south|east|west|up|down)/gi,
  /(north|south|east|west|up|down)(?:ward|wards|erly)?(?:,| |\.)/gi,
];

const OBJECT_INDICATORS = [
  /(?:you (?:see|notice|spot|find|discover) )?(?:a |an |the |some )?([a-z][a-z\s]{2,30}?)(?:\.|,| here| on | in | lying| sitting| standing| resting)/gi,
  /(?:there (?:is|are) )?(?:a |an |the |some )?([a-z][a-z\s]{2,30}?)(?:\.|,| here)/gi,
  /(?:pick(?:s)? up|take(?:s)?|grab(?:s)?) (?:the |a |an )?([a-z][a-z\s]{2,30})/gi,
];

const NPC_INDICATORS = [
  /(?:a |an |the )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:stands?|sits?|waits?|watches?|speaks?|says?|looks?|appears?)/g,
  /(?:you (?:see|notice|meet|encounter) )?(?:a |an |the )?([a-z]+(?:\s+[a-z]+)?)\s+(?:figure|person|being|entity|ghost|spirit|shade|woman|man|creature)/gi,
];

const ROOM_DESCRIPTION_PATTERNS = [
  /^you (?:are|find yourself|stand|float|appear) (?:in|on|at|within) (?:a |an |the )?(.+?)(?:\.|$)/im,
  /^(?:this is |you have entered |welcome to )?(?:a |an |the )?(.+?)(?:\.|$)/im,
];

const PUZZLE_INDICATORS = [
  /(?:locked|blocked|sealed|closed|won't (?:open|budge|move))/gi,
  /(?:needs?|requires?|must have|looking for) (?:a |an |the )?([a-z\s]+?) to/gi,
  /(?:puzzle|riddle|mystery|secret|hidden|mechanism|device|contraption)/gi,
];

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

  const normalizedText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

  // Extract current room from response
  const roomMatch = normalizedText.match(ROOM_DESCRIPTION_PATTERNS[0]) || 
                    normalizedText.match(ROOM_DESCRIPTION_PATTERNS[1]);
  if (roomMatch) {
    const roomName = cleanRoomName(roomMatch[1]);
    const exits = extractExits(normalizedText);
    const objects = extractVisibleObjects(normalizedText);
    
    extraction.rooms!.push({
      name: roomName,
      description: lines[0] || normalizedText.slice(0, 200),
      exits,
      objects,
      npcs: [],
    });
    extraction.currentRoom = roomName;
  }

  // Extract objects mentioned
  for (const pattern of OBJECT_INDICATORS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(normalizedText)) !== null) {
      const objName = cleanObjectName(match[1]);
      if (objName && objName.length > 2 && !isCommonWord(objName)) {
        const existing = extraction.objects!.find(o => o.name.toLowerCase() === objName.toLowerCase());
        if (!existing) {
          extraction.objects!.push({
            name: objName,
            description: extractObjectContext(normalizedText, objName),
            location: extraction.currentRoom || 'unknown',
            properties: inferObjectProperties(normalizedText, objName),
          });
        }
      }
    }
  }

  // Extract NPCs
  for (const pattern of NPC_INDICATORS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const npcName = match[1].trim();
      if (npcName && npcName.length > 1 && !isCommonWord(npcName)) {
        extraction.npcs!.push({
          name: npcName,
          description: extractNPCContext(text, npcName),
          location: extraction.currentRoom || 'unknown',
        });
      }
    }
  }

  // Extract puzzle hints
  const hasPuzzleIndicator = PUZZLE_INDICATORS.some(p => {
    p.lastIndex = 0;
    return p.test(normalizedText);
  });
  if (hasPuzzleIndicator) {
    extraction.puzzles!.push({
      name: `Puzzle in ${extraction.currentRoom || 'unknown'}`,
      description: extractPuzzleContext(normalizedText),
      location: extraction.currentRoom || 'unknown',
      hints: extractPuzzleHints(normalizedText),
    });
  }

  // Record the action
  const action = parsePlayerAction(playerCommand, normalizedText);
  if (action) {
    extraction.actions!.push(action);
    
    // Update inventory based on action
    if (action.command.match(/^(take|get|grab|pick)/i) && action.success && action.target) {
      if (!extraction.playerInventory!.includes(action.target)) {
        extraction.playerInventory!.push(action.target);
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

function cleanRoomName(raw: string): string {
  return raw
    .replace(/^(a |an |the |some )/i, '')
    .replace(/[.,!?;:].*$/, '')
    .trim()
    .slice(0, 50);
}

function cleanObjectName(raw: string): string {
  return raw
    .replace(/^(a |an |the |some )/i, '')
    .replace(/[.,!?;:].*$/, '')
    .trim()
    .toLowerCase()
    .slice(0, 40);
}

function isCommonWord(word: string): boolean {
  const common = new Set([
    'you', 'your', 'yourself', 'it', 'its', 'itself', 'this', 'that', 'these', 'those',
    'here', 'there', 'where', 'what', 'which', 'who', 'whom',
    'nothing', 'something', 'anything', 'everything',
    'way', 'place', 'thing', 'things', 'area', 'space', 'room',
    'moment', 'time', 'while', 'bit', 'kind', 'sort', 'type',
    'look', 'looks', 'looking', 'see', 'sees', 'seeing',
    'feel', 'feels', 'feeling', 'sense', 'senses',
    'seems', 'seem', 'appears', 'appear',
  ]);
  return common.has(word.toLowerCase());
}

function extractExits(text: string): ExtractedRoom['exits'] {
  const exits: ExtractedRoom['exits'] = [];
  const foundDirections = new Set<string>();
  
  for (const pattern of DIRECTION_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const dir = match[1].toLowerCase();
      if (!foundDirections.has(dir)) {
        foundDirections.add(dir);
        const blocked = /blocked|locked|sealed|closed|barred/i.test(
          text.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30)
        );
        exits.push({ direction: dir, blocked });
      }
    }
  }
  
  return exits;
}

function extractVisibleObjects(text: string): string[] {
  const objects: string[] = [];
  
  // Look for "you can see" lists
  const seeMatch = text.match(/you (?:can )?see[:\s]+([^.]+)/i);
  if (seeMatch) {
    const items = seeMatch[1].split(/,|and/).map(s => cleanObjectName(s)).filter(Boolean);
    objects.push(...items);
  }
  
  return Array.from(new Set(objects));
}

function extractObjectContext(text: string, objName: string): string {
  const regex = new RegExp(`[^.]*${objName}[^.]*\\.`, 'gi');
  const match = text.match(regex);
  return match ? match[0].trim().slice(0, 200) : '';
}

function extractNPCContext(text: string, npcName: string): string {
  const regex = new RegExp(`[^.]*${npcName}[^.]*\\.`, 'gi');
  const match = text.match(regex);
  return match ? match[0].trim().slice(0, 200) : '';
}

function extractPuzzleContext(text: string): string {
  // Find sentences mentioning puzzle-like elements
  const sentences = text.split(/[.!?]+/).filter(s => 
    /locked|blocked|puzzle|riddle|secret|hidden|mechanism|needs|requires/i.test(s)
  );
  return sentences.slice(0, 2).join('. ').slice(0, 300);
}

function extractPuzzleHints(text: string): string[] {
  const hints: string[] = [];
  
  const needsMatch = text.match(/(?:needs?|requires?|must have) (?:a |an |the )?([a-z\s]+?) to/gi);
  if (needsMatch) {
    hints.push(...needsMatch.map(m => m.trim()));
  }
  
  return hints;
}

function inferObjectProperties(text: string, objName: string): ExtractedObject['properties'] {
  const context = text.toLowerCase();
  const props: ExtractedObject['properties'] = {};
  
  // Look for clues about object properties near the object name
  const nearObj = new RegExp(`[^.]*${objName.toLowerCase()}[^.]*`, 'g');
  const nearby = (context.match(nearObj) || []).join(' ');
  
  if (/take|pick up|grab|portable|small|light/i.test(nearby)) props.takeable = true;
  if (/open|close|lid|door|drawer|container/i.test(nearby)) props.openable = true;
  if (/inside|contains|holding|within|empty|full/i.test(nearby)) props.container = true;
  if (/locked|key|unlock/i.test(nearby)) props.locked = true;
  if (/read|writing|text|inscription|note|book|page/i.test(nearby)) props.readable = true;
  if (/wear|put on|clothing|garment|robe|cloak/i.test(nearby)) props.wearable = true;
  
  return props;
}

function parsePlayerAction(command: string, response: string): ExtractedAction | null {
  const cmd = command.toLowerCase().trim();
  const words = cmd.split(/\s+/);
  const verb = words[0];
  
  // Determine success based on response
  const failureIndicators = [
    /can't|cannot|don't|unable|impossible|won't|nothing happens/i,
    /doesn't seem|doesn't work|doesn't budge/i,
    /you see no|there is no|i don't understand/i,
  ];
  const success = !failureIndicators.some(p => p.test(response));
  
  return {
    command: cmd,
    actor: 'player',
    target: words.slice(1).join(' ') || undefined,
    result: response.slice(0, 100),
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

/**
 * Merge new extractions into existing world state
 */
export function mergeExtractions(
  existing: WorldExtraction,
  newData: Partial<WorldExtraction>
): WorldExtraction {
  const merged = { ...existing };
  
  // Merge rooms (update existing or add new)
  for (const room of newData.rooms || []) {
    const existingRoom = merged.rooms.find(r => 
      r.name.toLowerCase() === room.name.toLowerCase()
    );
    if (existingRoom) {
      // Update with new info
      existingRoom.description = room.description || existingRoom.description;
      existingRoom.exits = mergeExits(existingRoom.exits, room.exits);
      existingRoom.objects = Array.from(new Set([...existingRoom.objects, ...room.objects]));
      existingRoom.npcs = Array.from(new Set([...existingRoom.npcs, ...room.npcs]));
    } else {
      merged.rooms.push(room);
    }
  }
  
  // Merge objects
  for (const obj of newData.objects || []) {
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
  
  // Merge NPCs
  for (const npc of newData.npcs || []) {
    const existingNPC = merged.npcs.find(n => 
      n.name.toLowerCase() === npc.name.toLowerCase()
    );
    if (!existingNPC) {
      merged.npcs.push(npc);
    }
  }
  
  // Append puzzles, actions, events
  merged.puzzles = [...merged.puzzles, ...(newData.puzzles || [])];
  merged.actions = [...merged.actions, ...(newData.actions || [])];
  merged.events = [...merged.events, ...(newData.events || [])];
  
  // Update current room and inventory
  if (newData.currentRoom) merged.currentRoom = newData.currentRoom;
  merged.playerInventory = newData.playerInventory || merged.playerInventory;
  
  return merged;
}

/**
 * Generate consistency context for AI from world extraction
 */
export function generateConsistencyContext(world: WorldExtraction): string {
  const parts: string[] = [];
  
  if (world.rooms.length > 0) {
    parts.push(`[ESTABLISHED LOCATIONS - maintain consistency]`);
    for (const room of world.rooms.slice(-10)) { // Last 10 rooms
      const exits = room.exits.map(e => `${e.direction}${e.blocked ? ' (blocked)' : ''}`).join(', ');
      parts.push(`• ${room.name}: exits to ${exits || 'unknown'}`);
    }
  }
  
  if (world.objects.length > 0) {
    parts.push(`\n[ESTABLISHED OBJECTS]`);
    for (const obj of world.objects.slice(-15)) {
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
      for (const puzzle of unsolved.slice(-5)) {
        parts.push(`• ${puzzle.name}: ${puzzle.hints.join(', ') || 'no hints yet'}`);
      }
    }
  }
  
  if (world.playerInventory.length > 0) {
    parts.push(`\n[PLAYER INVENTORY]: ${world.playerInventory.join(', ')}`);
  }
  
  parts.push(`\nStay consistent with established facts. You may expand but not contradict.`);
  
  return parts.join('\n');
}

/**
 * Create an empty world extraction
 */
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

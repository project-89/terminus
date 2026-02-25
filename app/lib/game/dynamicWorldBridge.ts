/**
 * Dynamic World Bridge
 *
 * Bridges AI-created content (WorldExtraction) to the game engine format.
 * Enables LOGOS to dynamically expand the game world.
 */

import {
  Room,
  ObjectState,
  Puzzle,
  PuzzleCondition,
  PuzzleEffect,
  Exit,
  Direction,
} from "./worldModel";
import {
  WorldExtraction,
  ExtractedRoom,
  ExtractedObject,
  ExtractedPuzzle
} from "./narrativeParser";

type SupportedConditionType = PuzzleCondition["type"];
type SupportedEffectType = PuzzleEffect["type"];

const SUPPORTED_CONDITION_TYPES = new Set<SupportedConditionType>([
  "object_state",
  "object_location",
  "flag",
  "inventory",
  "room",
]);

const SUPPORTED_EFFECT_TYPES = new Set<SupportedEffectType>([
  "unlock_exit",
  "reveal_object",
  "set_flag",
  "move_object",
  "change_description",
  "trigger_event",
]);

function isSupportedPuzzleCondition(
  condition: NonNullable<ExtractedPuzzle["conditions"]>[number],
): condition is PuzzleCondition {
  return SUPPORTED_CONDITION_TYPES.has(condition.type as SupportedConditionType);
}

function isSupportedPuzzleEffect(
  effect: NonNullable<ExtractedPuzzle["effects"]>[number],
): effect is PuzzleEffect {
  return SUPPORTED_EFFECT_TYPES.has(effect.type as SupportedEffectType);
}

/**
 * Convert a room name to a kebab-case ID
 */
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Convert direction string to Direction type
 */
function toDirection(dir: string): Direction | null {
  const dirMap: Record<string, Direction> = {
    north: 'north', n: 'north',
    south: 'south', s: 'south',
    east: 'east', e: 'east',
    west: 'west', w: 'west',
    up: 'up', u: 'up',
    down: 'down', d: 'down',
    in: 'in', enter: 'in',
    out: 'out', exit: 'out',
  };
  return dirMap[dir.toLowerCase()] || null;
}

/**
 * Convert ExtractedRoom to game engine Room format
 */
export function extractedRoomToRoom(
  extracted: ExtractedRoom,
  allRooms: ExtractedRoom[]
): Room {
  const id = nameToId(extracted.name);

  const exits: Exit[] = extracted.exits
    .map(e => {
      const direction = toDirection(e.direction);
      if (!direction) return null;

      // Find destination room ID
      let destId = e.destination ? nameToId(e.destination) : '';

      // If destination is a room name, convert to ID
      if (e.destination) {
        const destRoom = allRooms.find(
          r => r.name.toLowerCase() === e.destination?.toLowerCase()
        );
        if (destRoom) {
          destId = nameToId(destRoom.name);
        }
      }

      return {
        direction,
        destination: destId,
        blocked: e.blocked ?? false,
        blockedMessage: e.blockedBy,
      } as Exit;
    })
    .filter((e): e is Exit => e !== null);

  return {
    id,
    name: extracted.name,
    region: extracted.region || 'dynamic',
    description: extracted.description,
    isDark: false,
    visited: false,
    exits,
    objects: extracted.objects.map(nameToId),
  };
}

/**
 * Convert ExtractedObject to game engine ObjectState format
 */
export function extractedObjectToObjectState(
  extracted: ExtractedObject
): ObjectState {
  const id = nameToId(extracted.name);
  const props = extracted.properties || {};

  return {
    id,
    name: extracted.name,
    aliases: [extracted.name.toLowerCase()],
    description: extracted.description,
    location: extracted.location ? nameToId(extracted.location) : null,
    isCarried: false,
    isWearable: props.wearable ?? false,
    isWorn: false,
    isOpenable: props.openable ?? false,
    isOpen: false,
    isLockable: props.locked ?? false,
    isLocked: props.locked ?? false,
    isLit: false,
    isFixed: !(props.takeable ?? true),
    isScenery: false,
    isContainer: props.container ?? false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {
      aiCreated: true,
      readable: props.readable,
    },
  };
}

/**
 * Convert ExtractedPuzzle to game engine Puzzle format
 */
export function extractedPuzzleToPuzzle(
  extracted: ExtractedPuzzle
): Puzzle {
  const id = extracted.id ? nameToId(extracted.id) : nameToId(extracted.name);
  const engineConditions = extracted.conditions?.filter(isSupportedPuzzleCondition) ?? [];
  const engineEffects = extracted.effects?.filter(isSupportedPuzzleEffect) ?? [];

  return {
    id,
    name: extracted.name,
    solved: extracted.solved ?? false,
    conditions: engineConditions.length > 0
      ? engineConditions
      : [
          { type: "flag", target: `puzzle-${id}-complete`, value: true },
        ],
    onSolve: engineEffects.length > 0
      ? engineEffects
      : [
          { type: "set_flag", target: `puzzle-${id}-solved`, value: true },
        ],
    hint: extracted.hints[0],
    logosExperiment: extracted.experimentId
      ? `AI-generated puzzle (${extracted.type || "world"}) linked to ${extracted.experimentId}`
      : `AI-generated puzzle (${extracted.type || "world"}) for dynamic world expansion`,
    dependsOn: extracted.prerequisites,
  };
}

/**
 * Full conversion: WorldExtraction → { rooms, objects, puzzles }
 */
export function convertWorldExtraction(world: WorldExtraction): {
  rooms: Record<string, Room>;
  objects: Record<string, ObjectState>;
  puzzles: Puzzle[];
} {
  const rooms: Record<string, Room> = {};
  const objects: Record<string, ObjectState> = {};
  const puzzles: Puzzle[] = [];

  // Convert rooms
  for (const extractedRoom of world.rooms) {
    const room = extractedRoomToRoom(extractedRoom, world.rooms);
    rooms[room.id] = room;
  }

  // Convert objects
  for (const extractedObj of world.objects) {
    const obj = extractedObjectToObjectState(extractedObj);
    objects[obj.id] = obj;
  }

  // Convert puzzles
  for (const extractedPuzzle of world.puzzles) {
    puzzles.push(extractedPuzzleToPuzzle(extractedPuzzle));
  }

  return { rooms, objects, puzzles };
}

/**
 * Merge dynamic content with static content
 * Dynamic content takes precedence for matching IDs
 */
export function mergeDynamicContent(
  staticRooms: Record<string, Room>,
  staticObjects: Record<string, ObjectState>,
  staticPuzzles: Puzzle[],
  dynamicRooms: Record<string, Room>,
  dynamicObjects: Record<string, ObjectState>,
  dynamicPuzzles: Puzzle[]
): {
  rooms: Record<string, Room>;
  objects: Record<string, ObjectState>;
  puzzles: Puzzle[];
} {
  // Start with static content
  const rooms = { ...staticRooms };
  const objects = { ...staticObjects };
  const puzzles = [...staticPuzzles];

  // Add/override with dynamic content
  for (const [id, room] of Object.entries(dynamicRooms)) {
    if (!rooms[id]) {
      rooms[id] = room;
      console.log(`[DynamicWorld] Added AI room: ${id}`);
    } else if (rooms[id].region === "dynamic") {
      rooms[id] = room;
      console.log(`[DynamicWorld] Updated AI room: ${id}`);
    }
  }

  for (const [id, obj] of Object.entries(dynamicObjects)) {
    if (!objects[id]) {
      objects[id] = obj;
      console.log(`[DynamicWorld] Added AI object: ${id}`);
    } else if (objects[id].customState?.aiCreated) {
      objects[id] = obj;
      console.log(`[DynamicWorld] Updated AI object: ${id}`);
    }
  }

  for (const puzzle of dynamicPuzzles) {
    const existingIndex = puzzles.findIndex((p) => p.id === puzzle.id);
    if (existingIndex === -1) {
      puzzles.push(puzzle);
      console.log(`[DynamicWorld] Added AI puzzle: ${puzzle.id}`);
    } else if (puzzles[existingIndex].logosExperiment?.includes("AI-generated")) {
      puzzles[existingIndex] = puzzle;
      console.log(`[DynamicWorld] Updated AI puzzle: ${puzzle.id}`);
    }
  }

  return { rooms, objects, puzzles };
}

/**
 * Create a connection between an existing room and a new AI room
 */
export function connectRooms(
  rooms: Record<string, Room>,
  fromRoomId: string,
  toRoomId: string,
  direction: Direction,
  bidirectional = true
): void {
  const fromRoom = rooms[fromRoomId];
  const toRoom = rooms[toRoomId];

  if (!fromRoom || !toRoom) {
    console.warn(`[DynamicWorld] Cannot connect rooms: ${fromRoomId} -> ${toRoomId}`);
    return;
  }

  // Add exit from source to destination
  if (!fromRoom.exits.some(e => e.direction === direction)) {
    fromRoom.exits.push({
      direction,
      destination: toRoomId,
    });
  }

  // Add reverse exit if bidirectional
  if (bidirectional) {
    const opposites: Record<string, Direction> = {
      north: 'south', south: 'north',
      east: 'west', west: 'east',
      up: 'down', down: 'up',
      in: 'out', out: 'in',
    };
    const reverseDir = opposites[direction];
    if (reverseDir && !toRoom.exits.some(e => e.direction === reverseDir)) {
      toRoom.exits.push({
        direction: reverseDir,
        destination: fromRoomId,
      });
    }
  }

  console.log(`[DynamicWorld] Connected ${fromRoomId} <-> ${toRoomId} via ${direction}`);
}

/**
 * Create room data for AI to use when calling world_create_room
 */
export function createRoomForAI(
  name: string,
  description: string,
  region: string,
  exits: Array<{ direction: string; destination: string }> = [],
  connectTo?: { roomId: string; direction: string }
): Room {
  const id = nameToId(name);

  return {
    id,
    name,
    region,
    description,
    isDark: false,
    visited: false,
    exits: exits.map(e => ({
      direction: toDirection(e.direction) || 'north' as Direction,
      destination: e.destination,
      isLocked: false,
    })),
    objects: [],
  };
}

/**
 * Create object data for AI to use when calling world_create_object
 */
export function createObjectForAI(
  name: string,
  description: string,
  location: string,
  properties: {
    takeable?: boolean;
    openable?: boolean;
    container?: boolean;
    wearable?: boolean;
    readable?: boolean;
  } = {}
): ObjectState {
  const id = nameToId(name);

  return {
    id,
    name,
    aliases: [name.toLowerCase()],
    description,
    location: nameToId(location),
    isCarried: false,
    isWearable: properties.wearable ?? false,
    isWorn: false,
    isOpenable: properties.openable ?? false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: !(properties.takeable ?? true),
    isScenery: false,
    isContainer: properties.container ?? false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { aiCreated: true },
  };
}

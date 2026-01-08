import { Room, Exit, Direction } from "./worldModel";
import fs from "fs";
import path from "path";

/**
 * Room File Schema (from JSON)
 */
export type RoomFile = {
  region: string;
  layer?: number;
  rooms: RoomDefinition[];
};

export type RoomDefinition = {
  id: string;
  name: string;
  description: string;
  darkDescription?: string;
  isDark?: boolean;
  exits: ExitDefinition[];
  objects?: string[];
};

export type ExitDefinition = {
  direction: string;
  destination: string;
  isLocked?: boolean;
  lockedMessage?: string;
};

// Cache for loaded rooms
let cachedRooms: Room[] | null = null;
let roomMetadata: Map<string, { region: string; layer: number }> = new Map();

/**
 * Get the rooms directory path
 */
function getRoomsDir(): string {
  const possiblePaths = [
    path.join(process.cwd(), "app/lib/game/data/rooms"),
    path.join(__dirname, "data/rooms"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return possiblePaths[0];
}

/**
 * Convert JSON exit to Room exit
 */
function convertExit(def: ExitDefinition): Exit {
  return {
    direction: def.direction as Direction,
    destination: def.destination,
    blocked: def.isLocked ?? false,
    blockedMessage: def.lockedMessage,
  };
}

/**
 * Load all room files from the data/rooms directory
 */
export function loadRooms(): Room[] {
  if (cachedRooms) {
    return cachedRooms;
  }

  const roomsDir = getRoomsDir();
  const rooms: Room[] = [];
  roomMetadata.clear();

  if (!fs.existsSync(roomsDir)) {
    console.warn(`[RoomLoader] Rooms directory not found: ${roomsDir}`);
    return rooms;
  }

  const files = fs
    .readdirSync(roomsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  for (const file of files) {
    try {
      const filePath = path.join(roomsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const roomFile: RoomFile = JSON.parse(content);

      for (const def of roomFile.rooms) {
        const room: Room = {
          id: def.id,
          name: def.name,
          region: roomFile.region,
          description: def.description,
          darkDescription: def.darkDescription,
          isDark: def.isDark ?? false,
          visited: false,
          exits: def.exits.map(convertExit),
          objects: def.objects ?? [],
        };

        rooms.push(room);
        roomMetadata.set(def.id, {
          region: roomFile.region,
          layer: roomFile.layer ?? 0,
        });
      }

      console.log(
        `[RoomLoader] Loaded ${roomFile.rooms.length} rooms from ${file}`
      );
    } catch (e) {
      console.error(`[RoomLoader] Failed to load ${file}:`, e);
    }
  }

  cachedRooms = rooms;
  console.log(`[RoomLoader] Total rooms loaded: ${rooms.length}`);
  return rooms;
}

/**
 * Get metadata for a specific room
 */
export function getRoomMetadata(
  roomId: string
): { region: string; layer: number } | undefined {
  if (!cachedRooms) {
    loadRooms();
  }
  return roomMetadata.get(roomId);
}

/**
 * Get rooms for a specific region
 */
export function getRoomsByRegion(region: string): Room[] {
  const all = loadRooms();
  return all.filter((r) => roomMetadata.get(r.id)?.region === region);
}

/**
 * Get rooms available at a specific trust layer
 */
export function getRoomsByLayer(layer: number): Room[] {
  const all = loadRooms();
  return all.filter((r) => (roomMetadata.get(r.id)?.layer ?? 0) <= layer);
}

/**
 * Reload rooms from disk
 */
export function reloadRooms(): Room[] {
  cachedRooms = null;
  roomMetadata.clear();
  return loadRooms();
}

/**
 * Get all room IDs
 */
export function getRoomIds(): string[] {
  return loadRooms().map((r) => r.id);
}

/**
 * Validate a room file structure
 */
export function validateRoomFile(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const file: RoomFile = JSON.parse(content);

    if (!file.region) {
      errors.push("Missing required field: region");
    }

    if (!Array.isArray(file.rooms)) {
      errors.push("Missing or invalid rooms array");
    } else {
      const ids = new Set<string>();

      for (let i = 0; i < file.rooms.length; i++) {
        const r = file.rooms[i];

        if (!r.id) {
          errors.push(`Room ${i}: Missing required field: id`);
        } else if (ids.has(r.id)) {
          errors.push(`Room ${i}: Duplicate id: ${r.id}`);
        } else {
          ids.add(r.id);
        }

        if (!r.name) {
          errors.push(`Room ${r.id || i}: Missing required field: name`);
        }

        if (!r.description) {
          errors.push(`Room ${r.id || i}: Missing required field: description`);
        }

        if (!Array.isArray(r.exits)) {
          errors.push(`Room ${r.id || i}: Missing or invalid exits array`);
        }
      }
    }
  } catch (e) {
    errors.push(`Invalid JSON: ${(e as Error).message}`);
  }

  return { valid: errors.length === 0, errors };
}

import { ObjectState } from "./worldModel";
import fs from "fs";
import path from "path";

/**
 * Object File Schema (from JSON)
 */
export type ObjectFile = {
  region: string;
  objects: ObjectDefinition[];
};

export type ObjectDefinition = {
  id: string;
  name: string;
  aliases?: string[];
  description: string;
  location: string | null;
  containedIn?: string | null;
  properties?: {
    isWearable?: boolean;
    isWorn?: boolean;
    isOpenable?: boolean;
    isOpen?: boolean;
    isLockable?: boolean;
    isLocked?: boolean;
    isLit?: boolean;
    isFixed?: boolean;
    isScenery?: boolean;
    isContainer?: boolean;
    isSwitchable?: boolean;
    isSwitchedOn?: boolean;
  };
  customState?: Record<string, any>;
  interactions?: Record<string, any>;
};

// Cache for loaded objects
let cachedObjects: Record<string, ObjectState> | null = null;
let objectMetadata: Map<string, { region: string }> = new Map();

/**
 * Get the objects directory path
 */
function getObjectsDir(): string {
  const possiblePaths = [
    path.join(process.cwd(), "app/lib/game/data/objects"),
    path.join(__dirname, "data/objects"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return possiblePaths[0];
}

/**
 * Convert JSON object definition to ObjectState
 */
function convertObject(def: ObjectDefinition): ObjectState {
  const props = def.properties ?? {};

  return {
    id: def.id,
    name: def.name,
    aliases: def.aliases ?? [def.id],
    description: def.description,
    location: def.location,
    isCarried: false,
    isWearable: props.isWearable ?? false,
    isWorn: props.isWorn ?? false,
    isOpenable: props.isOpenable ?? false,
    isOpen: props.isOpen ?? false,
    isLockable: props.isLockable ?? false,
    isLocked: props.isLocked ?? false,
    isLit: props.isLit ?? false,
    isFixed: props.isFixed ?? false,
    isScenery: props.isScenery ?? false,
    isContainer: props.isContainer ?? false,
    isSwitchable: props.isSwitchable ?? false,
    isSwitchedOn: props.isSwitchedOn ?? false,
    containedIn: def.containedIn ?? null,
    customState: {
      ...(def.customState ?? {}),
      interactions: def.interactions ?? {},
    },
  };
}

/**
 * Load all object files from the data/objects directory
 */
export function loadObjects(): Record<string, ObjectState> {
  if (cachedObjects) {
    return cachedObjects;
  }

  const objectsDir = getObjectsDir();
  const objects: Record<string, ObjectState> = {};
  objectMetadata.clear();

  if (!fs.existsSync(objectsDir)) {
    console.warn(`[ObjectLoader] Objects directory not found: ${objectsDir}`);
    return objects;
  }

  const files = fs
    .readdirSync(objectsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  for (const file of files) {
    try {
      const filePath = path.join(objectsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const objectFile: ObjectFile = JSON.parse(content);

      for (const def of objectFile.objects) {
        objects[def.id] = convertObject(def);
        objectMetadata.set(def.id, {
          region: objectFile.region,
        });
      }

      console.log(
        `[ObjectLoader] Loaded ${objectFile.objects.length} objects from ${file}`
      );
    } catch (e) {
      console.error(`[ObjectLoader] Failed to load ${file}:`, e);
    }
  }

  cachedObjects = objects;
  console.log(`[ObjectLoader] Total objects loaded: ${Object.keys(objects).length}`);
  return objects;
}

/**
 * Get metadata for a specific object
 */
export function getObjectMetadata(
  objectId: string
): { region: string } | undefined {
  if (!cachedObjects) {
    loadObjects();
  }
  return objectMetadata.get(objectId);
}

/**
 * Get objects for a specific region
 */
export function getObjectsByRegion(region: string): ObjectState[] {
  const all = loadObjects();
  return Object.values(all).filter(
    (o) => objectMetadata.get(o.id)?.region === region
  );
}

/**
 * Reload objects from disk
 */
export function reloadObjects(): Record<string, ObjectState> {
  cachedObjects = null;
  objectMetadata.clear();
  return loadObjects();
}

/**
 * Get all object IDs
 */
export function getObjectIds(): string[] {
  return Object.keys(loadObjects());
}

/**
 * Validate an object file structure
 */
export function validateObjectFile(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const file: ObjectFile = JSON.parse(content);

    if (!file.region) {
      errors.push("Missing required field: region");
    }

    if (!Array.isArray(file.objects)) {
      errors.push("Missing or invalid objects array");
    } else {
      const ids = new Set<string>();

      for (let i = 0; i < file.objects.length; i++) {
        const o = file.objects[i];

        if (!o.id) {
          errors.push(`Object ${i}: Missing required field: id`);
        } else if (ids.has(o.id)) {
          errors.push(`Object ${i}: Duplicate id: ${o.id}`);
        } else {
          ids.add(o.id);
        }

        if (!o.name) {
          errors.push(`Object ${o.id || i}: Missing required field: name`);
        }

        if (!o.description) {
          errors.push(`Object ${o.id || i}: Missing required field: description`);
        }
      }
    }
  } catch (e) {
    errors.push(`Invalid JSON: ${(e as Error).message}`);
  }

  return { valid: errors.length === 0, errors };
}

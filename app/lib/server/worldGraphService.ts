/**
 * World Graph Service
 * 
 * Persists extracted narrative elements to the knowledge graph,
 * building a consistent world model as the player explores.
 */

import prisma from "@/app/lib/prisma";
import {
  parseNarrativeResponse,
  mergeExtractions,
  generateConsistencyContext as generateConsistencyContextFromParser,
  createEmptyWorld,
  WorldExtraction
} from "@/app/lib/game/narrativeParser";
import {
  checkPuzzleAppropriate,
  recordPuzzleAttempt,
  getPuzzleTrack,
  PuzzleType as PuzzleDifficultyType,
} from "./puzzleDifficultyService";

export { generateConsistencyContextFromParser as generateConsistencyContext };

export async function getSessionWorld(sessionId: string): Promise<WorldExtraction> {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { gameState: true },
  });

  if (session?.gameState && typeof session.gameState === 'object') {
    const state = session.gameState as Record<string, any>;
    if (state.worldExtraction) {
      return state.worldExtraction as WorldExtraction;
    }
  }

  return createEmptyWorld();
}

export async function saveSessionWorld(sessionId: string, world: WorldExtraction): Promise<void> {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { gameState: true },
  });

  const existingState = (session?.gameState as Record<string, any>) || {};

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      gameState: {
        ...existingState,
        worldExtraction: world,
      },
    },
  });
}

export async function processNarrativeExchange(
  sessionId: string,
  userId: string,
  playerCommand: string,
  aiResponse: string
): Promise<{
  world: WorldExtraction;
  consistencyContext: string;
}> {
  const existingWorld = await getSessionWorld(sessionId);
  
  const newExtraction = parseNarrativeResponse(aiResponse, playerCommand, existingWorld);
  
  const mergedWorld = mergeExtractions(existingWorld, newExtraction);
  
  await saveSessionWorld(sessionId, mergedWorld);
  
  await persistToKnowledgeGraph(userId, sessionId, newExtraction);
  
  const consistencyContext = generateConsistencyContextFromParser(mergedWorld);
  
  return { world: mergedWorld, consistencyContext };
}

async function persistToKnowledgeGraph(
  userId: string,
  sessionId: string,
  extraction: Partial<WorldExtraction>
): Promise<void> {
  const nodePromises: Promise<any>[] = [];

  for (const room of extraction.rooms || []) {
    nodePromises.push(
      prisma.knowledgeNode.upsert({
        where: {
          userId_type_label: {
            userId,
            type: 'ROOM',
            label: room.name,
          },
        },
        update: {
          data: {
            description: room.description,
            exits: room.exits,
            objects: room.objects,
            region: room.region,
          },
        },
        create: {
          userId,
          type: 'ROOM',
          label: room.name,
          data: {
            description: room.description,
            exits: room.exits,
            objects: room.objects,
            region: room.region,
            sessionId,
          },
          discoveredAt: new Date(),
        },
      })
    );
  }

  for (const obj of extraction.objects || []) {
    nodePromises.push(
      prisma.knowledgeNode.upsert({
        where: {
          userId_type_label: {
            userId,
            type: 'OBJECT',
            label: obj.name,
          },
        },
        update: {
          data: {
            description: obj.description,
            location: obj.location,
            properties: obj.properties,
          },
        },
        create: {
          userId,
          type: 'OBJECT',
          label: obj.name,
          data: {
            description: obj.description,
            location: obj.location,
            properties: obj.properties,
            sessionId,
          },
          discoveredAt: new Date(),
        },
      })
    );
  }

  for (const npc of extraction.npcs || []) {
    nodePromises.push(
      prisma.knowledgeNode.upsert({
        where: {
          userId_type_label: {
            userId,
            type: 'NPC',
            label: npc.name,
          },
        },
        update: {
          data: {
            description: npc.description,
            location: npc.location,
            dialogue: npc.dialogue,
          },
        },
        create: {
          userId,
          type: 'NPC',
          label: npc.name,
          data: {
            description: npc.description,
            location: npc.location,
            dialogue: npc.dialogue,
            sessionId,
          },
          discoveredAt: new Date(),
        },
      })
    );
  }

  for (const puzzle of extraction.puzzles || []) {
    nodePromises.push(
      prisma.knowledgeNode.upsert({
        where: {
          userId_type_label: {
            userId,
            type: 'PUZZLE',
            label: puzzle.name,
          },
        },
        update: {
          data: {
            description: puzzle.description,
            hints: puzzle.hints,
            solved: puzzle.solved,
          },
        },
        create: {
          userId,
          type: 'PUZZLE',
          label: puzzle.name,
          data: {
            description: puzzle.description,
            location: puzzle.location,
            hints: puzzle.hints,
            solved: puzzle.solved || false,
            sessionId,
          },
          discoveredAt: new Date(),
        },
      })
    );
  }

  for (const action of extraction.actions || []) {
    nodePromises.push(
      prisma.knowledgeNode.create({
        data: {
          userId,
          type: 'ACTION',
          label: `${action.command} @ ${action.timestamp.toISOString()}`,
          data: {
            command: action.command,
            target: action.target,
            result: action.result,
            success: action.success,
            sessionId,
          },
          discoveredAt: action.timestamp,
        },
      })
    );
  }

  try {
    await Promise.all(nodePromises);
  } catch (error) {
    console.error('[WorldGraph] Error persisting to knowledge graph:', error);
  }
}

export async function createWorldEdges(
  userId: string,
  world: WorldExtraction
): Promise<void> {
  const edgePromises: Promise<any>[] = [];

  const roomNodes = await prisma.knowledgeNode.findMany({
    where: { userId, type: 'ROOM' },
    select: { id: true, label: true, data: true },
  });

  const roomMap = new Map(roomNodes.map((r: { id: string; label: string; data: any }) => [r.label.toLowerCase(), r]));

  for (const room of world.rooms) {
    const roomNode = roomMap.get(room.name.toLowerCase()) as { id: string } | undefined;
    if (!roomNode) continue;

    for (const exit of room.exits) {
      if (exit.destination) {
        const destNode = roomMap.get(exit.destination.toLowerCase()) as { id: string } | undefined;
        if (destNode) {
          edgePromises.push(
            prisma.knowledgeEdge.upsert({
              where: {
                fromId_toId_relation: {
                  fromId: roomNode.id,
                  toId: destNode.id,
                  relation: 'LEADS_TO',
                },
              },
              update: {},
              create: {
                fromId: roomNode.id,
                toId: destNode.id,
                relation: 'LEADS_TO',
              },
            })
          );
        }
      }
    }
  }

  const objectNodes = await prisma.knowledgeNode.findMany({
    where: { userId, type: 'OBJECT' },
    select: { id: true, label: true, data: true },
  });

  for (const objNode of objectNodes) {
    const data = objNode.data as Record<string, any>;
    if (data?.location) {
      const roomNode = roomMap.get(data.location.toLowerCase()) as { id: string } | undefined;
      if (roomNode) {
        edgePromises.push(
          prisma.knowledgeEdge.upsert({
            where: {
              fromId_toId_relation: {
                fromId: roomNode.id,
                toId: objNode.id,
                relation: 'CONTAINS',
              },
            },
            update: {},
            create: {
              fromId: roomNode.id,
              toId: objNode.id,
              relation: 'CONTAINS',
            },
          })
        );
      }
    }
  }

  try {
    await Promise.all(edgePromises);
  } catch (error) {
    console.error('[WorldGraph] Error creating edges:', error);
  }
}

export async function getWorldGraphForPlayback(
  userId: string,
  sessionId?: string
): Promise<{
  rooms: any[];
  objects: any[];
  npcs: any[];
  puzzles: any[];
  actions: any[];
  edges: any[];
}> {
  const whereClause: any = { userId };
  
  const [rooms, objects, npcs, puzzles, actions, edges] = await Promise.all([
    prisma.knowledgeNode.findMany({
      where: { ...whereClause, type: 'ROOM' },
      orderBy: { discoveredAt: 'asc' },
    }),
    prisma.knowledgeNode.findMany({
      where: { ...whereClause, type: 'OBJECT' },
      orderBy: { discoveredAt: 'asc' },
    }),
    prisma.knowledgeNode.findMany({
      where: { ...whereClause, type: 'NPC' },
      orderBy: { discoveredAt: 'asc' },
    }),
    prisma.knowledgeNode.findMany({
      where: { ...whereClause, type: 'PUZZLE' },
      orderBy: { discoveredAt: 'asc' },
    }),
    prisma.knowledgeNode.findMany({
      where: { ...whereClause, type: 'ACTION' },
      orderBy: { discoveredAt: 'asc' },
      take: 100,
    }),
    prisma.knowledgeEdge.findMany({
      where: {
        fromNode: { userId },
      },
      include: {
        fromNode: { select: { label: true, type: true } },
        toNode: { select: { label: true, type: true } },
      },
    }),
  ]);

  return { rooms, objects, npcs, puzzles, actions, edges };
}

export async function generatePlaybackScript(userId: string): Promise<string[]> {
  const actions = await prisma.knowledgeNode.findMany({
    where: { userId, type: 'ACTION' },
    orderBy: { discoveredAt: 'asc' },
    select: { data: true, discoveredAt: true },
  });

  return actions.map((a: { data: any; discoveredAt: Date | null }) => {
    const data = a.data as Record<string, any>;
    return `> ${data.command}\n${data.result}`;
  });
}

// ============================================
// AI World-Building Tools
// These functions are called by the AI to expand the game world
// ============================================

export type AICreatedRoom = {
  id: string;
  name: string;
  description: string;
  region: 'oneiros' | 'samsara' | 'mundane' | 'liminal' | 'void';
  exits?: Array<{
    direction: string;
    destination: string;
    blocked?: boolean;
    blockedMessage?: string;
  }>;
  isDark?: boolean;
  connectTo?: {
    roomId: string;
    direction: string;
    bidirectional?: boolean;
  };
};

export type AICreatedObject = {
  id: string;
  name: string;
  description: string;
  location: string;
  takeable?: boolean;
  aliases?: string[];
  properties?: Record<string, any>;
};

export type AIStateModification = {
  type: 'move_player' | 'add_inventory' | 'remove_inventory' | 'set_flag' | 'modify_room' | 'modify_object';
  target: string;
  value: any;
  reason?: string;
};

export async function aiCreateRoom(
  sessionId: string,
  userId: string,
  room: AICreatedRoom
): Promise<{ success: boolean; message: string }> {
  try {
    const world = await getSessionWorld(sessionId);
    
    // Check if room already exists
    if (world.rooms.some(r => r.name.toLowerCase() === room.name.toLowerCase())) {
      return { success: false, message: `Room "${room.name}" already exists` };
    }
    
    // Add the new room
    world.rooms.push({
      name: room.name,
      description: room.description,
      region: room.region,
      exits: room.exits?.map(e => ({
        direction: e.direction,
        destination: e.destination,
        blocked: e.blocked,
        blockedMessage: e.blockedMessage,
      })) || [],
      objects: [],
      npcs: [],
    });
    
    // Handle bidirectional connection
    if (room.connectTo) {
      const targetRoom = world.rooms.find(
        r => r.name.toLowerCase() === room.connectTo!.roomId.toLowerCase()
      );
      if (targetRoom) {
        const oppositeDir = getOppositeDirection(room.connectTo.direction);
        if (oppositeDir && !targetRoom.exits.some(e => e.direction === oppositeDir)) {
          targetRoom.exits.push({
            direction: oppositeDir,
            destination: room.name,
          });
        }
      }
    }
    
    await saveSessionWorld(sessionId, world);
    
    // Also persist to knowledge graph
    await prisma.knowledgeNode.create({
      data: {
        userId,
        type: 'ROOM',
        label: room.name,
        data: {
          id: room.id,
          description: room.description,
          region: room.region,
          exits: room.exits,
          isDark: room.isDark,
          aiCreated: true,
          sessionId,
        },
        discoveredAt: new Date(),
      },
    });
    
    console.log(`[AI WORLD] Created room: ${room.name} in ${room.region}`);
    return { success: true, message: `Created room "${room.name}"` };
  } catch (error) {
    console.error('[AI WORLD] Failed to create room:', error);
    return { success: false, message: `Failed to create room: ${error}` };
  }
}

export async function aiCreateObject(
  sessionId: string,
  userId: string,
  obj: AICreatedObject
): Promise<{ success: boolean; message: string }> {
  try {
    const world = await getSessionWorld(sessionId);
    
    // Check if object already exists
    if (world.objects.some(o => o.name.toLowerCase() === obj.name.toLowerCase())) {
      return { success: false, message: `Object "${obj.name}" already exists` };
    }
    
    // Add the new object
    world.objects.push({
      name: obj.name,
      description: obj.description,
      location: obj.location,
      properties: {
        takeable: obj.takeable ?? true,
        ...(obj.properties || {}),
      },
    });
    
    // Add to room's object list if room exists
    const room = world.rooms.find(r => r.name.toLowerCase() === obj.location.toLowerCase());
    if (room && !room.objects.includes(obj.name)) {
      room.objects.push(obj.name);
    }
    
    await saveSessionWorld(sessionId, world);
    
    // Persist to knowledge graph
    await prisma.knowledgeNode.create({
      data: {
        userId,
        type: 'OBJECT',
        label: obj.name,
        data: {
          id: obj.id,
          description: obj.description,
          location: obj.location,
          takeable: obj.takeable,
          aliases: obj.aliases,
          properties: obj.properties,
          aiCreated: true,
          sessionId,
        },
        discoveredAt: new Date(),
      },
    });
    
    console.log(`[AI WORLD] Created object: ${obj.name} in ${obj.location}`);
    return { success: true, message: `Created object "${obj.name}"` };
  } catch (error) {
    console.error('[AI WORLD] Failed to create object:', error);
    return { success: false, message: `Failed to create object: ${error}` };
  }
}

export async function aiModifyState(
  sessionId: string,
  userId: string,
  mod: AIStateModification
): Promise<{ success: boolean; message: string }> {
  try {
    const world = await getSessionWorld(sessionId);
    
    switch (mod.type) {
      case 'modify_room': {
        const room = world.rooms.find(r => r.name.toLowerCase() === mod.target.toLowerCase());
        if (room) {
          Object.assign(room, mod.value);
          console.log(`[AI WORLD] Modified room: ${mod.target}`);
        }
        break;
      }
      case 'modify_object': {
        const obj = world.objects.find(o => o.name.toLowerCase() === mod.target.toLowerCase());
        if (obj) {
          if (mod.value.location && mod.value.location !== obj.location) {
            // Move object between rooms
            const oldRoom = world.rooms.find(r => r.name.toLowerCase() === obj.location?.toLowerCase());
            const newRoom = world.rooms.find(r => r.name.toLowerCase() === mod.value.location.toLowerCase());
            if (oldRoom) {
              oldRoom.objects = oldRoom.objects.filter(o => o.toLowerCase() !== obj.name.toLowerCase());
            }
            if (newRoom && !newRoom.objects.includes(obj.name)) {
              newRoom.objects.push(obj.name);
            }
          }
          Object.assign(obj, mod.value);
          console.log(`[AI WORLD] Modified object: ${mod.target}`);
        }
        break;
      }
      case 'set_flag': {
        // Store flags in a custom property (not part of base WorldExtraction)
        const worldWithFlags = world as WorldExtraction & { flags?: Record<string, any> };
        if (!worldWithFlags.flags) worldWithFlags.flags = {};
        worldWithFlags.flags[mod.target] = mod.value;
        console.log(`[AI WORLD] Set flag: ${mod.target} = ${mod.value}`);
        break;
      }
      // move_player, add_inventory, remove_inventory would need game engine integration
      // For now, just log intent
      default:
        console.log(`[AI WORLD] State modification requested: ${mod.type} ${mod.target} (${mod.reason || 'no reason'})`);
    }
    
    await saveSessionWorld(sessionId, world);
    
    // Log the modification
    await prisma.knowledgeNode.create({
      data: {
        userId,
        type: 'ACTION',
        label: `AI_MODIFY: ${mod.type} ${mod.target}`,
        data: {
          modificationType: mod.type,
          target: mod.target,
          value: mod.value,
          reason: mod.reason,
          aiInitiated: true,
          sessionId,
        },
        discoveredAt: new Date(),
      },
    });
    
    return { success: true, message: `Modified ${mod.type}: ${mod.target}` };
  } catch (error) {
    console.error('[AI WORLD] Failed to modify state:', error);
    return { success: false, message: `Failed to modify state: ${error}` };
  }
}

function getOppositeDirection(dir: string): string | null {
  const opposites: Record<string, string> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    up: 'down',
    down: 'up',
    in: 'out',
    out: 'in',
  };
  return opposites[dir.toLowerCase()] || null;
}

// ============================================
// AI Puzzle Design
// LOGOS can create puzzles that integrate with both
// the game engine (world-based) and PuzzleChain (multimedia/ARG)
// ============================================

export type AIPuzzleCondition = {
  type: 'object_state' | 'object_location' | 'flag' | 'inventory' | 'room' | 'cipher_solved' | 'stego_decoded';
  target: string;
  property?: string;
  value: any;
};

export type AIPuzzleEffect = {
  type: 'unlock_exit' | 'reveal_object' | 'set_flag' | 'move_object' | 'change_description' | 'trigger_event' | 'award_points' | 'play_sound' | 'show_image';
  target: string;
  value?: any;
};

export type AIPuzzleMultimedia = {
  // Cipher encoding for text clues
  cipher?: {
    type: 'caesar' | 'vigenere' | 'rot13' | 'atbash' | 'morse' | 'binary' | 'a1z26';
    key?: string; // For caesar (shift number) or vigenere (keyword)
    message: string; // The decoded message
  };
  // Steganography for hidden image data
  stego?: {
    imagePrompt: string; // Prompt to generate carrier image
    hiddenMessage: string;
    visualPattern?: 'grid89' | 'spiral' | 'qr_ghost';
  };
  // Audio clue
  audio?: {
    description: string; // Description for AI audio generation
    hiddenMessage?: string; // If audio contains encoded message
  };
  // Visual clue
  image?: {
    prompt: string;
    displayMode: 'modal' | 'subliminal' | 'peripheral' | 'corruption';
  };
};

export type AICreatedPuzzle = {
  id: string;
  name: string;
  description: string; // For LOGOS's notes, not shown to player

  // Puzzle type determines how it's solved
  type: 'world' | 'cipher' | 'stego' | 'audio' | 'coordinates' | 'meta' | 'chain';

  // For world-based puzzles: conditions in the game engine
  conditions?: AIPuzzleCondition[];

  // What happens when solved
  effects?: AIPuzzleEffect[];

  // The solution (keyword, action, or answer)
  solution?: string;

  // Progressive hints (revealed after failed attempts)
  hints: string[];

  // Multimedia components for richer puzzles
  multimedia?: AIPuzzleMultimedia;

  // Location in the game world (optional)
  location?: string; // Room ID where puzzle is active

  // Difficulty 1-5
  difficulty: 1 | 2 | 3 | 4 | 5;

  // Chain linkage
  prerequisites?: string[]; // Puzzle IDs that must be solved first
  unlocksNext?: string[]; // Puzzle IDs this unlocks when solved

  // Points awarded on solve
  pointsReward?: number;

  // Link to experiment testing player behavior
  experimentId?: string;
};

export async function aiCreatePuzzle(
  sessionId: string,
  userId: string,
  puzzle: AICreatedPuzzle
): Promise<{
  success: boolean;
  message: string;
  puzzleId?: string;
  warnings?: string[];
  suggestions?: string[];
}> {
  try {
    const world = await getSessionWorld(sessionId);

    // Check if puzzle already exists
    if (world.puzzles.some(p => p.name.toLowerCase() === puzzle.name.toLowerCase())) {
      return { success: false, message: `Puzzle "${puzzle.name}" already exists` };
    }

    // Check if puzzle is appropriate for player's skill level
    const difficultyNormalized = (puzzle.difficulty - 1) / 4; // Convert 1-5 to 0-1
    const appropriateCheck = await checkPuzzleAppropriate(
      userId,
      puzzle.type as PuzzleDifficultyType,
      difficultyNormalized,
      puzzle.multimedia
    );

    // Log warnings but don't block creation (AI can override)
    if (!appropriateCheck.appropriate) {
      console.warn(`[AI WORLD] Puzzle may be too hard for player:`, appropriateCheck.warnings);
      console.log(`[AI WORLD] Suggestions:`, appropriateCheck.suggestions);
    }

    // Generate encoded content if cipher is specified
    let encodedContent: string | undefined;
    if (puzzle.multimedia?.cipher) {
      const { type, key, message } = puzzle.multimedia.cipher;
      // Note: actual encoding happens client-side via tools
      // We store the intent and solution
      encodedContent = `[CIPHER:${type}${key ? `:${key}` : ''}] ${message}`;
    }

    // Add puzzle to world extraction (narrative-level)
    world.puzzles.push({
      name: puzzle.name,
      description: puzzle.description,
      hints: puzzle.hints,
      solved: false,
      location: puzzle.location || 'unknown',
    });

    await saveSessionWorld(sessionId, world);

    // Get the track this puzzle will test
    const track = getPuzzleTrack(puzzle.type as PuzzleDifficultyType);

    // Also persist to knowledge graph for tracking
    await prisma.knowledgeNode.create({
      data: {
        userId,
        type: 'PUZZLE',
        label: puzzle.name,
        data: {
          id: puzzle.id,
          puzzleType: puzzle.type,
          description: puzzle.description,
          difficulty: puzzle.difficulty,
          difficultyNormalized,
          track, // Track this puzzle tests (logic, perception, creation, field)
          location: puzzle.location,
          solution: puzzle.solution, // Stored securely, not exposed
          conditions: puzzle.conditions,
          effects: puzzle.effects,
          hints: puzzle.hints,
          multimedia: puzzle.multimedia ? {
            hasCipher: !!puzzle.multimedia.cipher,
            hasStego: !!puzzle.multimedia.stego,
            hasAudio: !!puzzle.multimedia.audio,
            hasImage: !!puzzle.multimedia.image,
            cipherType: puzzle.multimedia.cipher?.type,
          } : undefined,
          prerequisites: puzzle.prerequisites,
          unlocksNext: puzzle.unlocksNext,
          pointsReward: puzzle.pointsReward,
          experimentId: puzzle.experimentId,
          aiCreated: true,
          sessionId,
          attempts: 0,
          solved: false,
        },
        discoveredAt: new Date(),
      },
    });

    console.log(`[AI WORLD] Created puzzle: ${puzzle.name} (type: ${puzzle.type}, difficulty: ${puzzle.difficulty}/5, track: ${track})`);

    // If puzzle has multimedia components, log them
    if (puzzle.multimedia) {
      const components: string[] = [];
      if (puzzle.multimedia.cipher) components.push(`cipher:${puzzle.multimedia.cipher.type}`);
      if (puzzle.multimedia.stego) components.push('stego');
      if (puzzle.multimedia.audio) components.push('audio');
      if (puzzle.multimedia.image) components.push('image');
      console.log(`[AI WORLD] Puzzle multimedia: ${components.join(', ')}`);
    }

    // Build response with warnings if applicable
    const response: {
      success: boolean;
      message: string;
      puzzleId?: string;
      warnings?: string[];
      suggestions?: string[];
    } = {
      success: true,
      message: `Created puzzle "${puzzle.name}"`,
      puzzleId: puzzle.id,
    };

    if (!appropriateCheck.appropriate) {
      response.warnings = appropriateCheck.warnings;
      response.suggestions = appropriateCheck.suggestions;
      response.message += ` (NOTE: ${appropriateCheck.warnings.length} warning(s) - puzzle may be challenging for this player)`;
    }

    return response;
  } catch (error) {
    console.error('[AI WORLD] Failed to create puzzle:', error);
    return { success: false, message: `Failed to create puzzle: ${error}` };
  }
}

/**
 * Check if a puzzle solution is correct and handle effects
 */
export async function aiCheckPuzzleSolution(
  sessionId: string,
  userId: string,
  puzzleId: string,
  answer: string
): Promise<{
  correct: boolean;
  message: string;
  hint?: string;
  pointsAwarded?: number;
  unlockedPuzzles?: string[];
  skillUpdate?: {
    track: string;
    oldRating: number;
    newRating: number;
    change: number;
  };
}> {
  try {
    // Get puzzle from knowledge graph
    const puzzleNode = await prisma.knowledgeNode.findFirst({
      where: {
        userId,
        type: 'PUZZLE',
        data: {
          path: ['id'],
          equals: puzzleId,
        },
      },
    });

    if (!puzzleNode) {
      return { correct: false, message: 'Puzzle not found' };
    }

    const puzzleData = puzzleNode.data as Record<string, any>;
    const solution = puzzleData.solution?.toLowerCase().trim();
    const normalizedAnswer = answer.toLowerCase().trim();

    if (!solution) {
      return { correct: false, message: 'This puzzle requires a different method to solve' };
    }

    // Track attempts
    const attempts = (puzzleData.attempts || 0) + 1;
    await prisma.knowledgeNode.update({
      where: { id: puzzleNode.id },
      data: {
        data: {
          ...puzzleData,
          attempts,
        },
      },
    });

    if (normalizedAnswer !== solution) {
      // Provide hint based on attempt count
      const hints = puzzleData.hints || [];
      const hintIndex = Math.min(Math.floor(attempts / 2), hints.length - 1);
      const hint = hints[hintIndex];

      return {
        correct: false,
        message: 'Incorrect',
        hint,
      };
    }

    // Check if already solved - don't double-reward
    if (puzzleData.solved) {
      console.log(`[AI WORLD] Puzzle already solved: ${puzzleNode.label}`);
      return {
        correct: true,
        message: 'Already solved!',
        // No points awarded on re-solve
      };
    }

    // Correct! Mark as solved and update player skill
    const puzzleType = (puzzleData.puzzleType || 'world') as PuzzleDifficultyType;
    const puzzleDifficulty = puzzleData.difficultyNormalized || (puzzleData.difficulty - 1) / 4;

    // Record the outcome and update player's skill rating
    const skillResult = await recordPuzzleAttempt(
      userId,
      puzzleId,
      puzzleType,
      puzzleDifficulty,
      true, // solved
      attempts
    );

    // Update puzzle node with solve data
    await prisma.knowledgeNode.update({
      where: { id: puzzleNode.id },
      data: {
        data: {
          ...puzzleData,
          attempts,
          solved: true,
          solvedAt: new Date().toISOString(),
          attemptsToSolve: attempts,
          skillRatingBefore: skillResult.newRating - skillResult.ratingChange,
          skillRatingAfter: skillResult.newRating,
        },
      },
    });

    // Update world extraction
    const world = await getSessionWorld(sessionId);
    const worldPuzzle = world.puzzles.find(p =>
      p.name.toLowerCase() === puzzleNode.label.toLowerCase()
    );
    if (worldPuzzle) {
      worldPuzzle.solved = true;
    }
    await saveSessionWorld(sessionId, world);

    // Award points if specified
    let pointsAwarded: number | undefined;
    if (puzzleData.pointsReward) {
      await prisma.reward.create({
        data: {
          userId,
          type: 'CREDIT',
          amount: puzzleData.pointsReward,
          metadata: {
            reason: `Solved puzzle: ${puzzleNode.label}`,
            puzzleId,
            category: 'puzzle_progress',
          },
        },
      });
      pointsAwarded = puzzleData.pointsReward;
    }

    console.log(`[AI WORLD] Puzzle solved: ${puzzleNode.label} by ${userId} (${skillResult.track} skill: ${((skillResult.newRating - skillResult.ratingChange) * 100).toFixed(0)}% → ${(skillResult.newRating * 100).toFixed(0)}%)`);

    return {
      correct: true,
      message: 'Correct!',
      pointsAwarded,
      unlockedPuzzles: puzzleData.unlocksNext,
      skillUpdate: {
        track: skillResult.track,
        oldRating: skillResult.newRating - skillResult.ratingChange,
        newRating: skillResult.newRating,
        change: skillResult.ratingChange,
      },
    };
  } catch (error) {
    console.error('[AI WORLD] Failed to check puzzle solution:', error);
    return { correct: false, message: 'Error checking solution' };
  }
}

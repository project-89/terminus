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

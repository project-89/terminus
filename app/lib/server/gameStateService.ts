import prisma from "@/app/lib/prisma";
import { GameEngine, GameState } from "@/app/lib/game";

export async function getOrCreateGameState(sessionId: string): Promise<GameEngine> {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { gameState: true },
  });

  if (session?.gameState) {
    try {
      return GameEngine.deserialize(JSON.stringify(session.gameState));
    } catch (e) {
      console.error("Failed to deserialize game state, creating new:", e);
    }
  }

  return new GameEngine();
}

export async function saveGameState(sessionId: string, engine: GameEngine): Promise<void> {
  const serialized = engine.serialize();
  
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { gameState: JSON.parse(serialized) },
  });
}

export async function processGameCommand(
  sessionId: string,
  command: string
): Promise<{
  result: {
    success: boolean;
    message: string;
    puzzleSolved?: string;
    logosNote?: string;
  };
  constraints: string;
  state: GameState;
}> {
  const engine = await getOrCreateGameState(sessionId);
  const result = engine.execute(command);
  
  await saveGameState(sessionId, engine);
  
  return {
    result,
    constraints: engine.getConstraintsForAI(),
    state: engine.getState(),
  };
}

export async function getGameConstraints(sessionId: string): Promise<{
  constraints: ReturnType<GameEngine["getConstraintsForAI"]>;
  state: GameState;
} | null> {
  const engine = await getOrCreateGameState(sessionId);
  
  return {
    constraints: engine.getConstraintsForAI(),
    state: engine.getState(),
  };
}

export function isGameCommand(input: string): boolean {
  const cmd = input.toLowerCase().trim();
  const gameCommands = [
    "look", "l", "examine", "x", "ex", "inspect",
    "inventory", "i", "inv",
    "go", "walk", "move", "n", "s", "e", "w", "north", "south", "east", "west",
    "up", "down", "u", "d", "in", "out", "enter", "exit",
    "take", "get", "grab", "pick",
    "drop", "put", "leave",
    "open", "close", "shut",
    "wear", "don", "remove", "doff",
    "search", "focus", "concentrate",
    "burn", "light", "ignite",
    "wait", "z",
    "sleep", "wake",
    "become",
    "unscrew", "screw",
    "help",
    "read",
    "switch on", "switch off", "turn on", "turn off",
    "activate", "deactivate",
  ];
  
  const firstWord = cmd.split(/\s+/)[0];
  return gameCommands.includes(firstWord) || 
         gameCommands.includes(cmd.split(/\s+/).slice(0, 2).join(" "));
}

export async function resetGameState(sessionId: string): Promise<GameEngine> {
  const engine = new GameEngine();
  await saveGameState(sessionId, engine);
  return engine;
}

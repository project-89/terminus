import { NextResponse } from "next/server";
import * as puzzles from "@/app/lib/puzzles";
import { aiCheckPuzzleSolution } from "@/app/lib/server/worldGraphService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "encode_cipher": {
        const { text, cipher, key } = body;
        let encoded: string;
        
        switch (cipher) {
          case "caesar":
            encoded = puzzles.caesarCipher(text, parseInt(key) || 13);
            break;
          case "vigenere":
            encoded = puzzles.vigenereCipher(text, key || "LOGOS");
            break;
          case "rot13":
            encoded = puzzles.rot13(text);
            break;
          case "atbash":
            encoded = puzzles.atbashCipher(text);
            break;
          case "morse":
            encoded = puzzles.toMorse(text);
            break;
          case "binary":
            encoded = puzzles.toBinary(text);
            break;
          default:
            return NextResponse.json({ error: "Unknown cipher" }, { status: 400 });
        }
        
        return NextResponse.json({ encoded, cipher, original: text });
      }

      case "decode_cipher": {
        const { text, cipher, key } = body;
        let decoded: string;
        
        switch (cipher) {
          case "caesar":
            decoded = puzzles.caesarCipher(text, parseInt(key) || 13, true);
            break;
          case "vigenere":
            decoded = puzzles.vigenereCipher(text, key || "LOGOS", true);
            break;
          case "rot13":
            decoded = puzzles.rot13(text);
            break;
          case "atbash":
            decoded = puzzles.atbashCipher(text);
            break;
          case "morse":
            decoded = puzzles.fromMorse(text);
            break;
          case "binary":
            decoded = puzzles.fromBinary(text);
            break;
          default:
            return NextResponse.json({ error: "Unknown cipher" }, { status: 400 });
        }
        
        return NextResponse.json({ decoded, cipher });
      }

      case "generate_challenge": {
        const { message, difficulty } = body;
        const challenge = puzzles.createCipherChallenge(
          message,
          difficulty || "medium"
        );
        return NextResponse.json(challenge);
      }

      case "solve_attempt": {
        const { puzzleId, userId, answer, sessionId, scope } = body;
        if (!puzzleId || !userId || typeof answer !== "string") {
          return NextResponse.json(
            { error: "puzzleId, userId, and answer are required" },
            { status: 400 }
          );
        }
        if (scope === "world" || sessionId) {
          if (!sessionId || !userId) {
            return NextResponse.json(
              { error: "sessionId and userId are required for world puzzle solving" },
              { status: 400 }
            );
          }
          const worldResult = await aiCheckPuzzleSolution(sessionId, userId, puzzleId, answer);
          if (worldResult.correct || worldResult.message !== "Puzzle not found") {
            return NextResponse.json(worldResult);
          }
        }

        const result = await puzzles.solvePuzzle(puzzleId, userId, answer);
        return NextResponse.json(result);
      }

      case "create_chain": {
        const { title, description, puzzleConfigs, targetUserId, finalReward } = body;
        
        // Build puzzle nodes from configs
        const puzzleNodes = puzzleConfigs.map((config: any, index: number) => {
          if (config.type === "cipher") {
            return puzzles.createCipherPuzzle({
              message: config.solution,
              difficulty: config.difficulty || 3,
              order: index,
              prerequisites: config.prerequisites,
              unlocksNext: config.unlocksNext,
              tags: config.tags,
            });
          }
          if (config.type === "coordinates") {
            return puzzles.createCoordinatesPuzzle({
              lat: config.lat,
              lng: config.lng,
              locationHint: config.locationHint,
              whatToFind: config.solution,
              order: index,
              prerequisites: config.prerequisites,
              unlocksNext: config.unlocksNext,
            });
          }
          if (config.type === "meta") {
            return puzzles.createMetaPuzzle({
              question: config.question,
              answer: config.solution,
              order: index,
              prerequisites: config.prerequisites,
              unlocksNext: config.unlocksNext,
            });
          }
          // Default cipher
          return puzzles.createCipherPuzzle({
            message: config.solution || config.message,
            difficulty: 3,
            order: index,
          });
        });

        const chain = await puzzles.createPuzzleChain({
          title,
          description,
          puzzles: puzzleNodes,
          targetUserId,
          finalReward,
        });

        return NextResponse.json({ chainId: chain.id, puzzleCount: chain.nodes.length });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Puzzle API error:", error);
    return NextResponse.json(
      { error: "Puzzle operation failed", details: String(error) },
      { status: 500 }
    );
  }
}

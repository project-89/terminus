/**
 * Puzzle System
 * 
 * Tools for LOGOS to create evolving, interconnected mysteries:
 * - Steganography: Hide data in images
 * - Ciphers: Encode text with classic cryptography
 * - Chains: Link puzzles so solving one reveals the next
 */

export * from "./steganography";
export * from "./ciphers";
export * from "./puzzleChain";

// Re-export commonly used functions with clearer names
export { 
  encodeMessage as hideInImage,
  decodeMessage as extractFromImage,
  embedVisualPattern as addVisualClue,
} from "./steganography";

export {
  caesar as caesarCipher,
  vigenere as vigenereCipher,
  rot13,
  atbash as atbashCipher,
  toMorse,
  fromMorse,
  toBinary,
  fromBinary,
  generateChallenge as createCipherChallenge,
} from "./ciphers";

export {
  createChain as createPuzzleChain,
  attemptSolution as solvePuzzle,
  createCipherPuzzle,
  createStegoPuzzle,
  createCoordinatesPuzzle,
  createMetaPuzzle,
} from "./puzzleChain";

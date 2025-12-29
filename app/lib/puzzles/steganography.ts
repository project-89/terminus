/**
 * Steganography utilities for hiding data in images
 * Uses LSB (Least Significant Bit) encoding in pixel data
 */

import sharp from "sharp";

const MARKER_START = "<<P89S>>";
const MARKER_END = "<<P89E>>";

export interface StegoPayload {
  type: "coordinates" | "puzzle_fragment" | "next_step" | "cipher_key" | "message";
  data: Record<string, any>;
  puzzleId?: string;
  timestamp?: number;
}

/**
 * Encode a message into an image using LSB steganography
 */
export async function encodeMessage(imageBuffer: Buffer, payload: StegoPayload): Promise<Buffer> {
  const message = MARKER_START + JSON.stringify(payload) + MARKER_END;
  const binaryMessage = stringToBinary(message);
  
  // Get raw pixel data
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(data);
  const capacity = Math.floor(pixels.length / 8); // 1 bit per channel, 8 bits per byte
  
  if (message.length > capacity) {
    throw new Error(`Message too long. Capacity: ${capacity} bytes, Message: ${message.length} bytes`);
  }
  
  // Encode message into LSB of each byte
  let bitIndex = 0;
  for (let i = 0; i < pixels.length && bitIndex < binaryMessage.length; i++) {
    // Skip alpha channel if present (every 4th byte in RGBA)
    if (info.channels === 4 && i % 4 === 3) continue;
    
    const bit = parseInt(binaryMessage[bitIndex], 2);
    pixels[i] = (pixels[i] & 0xFE) | bit;
    bitIndex++;
  }
  
  // Rebuild image
  return sharp(Buffer.from(pixels), {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Decode a hidden message from an image
 */
export async function decodeMessage(imageBuffer: Buffer): Promise<StegoPayload | null> {
  try {
    const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8Array(data);
    
    // Extract LSB from each byte
    let binary = "";
    for (let i = 0; i < pixels.length; i++) {
      if (info.channels === 4 && i % 4 === 3) continue;
      binary += (pixels[i] & 1).toString();
    }
    
    const text = binaryToString(binary);
    
    // Find markers
    const startIdx = text.indexOf(MARKER_START);
    if (startIdx === -1) return null;
    
    const endIdx = text.indexOf(MARKER_END, startIdx);
    if (endIdx === -1) return null;
    
    const jsonStr = text.substring(startIdx + MARKER_START.length, endIdx);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Stego decode error:", e);
    return null;
  }
}

/**
 * Embed coordinates (for real-world ARG hooks)
 */
export async function embedCoordinates(
  imageBuffer: Buffer,
  lat: number,
  lng: number,
  hint?: string
): Promise<Buffer> {
  return encodeMessage(imageBuffer, {
    type: "coordinates",
    data: { lat, lng, hint },
    timestamp: Date.now(),
  });
}

/**
 * Embed a puzzle fragment (for chained puzzles)
 */
export async function embedPuzzleFragment(
  imageBuffer: Buffer,
  puzzleId: string,
  fragment: string,
  order: number,
  totalFragments: number
): Promise<Buffer> {
  return encodeMessage(imageBuffer, {
    type: "puzzle_fragment",
    puzzleId,
    data: { fragment, order, totalFragments },
    timestamp: Date.now(),
  });
}

/**
 * Embed a cipher key or decryption hint
 */
export async function embedCipherKey(
  imageBuffer: Buffer,
  puzzleId: string,
  key: string,
  algorithm: string
): Promise<Buffer> {
  return encodeMessage(imageBuffer, {
    type: "cipher_key",
    puzzleId,
    data: { key, algorithm },
    timestamp: Date.now(),
  });
}

/**
 * Embed next step instructions
 */
export async function embedNextStep(
  imageBuffer: Buffer,
  puzzleId: string,
  nextStep: {
    url?: string;
    command?: string;
    phrase?: string;
    coordinates?: { lat: number; lng: number };
  }
): Promise<Buffer> {
  return encodeMessage(imageBuffer, {
    type: "next_step",
    puzzleId,
    data: nextStep,
    timestamp: Date.now(),
  });
}

/**
 * Visual steganography: embed patterns visible only under specific conditions
 * (e.g., when contrast/brightness is adjusted in photo editor)
 */
export async function embedVisualPattern(
  imageBuffer: Buffer,
  pattern: "grid89" | "spiral" | "qr_ghost",
  intensity: number = 2 // How visible (1-5, lower = more hidden)
): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  const { width, height, channels } = info;
  
  switch (pattern) {
    case "grid89":
      // Grid with 89-pixel spacing (Project 89 signature)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (x % 89 === 0 || y % 89 === 0) {
            const idx = (y * width + x) * channels;
            for (let c = 0; c < Math.min(3, channels); c++) {
              pixels[idx + c] = Math.max(0, pixels[idx + c] - intensity);
            }
          }
        }
      }
      break;
      
    case "spiral":
      // Golden ratio spiral
      const centerX = width / 2;
      const centerY = height / 2;
      const phi = (1 + Math.sqrt(5)) / 2;
      
      for (let i = 0; i < 2000; i++) {
        const angle = i * phi * Math.PI * 2;
        const radius = Math.sqrt(i) * 2;
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * channels;
          for (let c = 0; c < Math.min(3, channels); c++) {
            pixels[idx + c] = Math.min(255, pixels[idx + c] + intensity);
          }
        }
      }
      break;
      
    case "qr_ghost":
      // Faint QR-code-like pattern in corner (not a real QR, just suggestive)
      const qrSize = Math.min(50, Math.floor(Math.min(width, height) * 0.1));
      const startX = width - qrSize - 10;
      const startY = height - qrSize - 10;
      
      for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
          // Create finder pattern illusion
          const isBorder = x < 3 || x >= qrSize - 3 || y < 3 || y >= qrSize - 3;
          const isInner = x >= 5 && x < qrSize - 5 && y >= 5 && y < qrSize - 5;
          const shouldDarken = (isBorder || isInner) && ((x + y) % 2 === 0);
          
          if (shouldDarken) {
            const px = startX + x;
            const py = startY + y;
            if (px < width && py < height) {
              const idx = (py * width + px) * channels;
              for (let c = 0; c < Math.min(3, channels); c++) {
                pixels[idx + c] = Math.max(0, pixels[idx + c] - intensity);
              }
            }
          }
        }
      }
      break;
  }
  
  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

// Helper functions
function stringToBinary(str: string): string {
  return str
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

function binaryToString(binary: string): string {
  let result = "";
  for (let i = 0; i + 8 <= binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    const charCode = parseInt(byte, 2);
    if (charCode === 0) break;
    result += String.fromCharCode(charCode);
  }
  return result;
}

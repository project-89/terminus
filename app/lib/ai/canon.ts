import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import { loadPrompt } from "@/app/lib/prompts";

const CANON_PATH = join(process.cwd(), "app/knowledge/if-canon.txt");

export function loadIFCanon(): string {
  try {
    if (existsSync(CANON_PATH)) {
      const content = readFileSync(CANON_PATH, "utf-8");
      // If file is populated (not just the stub), use it; otherwise fall back
      if (content && content.replace(/\s+/g, " ").trim().length > 500) {
        return content;
      }
    }
  } catch {}
  // Fallback to legacy prompt if canon file not present
  return loadPrompt("adventure");
}

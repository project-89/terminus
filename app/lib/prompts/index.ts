import { readFileSync } from "fs";
import { join } from "path";

export function loadPrompt(name: string): string {
  const promptPath = join(process.cwd(), "app/lib/prompts", `${name}.txt`);
  return readFileSync(promptPath, "utf-8");
}

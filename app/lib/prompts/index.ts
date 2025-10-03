import { readFileSync } from "fs";
import { join } from "path";

const promptCache = new Map<string, string>();

export function loadPrompt(name: string): string {
  if (promptCache.has(name)) {
    return promptCache.get(name)!;
  }

  const promptPath = join(process.cwd(), "app/lib/prompts", `${name}.txt`);
  const contents = readFileSync(promptPath, "utf-8");
  promptCache.set(name, contents);
  return contents;
}

export function clearPromptCache() {
  promptCache.clear();
}

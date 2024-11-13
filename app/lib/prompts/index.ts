import fs from "fs";
import path from "path";

export function loadPrompt(name: string): string {
  const promptPath = path.join(
    process.cwd(),
    "app",
    "lib",
    "prompts",
    `${name}.txt`
  );
  return fs.readFileSync(promptPath, "utf-8");
}

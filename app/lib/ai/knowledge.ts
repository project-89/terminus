import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

export type KnowledgeDoc = {
  name: string;
  content: string;
  kind: "md" | "json" | "txt";
};

let cache: KnowledgeDoc[] | null = null;

export function loadKnowledge(dir = join(process.cwd(), "app/knowledge")): KnowledgeDoc[] {
  if (cache) return cache;
  try {
    const entries = readdirSync(dir);
    const docs: KnowledgeDoc[] = [];
    for (const entry of entries) {
      const full = join(dir, entry);
      try {
        const st = statSync(full);
        if (!st.isFile()) continue;
        const ext = extname(entry).toLowerCase();
        const base = entry.replace(ext, "");
        let kind: KnowledgeDoc["kind"] = "txt";
        if (ext === ".md") kind = "md";
        else if (ext === ".json") kind = "json";
        else if (ext === ".txt") kind = "txt";
        else continue;
        const raw = readFileSync(full, "utf-8");
        const content = kind === "json" ? safeJsonToBullets(raw) : raw;
        docs.push({ name: base, content, kind });
      } catch {}
    }
    cache = docs;
    return docs;
  } catch {
    cache = [];
    return [];
  }
}

function safeJsonToBullets(raw: string): string {
  try {
    const obj = JSON.parse(raw);
    return toBullets(obj);
  } catch {
    return raw;
  }
}

function toBullets(obj: any, prefix = "- ", depth = 0): string {
  if (obj == null) return "";
  if (typeof obj !== "object") return String(obj);
  const lines: string[] = [];
  const pad = "".padStart(depth * 2, " ");
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object") {
      lines.push(`${pad}${prefix}${k}:`);
      lines.push(toBullets(v, prefix, depth + 1));
    } else {
      lines.push(`${pad}${prefix}${k}: ${v}`);
    }
  }
  return lines.join("\n");
}


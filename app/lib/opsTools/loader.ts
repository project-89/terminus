import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

export type OpsTool = {
  name: string; // filename without ext
  title: string;
  description?: string;
  tags?: string[];
  model?: string; // optional model override
  temperature?: number;
  content: string; // the prompt body (after front matter)
};

function parseFrontMatter(raw: string): { meta: any; body: string } {
  const fmStart = raw.indexOf("---\n");
  if (fmStart !== 0) return { meta: {}, body: raw };
  const fmEnd = raw.indexOf("\n---", 4);
  if (fmEnd === -1) return { meta: {}, body: raw };
  const fm = raw.slice(4, fmEnd).trim();
  const body = raw.slice(fmEnd + 4).replace(/^\s*\n/, "");
  const meta: any = {};
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      const valRaw = m[2].trim();
      try {
        if (valRaw.startsWith("[") || valRaw.startsWith("{")) {
          meta[key] = JSON.parse(valRaw);
        } else {
          meta[key] = valRaw;
        }
      } catch {
        meta[key] = valRaw;
      }
    }
  }
  return { meta, body };
}

let cache: Map<string, OpsTool> | null = null;

export function loadOpsTools(dir = join(process.cwd(), "app/ops-tools")): Map<string, OpsTool> {
  if (cache) return cache;
  const map = new Map<string, OpsTool>();
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (!entry.endsWith(".md") && !entry.endsWith(".txt")) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (!st.isFile()) continue;
      const raw = readFileSync(full, "utf-8");
      const { meta, body } = parseFrontMatter(raw);
      const name = entry.replace(/\.(md|txt)$/i, "");
      const tool: OpsTool = {
        name,
        title: meta.title || name,
        description: meta.description || undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : undefined,
        model: meta.model || undefined,
        temperature: typeof meta.temperature === "number" ? meta.temperature : undefined,
        content: body.trim(),
      };
      map.set(name, tool);
    }
  } catch {
    // ignore
  }
  cache = map;
  return map;
}

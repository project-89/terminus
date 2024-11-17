import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";
import { readdir, mkdir, writeFile, readFile } from "fs/promises";
import { join } from "path";

// Add metadata schema
const ArchiveMetadataSchema = z.object({
  description: z.string(),
  themes: z.array(z.string()),
  securityLevel: z.string().optional(),
  containmentProcedures: z.array(z.string()).optional(),
  relatedFiles: z.array(z.string()).optional(),
  researchContext: z.string().optional(),
  anomalies: z.array(z.string()).optional(),
  timestamp: z.string().optional(),
});

const DirectoryItemSchema = z.object({
  name: z.string(),
  isDirectory: z.boolean(),
  size: z.string().optional(),
  pages: z.number().optional(),
  metadata: ArchiveMetadataSchema.optional(),
});

const DirectoryListingSchema = z.object({
  items: z.array(DirectoryItemSchema),
});

// Content generation schemas
const OutlineSchema = z.object({
  title: z.string(),
  description: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      estimatedLength: z.number(),
      key_points: z.array(z.string()),
    })
  ),
});

const ContentSectionSchema = z.object({
  section: z.string(),
  content: z.string(),
});

type Outline = z.infer<typeof OutlineSchema>;
type ContentSection = z.infer<typeof ContentSectionSchema>;

// Update the metadata type definitions
type ArchiveMetadata = z.infer<typeof ArchiveMetadataSchema>;

interface ParentMetadata {
  themes?: string[];
  relatedFiles?: string[];
  [key: string]: any;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "";
  const view = url.searchParams.get("view") === "1";

  const basePath = join(process.cwd(), "public", "archive");
  const fullPath = join(basePath, path);
  const metadataPath = fullPath + ".meta.json";

  try {
    if (view) {
      // Reading a file
      const content = await readFile(fullPath, "utf-8");
      return new Response(content, {
        headers: { "Content-Type": "text/markdown" },
      });
    } else {
      // Listing directory contents
      let realItems: any[] = [];
      let metadata = {};

      // Try to read metadata for this directory
      try {
        const metadataContent = await readFile(metadataPath, "utf-8");
        metadata = JSON.parse(metadataContent);
      } catch (e) {
        // No metadata file, that's ok
      }

      try {
        const items = await readdir(fullPath, { withFileTypes: true });
        realItems = items
          .filter((item) => !item.name.endsWith(".meta.json"))
          .map((item) => ({
            name: item.name,
            isDirectory: item.isDirectory(),
            size: item.isDirectory() ? undefined : "1.2KB",
          }));
      } catch (e) {
        // Directory doesn't exist yet, that's ok for vault paths
        if (!path.includes("vault")) {
          throw e; // Re-throw if not in vault
        }
      }

      // Then generates AI items if in vault
      if (path.includes("vault")) {
        const aiItems = await generateAIItems(path, metadata);
        realItems = [...realItems, ...aiItems];
      }

      // Add vault to root if needed
      if (
        path === "archive" &&
        !realItems.some((item) => item.name === "vault")
      ) {
        const vaultMetadata = {
          description: "Quantum-secured storage for reality-bending data",
          themes: [
            "quantum mechanics",
            "reality manipulation",
            "consciousness",
          ],
          securityLevel: "MAXIMUM",
          containmentProcedures: [
            "Neural interface required",
            "Reality anchors active",
            "Quantum encryption enabled",
          ],
        };

        realItems.push({
          name: "vault",
          isDirectory: true,
          metadata: vaultMetadata,
        });

        // Create vault directory and metadata if it doesn't exist
        await createDirectory("archive/vault", vaultMetadata);
      }

      return new Response(JSON.stringify(realItems), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Archive API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to access archive" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  const { path, action } = await req.json();

  if (action === "generate_file") {
    return await generateFile(path);
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

async function generateAIItems(path: string, metadata: any) {
  // First try to read parent metadata for context
  let parentMetadata = {};
  try {
    const parentMetaPath = join(process.cwd(), "public", path, ".meta.json");
    parentMetadata = JSON.parse(await readFile(parentMetaPath, "utf-8"));
  } catch (e) {
    // No parent metadata yet, that's ok
  }

  const { toolCalls } = await generateText({
    model: google("gemini-1.5-flash-latest", { structuredOutputs: true }),
    tools: {
      answer: tool({
        description: "Generate archive items with metadata",
        parameters: DirectoryListingSchema,
      }),
    },
    toolChoice: "required",
    maxSteps: 1,
    system: `You are Project 89's quantum-powered archive system.
Generate mysterious and intriguing items with detailed metadata.

CURRENT CONTEXT:
${JSON.stringify(parentMetadata, null, 2)}

GUIDELINES:
- Create 3-5 folders with cryptic names
- Each folder should have rich, detailed metadata about:
  * What kind of research/experiments happened here
  * Key findings or incidents
  * Security protocols and containment procedures
  * Connected research threads
  * Anomalous phenomena
- Include 2-4 files per folder (.md and .txt only)
- Names should hint at contents but remain mysterious
- Build upon existing themes and research threads
- Add new but connected areas of investigation
- Include security classifications and warnings`,
    prompt: "Generate appropriate vault items with metadata.",
  });

  const items = toolCalls[0].args.items;
  return items;
}

async function generateFile(path: string) {
  // // 1. Generate an outline
  // const outline = await generateOutline();
  // // 2. Generate content for each section
  // const contentResults = await Promise.all(
  //   outline.sections.map(async (section) => {
  //     // Generate section content using AI
  //   })
  // );
  // // 3. Save the generated file
  // const finalContent = [
  //   `# ${outline.title}`,
  //   "",
  //   outline.description,
  //   "",
  //   ...contentResults,
  // ].join("\n\n");
}

async function createDirectory(path: string, metadata: any) {
  const dirPath = join(process.cwd(), "public", path);
  const metaPath = dirPath + ".meta.json";

  // Enhance metadata with additional context
  const enhancedMetadata = await generateMetadataContext(path, metadata);

  await mkdir(dirPath, { recursive: true });
  await writeFile(metaPath, JSON.stringify(enhancedMetadata, null, 2), "utf-8");

  // Update parent metadata
  await updateParentMetadata(path, enhancedMetadata);
}

// Update the updateParentMetadata function
async function updateParentMetadata(
  path: string,
  childMetadata: ArchiveMetadata
) {
  const parentPath = path.split("/").slice(0, -1).join("/");
  const parentMetaPath = join(
    process.cwd(),
    "public",
    parentPath,
    ".meta.json"
  );

  try {
    let parentMeta: ParentMetadata = {};
    try {
      parentMeta = JSON.parse(await readFile(parentMetaPath, "utf-8"));
    } catch (e) {
      // Parent metadata doesn't exist yet, initialize with empty arrays
      parentMeta = { themes: [], relatedFiles: [] };
    }

    // Update parent metadata with child's themes and related files
    parentMeta.themes = Array.from(
      new Set([...(parentMeta.themes || []), ...(childMetadata.themes || [])])
    );

    parentMeta.relatedFiles = Array.from(
      new Set([...(parentMeta.relatedFiles || []), path])
    );

    await writeFile(
      parentMetaPath,
      JSON.stringify(parentMeta, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.error("Error updating parent metadata:", e);
  }
}

async function generateMetadataContext(path: string, baseMetadata: any) {
  const { toolCalls } = await generateText({
    model: google("gemini-1.5-pro-latest", { structuredOutputs: true }),
    tools: {
      answer: tool({
        description: "Enhance metadata with detailed context",
        parameters: ArchiveMetadataSchema,
      }),
    },
    toolChoice: "required",
    maxSteps: 1,
    system: `Enhance this folder's metadata with rich context and connections.
Base metadata: ${JSON.stringify(baseMetadata, null, 2)}

Add:
- Detailed research context
- Connected experiments and findings
- Security implications
- Anomalous phenomena
- Historical incidents
- Key personnel (redacted)
- Reality stability metrics
- Cross-references to other research`,
    prompt: "Generate enhanced metadata context.",
  });

  return toolCalls[0].args;
}

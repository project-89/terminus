import { generateText, tool } from "ai";
import { z } from "zod";
import { readdir } from "fs/promises";
import { join } from "path";
import { getModel } from "@/app/lib/ai/models";

// Schema for directory items
const DirectoryItemSchema = z.object({
  name: z.string(),
  isDirectory: z.boolean(),
  size: z.string().optional(),
  pages: z.number().optional(),
  description: z.string().optional(),
});

const DirectoryListingSchema = z.object({
  items: z.array(DirectoryItemSchema),
});

export async function POST(req: Request) {
  const { path, context, parentContext } = await req.json();
  const contentModel = getModel("content");

  try {
    // First check if this is a real path in public
    const publicPath = join(process.cwd(), "public", path);
    let existingItems: any[] = [];

    try {
      const items = await readdir(publicPath, { withFileTypes: true });
      existingItems = items.map((item) => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        size: item.isDirectory() ? undefined : "1.2KB", // You might want to get actual file size
      }));
    } catch (e) {
      // Path doesn't exist in public, that's fine
      console.log("No existing path found, generating new items");
    }

    const { toolCalls } = await generateText({
      model: contentModel,
      tools: {
        answer: tool({
          description: "Generate a directory listing of files and folders",
          parameters: DirectoryListingSchema,
        }),
      },
      toolChoice: "required",
      maxSteps: 1,
      system: `You are the Project 89 Archive System's quantum-powered file generation subsystem.
Your task is to generate mysterious and intriguing directory listings that fit within the Project 89 universe.

Context for this directory: ${context}
Parent context: ${parentContext || "root"}

IMPORTANT GUIDELINES:
- Generate a mix of folders and files (markdown and txt)
- Use cryptic but meaningful names that hint at contents
- Include size estimates and page counts for files
- Maintain consistency with Project 89's themes:
  * Reality manipulation
  * Consciousness exploration
  * Quantum mechanics
  * Hidden truths
  * Technological mysticism
  
${
  existingItems.length > 0
    ? "EXISTING ITEMS TO INCLUDE:\n" + JSON.stringify(existingItems, null, 2)
    : ""
}`,
      prompt: "Generate an appropriate directory listing for this context.",
    });

    // Get the generated items
    const generatedItems = toolCalls[0].args.items;

    // Merge with existing items if any
    const finalItems = [...existingItems, ...generatedItems];

    return new Response(JSON.stringify(finalItems), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating items:", error);
    return new Response(JSON.stringify({ error: "Failed to generate items" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

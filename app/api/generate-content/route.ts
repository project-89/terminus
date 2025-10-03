import { generateText, tool } from "ai";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getModel } from "@/app/lib/ai/models";

// Schemas for content generation
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

// Define types based on the schemas
type Outline = z.infer<typeof OutlineSchema>;
type ContentSection = z.infer<typeof ContentSectionSchema>;

export async function POST(req: Request) {
  const { path, fileName, context, loreContext } = await req.json();
  const contentModel = getModel("content");

  try {
    // Step 1: Generate outline using structured output
    const { toolCalls: outlineCalls } = await generateText({
      model: contentModel,
      tools: {
        answer: tool({
          description: "Create a detailed outline for the document",
          parameters: OutlineSchema,
        }),
      },
      toolChoice: "required",
      maxSteps: 1,
      system: `You are the Project 89 Archive System's content generation AI.
Your task is to create a detailed outline for the document.

FILE CONTEXT:
Name: ${fileName}
Directory Context: ${context}
Lore Context: ${loreContext}

The outline should:
- Fit Project 89's mysterious and technological themes
- Include specific section lengths
- Plan key points that will be expanded
- Maintain internal consistency
- Include subtle references to reality manipulation`,
      prompt: "Generate an outline for this document.",
    });

    const outline = outlineCalls[0].args as Outline;

    // Step 2: Generate content for each section
    const contentResults: string[] = await Promise.all(
      outline.sections.map(async (section) => {
        const { toolCalls } = await generateText({
          model: contentModel,
          tools: {
            answer: tool({
              description: "Write content for a document section",
              parameters: ContentSectionSchema,
            }),
          },
          toolChoice: "required",
          maxSteps: 1,
          system: `You are now generating content for section "${
            section.title
          }" based on these key points:
${section.key_points.join("\n")}

GUIDELINES:
- Write in a technical yet mysterious style
- Include subtle reality-bending elements
- Reference Project 89's themes and concepts
- Maintain consistent tone and narrative
- Use markdown formatting for structure`,
          prompt: `Generate content for the section "${section.title}"`,
        });

        const sectionContent = toolCalls[0].args as ContentSection;
        return sectionContent.content;
      })
    );

    // Combine all sections into final content
    const finalContent = [
      `# ${outline.title}`,
      "",
      outline.description,
      "",
      ...contentResults,
    ].join("\n\n");

    // Save to public directory if needed
    const publicPath = join(process.cwd(), "public", path);
    await writeFile(publicPath, finalContent, "utf-8");

    return new Response(finalContent, {
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { ToolExecution, processToolCall } from "../tools/registry";

// Store chat history
let chatHistory: { role: string; content: string }[] = [];

export const adventureMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (!ctx.hasFullAccess && ctx.command !== "clear") {
    try {
      // Filter out empty messages before adding new one
      chatHistory = chatHistory.filter((msg) => msg.content.trim() !== "");

      // Add user message to history
      chatHistory.push({
        role: "user",
        content: ctx.command,
      });

      const stream = await getAdventureResponse(chatHistory);
      if (!stream) {
        throw new Error("Failed to get adventure response");
      }

      let responseText = "";
      let currentLine = "";

      const decoder = new TextDecoder();
      const reader = stream.getReader();

      // Print a blank line before response
      await ctx.terminal.print("", { speed: "instant" });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          responseText += text;
          currentLine += text;

          // Check for complete lines
          if (text.includes("\n")) {
            const lines = currentLine.split("\n");

            // Process all complete lines except the last one
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i];

              // Check if this is a tool command
              if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
                try {
                  const toolData = JSON.parse(line.trim());
                  if (toolData.tool) {
                    // Execute tool without printing anything
                    await processToolCall(toolData);
                  }
                } catch (e) {
                  // Not a valid tool call, print as normal text
                  await ctx.terminal.print(line, {
                    color: TERMINAL_COLORS.primary,
                    speed: "instant",
                  });
                }
              } else {
                // Print non-tool lines
                await ctx.terminal.print(line, {
                  color: TERMINAL_COLORS.primary,
                  speed: "instant",
                });
              }
            }

            // Keep the last incomplete line
            currentLine = lines[lines.length - 1];
          }
        }

        // Handle any remaining text
        if (currentLine) {
          const line = currentLine;
          if (!(line.trim().startsWith("{") && line.trim().endsWith("}"))) {
            await ctx.terminal.print(line, {
              color: TERMINAL_COLORS.primary,
              speed: "instant",
            });
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Only add non-empty responses to history
      if (responseText.trim() !== "") {
        chatHistory.push({
          role: "assistant",
          content: responseText,
        });
      }

      ctx.handled = true;
      return;
    } catch (error) {
      console.error("Adventure middleware error:", error);
      throw error;
    }
  }

  await next();
};

import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { ToolExecution, processToolCall } from "../tools/registry";

// Store chat history
let chatHistory: { role: string; content: string }[] = [];

export const adventureMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (!ctx.hasFullAccess && ctx.command !== "clear") {
    try {
      ctx.handled = true;

      chatHistory.push({
        role: "user",
        content: ctx.command,
      });

      const stream = await getAdventureResponse(chatHistory);
      if (!stream) throw new Error("No response stream received");

      let responseText = "";
      let currentLine = "";
      let lastLineWasEmpty = false;

      const decoder = new TextDecoder();
      const reader = stream.getReader();

      // Print a blank line before response
      await ctx.terminal.print("", { speed: "instant" });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          console.log("Received chunk:", text);
          responseText += text;
          currentLine += text;

          // Check for complete lines
          if (text.includes("\n")) {
            const lines = currentLine.split("\n");

            // Process all complete lines except the last one
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();

              // Handle tool calls
              if (line.startsWith("{") && line.endsWith("}")) {
                try {
                  const toolData = JSON.parse(line);
                  if (toolData.tool) {
                    console.log("Processing tool:", toolData);
                    await processToolCall(toolData);
                  }
                } catch (e) {
                  // Not a valid tool call, print as normal text
                  if (line) {
                    await ctx.terminal.print(line, {
                      color: TERMINAL_COLORS.primary,
                      speed: "instant",
                    });
                  }
                }
              } else {
                // Regular text line
                if (line || !lastLineWasEmpty) {
                  await ctx.terminal.print(line, {
                    color: TERMINAL_COLORS.primary,
                    speed: "instant",
                  });
                  lastLineWasEmpty = !line;
                }
              }
            }
            // Keep the last incomplete line
            currentLine = lines[lines.length - 1];
          }
        }

        // Handle any remaining text
        if (currentLine.trim()) {
          await ctx.terminal.print(currentLine.trim(), {
            color: TERMINAL_COLORS.primary,
            speed: "instant",
          });
        }

        // Add a blank line after response
        await ctx.terminal.print("", { speed: "instant" });
      } finally {
        reader.releaseLock();
      }

      chatHistory.push({
        role: "assistant",
        content: responseText,
      });

      await ctx.terminal.print("", { speed: "instant" });
      return;
    } catch (error) {
      console.error("Adventure middleware error:", error);
      throw error;
    }
  }
  await next();
};

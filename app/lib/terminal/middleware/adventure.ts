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

      const decoder = new TextDecoder();
      const reader = stream.getReader();

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
              if (line) {
                // Check if line is a tool call
                if (line.startsWith("{") && line.endsWith("}")) {
                  try {
                    const toolData = JSON.parse(line);
                    if (toolData.tool) {
                      console.log("Processing tool:", toolData);
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
                  // Regular text line
                  await ctx.terminal.print(line, {
                    color: TERMINAL_COLORS.primary,
                    speed: "instant",
                  });
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

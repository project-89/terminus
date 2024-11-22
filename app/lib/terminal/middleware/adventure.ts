import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { ToolExecution, processToolCall } from "../tools/registry";
import { AdventureScreen } from "../screens/AdventureScreen";
import { TerminalContext } from "../TerminalContext";
import { analytics } from "@/app/lib/analytics";

export const adventureMiddleware: TerminalMiddleware = async (ctx, next) => {
  // Check if we're on the adventure screen
  const screen = ctx.terminal.screenManager.getCurrentScreen();
  if (!(screen instanceof AdventureScreen)) {
    await next();
    return;
  }

  try {
    // Track command usage
    analytics.trackGameAction("command_entered", {
      command: ctx.command,
    });

    // Check for special commands first
    if (ctx.command.startsWith("!")) {
      await screen.processCommand(ctx.command);
      ctx.handled = true;
      return;
    }

    // Get existing messages from context
    const context = TerminalContext.getInstance();
    let chatHistory = context.getGameMessages();

    // Add user message
    const userMessage = {
      role: "user",
      content: ctx.command,
    };
    chatHistory.push(userMessage);
    context.setGameMessages(chatHistory);

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

        // Split by newlines to handle line-by-line printing
        const lines = text.split("\n");

        // Process all lines except the last one
        for (let i = 0; i < lines.length - 1; i++) {
          const line = currentLine + lines[i];
          if (!(line.trim().startsWith("{") && line.trim().endsWith("}"))) {
            await ctx.terminal.print(line, {
              color: TERMINAL_COLORS.primary,
              speed: "instant",
            });
          }
          currentLine = "";
        }

        // Add the last line to currentLine
        if (lines.length > 0) {
          currentLine += lines[lines.length - 1];
        }
      }

      // Handle any remaining text
      if (currentLine) {
        if (
          !(
            currentLine.trim().startsWith("{") &&
            currentLine.trim().endsWith("}")
          )
        ) {
          await ctx.terminal.print(currentLine, {
            color: TERMINAL_COLORS.primary,
            speed: "instant",
          });
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Add AI response to context
    if (responseText.trim() !== "") {
      const aiMessage = {
        role: "assistant",
        content: responseText,
      };
      context.addGameMessage(aiMessage);
    }

    ctx.handled = true;
  } catch (error: unknown) {
    const err = error as Error;
    analytics.trackGameAction("error", {
      error_type: err.name,
      error_message: err.message,
      location: "adventure_middleware",
    });
    console.error("Adventure middleware error:", err);
    throw error;
  }
};

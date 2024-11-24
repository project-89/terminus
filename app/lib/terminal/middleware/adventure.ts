import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { ToolExecution, processToolCall } from "../tools/registry";
import { AdventureScreen } from "../screens/AdventureScreen";
import { TerminalContext } from "../TerminalContext";
import { analytics } from "@/app/lib/analytics";

export const adventureMiddleware: TerminalMiddleware = async (ctx, next) => {
  // Only process commands if we're in the adventure screen
  const currentScreen = ctx.terminal.context.router?.currentScreen;
  if (!(currentScreen instanceof AdventureScreen)) {
    return next();
  }

  // If the command has already been handled by another middleware (like adventure-commands),
  // don't process it further
  if (ctx.handled) {
    return next();
  }

  try {
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

    // Process the AI response stream
    await ctx.terminal.processAIStream(stream, {
      color: TERMINAL_COLORS.primary,
      addSpacing: true,
    });

    // Mark as handled after successful processing
    ctx.handled = true;
  } catch (error) {
    console.error("Adventure middleware error:", error);
    await ctx.terminal.print("Error processing command", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
    ctx.handled = true;
  }
};

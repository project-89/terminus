import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { ToolExecution, processToolCall } from "../tools/registry";
import { AdventureScreen } from "../screens/AdventureScreen";
import { TerminalContext } from "../TerminalContext";
import { analytics } from "@/app/lib/analytics";

export const adventureMiddleware: TerminalMiddleware = async (ctx, next) => {
  // Only process commands if we're in the adventure screen
  const currentScreen = ctx.terminal.context?.currentScreen;
  if (!(currentScreen instanceof AdventureScreen)) {
    return next();
  }

  // Skip if command was already handled (like by override middleware)
  if (ctx.handled || ctx.command.startsWith("!")) {
    return next();
  }

  // Track that we're handling this command
  ctx.handled = true;

  try {
    const context = TerminalContext.getInstance();
    let chatHistory = context.getGameMessages();

    // Add user message
    const userMessage = {
      role: "user",
      content: ctx.command,
    };
    chatHistory.push(userMessage);

    // Get AI response
    const stream = await getAdventureResponse(chatHistory);
    if (!stream) {
      throw new Error("Failed to get adventure response");
    }

    // Process and store the AI response
    const aiResponse = (await ctx.terminal.processAIStream(stream, {
      color: TERMINAL_COLORS.primary,
      addSpacing: true,
      returnContent: true,
    })) as string;

    // Add AI response to chat history
    chatHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    // Update chat history with both messages
    context.setGameMessages(chatHistory);
  } catch (error) {
    console.error("Adventure middleware error:", error);
    await ctx.terminal.print("Error processing command", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
  }
};

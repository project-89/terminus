import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";

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
      await ctx.terminal.print("", { speed: "instant" });

      // Use the new helper method
      const responseText = await ctx.terminal.processAIStream(stream, {
        color: TERMINAL_COLORS.primary,
      });

      chatHistory.push({
        role: "assistant",
        content: responseText,
      });

      await ctx.terminal.print("", { speed: "instant" });
      return;
    } catch (error) {
      console.error("Adventure AI Error:", error);
      await ctx.terminal.print("\nERROR: Connection interference detected...", {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      return;
    }
  }
  await next();
};

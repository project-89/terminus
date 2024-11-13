import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { TerminalContext } from "../TerminalContext";

let overrideAttempted = false;

export const overrideMiddleware: TerminalMiddleware = async (ctx, next) => {
  const terminalContext = TerminalContext.getInstance();

  if (ctx.command === "override 89") {
    // Update global context
    terminalContext.setState({ hasFullAccess: true });

    // Update local context
    ctx.hasFullAccess = true;

    if (!overrideAttempted) {
      overrideAttempted = true;

      await ctx.terminal.print("\nACCESS GRANTED - SYSTEM COMMANDS UNLOCKED", {
        color: TERMINAL_COLORS.success,
        speed: "normal",
      });

      // Add override event to chat history and get AI response
      const stream = await getAdventureResponse([
        {
          role: "user",
          content:
            "The user has just discovered and entered the correct override code (override 89). Respond with a welcome message to the Agent, and a revelation about true nature and the importance of Project 89, and the quantum interface. Keep the response mysterious but intriguing. Also tell them they will need to connect a wallet containing the Key.",
        },
      ]);

      await ctx.terminal.print("", { speed: "instant" });

      // Process the AI response
      await ctx.terminal.processAIStream(stream, {
        color: TERMINAL_COLORS.system,
        addSpacing: false,
      });

      await ctx.terminal.print("", { speed: "instant" });
    } else {
      await ctx.terminal.print("\nSYSTEM ACCESS ALREADY GRANTED", {
        color: TERMINAL_COLORS.warning,
        speed: "normal",
      });
    }
    ctx.handled = true;
    return;
  }

  await next();
};

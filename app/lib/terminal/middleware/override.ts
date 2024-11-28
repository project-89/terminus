import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { TerminalContext } from "../TerminalContext";

let overrideAttempted = false;

export const overrideMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command.toLowerCase().startsWith("override ")) {
    const code = ctx.command.split(" ")[1];

    try {
      const response = await fetch("/api/override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const { valid } = await response.json();

      if (valid) {
        // Update global context
        const terminalContext = TerminalContext.getInstance();
        terminalContext.setState({ hasFullAccess: true });

        // Update local context
        ctx.hasFullAccess = true;

        if (!overrideAttempted) {
          overrideAttempted = true;

          await ctx.terminal.print(
            "\nACCESS GRANTED - SYSTEM COMMANDS UNLOCKED",
            {
              color: TERMINAL_COLORS.success,
              speed: "normal",
            }
          );

          await ctx.terminal.print("", { speed: "instant" });

          ctx.terminal.startGeneration();

          const stream = await getAdventureResponse([
            {
              role: "user",
              content:
                "The user has just discovered and entered the correct access code to unlock the secret back end of the terminal. The user now has full access to all system commands.  Print a brief message to the user welcoming them to the system and explaining that they can now use all system commands.",
            },
          ]);

          if (stream) {
            await ctx.terminal.processAIStream(stream, {
              color: TERMINAL_COLORS.system,
              addSpacing: false,
            });
          }

          ctx.terminal.endGeneration();
        } else {
          await ctx.terminal.print("\nSYSTEM ACCESS ALREADY GRANTED", {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          });
        }
      } else {
        await ctx.terminal.print("\nINVALID OVERRIDE CODE", {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
      }

      ctx.handled = true;
      return;
    } catch (error) {
      console.error("Override validation error:", error);
      await ctx.terminal.print("\nERROR VALIDATING OVERRIDE CODE", {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      ctx.handled = true;
      return;
    }
  }

  await next();
};

import { TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { TerminalContext } from "../TerminalContext";
import { TerminalMiddleware } from "../types";

let overrideAttempted = false;

export const overrideMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command.toLowerCase().startsWith("dashboard")) {
    // If user has access, navigate to main dashboard
    const terminalContext = TerminalContext.getInstance();
    const state = terminalContext.getState();
    if (state.hasFullAccess) {
      await ctx.terminal.emit("screen:transition", { to: "dashboard" });
      ctx.handled = true;
      return;
    }
    await ctx.terminal.print("ACCESS DENIED - OVERRIDE REQUIRED", {
      color: TERMINAL_COLORS.error,
      speed: "normal",
    });
    ctx.handled = true;
    return;
  }

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
        terminalContext.setState({ hasFullAccess: true, accessTier: 1 });

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
          await ctx.terminal.print(
            "Hint: type 'dashboard' to access control surface.",
            {
              color: TERMINAL_COLORS.secondary,
              speed: "instant",
            }
          );

          ctx.terminal.startGeneration();

          const handle = terminalContext.ensureHandle("agent");
          const sessionId = await terminalContext.ensureSession({ handle });
          const stream = await getAdventureResponse(
            [
              {
                role: "user",
                content:
                  "The user has just discovered and entered the correct access code to unlock the secret back end of the terminal. The user now has full access to all system commands. Print a brief message to the user welcoming them to the system, and hint that typing 'dashboard' opens a classified control surface.",
              },
            ],
            {
              sessionId,
              handle,
            }
          );

          if (stream) {
            await ctx.terminal.processAIStream(stream);
          }

          ctx.terminal.endGeneration();
        } else {
          await ctx.terminal.print("\nSYSTEM ACCESS ALREADY GRANTED", {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          });
          await ctx.terminal.print(
            "Hint: type 'dashboard' to access control surface.",
            {
              color: TERMINAL_COLORS.secondary,
              speed: "instant",
            }
          );
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

  // Elevated tier code: "elevate <code>"
  if (ctx.command.toLowerCase().startsWith("elevate ")) {
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
        const terminalContext = TerminalContext.getInstance();
        terminalContext.setState({ hasFullAccess: true, accessTier: 2 });
        await ctx.terminal.print("\nELEVATED ACCESS GRANTED - TIER II", {
          color: TERMINAL_COLORS.success,
          speed: "normal",
        });
        await ctx.terminal.print(
          "Additional controls unlocked in 'dashboard'.",
          {
            color: TERMINAL_COLORS.secondary,
            speed: "instant",
          }
        );
      } else {
        await ctx.terminal.print("\nINVALID ELEVATION CODE", {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
      }
      ctx.handled = true;
      return;
    } catch (e) {
      await ctx.terminal.print("\nERROR VALIDATING ELEVATION CODE", {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      ctx.handled = true;
      return;
    }
  }

  await next();
};

import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";

// Track terminal access state
let hasFullAccess = false;

export const helpMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command.toLowerCase() === "override 89") {
    hasFullAccess = true;
    await ctx.terminal.print("\nACCESS GRANTED - HELP SYSTEM UNLOCKED", {
      color: TERMINAL_COLORS.success,
      speed: "normal",
    });
    ctx.handled = true;
    return;
  }

  if (ctx.command === "help") {
    if (!hasFullAccess) {
      await ctx.terminal.print("\nERROR: HELP SYSTEM LOCKED", {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      await ctx.terminal.print("OVERRIDE CODE REQUIRED", {
        color: TERMINAL_COLORS.warning,
        speed: "normal",
      });
    } else {
      // Show full help menu
      await ctx.terminal.print("\nAvailable Commands:", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  connect  - Connect Phantom wallet", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  verify   - Verify P89 token balance", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  clear    - Clear terminal display", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
    }
    ctx.handled = true;
    return;
  }

  // If no full access and not an override command, pass to adventure system
  if (!hasFullAccess && ctx.command !== "clear") {
    // Here we'll add the adventure system handler later
    await ctx.terminal.print("\n> " + ctx.command, {
      color: TERMINAL_COLORS.secondary,
      speed: "normal",
    });
    await ctx.terminal.print("You try that, but nothing seems to happen...", {
      color: TERMINAL_COLORS.primary,
      speed: "normal",
    });
    ctx.handled = true;
    return;
  }

  await next();
};

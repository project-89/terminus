import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";

export const commandsMiddleware: TerminalMiddleware = async (ctx, next) => {
  // Only handle commands that start with !
  if (!ctx.command.startsWith("!")) {
    return next();
  }

  const command = ctx.command.slice(1); // Remove !

  switch (command) {
    case "help":
      await ctx.terminal.print("\nTerminal Commands:", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !help     - Show terminal commands", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !clear    - Clear the terminal", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !copy     - Copy all terminal content", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !copylast - Copy last message only", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      ctx.handled = true;
      break;

    case "clear":
      ctx.terminal.clear();
      ctx.handled = true;
      break;

    case "copy":
      await ctx.terminal.copyToClipboard(ctx.terminal.getBufferText());
      ctx.handled = true;
      break;

    case "copylast":
      await ctx.terminal.copyToClipboard(ctx.terminal.getLastMessage());
      ctx.handled = true;
      break;

    default:
      await ctx.terminal.print(`Unknown command: ${command}`, {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      ctx.handled = true;
  }
};

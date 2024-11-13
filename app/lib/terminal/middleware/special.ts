import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";

export const specialCommandsMiddleware: TerminalMiddleware = async (
  ctx,
  next
) => {
  // Handle special ! commands
  if (ctx.command.startsWith("!")) {
    const command = ctx.command.slice(1); // Remove !

    switch (command) {
      case "copy":
        await ctx.terminal.copyToClipboard(ctx.terminal.getBufferText());
        ctx.handled = true;
        break;

      case "copylast":
        await ctx.terminal.copyToClipboard(ctx.terminal.getLastMessage());
        ctx.handled = true;
        break;

      case "help":
        await ctx.terminal.print("\nSpecial Commands:", {
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
        await ctx.terminal.print("  !help     - Show special commands", {
          color: TERMINAL_COLORS.primary,
          speed: "fast",
        });
        ctx.handled = true;
        break;

      default:
        await ctx.terminal.print(`Unknown special command: ${command}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
        ctx.handled = true;
    }

    return;
  }

  await next();
};

import { TerminalMiddleware } from "../types";

export const navigationMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command === "main") {
    // Mark as handled before navigation
    ctx.handled = true;

    // Clear any ongoing transitions
    ctx.terminal.clear();

    // Access router from context
    const router = ctx.router;
    if (!router) {
      console.error("Router not found in context");
      return;
    }

    try {
      // Clear history and force cleanup current screen
      await router.navigate("home");
    } catch (error) {
      console.error("Navigation error:", error);
      await ctx.terminal.print("Error navigating to main screen", {
        color: "#ff0000",
      });
    }
    return;
  }

  if (ctx.command === "archive") {
    ctx.handled = true;
    const router = ctx.router;
    if (!router) return;
    try {
      await router.navigate("archives");
    } catch (error) {
      console.error("Navigation error:", error);
      await ctx.terminal.print("Error navigating to archives dashboard", {
        color: "#ff0000",
      });
    }
    return;
  }
  await next();
};

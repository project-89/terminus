import { TerminalMiddleware } from "../Terminal";

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
      router.clearHistory();
      router.forceCleanup();

      // Navigate to main
      await router.navigate("main", { type: "instant" });
    } catch (error) {
      console.error("Navigation error:", error);
      await ctx.terminal.print("Error navigating to main screen", {
        color: "#ff0000",
      });
    }
    return;
  }
  await next();
};

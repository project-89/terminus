import { TerminalMiddleware } from "../Terminal";

export const navigationMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command === "main") {
    // Clear any ongoing transitions
    ctx.terminal.clear();

    // Access router from context
    const router = ctx.router;
    if (!router) {
      console.error("Router not found in context");
      return next();
    }

    // Clear history and navigate
    router.clearHistory();
    await ctx.terminal.emit("screen:transition", {
      to: "main",
      options: { type: "instant" },
    });

    ctx.handled = true;
    return;
  }
  await next();
};

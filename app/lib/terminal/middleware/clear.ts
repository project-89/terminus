import { TerminalMiddleware } from "../Terminal";

export const clearMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command === "clear") {
    // Add clear functionality to context for terminal to handle
    ctx.clear = true;
    ctx.handled = true;
    return;
  }
  await next();
};

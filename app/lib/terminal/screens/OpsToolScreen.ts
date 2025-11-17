import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";

export class OpsToolScreen extends BaseScreen {
  private toolName: string;
  private title: string;
  private intro?: string;

  constructor(context: ScreenContext & { tool: { name: string; title: string; intro?: string } }) {
    super(context);
    this.toolName = context.tool.name;
    this.title = context.tool.title;
    this.intro = context.tool.intro;
  }

  async render(): Promise<void> {
    this.terminal.setCursorOptions({ centered: false, leftPadding: 20 });
    this.terminal.setCommandAccess(true);
    await this.terminal.clear();

    await this.terminal.print(`${this.title}`, {
      color: TERMINAL_COLORS.primary,
      speed: "instant",
    });
    if (this.intro) {
      await this.terminal.print(this.intro, {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      });
    }
    await this.terminal.print(
      "Type your command or text. 'exit' to return, 'help' for tips.",
      { color: TERMINAL_COLORS.system, speed: "fast" }
    );
    this.terminal.scrollToLatest({ extraPadding: 16 });
  }

  // Default handler: send any input to the tools API using this.toolName
  async handleCommand(ctx: any): Promise<void> {
    const raw = String(ctx.command || "").trim();
    if (!raw) return;
    const lower = raw.toLowerCase();
    if (lower === "exit") {
      (this.terminal as any).emit("screen:transition", { to: "dashboard" });
      ctx.handled = true;
      return;
    }
    if (lower === "help") {
      await this.terminal.print(
        "This experience streams from its prompt. Try short commands or descriptions.",
        { color: TERMINAL_COLORS.secondary, speed: "fast" }
      );
      await this.terminal.print("Commands: exit, help", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });
      ctx.handled = true;
      return;
    }

    try {
      const res = await fetch(`/api/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", name: this.toolName, input: raw }),
      });
      if (!res.ok) {
        const text = await res.text();
        await this.terminal.print(`Tool error: ${text}`, {
          color: TERMINAL_COLORS.error,
          speed: "fast",
        });
        ctx.handled = true;
        return;
      }
      if (res.body) {
        await this.terminal.processAIStream(res.body);
      } else {
        const text = await res.text();
        await this.terminal.print(text, { speed: "normal" });
      }
    } catch (e: any) {
      await this.terminal.print(`Failed to run: ${e?.message || e}`, {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
    }
    ctx.handled = true;
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
  }
}


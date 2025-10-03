import { ScreenCommandRegistry } from "../commands/registry";
import { CommandConfig } from "../commands/types";
import { Terminal, TERMINAL_COLORS } from "../Terminal";
import { TerminalContext } from "../types";
import { overrideMiddleware } from "../middleware/override";
import { systemCommandsMiddleware } from "../middleware/system";
import { navigationMiddleware } from "../middleware/navigation";

export interface ScreenDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  centered?: boolean;
}

export interface ScreenContext {
  terminal: Terminal;
  params?: Record<string, any>;
  dimensions?: Partial<ScreenDimensions>;
  screenManager?: any;
}

export interface TransitionOptions {
  type: "fade" | "slide" | "instant";
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
}

export type ScreenMiddleware = (
  ctx: TerminalContext,
  next: () => Promise<void>
) => Promise<void>;

export abstract class BaseScreen {
  protected terminal: Terminal;
  protected dimensions: ScreenDimensions;
  protected commandRegistry: ScreenCommandRegistry;
  private middlewareChain: ScreenMiddleware[] = [];

  constructor(protected context: ScreenContext) {
    this.terminal = context.terminal;
    this.commandRegistry = new ScreenCommandRegistry();

    // Get terminal dimensions with responsive handling
    this.dimensions = this.getResponsiveDimensions();

    // Add resize listener for responsive updates
    window.addEventListener("resize", this.handleResize);

    // Global middlewares available on all screens (order matters)
    this.registerMiddleware(async (ctx, next) => overrideMiddleware(ctx, next));
    this.registerMiddleware(async (ctx, next) =>
      systemCommandsMiddleware(ctx, next)
    );
    this.registerMiddleware(async (ctx, next) =>
      navigationMiddleware(ctx, next)
    );

    // Register command handler middleware by default
    this.registerMiddleware(async (ctx, next) => {
      const command = this.commandRegistry.getCommand(ctx.command);
      if (command) {
        ctx.handled = true;
        await command.handler(ctx);
        return;
      }
      await next();
    });
  }

  // Add responsive dimension calculation
  protected getResponsiveDimensions(): ScreenDimensions {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Calculate padding based on screen size
    const padding = {
      top: this.getResponsivePadding(),
      right: this.getResponsivePadding(),
      bottom: this.getResponsivePadding(),
      left: this.getResponsivePadding(),
    };

    return {
      width,
      height,
      padding,
      centered: true,
    };
  }

  // Add responsive padding calculation
  protected getResponsivePadding(): number {
    const width = window.innerWidth;
    if (width < 480) return 10; // mobile
    if (width < 768) return 15; // tablet
    return 20; // desktop
  }

  // Add responsive font size calculation
  protected getResponsiveFontSize(): number {
    const width = window.innerWidth;
    if (width < 480) return 12; // mobile
    if (width < 768) return 14; // tablet
    return 16; // desktop
  }

  // Add resize handler
  protected handleResize = () => {
    this.dimensions = this.getResponsiveDimensions();
    // Trigger re-render if needed
    this.render();
  };

  // Clean up event listeners in cleanup method
  async cleanup(): Promise<void> {
    window.removeEventListener("resize", this.handleResize);
  }

  registerCommands(commands: CommandConfig[]) {
    this.commandRegistry.registerCommands(commands);
  }

  registerCommand(command: CommandConfig) {
    this.commandRegistry.registerCommand(command);
  }

  clearCommands() {
    this.commandRegistry.clearCommands();
  }

  // Helper method to center text horizontally with proper width calculation
  protected centerText(text: string): string {
    // Get the actual terminal width in characters (assuming monospace font)
    const terminalWidth = Math.floor(this.terminal.getWidth() / 10); // Approximate character width
    const textLength = text.length;

    // Calculate padding, ensuring we don't go negative
    const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));

    // Return centered text with appropriate padding
    return " ".repeat(padding) + text;
  }

  // Helper to get vertical center position
  protected getVerticalCenter(): number {
    return Math.floor(this.terminal.getHeight() / 2);
  }

  // Helper to add vertical padding from top
  protected async addVerticalPadding(lines: number = 1): Promise<void> {
    for (let i = 0; i < lines; i++) {
      await this.terminal.print("", { speed: "instant" });
    }
  }

  // Helper to center content vertically and horizontally
  protected async printCentered(
    lines: string[],
    options: { startFromCenter?: boolean; topPadding?: number } = {}
  ): Promise<void> {
    const { startFromCenter = true, topPadding = 2 } = options;

    // Add minimal padding at top
    await this.addVerticalPadding(topPadding);

    // Print centered lines
    for (const line of lines) {
      await this.terminal.print(this.centerText(line), {
        color: TERMINAL_COLORS.primary,
        speed: "instant",
      });
    }
  }

  // Helper to add vertical padding
  protected getVerticalPadding(): number {
    return Math.floor(this.terminal.getHeight() / 4); // Start at 1/4 down the screen
  }

  // Helper to add padding to text
  protected padText(text: string): string {
    return " ".repeat(this.dimensions.padding.left) + text;
  }

  // Helper to format text based on screen settings
  protected formatText(text: string): string {
    return this.dimensions.centered
      ? this.centerText(text)
      : this.padText(text);
  }

  // New method to handle transitions
  protected async transition(
    to: string,
    options: TransitionOptions = { type: "instant" }
  ) {
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("screen", to);
    window.history.pushState({}, "", url.toString());

    // Use screenManager to handle the actual navigation
    if (this.context.terminal.screenManager) {
      await this.context.terminal.screenManager.navigate(to, options);
    } else {
      console.error("Screen manager not initialized");
    }
  }

  protected setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const router = (this.context.terminal.context as any).router;
    if (router) {
      return router.setTimeout(callback, delay);
    }
    return setTimeout(callback, delay);
  }

  protected setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const router = (this.context.terminal.context as any).router;
    if (router) {
      return router.setInterval(callback, delay);
    }
    return setInterval(callback, delay);
  }

  // Middleware management
  protected registerMiddleware(middleware: ScreenMiddleware) {
    this.middlewareChain.push(middleware);
  }

  // Base command handling that runs middleware
  async handleCommand(ctx: TerminalContext): Promise<void> {
    let index = 0;
    const executeNext = async (): Promise<void> => {
      if (index < this.middlewareChain.length) {
        const middleware = this.middlewareChain[index++];
        await middleware(ctx, executeNext);
      }
    };

    await executeNext();
  }

  // Abstract methods
  abstract render(): Promise<void>;

  // Optional lifecycle methods
  async beforeRender(): Promise<void> {}
  async afterRender(): Promise<void> {}
}

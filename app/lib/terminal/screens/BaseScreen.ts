import { Terminal, TERMINAL_COLORS } from "../Terminal";

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

export abstract class BaseScreen {
  protected terminal: Terminal;
  protected dimensions: ScreenDimensions;

  constructor(protected context: ScreenContext) {
    this.terminal = context.terminal;

    // Get terminal dimensions or use defaults
    const terminalWidth = this.terminal.getWidth?.() || window.innerWidth;
    const terminalHeight = this.terminal.getHeight?.() || window.innerHeight;

    this.dimensions = {
      width: terminalWidth,
      height: terminalHeight,
      padding: {
        top: context.dimensions?.padding?.top ?? 2,
        right: context.dimensions?.padding?.right ?? 4,
        bottom: context.dimensions?.padding?.bottom ?? 2,
        left: context.dimensions?.padding?.left ?? 4,
      },
      centered: context.dimensions?.centered ?? true,
    };
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
    // Check if emit is available, otherwise use the screen manager directly
    if (typeof this.context.terminal.emit === "function") {
      await this.context.terminal.emit("screen:transition", { to, options });
    } else {
      // Fallback to using screen manager if available
      if (this.context.screenManager) {
        await this.context.screenManager.navigate(to, options);
      } else {
        console.warn("No transition mechanism available");
      }
    }
  }

  abstract render(): Promise<void>;
  abstract cleanup(): Promise<void>;

  // Optional lifecycle methods
  async beforeRender(): Promise<void> {}
  async afterRender(): Promise<void> {}
}

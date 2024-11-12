import { Terminal } from "./Terminal";
import { BaseScreen, TransitionOptions } from "./screens/BaseScreen";

interface Route {
  path: string;
  screen: new (context: any) => BaseScreen;
}

export class ScreenRouter {
  private routes: Map<string, Route> = new Map();
  private currentScreen?: BaseScreen;
  private history: string[] = [];
  private isTransitioning: boolean = false;
  private pendingTransition: string | null = null;

  constructor(private terminal: Terminal) {
    console.log("Initializing ScreenRouter");

    terminal.on("screen:transition", async ({ to, options }) => {
      console.log("Transition event received:", to, options);
      if (this.isTransitioning) {
        console.log("Queuing transition to:", to);
        this.pendingTransition = to;
        return;
      }
      await this.navigate(to, options);
    });
  }

  public register(path: string, screen: new (context: any) => BaseScreen) {
    console.log("Registering screen:", path);
    this.routes.set(path, { path, screen });
    return this;
  }

  public async navigate(
    to: string,
    options: TransitionOptions = { type: "instant" }
  ) {
    if (this.isTransitioning) {
      console.log("Navigation already in progress, queuing:", to);
      this.pendingTransition = to;
      return;
    }

    this.isTransitioning = true;
    console.log("Router: Navigating to:", to);

    try {
      const route = this.routes.get(to);
      if (!route) throw new Error(`Screen "${to}" not found`);

      // Force cleanup of current screen
      if (this.currentScreen) {
        console.log("Router: Cleaning up current screen");
        await this.currentScreen.cleanup();
        this.currentScreen = undefined;
      }

      // Clear the terminal
      console.log("Router: Clearing terminal");
      this.terminal.clear();

      // Show new screen
      console.log("Router: Showing new screen");
      await this.showScreen(route.screen);
      console.log("Router: New screen shown successfully");

      this.history.push(to);
    } catch (error) {
      console.error("Router: Error during navigation:", error);
    } finally {
      this.isTransitioning = false;

      // Check for pending transitions
      if (this.pendingTransition) {
        const nextScreen = this.pendingTransition;
        this.pendingTransition = null;
        await this.navigate(nextScreen, options);
      }
    }
  }

  private async handleTransition(
    from: BaseScreen,
    to: new (context: any) => BaseScreen,
    options: TransitionOptions
  ) {
    switch (options.type) {
      case "fade":
        await this.fadeTransition(from, to, options.duration);
        break;
      case "slide":
        await this.slideTransition(from, to, options);
        break;
      default:
        await from.cleanup();
        this.terminal.clear();
        await this.showScreen(to);
    }
  }

  private async fadeTransition(
    from: BaseScreen,
    to: new (context: any) => BaseScreen,
    duration: number = 500
  ) {
    // Implement fade transition
    await from.cleanup();
    await this.showScreen(to);
  }

  private async slideTransition(
    from: BaseScreen,
    to: new (context: any) => BaseScreen,
    options: TransitionOptions
  ) {
    // Implement slide transition
    await from.cleanup();
    await this.showScreen(to);
  }

  private async showScreen(Screen: new (context: any) => BaseScreen) {
    console.log("Router: Creating new screen instance");
    const screen = new Screen({
      terminal: this.terminal,
      dimensions: {
        centered: true,
        padding: { top: 2, right: 4, bottom: 2, left: 4 },
      },
    });

    console.log("Router: Running screen lifecycle methods");
    await screen.beforeRender();
    await screen.render();
    await screen.afterRender();

    console.log("Router: Setting current screen");
    this.currentScreen = screen;
  }

  public async back() {
    this.history.pop(); // Remove current
    const previous = this.history.pop(); // Get previous
    if (previous) {
      await this.navigate(previous);
    }
  }

  public clearHistory() {
    // Force cleanup current screen before clearing history
    if (this.currentScreen) {
      this.currentScreen.cleanup();
      this.currentScreen = undefined;
    }
    this.history = [];
    this.isTransitioning = false;
  }
}

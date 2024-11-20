import { Terminal, TERMINAL_COLORS } from "./Terminal";
import { BaseScreen, TransitionOptions } from "./screens/BaseScreen";
import { StaticScreen } from "./screens/StaticScreen";
import { FluidScreen } from "./screens/FluidScreen";
import { AdventureScreen } from "./screens/AdventureScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";

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
      await this.navigate(to, options);
    });

    // Register screens
    this.register("fluid", FluidScreen);
    this.register("static", StaticScreen);
    this.register("adventure", AdventureScreen);
    this.register("archive", ArchiveScreen);
    this.register("welcome", WelcomeScreen);

    console.log("Available routes:", Array.from(this.routes.keys()));

    // **Listen to URL changes**
    window.addEventListener("popstate", (event) => {
      const screen = event.state?.screen || this.getScreenFromURL() || "fluid";
      this.navigate(screen, { type: "instant", replaceState: true }).catch(
        console.error
      );
    });

    // **Navigate to initial screen based on URL**
    const initialScreen = this.getScreenFromURL() || "fluid";
    this.navigate(initialScreen, { type: "instant", replaceState: true }).catch(
      console.error
    );
  }

  private getScreenFromURL(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get("screen");
    if (screen && this.routes.has(screen)) {
      return screen;
    }
    return null;
  }

  public register(path: string, screen: new (context: any) => BaseScreen) {
    console.log("Registering screen:", path);
    this.routes.set(path, { path, screen });
    return this;
  }

  public async navigate(
    to: string,
    options: TransitionOptions & { replaceState?: boolean } = {
      type: "instant",
    }
  ) {
    console.log(`Attempting to navigate to: ${to}`);

    if (this.isTransitioning) {
      console.log("Navigation already in progress, queuing:", to);
      this.pendingTransition = to;
      return;
    }

    this.isTransitioning = true;

    try {
      const route = this.routes.get(to);
      if (!route) {
        throw new Error(
          `Screen "${to}" not found. Available routes: ${Array.from(
            this.routes.keys()
          ).join(", ")}`
        );
      }

      if (this.currentScreen) {
        console.log("Cleaning up current screen");
        await this.currentScreen.cleanup();
        this.currentScreen = undefined;
      }

      // **Update URL without reloading**
      this.updateURL(to, options.replaceState);

      console.log("Creating new screen instance");
      const newScreen = new route.screen({ terminal: this.terminal });
      await newScreen.render();

      this.currentScreen = newScreen;

      console.log("Navigation complete");
    } catch (error) {
      console.error("Navigation error:", error);
      await this.terminal.print("An error occurred during navigation.", {
        color: TERMINAL_COLORS.error,
      });
    } finally {
      this.isTransitioning = false;

      if (this.pendingTransition) {
        const nextScreen = this.pendingTransition;
        this.pendingTransition = null;
        await this.navigate(nextScreen);
      }
    }
  }

  private updateURL(screen: string, replaceState?: boolean) {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", screen);

    if (replaceState) {
      window.history.replaceState({ screen }, "", url.toString());
    } else {
      window.history.pushState({ screen }, "", url.toString());
    }
  }
}

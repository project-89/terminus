import { Terminal } from "./Terminal";
import { BaseScreen, ScreenContext } from "./screens/BaseScreen";
import { FluidScreen } from "./screens/FluidScreen";
import { AdventureScreen } from "./screens/AdventureScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";

interface Route {
  screen: new (context: ScreenContext) => BaseScreen;
}

export class ScreenRouter {
  private currentScreen: BaseScreen | null = null;
  private routes: Record<string, Route> = {
    fluid: { screen: FluidScreen },
    adventure: { screen: AdventureScreen },
    archive: { screen: ArchiveScreen },
    // Add other screens as needed
  };

  constructor(private terminal: Terminal) {
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", (event) => {
        this.handlePopState(event);
      });
    }
  }

  private async handlePopState(event: PopStateEvent) {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get("screen") || "fluid";
    await this.showScreen(screen);
  }

  private async showScreen(screenName: string) {
    const route = this.routes[screenName];
    if (!route) {
      console.error(`No route found for screen: ${screenName}`);
      // Fallback to fluid screen
      await this.terminal.screenManager.showScreen(this.routes.fluid.screen);
      return;
    }

    await this.terminal.screenManager.showScreen(route.screen);
  }

  public async navigate(screenName: string, options: any = {}) {
    // Cleanup current screen if it exists
    if (this.currentScreen) {
      await this.currentScreen.cleanup();
    }

    // Get the route
    const route = this.routes[screenName];
    if (!route) {
      throw new Error(`Screen "${screenName}" not found`);
    }

    // Create new screen instance
    const screen = new route.screen({ terminal: this.terminal });

    // Set as current screen in both router and terminal context
    this.currentScreen = screen;
    this.terminal.context.currentScreen = screen;

    // Render the new screen
    await screen.render();

    return screen;
  }

  getCurrentScreen(): BaseScreen | null {
    return this.currentScreen;
  }

  // Helper method to get screen name from screen type
  public getScreenName(
    screen: new (context: ScreenContext) => BaseScreen
  ): string {
    for (const [name, route] of Object.entries(this.routes)) {
      if (route.screen === screen) {
        return name;
      }
    }
    return "fluid"; // Default fallback
  }
}

import { Terminal } from "./Terminal";
import { BaseScreen, ScreenContext } from "./screens/BaseScreen";
import { FluidScreen } from "./screens/FluidScreen";
import { AdventureScreen } from "./screens/AdventureScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";

interface Route {
  path: string;
  screen: new (context: ScreenContext) => BaseScreen;
}

export class ScreenRouter {
  private routes: Route[] = [
    { path: "/", screen: FluidScreen },
    { path: "/adventure", screen: AdventureScreen },
    { path: "/archive", screen: ArchiveScreen },
  ];

  constructor(private terminal: Terminal) {
    // Listen for popstate events to handle browser back/forward
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", (event) => {
        this.handlePopState(event);
      });
    }
  }

  private async handlePopState(event: PopStateEvent) {
    const path = window.location.pathname;
    const route = this.routes.find((r) => r.path === path);
    if (route) {
      await this.terminal.screenManager.showScreen(route.screen);
    }
  }

  public async navigate(path: string) {
    const route = this.routes.find((r) => r.path === path);
    if (!route) {
      console.error(`No route found for path: ${path}`);
      return;
    }

    // Update URL without triggering a page reload
    window.history.pushState({}, "", path);

    // Show the screen
    await this.terminal.screenManager.showScreen(route.screen);
  }

  // Helper method to get route path from screen type
  public getPathForScreen(
    screen: new (context: ScreenContext) => BaseScreen
  ): string {
    const route = this.routes.find((r) => r.screen === screen);
    return route ? route.path : "/";
  }
}

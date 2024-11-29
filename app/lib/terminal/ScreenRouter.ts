import { Terminal } from "./Terminal";
import { BaseScreen, ScreenContext } from "./screens/BaseScreen";
import { FluidScreen } from "./screens/FluidScreen";
import { AdventureScreen } from "./screens/AdventureScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";

interface Route {
  screen: new (context: ScreenContext) => BaseScreen;
}

export class ScreenRouter {
  constructor(private terminal: Terminal) {
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.handlePopState.bind(this));
    }
  }

  private async handlePopState(event: PopStateEvent) {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get("screen") || "home";
    await this.navigate(screen);
  }

  public async navigate(screenName: string, options: any = {}) {
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("screen", screenName);
    window.history.pushState({}, "", url.toString());

    // Delegate to ScreenManager
    await this.terminal.screenManager.navigate(screenName, options);
  }
}

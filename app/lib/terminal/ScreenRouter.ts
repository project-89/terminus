import { Terminal } from "./Terminal";
import { BaseScreen, ScreenContext } from "./screens/BaseScreen";
import { FluidScreen } from "./screens/FluidScreen";
import { AdventureScreen } from "./screens/AdventureScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";

interface Route {
  screen: new (context: ScreenContext) => BaseScreen;
}

export class ScreenRouter {
  private static instance: ScreenRouter | null = null;
  private isNavigating: boolean = false;

  constructor(private terminal: Terminal) {
    if (ScreenRouter.instance) {
      return ScreenRouter.instance;
    }
    console.log("ScreenRouter initialized");
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.handlePopState.bind(this));
    }
    ScreenRouter.instance = this;
  }

  public static getInstance(): ScreenRouter | null {
    return ScreenRouter.instance;
  }

  private async handlePopState(event: PopStateEvent) {
    console.log("PopState event triggered", { event });
    const params = new URLSearchParams(window.location.search);
    const screen = params.get("screen") || "home";
    await this.navigate(screen);
  }

  public async navigate(screenName: string, options: any = {}) {
    console.log("Navigation requested", {
      screenName,
      isNavigating: this.isNavigating,
    });
    if (this.isNavigating) {
      console.log("Navigation already in progress, skipping");
      return;
    }
    this.isNavigating = true;

    try {
      // Update URL
      const url = new URL(window.location.href);
      const currentScreen = url.searchParams.get("screen");
      console.log("Current screen from URL:", currentScreen);

      url.searchParams.set("screen", screenName);
      window.history.pushState({}, "", url.toString());

      // Delegate to ScreenManager
      await this.terminal.screenManager.navigate(screenName, options);
    } finally {
      this.isNavigating = false;
      console.log("Navigation completed");
    }
  }
}

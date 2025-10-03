import { Terminal } from "./Terminal";

type NavigateOptions = Record<string, unknown>;

export class ScreenRouter {
  private isNavigating = false;
  private teardownListener: (() => void) | null = null;

  constructor(private readonly terminal: Terminal) {
    if (typeof window !== "undefined") {
      const handler = this.handlePopState.bind(this);
      window.addEventListener("popstate", handler);
      this.teardownListener = () =>
        window.removeEventListener("popstate", handler);
    }
  }

  destroy() {
    if (this.teardownListener) {
      this.teardownListener();
      this.teardownListener = null;
    }
  }

  private async handlePopState() {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const screen = params.get("screen") || "home";
    await this.navigate(screen);
  }

  public async navigate(screenName: string, options: NavigateOptions = {}) {
    if (this.isNavigating) {
      return;
    }
    this.isNavigating = true;

    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("screen", screenName);
        window.history.pushState({}, "", url.toString());
      }

      await this.terminal.screenManager.navigate(screenName, options);
    } finally {
      this.isNavigating = false;
    }
  }

  // Expose timers so screens can schedule work via router
  public setTimeout(callback: () => void, delay: number): number {
    return window.setTimeout(callback, delay) as unknown as number;
  }

  public clearTimeout(id: number) {
    window.clearTimeout(id as unknown as number);
  }

  public setInterval(callback: () => void, delay: number): number {
    return window.setInterval(callback, delay) as unknown as number;
  }

  public clearInterval(id: number) {
    window.clearInterval(id as unknown as number);
  }
}

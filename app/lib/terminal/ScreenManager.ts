import { Terminal } from "./Terminal";
import { BaseScreen, ScreenContext } from "./screens/BaseScreen";

export class ScreenManager {
  private currentScreen?: BaseScreen;
  private history: BaseScreen[] = [];

  constructor(private terminal: Terminal) {}

  async showScreen(
    Screen: new (context: ScreenContext) => BaseScreen,
    params?: Record<string, any>
  ) {
    try {
      // Cleanup current screen if it exists
      if (this.currentScreen) {
        await this.currentScreen.cleanup();
      }

      // Create and initialize new screen
      const screen = new Screen({ terminal: this.terminal, params });

      // Store current screen in history before changing
      if (this.currentScreen) {
        this.history.push(this.currentScreen);
      }

      // Set new screen as current
      this.currentScreen = screen;

      // Render the new screen
      await screen.beforeRender?.();
      await screen.render();
      await screen.afterRender?.();

      return screen;
    } catch (error) {
      console.error("Error showing screen:", error);
      throw error;
    }
  }

  getCurrentScreen(): BaseScreen | undefined {
    return this.currentScreen;
  }

  async back() {
    const previousScreen = this.history.pop();
    if (previousScreen) {
      if (this.currentScreen) {
        await this.currentScreen.cleanup();
      }
      this.currentScreen = previousScreen;
      await previousScreen.render();
    }
  }
}

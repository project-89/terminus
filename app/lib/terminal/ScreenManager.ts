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
    if (this.currentScreen) {
      await this.currentScreen.cleanup();
    }

    const screen = new Screen({ terminal: this.terminal, params });
    await screen.beforeRender();
    await screen.render();
    await screen.afterRender();

    this.history.push(this.currentScreen!);
    this.currentScreen = screen;
  }

  getCurrentScreen(): BaseScreen | undefined {
    return this.currentScreen;
  }

  async back() {
    const previousScreen = this.history.pop();
    if (previousScreen) {
      await this.currentScreen?.cleanup();
      this.currentScreen = previousScreen;
      await previousScreen.render();
    }
  }
}

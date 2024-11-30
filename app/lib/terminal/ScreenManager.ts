import { Terminal } from "./Terminal";
import { BaseScreen, ScreenContext } from "./screens/BaseScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { StaticScreen } from "./screens/StaticScreen";
import { ScanningScreen } from "./screens/ScanningScreen";
import { ConsentScreen } from "./screens/ConsentScreen";
import { AdventureScreen } from "./screens/AdventureScreen";
import { FluidScreen } from "./screens/FluidScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { MainScreen } from "./screens/MainScreen";

export class ScreenManager {
  private screens = new Map<
    string,
    new (context: ScreenContext) => BaseScreen
  >();
  private terminal: Terminal;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.registerScreens();
  }

  private registerScreens() {
    // Central place for all screen registration
    this.registerScreen("home", FluidScreen);
    this.registerScreen("adventure", AdventureScreen);
    this.registerScreen("archive", ArchiveScreen);
    this.registerScreen("static", StaticScreen);
    this.registerScreen("scanning", ScanningScreen);
    this.registerScreen("consent", ConsentScreen);
    this.registerScreen("main", MainScreen);
  }

  private registerScreen<T extends BaseScreen>(
    name: string,
    screenClass: new (context: ScreenContext) => T
  ) {
    this.screens.set(name, screenClass as any);
  }

  public async navigate(screenName: string, options?: any): Promise<void> {
    try {
      // Clean up current screen if it exists
      if (this.terminal.context?.currentScreen) {
        await this.terminal.context.currentScreen.cleanup();
      }

      // Clear terminal and wait for it to complete
      await this.terminal.clear();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increased delay for stability

      // Get screen class
      const ScreenClass = this.screens.get(screenName);
      if (!ScreenClass) {
        throw new Error(`Screen '${screenName}' not found`);
      }

      // Create new screen instance
      const screenContext = {
        terminal: this.terminal,
        options,
      };

      const newScreen = new ScreenClass(screenContext);

      // Update terminal context with new screen
      if (this.terminal.context) {
        this.terminal.context.currentScreen = newScreen;
      }

      // Render new screen
      if (newScreen.beforeRender) {
        await newScreen.beforeRender();
      }
      await newScreen.render();
      if (newScreen.afterRender) {
        await newScreen.afterRender();
      }
    } catch (error) {
      console.error(`Error navigating to screen ${screenName}:`, error);
      throw error;
    }
  }
}

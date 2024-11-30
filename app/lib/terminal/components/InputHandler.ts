import { Terminal } from "../Terminal";

export class InputHandler {
  private hiddenTextarea!: HTMLTextAreaElement;
  private inputBuffer: string = "";
  private cursorPosition: number = 0;
  private inputHistory: string[] = [];
  private historyIndex: number = -1;
  private tempInput: string = "";

  constructor(private terminal: Terminal) {
    this.initializeInput();
  }

  private initializeInput() {
    this.hiddenTextarea = document.createElement("textarea");
    this.hiddenTextarea.style.position = "absolute";
    this.hiddenTextarea.style.left = "-9999px";
    this.hiddenTextarea.style.top = "-9999px";
    document.body.appendChild(this.hiddenTextarea);

    this.hiddenTextarea.addEventListener("keydown", this.handleKeyDown);
    this.hiddenTextarea.focus();

    this.terminal.canvas.addEventListener("click", () => this.focus());
  }

  public focus() {
    this.hiddenTextarea.focus();
  }

  public handleInput(char: string, event?: KeyboardEvent) {
    if (this.terminal.isGenerating) return;

    if (
      event &&
      [
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Backspace",
        "Delete",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      return;
    }

    if (
      char.length === 1 &&
      !event?.ctrlKey &&
      !event?.altKey &&
      !event?.metaKey
    ) {
      const before = this.inputBuffer.slice(0, this.cursorPosition);
      const after = this.inputBuffer.slice(this.cursorPosition);
      this.inputBuffer = before + char + after;
      this.cursorPosition++;
      this.terminal.render();
    }
  }

  private handleKeyDown = async (e: KeyboardEvent) => {
    if (this.terminal.isGenerating) return;

    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Enter",
        "Backspace",
        "Delete",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }

    switch (e.key) {
      case "ArrowLeft":
        this.moveCursor(-1);
        break;

      case "ArrowRight":
        this.moveCursor(1);
        break;

      case "Home":
        this.cursorPosition = 0;
        this.terminal.render();
        break;

      case "End":
        this.cursorPosition = this.inputBuffer.length;
        this.terminal.render();
        break;

      case "ArrowUp":
        this.handleHistoryNavigation("up");
        break;

      case "ArrowDown":
        this.handleHistoryNavigation("down");
        break;

      case "Backspace":
        this.handleBackspace();
        break;

      case "Delete":
        this.handleDelete();
        break;

      case "Enter":
        await this.handleEnter();
        break;
    }
  };

  private moveCursor(delta: number) {
    const newPosition = this.cursorPosition + delta;
    if (newPosition >= 0 && newPosition <= this.inputBuffer.length) {
      this.cursorPosition = newPosition;
      this.terminal.render();
    }
  }

  private handleHistoryNavigation(direction: "up" | "down") {
    if (
      direction === "up" &&
      this.historyIndex < this.inputHistory.length - 1
    ) {
      if (this.historyIndex === -1) {
        this.tempInput = this.inputBuffer;
      }
      this.historyIndex++;
      this.inputBuffer = this.inputHistory[this.historyIndex];
      this.cursorPosition = this.inputBuffer.length;
      this.terminal.render();
    } else if (direction === "down" && this.historyIndex >= 0) {
      this.historyIndex--;
      this.inputBuffer =
        this.historyIndex === -1
          ? this.tempInput
          : this.inputHistory[this.historyIndex];
      this.cursorPosition = this.inputBuffer.length;
      this.terminal.render();
    }
  }

  private handleBackspace() {
    if (this.cursorPosition > 0) {
      const before = this.inputBuffer.slice(0, this.cursorPosition - 1);
      const after = this.inputBuffer.slice(this.cursorPosition);
      this.inputBuffer = before + after;
      this.cursorPosition--;
      this.terminal.render();
    }
  }

  private handleDelete() {
    if (this.cursorPosition < this.inputBuffer.length) {
      const before = this.inputBuffer.slice(0, this.cursorPosition);
      const after = this.inputBuffer.slice(this.cursorPosition + 1);
      this.inputBuffer = before + after;
      this.terminal.render();
    }
  }

  private async handleEnter() {
    const command = this.inputBuffer.trim();
    if (command) {
      this.inputBuffer = "";
      this.cursorPosition = 0;
      this.terminal.render();

      this.inputHistory.unshift(command);
      this.historyIndex = -1;
      this.tempInput = "";

      await this.terminal.processCommand(command);
    }
  }

  public getInputBuffer(): string {
    return this.inputBuffer;
  }

  public getCursorPosition(): number {
    return this.cursorPosition;
  }

  public destroy() {
    if (this.hiddenTextarea && this.hiddenTextarea.parentNode) {
      this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea);
    }
  }
}

import { Terminal } from "../Terminal";

export class InputHandler {
  private hiddenTextarea!: HTMLTextAreaElement;
  private buffer: string = "";
  private history: string[] = [];
  private historyIndex: number = -1;
  private tempInput: string = "";
  private cursorPosition: number = 0;

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

    if (char === "ArrowLeft") {
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
        this.terminal.render();
      }
      return;
    }

    if (char === "ArrowRight") {
      if (this.cursorPosition < this.buffer.length) {
        this.cursorPosition++;
        this.terminal.render();
      }
      return;
    }

    if (
      char.length === 1 &&
      !event?.ctrlKey &&
      !event?.altKey &&
      !event?.metaKey
    ) {
      const before = this.buffer.slice(0, this.cursorPosition);
      const after = this.buffer.slice(this.cursorPosition);
      this.buffer = before + char + after;
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
        this.cursorPosition = this.buffer.length;
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
    const inputText = `> ${this.buffer}`;
    const wrappedLines = this.terminal.renderer.wrapText(inputText);
    const maxCharsPerLine = this.terminal.renderer.getMaxCharsPerLine();

    // Calculate current line and column
    let currentPos = 0;
    let currentLine = 0;
    let currentCol = 0;

    for (const line of wrappedLines) {
      const lineLength = line.length;
      if (currentPos + lineLength > this.cursorPosition) {
        currentCol = this.cursorPosition - currentPos;
        break;
      }
      currentPos += lineLength;
      currentLine++;
    }

    // Handle left movement
    if (delta < 0 && this.cursorPosition > 0) {
      if (currentCol > 0) {
        this.cursorPosition--;
      } else if (currentLine > 0) {
        // Move to end of previous line
        const prevLine = wrappedLines[currentLine - 1];
        this.cursorPosition = currentPos - prevLine.length;
      }
    }
    // Handle right movement
    else if (delta > 0 && this.cursorPosition < this.buffer.length) {
      if (currentCol < wrappedLines[currentLine]?.length - 1) {
        this.cursorPosition++;
      } else if (currentLine < wrappedLines.length - 1) {
        // Move to start of next line
        this.cursorPosition = currentPos + wrappedLines[currentLine].length;
      }
    }

    this.terminal.render();
  }

  private handleHistoryNavigation(direction: "up" | "down") {
    if (direction === "up" && this.historyIndex < this.history.length - 1) {
      if (this.historyIndex === -1) {
        this.tempInput = this.buffer;
      }
      this.historyIndex++;
      this.buffer = this.history[this.historyIndex];
      this.cursorPosition = this.buffer.length;
      this.terminal.render();
    } else if (direction === "down" && this.historyIndex >= 0) {
      this.historyIndex--;
      this.buffer =
        this.historyIndex === -1
          ? this.tempInput
          : this.history[this.historyIndex];
      this.cursorPosition = this.buffer.length;
      this.terminal.render();
    }
  }

  private handleBackspace() {
    if (this.cursorPosition > 0) {
      const before = this.buffer.slice(0, this.cursorPosition - 1);
      const after = this.buffer.slice(this.cursorPosition);
      this.buffer = before + after;
      this.cursorPosition--;
      this.terminal.render();
    }
  }

  private handleDelete() {
    if (this.cursorPosition < this.buffer.length) {
      const before = this.buffer.slice(0, this.cursorPosition);
      const after = this.buffer.slice(this.cursorPosition + 1);
      this.buffer = before + after;
      this.terminal.render();
    }
  }

  private async handleEnter() {
    const command = this.buffer.trim();
    if (command) {
      this.buffer = "";
      this.cursorPosition = 0;
      this.terminal.render();

      this.addToHistory(command);

      await this.terminal.processCommand(command);
    }
  }

  public getHistory(): string[] {
    return this.history;
  }

  public getHistoryIndex(): number {
    return this.historyIndex;
  }

  public setHistoryIndex(index: number): void {
    this.historyIndex = index;
  }

  public getInputBuffer(): string {
    return this.buffer;
  }

  public setBuffer(value: string): void {
    this.buffer = value;
    this.cursorPosition = value.length;
  }

  public addToHistory(command: string): void {
    if (command.trim()) {
      this.history.unshift(command);
      this.historyIndex = -1;
    }
  }

  public getCursorPosition(): number {
    return this.cursorPosition;
  }

  public setCursorPosition(position: number): void {
    this.cursorPosition = Math.max(0, Math.min(position, this.buffer.length));
  }

  public destroy() {
    if (this.hiddenTextarea && this.hiddenTextarea.parentNode) {
      this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea);
    }
  }
}

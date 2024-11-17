import { BaseScreen } from "./BaseScreen";
import { Terminal, TERMINAL_COLORS } from "../Terminal";
import { FileSystemItem, SpecialPaths } from "../types";

export class ArchiveScreen extends BaseScreen {
  private items: FileSystemItem[] = [];
  private selectedIndex: number = 0;
  private isNavigating: boolean = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private layout = {
    padding: {
      top: 20,
      left: 20,
      right: 20,
      bottom: 20,
    },
    spacing: {
      line: 24,
      item: 28,
    },
    sizes: {
      header: 18,
      text: 16,
      small: 14,
    },
    colors: {
      background: "#090812",
      foreground: "#5cfffa",
      highlight: "#ffffff",
      folder: "#5cfffa",
      file: "rgba(92, 255, 250, 0.7)",
      selectedBackground: "rgba(92, 255, 250, 0.1)",
      dim: "rgba(92, 255, 250, 0.4)",
    },
    fontFamily: "Berkeley Mono",
    textShadow: {
      color: "rgba(92, 255, 250, 0.6)",
      blur: "10px",
      offset: "0px",
    },
  };

  private header = `
█████████████████████████████████████████████████████████████████████████████

██████╗  █████╗ ████████╗ █████╗     ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗    ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██║  ██║███████║   ██║   ███████║    ██║   ██║███████║██║   ██║██║     ██║   
██║  ██║██╔══██║   ██║   ██╔══██║    ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
██████╔╝██║  ██║   ██║   ██║  ██║     ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝      ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
[RESTRICTED ACCESS] [REALITY COHERENCE: 89.3%] [SIMULATION ANOMALIES DETECTED]
///////////////////////////////////////////////////////////////////////////////
>> AUTHORIZED PERSONNEL ONLY << ONEIROCOM SECURITY MONITORING ACTIVE << BEWARE //
█████████████████████████████████████████████████████████████████████████████`.trim();

  // Add new properties for file viewing
  private isViewingFile: boolean = false;
  private scrollOffset: number = 0;
  private contentLines: string[] = [];
  private maxScrollOffset: number = 0;
  private readonly linesPerPage = 20;

  // Add loading state property
  private isLoading: boolean = false;
  private loadingMessages: string[] = [
    "ACCESSING QUANTUM STORAGE...",
    "DECRYPTING NEURAL PATTERNS...",
    "STABILIZING REALITY ANCHORS...",
    "GENERATING TEMPORAL INDICES...",
    "SCANNING DIMENSIONAL RIFTS...",
  ];
  private currentLoadingMessage: number = 0;
  private loadingAnimationFrame: number = 0;

  // Add new properties for effects
  private scanLineOffset: number = 0;
  private glitchTimeout: NodeJS.Timeout | null = null;
  private glitchLines: { y: number; width: number }[] = [];
  private noiseCanvas: HTMLCanvasElement;
  private noiseCtx: CanvasRenderingContext2D;
  private lastFrameTime: number = 0;

  private handleKeyDown = async (e: KeyboardEvent) => {
    if (this.isNavigating) return;

    if (this.isViewingFile) {
      // Handle file viewing controls
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.scrollOffset = Math.max(0, this.scrollOffset - 1);
        await this.renderFileContent();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.scrollOffset = Math.min(
          this.maxScrollOffset,
          this.scrollOffset + 1
        );
        await this.renderFileContent();
      } else if (e.key === "PageUp") {
        e.preventDefault();
        this.scrollOffset = Math.max(0, this.scrollOffset - this.linesPerPage);
        await this.renderFileContent();
      } else if (e.key === "PageDown") {
        e.preventDefault();
        this.scrollOffset = Math.min(
          this.maxScrollOffset,
          this.scrollOffset + this.linesPerPage
        );
        await this.renderFileContent();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.isViewingFile = false;
        this.scrollOffset = 0;
        await this.displayItems();
      }
      return;
    }

    // Existing directory navigation controls
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.selectedIndex =
        (this.selectedIndex - 1 + this.items.length) % this.items.length;
      await this.displayItems();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      await this.displayItems();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      await this.expandItem();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      await this.collapseItem();
    } else if (e.key === "Enter") {
      e.preventDefault();
      await this.selectItem();
    }
  };

  private handleWheel = async (e: WheelEvent) => {
    if (this.isViewingFile) {
      e.preventDefault();
      const scrollAmount = Math.sign(e.deltaY);
      this.scrollOffset = Math.max(
        0,
        Math.min(this.maxScrollOffset, this.scrollOffset + scrollAmount)
      );
      await this.renderFileContent();
    }
  };

  constructor(context: { terminal: Terminal }) {
    super(context);

    // Create our own canvas
    this.canvas = document.createElement("canvas");
    this.canvas.className = "absolute inset-0";
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.zIndex = "20";

    // Add CRT overlay elements
    const crtOverlay = document.createElement("div");
    crtOverlay.className =
      "pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10";
    this.canvas.parentElement?.appendChild(crtOverlay);

    const scanlineOverlay = document.createElement("div");
    scanlineOverlay.className =
      "pointer-events-none absolute inset-0 bg-[url('/scanline.png')] opacity-5";
    this.canvas.parentElement?.appendChild(scanlineOverlay);

    this.ctx = this.canvas.getContext("2d")!;
    this.setupCanvas();

    // Add wheel event listener
    this.canvas.addEventListener("wheel", this.handleWheel);

    // Create noise canvas for scan line effect
    this.noiseCanvas = document.createElement("canvas");
    this.noiseCanvas.width = 256;
    this.noiseCanvas.height = 256;
    this.noiseCtx = this.noiseCanvas.getContext("2d")!;
    this.generateNoise();

    // Start the animation loop
    this.animate();
  }

  private setupCanvas() {
    const parent = this.terminal.canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas dimensions
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Set display size
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Scale context for retina displays
    this.ctx.scale(dpr, dpr);

    // Set base font properties
    this.ctx.font = `${this.layout.sizes.text}px "${this.layout.fontFamily}"`;
    this.ctx.textBaseline = "top";

    parent.appendChild(this.canvas);
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    options: {
      color?: string;
      size?: number;
      align?: "left" | "center" | "right";
      weight?: string;
      glow?: boolean;
    } = {}
  ) {
    const dpr = window.devicePixelRatio || 1;
    const {
      color = TERMINAL_COLORS.primary,
      size = this.layout.sizes.text,
      align = "left",
      weight = "normal",
      glow = true,
    } = options;

    this.ctx.font = `${weight} ${size}px "Berkeley Mono Variable"`;

    // Calculate position
    let xPos = x;
    if (align === "center") {
      xPos = (this.canvas.width / dpr - this.ctx.measureText(text).width) / 2;
    } else if (align === "right") {
      xPos =
        this.canvas.width / dpr -
        this.ctx.measureText(text).width -
        this.layout.padding.right;
    }

    // Add glow effect
    if (glow) {
      this.ctx.save();
      this.ctx.shadowColor = this.layout.textShadow.color;
      this.ctx.shadowBlur = parseInt(this.layout.textShadow.blur);
      this.ctx.shadowOffsetX = parseInt(this.layout.textShadow.offset);
      this.ctx.shadowOffsetY = parseInt(this.layout.textShadow.offset);
    }

    // Draw the text
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, xPos, y);

    // Reset shadow if glow was applied
    if (glow) {
      this.ctx.restore();
    }
  }

  private async renderItems() {
    // If loading, show loading screen instead of items
    if (this.isLoading) {
      await this.renderLoadingScreen();
      return;
    }

    // Clear canvas
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let y = this.layout.padding.top;

    // Render ASCII header with stronger glow
    this.ctx.font = `bold ${this.layout.sizes.header}px "${this.layout.fontFamily}"`;
    this.ctx.fillStyle = this.layout.colors.foreground;

    const headerLines = this.header.split("\n");
    for (const line of headerLines) {
      this.drawText(line, 0, y, {
        color: this.layout.colors.foreground,
        size: this.layout.sizes.header,
        align: "center",
        weight: "bold",
        glow: true,
      });
      y += this.layout.spacing.line;
    }
    y += this.layout.spacing.line; // Add extra space after header

    // Render path
    this.ctx.font = `${this.layout.sizes.text}px "${this.layout.fontFamily}"`;
    this.ctx.fillStyle = this.layout.colors.dim;
    const currentPath = this.getCurrentPath();
    const pathDisplay = currentPath ? `/${currentPath}` : "/";
    this.ctx.fillText(`Location: ${pathDisplay}`, this.layout.padding.left, y);
    y += this.layout.spacing.line;

    // Add separator
    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(
      this.layout.padding.left,
      y,
      this.canvas.width -
        (this.layout.padding.left + this.layout.padding.right),
      1
    );
    y += this.layout.spacing.line;

    // Render items
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const isSelected = i === this.selectedIndex;
      const indent = this.layout.padding.left + item.level * 20;

      // Selection highlight
      if (isSelected) {
        this.ctx.fillStyle = this.layout.colors.selectedBackground;
        this.ctx.fillRect(
          this.layout.padding.left - 10,
          y - 4,
          this.canvas.width -
            (this.layout.padding.left + this.layout.padding.right) +
            20,
          this.layout.spacing.line
        );

        // Selection marker
        this.ctx.fillStyle = this.layout.colors.foreground;
        this.ctx.fillRect(
          this.layout.padding.left - 10,
          y - 4,
          4,
          this.layout.spacing.line
        );
      }

      // Set font and color for items
      this.ctx.font = `${this.layout.sizes.text}px "${this.layout.fontFamily}"`;
      this.ctx.fillStyle = isSelected
        ? this.layout.colors.highlight
        : item.isDirectory
        ? this.layout.colors.folder
        : this.layout.colors.file;

      // Draw item text
      const itemText = item.isDirectory
        ? `${item.expanded ? "▼" : "▶"} ${item.name}/`
        : `${this.getFileIcon(item.name)} ${item.name}`;
      this.ctx.fillText(itemText, indent, y);

      // Display file type for selected items
      if (isSelected && !item.isDirectory) {
        const textWidth = this.ctx.measureText(itemText).width;
        this.ctx.fillStyle = this.layout.colors.dim;
        this.ctx.font = `${this.layout.sizes.small}px "${this.layout.fontFamily}"`;
        const extension = item.name.split(".").pop()?.toLowerCase() || "";
        this.ctx.fillText(
          `[${extension.toUpperCase()}]`,
          indent + textWidth + 10,
          y
        );
      }

      y += this.layout.spacing.line;
    }

    // Status bar
    const statusY =
      this.canvas.height / window.devicePixelRatio -
      (this.layout.padding.bottom + this.layout.spacing.line);
    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(0, statusY - 4, this.canvas.width, 1);

    this.ctx.font = `${this.layout.sizes.small}px "${this.layout.fontFamily}"`;
    this.ctx.fillText(
      "↑/↓: Navigate   ←/→: Expand/Collapse   Enter: Open   Esc: Back",
      this.layout.padding.left,
      statusY + 12
    );

    // Add effects on top
    this.renderEffects();
  }

  // **Helper method to get file icon**
  private getFileIcon(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    switch (extension) {
      case "md":
        return "◆";
      case "txt":
        return "◇";
      case "pdf":
        return "□";
      case "jpg":
      case "png":
        return "▣";
      default:
        return "○";
    }
  }

  async render(): Promise<void> {
    this.terminal.canvas.style.display = "none"; // Hide the terminal
    await this.fetchAndDisplayItems();
    this.addEventListeners();
  }

  private async fetchAndDisplayItems() {
    this.items = await this.fetchItems("", 0, null);
    await this.displayItems();
  }

  // Modify fetchItems to show loading state
  private async fetchItems(
    path: string,
    level: number,
    parent: FileSystemItem | null
  ): Promise<FileSystemItem[]> {
    try {
      // Only show loading for vault-related paths
      if (path.includes("vault")) {
        this.isLoading = true;
        this.renderLoadingScreen();
      }

      const response = await fetch(
        `/api/archive?path=${encodeURIComponent(path)}`
      );

      if (response.ok) {
        const items = await response.json();
        return items.map((item: any) => ({
          ...item,
          expanded: false,
          children: [],
          level,
          parent,
        }));
      } else {
        console.error("Failed to fetch items", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching items", error);
    } finally {
      this.isLoading = false;
    }
    return [];
  }

  private async displayItems() {
    await this.renderItems();
  }

  private addEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private async expandItem() {
    const item = this.items[this.selectedIndex];
    if (item.isDirectory && !item.expanded) {
      item.expanded = true;
      const path = this.getFullPath(item);
      const children = await this.fetchItems(path, item.level + 1, item);
      const insertIndex = this.selectedIndex + 1;
      this.items.splice(insertIndex, 0, ...children);
      await this.displayItems();
    }
  }

  private async collapseItem() {
    const item = this.items[this.selectedIndex];
    if (item.isDirectory && item.expanded) {
      item.expanded = false;
      this.removeChildren(this.selectedIndex);
      await this.displayItems();
    } else if (item.parent) {
      // Move selection to parent directory
      const parentIndex = this.items.indexOf(item.parent);
      if (parentIndex !== -1) {
        this.selectedIndex = parentIndex;
        await this.displayItems();
      }
    }
  }

  private removeChildren(index: number) {
    const item = this.items[index];
    let removeCount = 0;
    for (let i = index + 1; i < this.items.length; i++) {
      if (this.items[i].level > item.level) {
        removeCount++;
      } else {
        break;
      }
    }
    this.items.splice(index + 1, removeCount);
  }

  private async selectItem() {
    const selectedItem = this.items[this.selectedIndex];
    if (selectedItem.isDirectory) {
      await this.expandItem();
    } else {
      const extension = selectedItem.name.split(".").pop()?.toLowerCase();

      if (extension === "txt" || extension === "md") {
        await this.viewFile(selectedItem, extension);
      } else {
        // Show download message for other file types
        const messageY = this.canvas.height - this.layout.spacing.line * 4;

        // Clear previous message area
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(
          0,
          messageY - 10,
          this.canvas.width,
          this.layout.spacing.line * 2
        );

        // Show downloading message with glitch effect
        const showGlitchMessage = async () => {
          const messages = [
            "INITIATING QUANTUM TRANSFER...",
            "STABILIZING DATA STREAM...",
            "DOWNLOADING FILE...",
          ];

          for (const msg of messages) {
            this.ctx.fillStyle = TERMINAL_COLORS.primary;
            const msgWidth = this.ctx.measureText(msg).width;
            this.ctx.fillText(
              msg,
              (this.canvas.width - msgWidth) / 2,
              messageY
            );
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        };

        showGlitchMessage().then(() => {
          const path = this.getFullPath(selectedItem);
          window.open(
            `/api/files?path=${encodeURIComponent(path)}&download=1`,
            "_blank"
          );
        });
      }
    }
  }

  // Modify viewFile to show loading state
  private async viewFile(item: FileSystemItem, fileType: "txt" | "md") {
    try {
      const path = this.getFullPath(item);

      // Show loading for vault files
      if (path.includes("vault")) {
        this.isLoading = true;
        this.renderLoadingScreen();
      }

      // First try to fetch existing file
      let response = await fetch(
        `/api/archive?path=${encodeURIComponent(path)}&view=1`
      );

      // If file doesn't exist, generate it
      if (!response.ok) {
        response = await fetch("/api/archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: path,
            action: "generate_file",
          }),
        });
      }

      if (!response.ok)
        throw new Error("Failed to fetch/generate file contents");
      const content = await response.text();

      this.isLoading = false;

      // Set viewing state and render content
      this.isViewingFile = true;
      this.scrollOffset = 0;
      this.contentLines = content.split("\n");
      this.maxScrollOffset = Math.max(
        0,
        this.contentLines.length - this.linesPerPage
      );

      await this.renderFileContent();
    } catch (error) {
      console.error("Error viewing file:", error);
      this.isLoading = false;

      // Show error message
      this.ctx.fillStyle = TERMINAL_COLORS.error;
      const errorMsg = "ERROR: Failed to access file contents";
      const errorWidth = this.ctx.measureText(errorMsg).width;
      this.ctx.fillText(
        errorMsg,
        (this.canvas.width - errorWidth) / 2,
        this.canvas.height / 2
      );
      setTimeout(() => {
        this.displayItems();
      }, 2000);
    }
  }

  private async renderFileContent() {
    // Clear canvas
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let y = this.layout.padding.top;

    // Render visible lines with glow
    const visibleLines = this.contentLines.slice(
      this.scrollOffset,
      this.scrollOffset + this.linesPerPage
    );

    for (const line of visibleLines) {
      this.drawText(line, this.layout.padding.left, y, {
        color: this.layout.colors.foreground,
        glow: true,
      });
      y += this.layout.spacing.line;
    }

    // Render scroll indicators if needed
    if (this.maxScrollOffset > 0) {
      this.renderScrollIndicators();
    }

    // Render footer
    const footerY =
      this.canvas.height -
      (this.layout.padding.bottom + this.layout.spacing.line);
    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(0, footerY - 4, this.canvas.width, 1);
    this.ctx.fillText(
      "↑/↓: Scroll   PgUp/PgDn: Page   Esc: Back",
      this.layout.padding.left,
      footerY + 12
    );

    // Add effects on top
    this.renderEffects();
  }

  private renderScrollIndicators() {
    const scrollPercentage = this.scrollOffset / this.maxScrollOffset;
    const scrollBarHeight = 200;
    const scrollBarY =
      (this.canvas.height - scrollBarHeight) * scrollPercentage;

    // Render scroll bar
    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(this.canvas.width - 8, 0, 2, this.canvas.height);

    // Render scroll thumb
    this.ctx.fillStyle = this.layout.colors.foreground;
    this.ctx.fillRect(this.canvas.width - 8, scrollBarY, 2, 20);
  }

  private getFullPath(item: FileSystemItem): string {
    const parts = [];
    let currentItem: FileSystemItem | null = item;
    while (currentItem !== null) {
      parts.unshift(currentItem.name);
      currentItem = currentItem.parent;
    }
    return parts.join("/");
  }

  private getCurrentPath(): string {
    const selectedItem = this.items[this.selectedIndex];
    return selectedItem ? this.getFullPath(selectedItem) : "";
  }

  async cleanup(): Promise<void> {
    window.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("wheel", this.handleWheel);

    // Remove CRT overlays
    const parent = this.canvas.parentElement;
    if (parent) {
      const overlays = parent.querySelectorAll(".pointer-events-none");
      overlays.forEach((overlay) => overlay.remove());
    }

    if (this.glitchTimeout) {
      clearTimeout(this.glitchTimeout);
    }
    this.canvas.remove();
    this.noiseCanvas.remove();
    this.terminal.canvas.style.display = "block";
    await this.terminal.clear();
  }

  // Add loading animation method
  private async renderLoadingScreen() {
    // Clear the entire canvas
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const centerY = this.canvas.height / (2 * window.devicePixelRatio);
    const spinnerChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

    // Draw spinner and message
    this.ctx.fillStyle = this.layout.colors.foreground;
    this.ctx.font = `${this.layout.sizes.text}px "${this.layout.fontFamily}"`;

    const message = this.loadingMessages[this.currentLoadingMessage];
    const spinner =
      spinnerChars[this.loadingAnimationFrame % spinnerChars.length];

    const text = `${spinner} ${message}`;
    const textWidth = this.ctx.measureText(text).width;

    this.drawText(text, 0, centerY, {
      color: this.layout.colors.foreground,
      align: "center",
      glow: true,
    });

    // Update animation state
    this.loadingAnimationFrame++;
    if (this.loadingAnimationFrame % 15 === 0) {
      this.currentLoadingMessage =
        (this.currentLoadingMessage + 1) % this.loadingMessages.length;
    }

    if (this.isLoading) {
      requestAnimationFrame(() => this.renderLoadingScreen());
    } else {
      // When loading is done, render the items
      await this.renderItems();
    }
  }

  // Add these new methods for effects
  private generateNoise() {
    const imageData = this.noiseCtx.createImageData(
      this.noiseCanvas.width,
      this.noiseCanvas.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value; // r
      data[i + 1] = value; // g
      data[i + 2] = value; // b
      data[i + 3] = 15; // alpha
    }

    this.noiseCtx.putImageData(imageData, 0, 0);
  }

  private renderEffects() {
    // Render scan lines
    this.ctx.globalAlpha = 0.1;
    this.ctx.drawImage(
      this.noiseCanvas,
      0,
      this.scanLineOffset,
      this.canvas.width,
      this.canvas.height
    );

    // Render CRT screen curve effect
    this.ctx.globalAlpha = 0.1;
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width
    );
    gradient.addColorStop(0, "rgba(92, 255, 250, 0.1)");
    gradient.addColorStop(1, "rgba(92, 255, 250, 0)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render glitch lines
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = this.layout.colors.foreground;
    for (const line of this.glitchLines) {
      this.ctx.fillRect(0, line.y, line.width, 1);
    }

    // Reset alpha
    this.ctx.globalAlpha = 1;
  }

  private animate = (timestamp: number = 0) => {
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Update scan line position
    this.scanLineOffset =
      (this.scanLineOffset + deltaTime * 0.05) % this.canvas.height;

    // Extremely rare glitch effect (roughly every 2-3 minutes)
    if (Math.random() < 0.00008) {
      // Much lower probability
      this.glitchLines = Array(Math.floor(Math.random() * 2))
        .fill(0)
        .map(() => ({
          y: Math.random() * this.canvas.height,
          width: Math.random() * this.canvas.width * 0.8,
        }));

      // Clear glitch lines after a brief moment
      setTimeout(() => {
        this.glitchLines = [];
      }, 150); // Slightly shorter duration
    }

    // Re-render current screen with effects
    if (this.isViewingFile) {
      this.renderFileContent();
    } else {
      this.renderItems();
    }

    // Continue animation loop
    requestAnimationFrame(this.animate);
  };
}

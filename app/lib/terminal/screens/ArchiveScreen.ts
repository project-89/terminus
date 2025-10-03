import { BaseScreen } from "./BaseScreen";
import { Terminal, TERMINAL_COLORS } from "../Terminal";
import { FileSystemItem, SpecialPaths } from "../types";
import { FileMetadata } from "../../files/types";

export class ArchiveScreen extends BaseScreen {
  private items: FileSystemItem[] = [];
  private selectedIndex: number = 0;
  private isNavigating: boolean = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number = 0; // CSS pixel width
  private canvasHeight: number = 0; // CSS pixel height

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
      foreground: "#2fb7c3",
      highlight: "#ffffff",
      folder: "#2fb7c3",
      file: "rgba(47, 183, 195, 0.7)",
      selectedBackground: "rgba(47, 183, 195, 0.1)",
      dim: "rgba(47, 183, 195, 0.4)",
    },
    fontFamily: "Berkeley Mono",
    textShadow: {
      color: "rgba(47, 183, 195, 0.4)",
      blur: "8px",
      offset: "0px",
    },
    effects: {
      glow: {
        blur: 16,
        color: "#2fb7c3",
        strength: 1.5,
        passes: 2,
      },
      scanlines: {
        spacing: 4,
        opacity: 0.1,
        speed: 0.005,
        offset: 0,
        thickness: 1,
      },
      crt: {
        curvature: 0.15,
        vignetteStrength: 0.25,
        cornerBlur: 0.12,
        scanlineGlow: 0.05,
      },
    },
  };

  private header = `
███████████████████████████████████████████████████████████████████████████████████

 █████╗  █████╗      █████╗ ██████╗  ██████╗██╗  ██╗██╗██╗   ██╗███████╗
██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██║  ██║██║██║   ██║██╔════╝
╚█████╔╝╚██████║    ███████║██████╔╝██║     ███████║██║██║   ██║█████╗  
██╔══██╗ ╚═══██║    ██╔══██║██╔══██╗██║     █��╔══██║██║╚██╗ ██╔╝██╔══╝  
╚█████╔╝ █████╔╝    ██║  ██║██║  ██║╚██████╗██║  ██║██║ ╚████╔╝ ███████╗
 ╚════╝  ╚════╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
[RESTRICTED ACCESS] [REALITY COHERENCE: 89.3%] [SIMULATION ANOMALIES DETECTED]
///////////////////////////////////////////////////////////////////////////////
>> AUTHORIZED PERSONNEL ONLY << ONEIROCOM SECURITY MONITORING ACTIVE << BEWARE //
███████████████████████████████████████████████████████████████████████████████████`.trim();

  private mobileHeader = `
████████████████████████████████

 █████╗ ██████╗  ██████╗██╗  ██╗
██╔══██╗██╔══██╗██╔════╝██║  ██║
███████║██████╔╝██║     ███████║
██╔══██║█��╔══██╗██║     ██╔══██║
██║  ██║██║  ██║╚██████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
[RESTRICTED ACCESS]
>> AUTHORIZED ONLY <<
████████████████████████████████`.trim();

  // Add new properties for file viewing
  private isViewingFile: boolean = false;
  private scrollOffset: number = 0;
  private contentLines: string[] = [];
  private maxScrollOffset: number = 0;
  private linesPerPage: number = 30;
  private readonly maxLineWidth: number = 0;

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

  // Add new state properties
  private isPasswordPrompt: boolean = false;
  private currentPassword: string = "";
  private protectedPaths = new Set(["vault"]);
  private incorrectAttempts: number = 0;
  private isLocked: boolean = true;

  // Add new properties for PDF viewing
  private isPdfViewing: boolean = false;
  private currentPdfPage: number = 1;
  private totalPdfPages: number = 1;
  private pdfScale: number = 1.0;

  // Add PDF document storage
  private pdfDocument: any = null;

  private pdfLib: any = null;

  private touchStartY: number | null = null;
  private touchMoveThreshold = 50;
  private isScrolling = false;

  private handleKeyDown = async (e: KeyboardEvent) => {
    if (this.isPasswordPrompt) {
      e.preventDefault();

      if (e.key === "Enter") {
        await this.validatePassword();
      } else if (e.key === "Escape") {
        this.isPasswordPrompt = false;
        this.currentPassword = "";
        await this.displayItems();
      } else if (e.key === "Backspace") {
        this.currentPassword = this.currentPassword.slice(0, -1);
        await this.renderPasswordPrompt();
      } else if (e.key.length === 1) {
        // Only add printable characters
        this.currentPassword += e.key;
        await this.renderPasswordPrompt();
      }
      return;
    }

    if (this.isNavigating) return;

    if (this.isViewingFile) {
      // Add download shortcut
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        await this.downloadCurrentFile();
        return;
      }

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

    if (this.isPdfViewing) {
      if (e.key === "ArrowRight" && this.currentPdfPage < this.totalPdfPages) {
        this.currentPdfPage++;
        await this.renderPdfPage(this.pdfDocument, this.currentPdfPage);
      } else if (e.key === "ArrowLeft" && this.currentPdfPage > 1) {
        this.currentPdfPage--;
        await this.renderPdfPage(this.pdfDocument, this.currentPdfPage);
      } else if (e.key === "Escape") {
        this.isPdfViewing = false;
        this.currentPdfPage = 1;
        await this.displayItems();
      }
      return;
    }

    // Add escape key handling for root directory
    if (e.key === "Escape") {
      // Check if we're at root level (no items have parents)
      const isAtRoot = this.items.every((item) => !item.parent);
      if (isAtRoot) {
        await this.transition("home");
        return;
      }
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
    this.initializePdfLib();

    // Create our own canvas
    this.canvas = document.createElement("canvas");
    this.canvas.className = "absolute inset-0";
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.zIndex = "20";

    // Get parent element before appending canvas
    const parent = this.terminal.canvas.parentElement!;
    parent.appendChild(this.canvas);

    // Setup canvas context and other initializations
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

    // Add keyboard event listener
    window.addEventListener("keydown", this.handleKeyDown);

    // Add touch event handling
    this.setupTouchHandling();
  }

  private setupCanvas() {
    const parent = this.terminal.canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Store CSS dimensions for use in rendering
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    // Set actual canvas dimensions
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Set display size
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Scale context for retina displays
    this.ctx.scale(dpr, dpr);

    // Adjust font size for mobile
    const fontSize = this.isMobile() ? 14 : this.layout.sizes.text;
    this.ctx.font = `${fontSize}px "${this.layout.fontFamily}"`;
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
      color = this.layout.colors.foreground,
      size = this.layout.sizes.text,
      align = "left",
      weight = "normal",
      glow = true,
    } = options;

    this.ctx.font = `${weight} ${size}px "${this.layout.fontFamily}"`;

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
      const { glow: glowEffect } = this.layout.effects;
      this.ctx.save();

      for (let i = 0; i < glowEffect.passes; i++) {
        this.ctx.shadowColor = glowEffect.color;
        this.ctx.shadowBlur = glowEffect.blur * (i + 1) * 0.8;
        this.ctx.globalAlpha = (glowEffect.strength / glowEffect.passes) * 0.8;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, xPos, y);
      }

      this.ctx.restore();
    }

    // Draw the main text
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, xPos, y);
  }

  private async renderItems() {
    // If we're showing the password prompt, render that instead
    if (this.isPasswordPrompt) {
      await this.renderPasswordPrompt();
      return;
    }

    // Clear canvas (use stored CSS dimensions)
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // If loading, show simple loading message
    if (this.isLoading) {
      const centerY = this.canvas.height / (2 * window.devicePixelRatio);

      // Draw loading message
      this.drawText("ACCESSING QUANTUM STORAGE...", 0, centerY - 40, {
        color: this.layout.colors.foreground,
        align: "center",
        glow: true,
      });

      this.drawText("PLEASE MAINTAIN NEURAL LINK", 0, centerY, {
        color: this.layout.colors.dim,
        align: "center",
        glow: true,
      });

      // Add effects
      this.renderEffects();
      return;
    }

    let y = this.layout.padding.top;

    // Render ASCII header with stronger glow
    this.ctx.font = `bold ${this.layout.sizes.header}px "${this.layout.fontFamily}"`;
    this.ctx.fillStyle = this.layout.colors.foreground;

    // Use mobile or desktop header based on screen size
    const headerText = this.isMobile() ? this.mobileHeader : this.header;
    const headerLines = headerText.split("\n");

    for (const line of headerLines) {
      this.drawText(line, 0, y, {
        color: this.layout.colors.foreground,
        size: this.isMobile() ? 14 : this.layout.sizes.header,
        align: "center",
        weight: "bold",
        glow: true,
      });
      y += this.isMobile()
        ? this.layout.spacing.line * 0.8
        : this.layout.spacing.line;
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

    // Adjust padding and spacing for mobile
    const isMobile = this.isMobile();
    const sidePadding = isMobile ? 5 : this.layout.padding.left;
    const itemSpacing = isMobile ? 30 : this.layout.spacing.item;
    const fontSize = isMobile ? 14 : this.layout.sizes.text;

    // Render items
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const isSelected = i === this.selectedIndex;
      const indent = sidePadding + item.level * (isMobile ? 10 : 20);

      // Selection highlight
      if (isSelected) {
        this.ctx.fillStyle = this.layout.colors.selectedBackground;
        this.ctx.fillRect(
          sidePadding - 5,
          y - 4,
          this.canvas.width - sidePadding * 2,
          itemSpacing
        );

        // Selection marker
        this.ctx.fillStyle = this.layout.colors.foreground;
        this.ctx.fillRect(sidePadding - 5, y - 4, 2, itemSpacing);
      }

      // Set font and color for items
      this.ctx.font = `${fontSize}px "${this.layout.fontFamily}"`;
      this.ctx.fillStyle = isSelected
        ? this.layout.colors.highlight
        : item.isDirectory
        ? this.layout.colors.folder
        : this.layout.colors.file;

      // Draw item text with smaller icons for mobile
      const itemText = item.isDirectory
        ? `${item.expanded ? "▼" : "▶"} ${item.name}/`
        : `${this.getFileIcon(item.name)} ${item.name}`;
      this.ctx.fillText(itemText, indent, y);

      // Only show file type on desktop
      if (isSelected && !item.isDirectory && !isMobile) {
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

      y += itemSpacing;
    }

    // Adjust status bar for mobile
    const statusY =
      this.canvas.height / window.devicePixelRatio -
      (this.layout.padding.bottom + this.layout.spacing.line);

    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(0, statusY - 4, this.canvas.width, 1);

    // Simplified controls text for mobile
    const controlsText = isMobile
      ? "↑↓: Nav   ←→: Expand   ⏎: Open   ⬅: Back"
      : "↑/↓: Navigate   ←/→: Expand/Collapse   Enter: Open   Esc: Back";

    this.ctx.font = `${isMobile ? 12 : this.layout.sizes.small}px "${
      this.layout.fontFamily
    }"`;
    this.ctx.fillText(controlsText, sidePadding, statusY + 12);

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
    // Hide terminal canvas since we're using our own
    this.terminal.canvas.style.display = "none";

    // Fetch and display initial items
    await this.fetchAndDisplayItems();
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
      if (path.includes("vault")) {
        this.isLoading = true;
        await this.renderItems();
      }

      const response = await fetch(
        `/api/archive?path=${encodeURIComponent(path)}`
      );

      if (response.ok) {
        const items = await response.json();
        const mappedItems = items.map((item: FileMetadata) => ({
          ...item,
          expanded: false,
          children: [],
          level,
          parent,
        }));

        // Sort items: folders first, then files, both alphabetically
        return mappedItems.sort((a: FileSystemItem, b: FileSystemItem) => {
          // If both are directories or both are files, sort alphabetically
          if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
          }
          // If one is a directory and one is a file, directory comes first
          return a.isDirectory ? -1 : 1;
        });
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
      // Check if this is a protected path
      if (this.protectedPaths.has(item.name) && this.isLocked) {
        this.isPasswordPrompt = true;
        this.currentPassword = "";
        await this.renderPasswordPrompt();
        return;
      }

      // If not protected or already unlocked, proceed with expansion
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
        await this.viewFile(selectedItem, extension as "txt" | "md");
      } else {
        // Show download message for all other file types (including PDFs)
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

  // Modify viewFile method to handle PDFs
  private async viewFile(item: FileSystemItem, fileType: "txt" | "md") {
    try {
      const path = this.getFullPath(item);

      // First try to fetch existing file
      const response = await fetch(
        `/api/archive?path=${encodeURIComponent(path)}&view=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch file content");
      }

      const content = await response.text();

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
      // Show error message
      const centerY = this.canvas.height / (2 * window.devicePixelRatio);
      this.drawText("ERROR LOADING FILE", 0, centerY - 20, {
        color: TERMINAL_COLORS.error,
        align: "center",
        glow: true,
      });
      setTimeout(() => this.displayItems(), 2000);
    }
  }

  private async viewPdf(path: string) {
    try {
      if (!this.pdfLib) {
        await this.initializePdfLib();
      }

      if (!this.pdfLib) {
        throw new Error("Failed to initialize PDF.js");
      }

      this.isLoading = true;
      await this.renderItems();

      const response = await fetch(
        `/api/archive?path=${encodeURIComponent(path)}&view=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const arrayBuffer = await response.arrayBuffer();

      // Load PDF with additional options for better compatibility
      this.pdfDocument = await this.pdfLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        cMapUrl: "https://unpkg.com/pdfjs-dist/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "https://unpkg.com/pdfjs-dist/standard_fonts/",
        disableAutoFetch: true,
        disableStream: false,
      }).promise;

      this.totalPdfPages = this.pdfDocument.numPages;
      this.isPdfViewing = true;
      this.currentPdfPage = 1;

      // Render first page
      await this.renderPdfPage(this.pdfDocument, 1);
    } catch (error) {
      console.error("Error loading PDF:", error);
      // Reset viewing state
      this.isPdfViewing = false;
      this.pdfDocument = null;
      // Show error message
      const centerY = this.canvas.height / (2 * window.devicePixelRatio);
      this.drawText("ERROR LOADING PDF", 0, centerY - 20, {
        color: TERMINAL_COLORS.error,
        align: "center",
        glow: true,
      });
      // Return to file list after delay
      setTimeout(() => this.displayItems(), 2000);
    } finally {
      this.isLoading = false;
    }
  }

  private async renderPdfPage(pdf: any, pageNumber: number) {
    try {
      // Clear canvas
      this.ctx.fillStyle = this.layout.colors.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Get page
      const page = await pdf.getPage(pageNumber);

      // Calculate scale to fit width
      const viewport = page.getViewport({ scale: 1.0 });
      const availableWidth =
        this.canvas.width / window.devicePixelRatio -
        (this.layout.padding.left + this.layout.padding.right);
      this.pdfScale = availableWidth / viewport.width;

      // Update viewport with new scale
      const scaledViewport = page.getViewport({ scale: this.pdfScale });

      // Render PDF page
      await page.render({
        canvasContext: this.ctx,
        viewport: scaledViewport,
        transform: [
          1,
          0,
          0,
          1,
          this.layout.padding.left,
          this.layout.padding.top,
        ],
      }).promise;

      // Draw page info
      this.drawText(
        `Page ${pageNumber}/${this.totalPdfPages}`,
        0,
        this.canvas.height / window.devicePixelRatio - 40,
        {
          color: this.layout.colors.dim,
          align: "center",
        }
      );

      // Add effects
      this.renderEffects();
    } catch (error) {
      console.error("Error rendering PDF page:", error);
    }
  }

  private async renderFileContent() {
    // Clear canvas
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate max width for content (use 900px or 80% of screen width, whichever is smaller)
    const maxContentWidth = Math.min(
      900,
      (this.canvas.width / window.devicePixelRatio) * 0.8
    );
    const sidePadding =
      (this.canvas.width / window.devicePixelRatio - maxContentWidth) / 2;

    // Word wrap function
    const wrapText = (text: string): string[] => {
      // If the line is empty (paragraph break), return an empty line
      if (!text.trim()) {
        return [""];
      }

      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      this.ctx.font = `${this.layout.sizes.text}px "${this.layout.fontFamily}"`;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = this.ctx.measureText(testLine);

        if (metrics.width > maxContentWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Process all content lines with word wrap
    const wrappedLines: string[] = [];
    for (const line of this.contentLines) {
      wrappedLines.push(...wrapText(line));
    }

    // Calculate usable viewport height
    const viewportHeight =
      this.canvas.height / window.devicePixelRatio -
      (this.layout.padding.top +
        this.layout.padding.bottom +
        this.layout.spacing.line * 2);

    // Calculate how many lines can fit in the viewport
    this.linesPerPage = Math.floor(viewportHeight / this.layout.spacing.line);

    // Update max scroll offset based on wrapped content
    this.maxScrollOffset = Math.max(0, wrappedLines.length - this.linesPerPage);

    // Render visible lines
    let y = this.layout.padding.top;
    const visibleLines = wrappedLines.slice(
      this.scrollOffset,
      this.scrollOffset + this.linesPerPage
    );

    for (const line of visibleLines) {
      this.drawText(line, sidePadding, y, {
        color: this.layout.colors.foreground,
        glow: true,
      });
      y += this.layout.spacing.line;
    }

    // Draw scroll indicators if needed
    if (this.maxScrollOffset > 0) {
      this.renderScrollIndicators();
    }

    // Update footer
    const footerY =
      this.canvas.height / window.devicePixelRatio -
      (this.layout.padding.bottom + this.layout.spacing.line);

    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(0, footerY - 4, this.canvas.width, 1);

    this.drawText(
      "↑/↓: Scroll   PgUp/PgDn: Page   Ctrl+D: Download   Esc: Back",
      this.layout.padding.left,
      footerY + 12,
      {
        color: this.layout.colors.dim,
        glow: false,
      }
    );

    // Add effects on top
    this.renderEffects();
  }

  private renderScrollIndicators() {
    const scrollPercentage = this.scrollOffset / this.maxScrollOffset;
    const canvasHeight = this.canvas.height / window.devicePixelRatio;
    const scrollTrackHeight =
      canvasHeight - (this.layout.padding.top + this.layout.padding.bottom);
    const scrollThumbHeight = Math.max(
      20,
      (this.linesPerPage / this.contentLines.length) * scrollTrackHeight
    );
    const scrollBarY =
      this.layout.padding.top +
      (scrollTrackHeight - scrollThumbHeight) * scrollPercentage;

    // Render scroll track
    this.ctx.fillStyle = this.layout.colors.dim;
    this.ctx.fillRect(
      this.canvas.width / window.devicePixelRatio - 8,
      this.layout.padding.top,
      2,
      scrollTrackHeight
    );

    // Render scroll thumb
    this.ctx.fillStyle = this.layout.colors.foreground;
    this.ctx.fillRect(
      this.canvas.width / window.devicePixelRatio - 8,
      scrollBarY,
      2,
      scrollThumbHeight
    );
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
    await super.cleanup();
    // Remove event listeners
    window.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("wheel", this.handleWheel);

    // Remove CRT overlays
    const parent = this.canvas.parentElement;
    if (parent) {
      const overlays = parent.querySelectorAll(".pointer-events-none");
      overlays.forEach((overlay) => overlay.remove());
    }

    // Clear any timeouts
    if (this.glitchTimeout) {
      clearTimeout(this.glitchTimeout);
    }

    // Remove canvases
    this.canvas.remove();
    this.noiseCanvas.remove();

    // Show terminal canvas again
    this.terminal.canvas.style.display = "block";
    await this.terminal.clear();

    // Remove touch event listeners
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.canvas.removeEventListener("touchend", this.handleTouchEnd);
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
    // Apply CRT effect
    const { crt } = this.layout.effects;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Apply vignette
    const gradient = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.5
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${crt.vignetteStrength})`);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Apply scanlines
    const { scanlines } = this.layout.effects;
    this.ctx.fillStyle = `rgba(0,0,0,${scanlines.opacity})`;
    this.scanLineOffset =
      (this.scanLineOffset + scanlines.speed) % scanlines.spacing;

    for (let y = this.scanLineOffset; y < height; y += scanlines.spacing) {
      this.ctx.fillRect(0, y, width, scanlines.thickness);
    }

    // Add subtle noise
    this.ctx.globalAlpha = 0.02;
    this.ctx.drawImage(this.noiseCanvas, 0, 0, width, height);
    this.ctx.globalAlpha = 1.0;
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

  // Add new method for downloading files
  private async downloadCurrentFile() {
    const selectedItem = this.items[this.selectedIndex];
    const path = this.getFullPath(selectedItem);
    const extension = selectedItem.name.split(".").pop()?.toLowerCase();

    // Calculate centerY at the start of the method
    const centerY = this.canvas.height / (2 * window.devicePixelRatio);

    // Only allow downloading of text/markdown files
    if (extension !== "txt" && extension !== "md") {
      return;
    }

    try {
      // Show downloading message
      this.drawText("INITIATING QUANTUM TRANSFER...", 0, centerY - 20, {
        color: this.layout.colors.foreground,
        align: "center",
        glow: true,
      });

      // Fetch the file content
      const response = await fetch(
        `/api/archive?path=${encodeURIComponent(path)}&view=1`
      );
      if (!response.ok) throw new Error("Failed to fetch file");

      const content = await response.text();

      // Create blob and download
      const blob = new Blob([content], {
        type: extension === "md" ? "text/markdown" : "text/plain",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedItem.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message briefly
      this.drawText("TRANSFER COMPLETE", 0, centerY + 20, {
        color: this.layout.colors.foreground,
        align: "center",
        glow: true,
      });

      setTimeout(() => this.renderFileContent(), 1000);
    } catch (error) {
      console.error("Download error:", error);

      // Show error message
      this.drawText("TRANSFER FAILED", 0, centerY + 20, {
        color: TERMINAL_COLORS.error,
        align: "center",
        glow: true,
      });

      setTimeout(() => this.renderFileContent(), 1000);
    }
  }

  // Update renderPasswordPrompt to ensure it clears and renders properly
  private async renderPasswordPrompt() {
    // Clear the entire canvas first
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate center position
    const centerY = this.canvas.height / window.devicePixelRatio / 2;

    // Draw ASCII art border
    this.drawText("╔══════════════════════════════╗", 0, centerY - 100, {
      color: this.layout.colors.foreground,
      align: "center",
      glow: true,
    });

    // Draw warning header
    this.drawText("⚠ SECURE QUANTUM VAULT ACCESS ⚠", 0, centerY - 80, {
      color: this.layout.colors.foreground,
      align: "center",
      glow: true,
    });

    // Draw authentication prompt
    this.drawText("ENTER NEURAL AUTHENTICATION KEY:", 0, centerY - 20, {
      color: this.layout.colors.dim,
      align: "center",
    });

    // Draw password field with cursor
    const dots = "•".repeat(this.currentPassword.length);
    this.drawText(`${dots}█`, 0, centerY + 20, {
      color: this.layout.colors.foreground,
      align: "center",
      glow: true,
    });

    // Draw error message if there are incorrect attempts
    if (this.incorrectAttempts > 0) {
      this.drawText(
        `ACCESS DENIED - NEURAL PATTERN MISMATCH (${this.incorrectAttempts}/3)`,
        0,
        centerY + 60,
        {
          color: TERMINAL_COLORS.error,
          align: "center",
        }
      );
    }

    // Draw bottom border
    this.drawText("╚══════════════════════════════╝", 0, centerY + 100, {
      color: this.layout.colors.foreground,
      align: "center",
      glow: true,
    });

    // Add effects
    this.renderEffects();
  }

  // Add password validation
  private async validatePassword() {
    // TODO: Replace with actual password validation logic
    const correctPassword = "REALITY-897";

    if (this.currentPassword === correctPassword) {
      this.isPasswordPrompt = false;
      this.isLocked = false;
      this.incorrectAttempts = 0;
      this.currentPassword = "";
      await this.expandItem();
    } else {
      this.incorrectAttempts++;
      this.currentPassword = "";
      if (this.incorrectAttempts >= 3) {
        // Lock out after 3 attempts
        this.isPasswordPrompt = false;
        await this.displayItems();
      } else {
        await this.renderPasswordPrompt();
      }
    }
  }

  private async initializePdfLib() {
    try {
      // Dynamically import PDF.js only when needed
      const PDFJS = await import("pdfjs-dist");
      this.pdfLib = PDFJS;

      // Use correct file extension for ES modules
      const workerUrl = `https://unpkg.com/pdfjs-dist@${PDFJS.version}/build/pdf.worker.min.mjs`;
      this.pdfLib.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch (error) {
      console.error("Failed to initialize PDF.js:", error);
    }
  }

  // Add isMobile helper method
  private isMobile(): boolean {
    return window.innerWidth < 480;
  }

  private setupTouchHandling() {
    // Ensure parent can receive touch events
    const parent = this.terminal.canvas.parentElement;
    if (parent) {
      parent.style.touchAction = "none";
      parent.style.pointerEvents = "auto";
    }

    // Add touch event listeners
    this.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    this.canvas.addEventListener("touchend", this.handleTouchEnd, {
      passive: true,
    });
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartY = touch.clientY;
    this.isScrolling = false;

    // Calculate which item was touched
    if (!this.isViewingFile) {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Adjust touch position for device pixel ratio and canvas scaling
      const y = (touch.clientY - rect.top) * dpr;

      // Calculate header height including all components
      const headerLines = this.header.split("\n").length;
      const headerHeight =
        (this.layout.padding.top + // Initial padding
          headerLines * this.layout.spacing.line + // ASCII header height
          this.layout.spacing.line + // Extra space after ASCII
          this.layout.spacing.line + // Path display line
          this.layout.spacing.line + // Separator line
          this.layout.spacing.line / 2) * // Half line adjustment
        dpr;

      // Calculate item spacing with proper scaling
      const isMobile = this.isMobile();
      const itemSpacing = (isMobile ? 30 : this.layout.spacing.item) * dpr;

      // Calculate touched index with offset adjustment
      const touchedIndex = Math.floor(
        (y - headerHeight + itemSpacing / 2) / itemSpacing
      );

      // Debug logging
      console.log({
        y,
        headerHeight,
        adjustedY: y - headerHeight,
        itemSpacing,
        touchedIndex,
        dpr,
        totalItems: this.items.length,
        headerLines: headerLines,
      });

      // Update selection if valid index
      if (touchedIndex >= 0 && touchedIndex < this.items.length) {
        this.selectedIndex = touchedIndex;
        this.renderItems();
      }
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.touchStartY) return;

    const touch = e.touches[0];
    const deltaY = this.touchStartY - touch.clientY;

    if (Math.abs(deltaY) > this.touchMoveThreshold) {
      this.isScrolling = true;
      if (this.isViewingFile) {
        // Handle file content scrolling
        const scrollAmount = Math.sign(deltaY);
        this.scrollOffset = Math.max(
          0,
          Math.min(this.maxScrollOffset, this.scrollOffset + scrollAmount * 3) // Increased scroll speed
        );
        this.renderFileContent();
      } else {
        // Handle item list scrolling
        const scrollAmount = Math.sign(deltaY);
        this.selectedIndex = Math.max(
          0,
          Math.min(this.items.length - 1, this.selectedIndex + scrollAmount)
        );
        this.renderItems();
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (!this.isScrolling) {
      // Get touch position
      const touch = e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const y = touch.clientY - rect.top;

      // Check if touch is in the bottom status bar area
      const statusY =
        this.canvas.height / window.devicePixelRatio -
        (this.layout.padding.bottom + this.layout.spacing.line);

      if (y > statusY) {
        // Handle back button touch
        if (this.isViewingFile) {
          this.isViewingFile = false;
          this.scrollOffset = 0;
          this.displayItems();
        } else {
          // Check if we're at root level
          const isAtRoot = this.items.every((item) => !item.parent);
          if (isAtRoot) {
            this.transition("home");
          } else {
            // Go back to parent directory
            const currentItem = this.items[this.selectedIndex];
            if (currentItem.parent) {
              const parentIndex = this.items.indexOf(currentItem.parent);
              if (parentIndex !== -1) {
                this.selectedIndex = parentIndex;
                currentItem.parent.expanded = false;
                this.removeChildren(parentIndex);
                this.displayItems();
              }
            }
          }
        }
        return;
      }

      // Only proceed with item selection if we have a valid selected index
      if (this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {
        if (this.isPasswordPrompt) {
          // Close password prompt on tap
          this.isPasswordPrompt = false;
          this.currentPassword = "";
          this.displayItems();
        } else if (this.isViewingFile) {
          // Close the file view
          this.isViewingFile = false;
          this.scrollOffset = 0;
          this.displayItems();
        } else {
          // Get the selected item
          const selectedItem = this.items[this.selectedIndex];

          // Check if this is a protected path before expanding
          if (
            selectedItem.isDirectory &&
            !selectedItem.expanded &&
            this.protectedPaths.has(selectedItem.name) &&
            this.isLocked
          ) {
            this.isPasswordPrompt = true;
            this.currentPassword = "";
            this.renderPasswordPrompt();
          } else if (selectedItem.isDirectory && selectedItem.expanded) {
            // If it's an expanded directory, collapse it
            selectedItem.expanded = false;
            this.removeChildren(this.selectedIndex);
            this.displayItems();
          } else {
            // Otherwise handle normal selection/expansion
            this.selectItem();
          }
        }
      }
    }

    this.touchStartY = null;
    this.isScrolling = false;
  };
}

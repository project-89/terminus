import { BaseScreen } from "./BaseScreen";
import { Terminal } from "../Terminal";

export class ArchivesDashboardScreen extends BaseScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(context: { terminal: Terminal }) {
    super(context);

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "24";
    this.canvas.style.pointerEvents = "auto";
    const parent = this.terminal.canvas.parentElement!;
    parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;
    this.setupCanvas();

    window.addEventListener("resize", this.handleResize);
  }

  private setupCanvas() {
    const parent = this.terminal.canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.terminal.setCommandAccess(true);
  }

  protected handleResize = () => {
    this.setupCanvas();
    this.renderUI();
  };

  private renderUI() {
    // Clear
    this.ctx.fillStyle = this.terminal.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const padding = 16;
    const sideW = Math.max(280, this.width * 0.26);
    const rightW = Math.max(280, this.width * 0.28);
    const topH = 90;

    this.drawPanel(
      this.ctx,
      { x: padding, y: padding, w: this.width - padding * 2, h: topH },
      "ARCHIVES // INDEX"
    );
    this.drawPanel(
      this.ctx,
      {
        x: padding,
        y: padding + topH + 12,
        w: sideW,
        h: this.height - (padding * 2 + topH + 12),
      },
      "COLLECTIONS"
    );
    this.drawPanel(
      this.ctx,
      {
        x: padding + sideW + 12,
        y: padding + topH + 12,
        w: this.width - (padding * 3 + sideW + rightW + 12),
        h: this.height - (padding * 2 + topH + 12),
      },
      "VIEWER"
    );
    this.drawPanel(
      this.ctx,
      {
        x: this.width - rightW - padding,
        y: padding + topH + 12,
        w: rightW,
        h: this.height - (padding * 2 + topH + 12),
      },
      "METADATA & ACTIVITY"
    );

    // Header stats placeholders
    this.ctx.fillStyle = "#2fb7c3";
    this.ctx.font = `14px ${this.terminal.options.fontFamily}`;
    [
      "Collections: 42",
      "Documents: 1,283",
      "Media: 97",
      "Last index: OK",
    ].forEach((t, i) =>
      this.ctx.fillText(t, padding + 12 + i * 200, padding + 32)
    );

    // Lists placeholders
    this.ctx.fillStyle = "rgba(255,255,255,0.75)";
    this.ctx.font = `13px ${this.terminal.options.fontFamily}`;
    const listX = padding + 24;
    let y = padding + topH + 40;
    [
      "Vault / Chronos",
      "Vault / Chimera",
      "Journal Notes",
      "Foundational Docs",
    ].forEach((n) => {
      this.ctx.fillText(`• ${n}`, listX, y);
      y += 22;
    });

    // Viewer placeholder
    const viewerX = padding + sideW + 24;
    const viewerY = padding + topH + 40;
    this.ctx.fillStyle = "rgba(47,183,195,0.2)";
    this.ctx.fillRect(viewerX, viewerY, 360, 220);
    this.ctx.fillStyle = "rgba(255,255,255,0.7)";
    this.ctx.fillText("[Preview Area]", viewerX + 12, viewerY + 16);
  }

  async render(): Promise<void> {
    this.terminal.setCursorOptions({ centered: false, leftPadding: 20 });
    this.terminal.setCommandAccess(true);
    await this.terminal.clear();
    this.renderUI();
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    window.removeEventListener("resize", this.handleResize);
    this.canvas.remove();
  }
}

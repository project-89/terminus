import { BaseScreen } from "./BaseScreen";
import { Terminal } from "../Terminal";

export class AdminDashboardScreen extends BaseScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private animationFrame = 0;
  private rotation = 0;
  private points: { lat: number; lon: number; weight: number }[] = [];
  private opsTools: Array<{ name: string; title: string; description?: string }> = [];
  private experiences: Array<{ label: string; route: string }>; 
  private onClickBound = (e: MouseEvent) => this.handleClick(e);

  constructor(context: { terminal: Terminal }) {
    super(context);

    // Create overlay canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "25";
    this.canvas.style.pointerEvents = "auto";

    const parent = this.terminal.canvas.parentElement!;
    parent.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d")!;
    this.setupCanvas();

    // Seed a few anomaly points
    this.points = [
      { lat: 37.7749, lon: -122.4194, weight: 0.9 }, // SF
      { lat: 51.5074, lon: -0.1278, weight: 0.6 }, // London
      { lat: 35.6895, lon: 139.6917, weight: 0.7 }, // Tokyo
      { lat: -33.8688, lon: 151.2093, weight: 0.5 }, // Sydney
      { lat: 40.7128, lon: -74.006, weight: 0.8 }, // NYC
    ];

    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("click", this.onClickBound);
    this.loadOpsTools().catch(() => {});
    this.experiences = [
      { label: "Adventure", route: "adventure" },
      { label: "Archives", route: "archives" },
      { label: "Scanning", route: "scanning" },
      { label: "Static", route: "static" },
      { label: "Home", route: "home" },
    ];
    this.animate();
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

    // Enable command input on dashboard
    this.terminal.setCommandAccess(true);
  }

  protected handleResize = () => {
    this.setupCanvas();
    this.renderUI(0);
  };

  private project(lat: number, lon: number, r: number, cx: number, cy: number) {
    // Convert to radians
    const phi = (lat * Math.PI) / 180;
    const theta = (lon * Math.PI) / 180 + this.rotation;
    // 3D sphere to 2D orthographic
    const x = r * Math.cos(phi) * Math.cos(theta);
    const y = r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.sin(theta);
    // Only draw front hemisphere (z >= 0)
    return { x: cx + x, y: cy - y, front: z >= 0 };
  }

  private drawGlobe(timestamp: number) {
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    const r = Math.min(this.width, this.height) * 0.26;

    // Sphere base
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(47,183,195,0.35)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.stroke();

    // Meridians and parallels
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "rgba(47,183,195,0.2)";
    for (let i = -60; i <= 60; i += 30) {
      // latitude
      const lat = (i * Math.PI) / 180;
      const ry = r * Math.sin(lat);
      const rx = r * Math.cos(lat);
      this.ctx.beginPath();
      for (let a = 0; a <= 360; a += 5) {
        const theta = (a * Math.PI) / 180;
        const x = cx + rx * Math.cos(theta + this.rotation);
        const y = cy + ry;
        if (a === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }
    for (let j = 0; j < 360; j += 30) {
      this.ctx.beginPath();
      for (let a = -90; a <= 90; a += 5) {
        const p = this.project(a, j, r, cx, cy);
        if (!p.front) continue;
        if (a === -90) this.ctx.moveTo(p.x, p.y);
        else this.ctx.lineTo(p.x, p.y);
      }
      this.ctx.stroke();
    }

    // Points
    for (const pt of this.points) {
      const p = this.project(pt.lat, pt.lon, r, cx, cy);
      if (!p.front) continue;
      this.ctx.fillStyle = `rgba(47,183,195,${0.35 + pt.weight * 0.4})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3 + pt.weight * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private renderUI(timestamp: number) {
    // Clear
    this.ctx.fillStyle = this.terminal.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Panels
    const padding = 16;
    const sideW = Math.max(260, this.width * 0.24);
    const rightW = Math.max(320, this.width * 0.28);
    const topH = 90;

    this.drawPanel(
      this.ctx,
      { x: padding, y: padding, w: this.width - padding * 2, h: topH },
      "PROJECT 89 // OPS OVERVIEW"
    );
    this.drawPanel(
      this.ctx,
      {
        x: padding,
        y: padding + topH + 12,
        w: sideW,
        h: this.height - (padding * 2 + topH + 12),
      },
      "AGENTS"
    );
    this.drawPanel(
      this.ctx,
      {
        x: padding + sideW + 12,
        y: padding + topH + 12,
        w: this.width - (padding * 3 + sideW + rightW + 12),
        h: this.height - (padding * 2 + topH + 12),
      },
      "MISSIONS"
    );
    this.drawPanel(
      this.ctx,
      {
        x: this.width - rightW - padding,
        y: padding + topH + 12,
        w: rightW,
        h: this.height - (padding * 2 + topH + 12),
      },
      "OPS TOOLS & EXPERIENCES"
    );

    // Stats badges
    this.ctx.fillStyle = "#2fb7c3";
    this.ctx.font = `14px ${this.terminal.options.fontFamily}`;
    const badges = [
      "Agents: 12 active",
      "Anomalies: 5 today",
      "Missions: 8 open",
      "Trust Index: 0.72",
    ];
    badges.forEach((b, i) => {
      const x = padding + 12 + i * 180;
      const y = padding + 32;
      this.ctx.fillText(b, x, y);
    });

    // Globe in the center of Missions panel
    this.drawGlobe(timestamp);

    // Placeholder lists
    this.ctx.fillStyle = "rgba(255,255,255,0.7)";
    this.ctx.font = `13px ${this.terminal.options.fontFamily}`;
    const agentX = padding + 24;
    let agentY = padding + topH + 36;
    ["Echo-7", "Vesper-2", "Atlas-9", "Noir-3"].forEach((a) => {
      this.ctx.fillText(`• ${a}`, agentX, agentY);
      agentY += 22;
    });

    // OPS panel lists: tools and experiences
    const opsX = this.width - rightW - padding + 16;
    let y = padding + topH + 36;
    this.ctx.fillStyle = "#2fb7c3";
    this.ctx.fillText("Tools", opsX, y);
    y += 18;
    this.ctx.fillStyle = "rgba(255,255,255,0.8)";
    const lineH = 22;
    // Render tools
    this.opsTools.forEach((t, idx) => {
      this.ctx.fillText(`• ${t.name} – ${t.title}`, opsX, y);
      // Store a lightweight hit area per item
      (this as any)._toolHits = (this as any)._toolHits || [];
      (this as any)._toolHits[idx] = { x: opsX, y, w: rightW - 32, h: lineH, name: t.name };
      y += lineH;
    });

    // Experiences header
    y += 10;
    this.ctx.fillStyle = "#2fb7c3";
    this.ctx.fillText("Experiences", opsX, y);
    y += 18;
    this.ctx.fillStyle = "rgba(255,255,255,0.8)";
    this.experiences.forEach((e, idx) => {
      this.ctx.fillText(`• ${e.label}`, opsX, y);
      (this as any)._expHits = (this as any)._expHits || [];
      (this as any)._expHits[idx] = { x: opsX, y, w: rightW - 32, h: lineH, route: e.route };
      y += lineH;
    });
  }

  private animate = (timestamp: number = 0) => {
    this.rotation += 0.0025;
    this.renderUI(timestamp);
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  async render(): Promise<void> {
    this.terminal.setCursorOptions({ centered: false, leftPadding: 20 });
    this.terminal.setCommandAccess(true);
    // Hide base terminal buffer for a clean dashboard feel
    await this.terminal.clear();
    this.renderUI(0);
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    window.removeEventListener("resize", this.handleResize);
    this.canvas.removeEventListener("click", this.onClickBound);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.canvas.remove();
  }

  private async loadOpsTools() {
    try {
      const res = await fetch(`/api/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      this.opsTools = (data?.tools || []) as Array<{ name: string; title: string; description?: string }>;
      this.renderUI(0);
    } catch (e) {
      // ignore
    }
  }

  private async handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const toolHits = (this as any)._toolHits as Array<{ x: number; y: number; w: number; h: number; name: string }> | undefined;
    if (toolHits) {
      for (const hit of toolHits) {
        if (!hit) continue;
        if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y - 14 && y <= hit.y + hit.h) {
          // Run tool: hide overlay to show streamed output, then restore
          try {
            this.canvas.style.display = "none";
            const res = await fetch(`/api/tools`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "run", name: hit.name, input: "" }),
            });
            if (res.body) {
              await this.terminal.processAIStream(res.body);
            } else {
              const text = await res.text();
              await this.terminal.print(text, { speed: "fast" });
            }
          } catch (err) {
            await this.terminal.print(`Tool failed: ${String(err)}`);
          } finally {
            this.canvas.style.display = "block";
          }
          return;
        }
      }
    }
    const expHits = (this as any)._expHits as Array<{ x: number; y: number; w: number; h: number; route: string }> | undefined;
    if (expHits) {
      for (const hit of expHits) {
        if (!hit) continue;
        if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y - 14 && y <= hit.y + hit.h) {
          (this.terminal as any).emit("screen:transition", { to: hit.route });
          return;
        }
      }
    }
  }
}

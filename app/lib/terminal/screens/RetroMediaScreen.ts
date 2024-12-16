import { BaseScreen } from "./BaseScreen";
import { Terminal, TERMINAL_COLORS } from "../Terminal";

interface Track {
  title: string;
  path: string;
  duration: number;
}

export class RetroMediaScreen extends BaseScreen {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private audioElement!: HTMLAudioElement;
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private tracks: Track[] = [];
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private selectedIndex: number = 0;
  private visualizerData!: Uint8Array;
  private animationFrame: number | null = null;
  private scrubberPosition: number = 0;
  private isDraggingScrubber: boolean = false;

  private layout = {
    colors: {
      background: "#090812",
      text: "#5cfffa",
      visualizer: "rgba(92, 255, 250, 0.8)",
      playbar: "rgba(92, 255, 250, 0.3)",
      selection: "rgba(92, 255, 250, 0.1)",
      dim: "rgba(92, 255, 250, 0.4)",
    },
    visualizer: {
      height: 120,
      barWidth: 4,
      barSpacing: 2,
      barCount: 64,
    },
    fontFamily: "Berkeley Mono",
    textShadow: {
      color: "rgba(92, 255, 250, 0.6)",
      blur: "10px",
      offset: "0px",
    },
  };

  constructor(context: { terminal: Terminal }) {
    super(context);
    this.setupAudio();
    this.setupCanvas();
    this.loadTracks();
    this.addEventListeners();
  }

  private setupAudio() {
    this.audioElement = new Audio();
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaElementSource(
      this.audioElement
    );
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.visualizerData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  private async loadTracks() {
    try {
      const response = await fetch("/api/media");
      if (!response.ok) throw new Error("Failed to load tracks");
      this.tracks = await response.json();

      // Add metadata load handler
      this.audioElement.addEventListener("loadedmetadata", () => {
        if (
          this.currentTrackIndex >= 0 &&
          this.currentTrackIndex < this.tracks.length
        ) {
          this.tracks[this.currentTrackIndex].duration =
            this.audioElement.duration;
          this.renderPlaylist(); // Re-render to show updated duration
        }
      });
    } catch (error) {
      console.error("Error loading tracks:", error);
      this.tracks = [];
    }
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    options: {
      color?: string;
      align?: "left" | "center" | "right";
      glow?: boolean;
    } = {}
  ) {
    const {
      color = this.layout.colors.text,
      align = "left",
      glow = true,
    } = options;

    this.ctx.save();
    if (glow) {
      this.ctx.shadowColor = this.layout.textShadow.color;
      this.ctx.shadowBlur = parseInt(this.layout.textShadow.blur);
      this.ctx.shadowOffsetX = parseInt(this.layout.textShadow.offset);
      this.ctx.shadowOffsetY = parseInt(this.layout.textShadow.offset);
    }

    this.ctx.fillStyle = color;

    if (align === "center") {
      const width = this.ctx.measureText(text).width;
      x = (this.canvas.width / window.devicePixelRatio - width) / 2;
    } else if (align === "right") {
      const width = this.ctx.measureText(text).width;
      x = this.canvas.width / window.devicePixelRatio - width - 20;
    }

    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  private renderVisualizer() {
    this.analyser.getByteFrequencyData(this.visualizerData);

    // Clear visualizer area with slight trail effect
    this.ctx.fillStyle = "rgba(9, 8, 18, 0.3)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.layout.visualizer.height);

    const barWidth = this.layout.visualizer.barWidth;
    const spacing = this.layout.visualizer.barSpacing;
    const barCount = this.layout.visualizer.barCount;

    // Draw reflection gradient
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      this.layout.visualizer.height
    );
    gradient.addColorStop(0, this.layout.colors.visualizer);
    gradient.addColorStop(1, "rgba(92, 255, 250, 0.1)");

    for (let i = 0; i < barCount; i++) {
      const height =
        (this.visualizerData[i] / 255) * this.layout.visualizer.height;

      // Add glow effect
      this.ctx.shadowColor = this.layout.colors.visualizer;
      this.ctx.shadowBlur = 15;

      // Draw bar
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        i * (barWidth + spacing),
        this.layout.visualizer.height - height,
        barWidth,
        height
      );
    }

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  private renderPlaylist() {
    const startY = this.layout.visualizer.height + 40;
    const itemHeight = 30;

    this.tracks.forEach((track, index) => {
      const isSelected = index === this.selectedIndex;
      const isPlaying = index === this.currentTrackIndex;

      // Background for selected item
      if (isSelected) {
        this.ctx.fillStyle = this.layout.colors.selection;
        this.ctx.fillRect(
          20,
          startY + index * itemHeight,
          this.canvas.width - 40,
          itemHeight
        );
      }

      // Track number and icon
      this.ctx.fillStyle = isSelected
        ? this.layout.colors.text
        : this.layout.colors.dim;
      this.ctx.fillText(
        `${(index + 1).toString().padStart(2, "0")} ${isPlaying ? "▶" : " "}`,
        30,
        startY + index * itemHeight + 20
      );

      // Track title
      this.ctx.fillText(track.title, 80, startY + index * itemHeight + 20);

      // Duration - use our new formatTime helper
      const duration = this.formatTime(track.duration);
      this.ctx.fillText(
        duration,
        this.canvas.width - 70,
        startY + index * itemHeight + 20
      );
    });
  }

  private renderPlaybar() {
    const y = this.canvas.height - 60;

    // Progress bar background
    this.ctx.fillStyle = this.layout.colors.playbar;
    this.ctx.fillRect(20, y, this.canvas.width - 40, 4);

    // Progress bar fill
    if (this.audioElement.duration) {
      const progress =
        this.audioElement.currentTime / this.audioElement.duration;
      this.ctx.fillStyle = this.layout.colors.text;
      this.ctx.fillRect(20, y, (this.canvas.width - 40) * progress, 4);
    }

    // Time display - use our new formatTime helper
    const currentTime = this.formatTime(this.audioElement.currentTime);
    const totalTime = this.formatTime(this.audioElement.duration);

    this.ctx.fillStyle = this.layout.colors.text;
    this.ctx.fillText(`${currentTime} / ${totalTime}`, 20, y + 20);

    // Controls
    const controls = "⏮   ⏸/▶   ⏭";
    const controlsWidth = this.ctx.measureText(controls).width;
    this.ctx.fillText(
      controls,
      (this.canvas.width - controlsWidth) / 2,
      y + 20
    );
  }

  private animate = () => {
    this.renderVisualizer();
    this.renderPlaylist();
    this.renderPlaybar();
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case " ":
        this.togglePlayPause();
        break;
      case "ArrowUp":
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        break;
      case "ArrowDown":
        this.selectedIndex = Math.min(
          this.tracks.length - 1,
          this.selectedIndex + 1
        );
        break;
      case "Enter":
        this.playTrack(this.selectedIndex);
        break;
      // Add more controls...
    }
  };

  private togglePlayPause() {
    if (this.isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  private playTrack(index: number) {
    if (index >= 0 && index < this.tracks.length) {
      this.currentTrackIndex = index;
      this.audioElement.src = this.tracks[index].path;
      this.audioElement.play();
      this.isPlaying = true;
    }
  }

  async render(): Promise<void> {
    // Hide terminal canvas
    this.terminal.canvas.style.display = "none";

    // Clear any existing canvas
    const parent = this.terminal.canvas.parentElement!;
    const existingCanvas = parent.querySelector("canvas:not(.terminal-canvas)");
    if (existingCanvas) {
      existingCanvas.remove();
    }

    // Add our canvas to DOM
    parent.appendChild(this.canvas);

    // Add CRT overlay elements
    const crtOverlay = document.createElement("div");
    crtOverlay.className =
      "pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10";
    parent.appendChild(crtOverlay);

    const scanlineOverlay = document.createElement("div");
    scanlineOverlay.className =
      "pointer-events-none absolute inset-0 bg-[url('/scanline.png')] opacity-5";
    parent.appendChild(scanlineOverlay);

    // Initial clear of canvas
    this.ctx.fillStyle = this.layout.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw title
    this.drawText("QUANTUM AUDIO INTERFACE", 0, 30, {
      color: this.layout.colors.text,
      align: "center",
      glow: true,
    });

    // Start animation
    this.animate();
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.audioElement.pause();
    this.audioContext.close();
    window.removeEventListener("keydown", this.handleKeyDown);

    // Remove CRT overlays
    const parent = this.canvas.parentElement;
    if (parent) {
      const overlays = parent.querySelectorAll(".pointer-events-none");
      overlays.forEach((overlay) => overlay.remove());
    }

    this.canvas.remove();
    this.terminal.canvas.style.display = "block";
  }

  private setupCanvas() {
    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.className = "absolute inset-0";
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.zIndex = "20";
    this.canvas.style.backgroundColor = this.layout.colors.background; // Add background color

    // Get context
    this.ctx = this.canvas.getContext("2d")!;

    // Set canvas dimensions
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
    this.ctx.font = `16px "${this.layout.fontFamily}"`;
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this.layout.colors.text;

    // Add canvas to DOM
    parent.appendChild(this.canvas);

    // Add event listeners
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private addEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  // Add a debug method
  private debug() {
    console.log({
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      isVisible: this.canvas.style.display !== "none",
      parent: this.canvas.parentElement,
      context: !!this.ctx,
    });
  }
}

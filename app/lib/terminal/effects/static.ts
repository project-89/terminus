export class StaticEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame: number | null = null;
  private intensity: number = 1.0;
  private pixelSize: number = 6;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true })!;
    this.setupCanvas();
  }

  private setupCanvas() {
    const parent = this.canvas.parentElement!;
    const rect = parent.getBoundingClientRect();

    // Set actual dimensions
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Set display size
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
  }

  public start() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animate();
  }

  public stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  public setIntensity(intensity: number) {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Create a distortion map based on time
    const time = performance.now() * 0.001;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = 300; // Area of distortion

    // Draw static noise with membrane-like distortion
    for (let y = 0; y < this.canvas.height; y += this.pixelSize) {
      for (let x = 0; x < this.canvas.width; x += this.pixelSize) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Create pushing effect
        let distortion = 0;
        if (distance < radius) {
          // Calculate how much the static should be "pushed" at this point
          distortion =
            Math.cos((distance / radius) * Math.PI) * 20 * this.intensity;
          distortion *= Math.sin(time * 2) * 0.3 + 0.7; // Pulsing effect
        }

        // Add some noise variation
        const noiseValue = Math.random();
        const value = Math.floor(
          (noiseValue * 200 + 55) * (1 - (distance / radius) * 0.5)
        );

        // Draw the static pixel with distortion
        this.ctx.fillStyle = `rgb(${value},${value},${value})`;
        this.ctx.globalAlpha =
          this.intensity * (1 - (distance < radius ? 0.3 : 0));

        // Apply the membrane-like distortion
        const offsetX = (dx / distance) * distortion || 0;
        const offsetY = (dy / distance) * distortion || 0;

        this.ctx.fillRect(
          x + offsetX,
          y + offsetY,
          this.pixelSize,
          Math.floor(this.pixelSize * 1.2)
        );
      }
    }

    // Add scanlines with distortion
    if (this.intensity > 0.1) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * this.intensity})`;
      for (let y = 0; y < this.canvas.height; y += 16) {
        const distortion = Math.sin(y * 0.01 + time) * 5;
        this.ctx.fillRect(0, y + distortion, this.canvas.width, 2);
      }
    }

    // Add occasional tears that follow the distortion
    if (Math.random() < 0.03 * this.intensity) {
      const x = centerX + (Math.random() - 0.5) * radius;
      const width = 40;
      const distortion = Math.sin(time * 3) * 10;
      this.ctx.drawImage(
        this.canvas,
        x,
        0,
        width,
        this.canvas.height,
        x + distortion,
        0,
        width,
        this.canvas.height
      );
    }

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  public async transitionIntensity(target: number, duration: number) {
    console.log(
      `Transitioning static intensity from ${this.intensity} to ${target}`
    );
    const start = this.intensity;
    const startTime = performance.now();

    return new Promise<void>((resolve) => {
      const animate = () => {
        const now = performance.now();
        const progress = Math.min(1, (now - startTime) / duration);
        this.intensity = start + (target - start) * this.easeInOut(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log(
            `Static intensity transition complete: ${this.intensity}`
          );
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

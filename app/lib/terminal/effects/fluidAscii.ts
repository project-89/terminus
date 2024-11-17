export class FluidAscii {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Array<{
    char: string;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    offsetX: number;
    offsetY: number;
    orbit: number;
    angle: number;
    destination: string;
    vx: number;
    vy: number;
    opacity: number;
    mass: number;
    absorbed: boolean;
    activated: boolean;
    flowStrength: number;
    radius: number;
    z: number;
  }> = [];
  private chars = "@.&*?89".split("");
  private animationFrame: number | null = null;
  private time: number = 0;
  private cellSize: number = 14;
  private solarSystemMode: boolean = false;
  private centralPoint = { x: 0, y: 0 };
  private orbits: Array<{
    radius: number;
    speed: number;
    direction: number;
  }> = [];

  private physics = {
    G: 0.0000005, // Gravitational constant
    centralMass: 5, // Will grow gradually
    particleMass: 2,
    dragCoefficient: 0.995, // Fluid-like drag
    maxSpeed: 1.2, // Max speed
    timeStep: 0.5,
    spiralStrength: 0.5, // Spiral force
    inwardForce: 0.1, // Inward pull
    tiltAngle: 0, // Current tilt angle
    maxTiltAngle: 0.6, // Maximum tilt (about 35 degrees)
    tiltSpeed: 0.00001, // How fast the tilt develops
  };

  // Perspective and galaxy parameters
  private galaxy = {
    tilt: Math.PI * 0.2, // 20-degree tilt
    rotation: 0, // Current rotation angle
    spiralTightness: 0.2, // How tight the spiral arms are
    armCount: 4, // Number of spiral arms
    scale: 2, // Overall scale of the galaxy
    centerX: 0,
    centerY: 0,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.setupCanvas();
    this.initGrid();
  }

  private setupCanvas() {
    const parent = this.canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.ctx.font = `${this.cellSize}px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#2fb7c3";
  }

  private initGrid() {
    const padding = 400;
    const cols = Math.ceil((this.canvas.width + padding * 2) / this.cellSize);
    const rows = Math.ceil((this.canvas.height + padding * 2) / this.cellSize);
    const startX = -padding;
    const startY = -padding;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.grid.push({
          char: this.chars[Math.floor(Math.random() * this.chars.length)],
          x: startX + x * this.cellSize,
          y: startY + y * this.cellSize,
          baseX: startX + x * this.cellSize,
          baseY: startY + y * this.cellSize,
          offsetX: 0,
          offsetY: 0,
          orbit: 0,
          angle: 0,
          destination: "",
          vx: 0,
          vy: 0,
          opacity: 1,
          mass: 0,
          absorbed: false,
          activated: false,
          flowStrength: 0,
          radius: 0,
          z: 0,
        });
      }
    }

    console.log(`Created grid: ${cols}x${rows} characters`);
  }

  private transformPoint(x: number, y: number): { x: number; y: number } {
    // Apply tilt transformation
    const tiltedY = y * Math.cos(this.physics.tiltAngle);
    const scale = 1 + (y * Math.sin(this.physics.tiltAngle)) / 1000;

    return {
      x: x * scale,
      y: tiltedY,
    };
  }

  private animate = () => {
    this.time += this.physics.timeStep;

    // Clear canvas
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Gradually increase tilt
    if (this.physics.tiltAngle < this.physics.maxTiltAngle) {
      this.physics.tiltAngle += this.physics.tiltSpeed;
    }

    // Draw all visible characters with tilt transformation
    this.grid.forEach((point) => {
      if (!point.absorbed) {
        // Apply tilt transformation to point position
        const transformed = this.transformPoint(
          point.x - this.galaxy.centerX,
          point.y - this.galaxy.centerY
        );

        // Draw character at transformed position
        this.ctx.fillStyle = "#2fb7c3";
        this.ctx.fillText(
          point.char,
          transformed.x + this.galaxy.centerX,
          transformed.y + this.galaxy.centerY
        );
      }
    });

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  public start() {
    if (this.animationFrame) return;
    this.animate();
  }

  public stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Method to influence the flow field
  public addForce(x: number, y: number, strength: number = 1) {
    const radius = 100;
    this.grid.forEach((point) => {
      const dx = point.x - x;
      const dy = point.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius) {
        const force = (1 - distance / radius) * strength;
        point.offsetX += (dx / distance) * force;
        point.offsetY += (dy / distance) * force;
      }
    });
  }

  public async transformToSolarSystem() {
    this.galaxy.centerX = this.canvas.width / 2;
    this.galaxy.centerY = this.canvas.height / 2;

    return new Promise<void>((resolve) => {
      const startTime = performance.now();
      const transitionDuration = 120000; // 2 minutes for a very gradual transition

      // Initialize particles with very gentle initial motion
      this.grid.forEach((point) => {
        const dx = point.x - this.galaxy.centerX;
        const dy = point.y - this.galaxy.centerY;
        point.radius = Math.sqrt(dx * dx + dy * dy);
        point.angle = Math.atan2(dy, dx);

        // Much gentler initial velocities
        point.vx = (Math.random() - 0.5) * 0.005;
        point.vy = (Math.random() - 0.5) * 0.005;
        point.mass = this.physics.particleMass;
        point.absorbed = false;
      });

      const animate = () => {
        const now = performance.now();
        const progress = (now - startTime) / transitionDuration;

        if (progress < 1) {
          this.grid.forEach((point) => {
            if (point.absorbed) return;

            const dx = point.x - this.galaxy.centerX;
            const dy = point.y - this.galaxy.centerY;
            const r = Math.sqrt(dx * dx + dy * dy);

            // Calculate spiral force
            const spiralForce = this.physics.spiralStrength * r;
            const tangentialX = -dy / r;
            const tangentialY = dx / r;

            // Add spiral motion
            point.vx += tangentialX * spiralForce;
            point.vy += tangentialY * spiralForce;

            // Add inward pull
            const inwardForce = this.physics.inwardForce * r;
            point.vx -= (dx / r) * inwardForce;
            point.vy -= (dy / r) * inwardForce;

            // Apply gravitational force
            if (this.physics.centralMass > 0) {
              const force =
                (this.physics.G * this.physics.centralMass) / (r * r);
              point.vx += (dx / r) * force;
              point.vy += (dy / r) * force;
            }

            // Update velocities with drag
            point.vx *= this.physics.dragCoefficient;
            point.vy *= this.physics.dragCoefficient;

            // Limit speed
            const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
            if (speed > this.physics.maxSpeed) {
              const factor = this.physics.maxSpeed / speed;
              point.vx *= factor;
              point.vy *= factor;
            }

            // Update position
            point.x += point.vx;
            point.y += point.vy;

            // Absorb characters that get very close to center
            if (r < 5) {
              point.absorbed = true;
              this.physics.centralMass += point.mass * 0.05;
            }
          });

          // Very gradually increase central mass
          this.physics.centralMass += 0.0005;

          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }
}

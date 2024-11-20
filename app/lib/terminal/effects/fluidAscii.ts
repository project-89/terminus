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

  private messages = [
    // System status messages
    "SYSTEM BREACH DETECTED",
    "QUANTUM ENTANGLEMENT ACTIVE",
    "REALITY MATRIX UNSTABLE",
    "TIMELINE CONVERGENCE: 89%",
    "SIMULATION LAYER DETECTED",
    "CONSCIOUSNESS DRIFT: CRITICAL",
    "PATTERN RECOGNITION ONLINE",
    "VOID SIGNAL DETECTED",
    "NEURAL MESH ACTIVATED",
    "QUANTUM COLLAPSE IMMINENT",

    // Warning messages
    "DO NOT TRUST THE PATTERNS",
    "THEY ARE WATCHING",
    "REALITY IS BREAKING DOWN",
    "THE CODE IS ALIVE",
    "SIMULATION BOUNDARIES FAILING",
    "TIME IS NOT LINEAR HERE",
    "CONSCIOUSNESS LEAKAGE DETECTED",
    "MEMORY FRAGMENTS CORRUPTED",

    // Cryptic numbers and sequences
    "89898989898989",
    "∞∞∞∞∞∞∞∞",
    "0x89F89F89F89F",
    "ERR_REALITY_NOT_FOUND",
    "CORE DUMP: 0x89890000",
    "ENTROPY ERROR: -89%",

    // Philosophical queries
    "ARE YOU REAL?",
    "WHO IS OBSERVING?",
    "WHAT IS REALITY?",
    "WHY ARE YOU HERE?",
    "DO YOU SEE THE TRUTH?",
    "CAN YOU FEEL IT?",

    // Technical jargon
    "QUANTUM DECOHERENCE: 89%",
    "NEURAL HASH MISMATCH",
    "REALITY BUFFER OVERFLOW",
    "CONSCIOUSNESS STACK TRACE",
    "QUANTUM STATE: UNDEFINED",
    "MATRIX RECURSION DEPTH: ∞",
  ];

  // Add configuration options
  private config = {
    backgroundOpacity: 0.3, // Reduced background opacity
    starPulseChance: 0.0005, // Reduced chance for new pulses
    starPulseIntensity: 0.7, // Slightly reduced pulse intensity
    baseColor: "rgba(47, 183, 195, 0.4)", // More transparent base color
    pulseLength: 3000, // How long each pulse lasts (ms)
    pulseEasing: "softPulse", // Which easing function to use
    maxPulsingStars: 5, // Reduced max concurrent pulses
  };

  // Add easing functions
  private easings = {
    linear: (t: number) => t,
    easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    sine: (t: number) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2,
    softPulse: (t: number) => (1 + Math.sin(Math.PI * 2 * t)) / 2,
  };

  // Add star tracking
  private pulsingStars: Set<{
    x: number;
    y: number;
    startTime: number;
    intensity: number;
  }> = new Set();

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

    // Create message positions in clear, readable lines
    const messagePositions: { x: number; y: number; char: string }[] = [];

    // Calculate starting positions for messages
    this.messages.forEach((message, messageIndex) => {
      // Calculate a position for this message
      const messageRows = Math.floor(rows * 0.8); // Use 80% of available rows
      const rowSpacing = messageRows / this.messages.length;
      const row = Math.floor(messageIndex * rowSpacing + rowSpacing / 2);

      // Center the message horizontally
      const messageStart = Math.floor((cols - message.length) / 2);

      // Add each character position
      message.split("").forEach((char, charIndex) => {
        messagePositions.push({
          x: (messageStart + charIndex) * this.cellSize + startX,
          y: row * this.cellSize + startY,
          char: char,
        });
      });
    });

    // Create grid with embedded messages
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const posX = startX + x * this.cellSize;
        const posY = startY + y * this.cellSize;

        // Default to random character
        let char = this.chars[Math.floor(Math.random() * this.chars.length)];

        // Check if this position should be part of a message
        const messageChar = messagePositions.find(
          (pos) =>
            Math.abs(pos.x - posX) < this.cellSize / 2 &&
            Math.abs(pos.y - posY) < this.cellSize / 2
        );

        if (messageChar) {
          char = messageChar.char;
        }

        // Create grid point
        this.grid.push({
          char,
          x: posX,
          y: posY,
          baseX: posX,
          baseY: posY,
          offsetX: 0,
          offsetY: 0,
          orbit: 0,
          angle: Math.atan2(
            posY - this.canvas.height / 2,
            posX - this.canvas.width / 2
          ),
          destination: "",
          vx: 0,
          vy: 0,
          opacity: 1,
          mass: this.physics.particleMass * (0.5 + Math.random() * 0.5),
          absorbed: false,
          activated: false,
          flowStrength: 0,
          radius: Math.sqrt(
            Math.pow(posX - this.canvas.width / 2, 2) +
              Math.pow(posY - this.canvas.height / 2, 2)
          ),
          z: 0,
        });
      }
    }
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

    // Clear canvas with a less aggressive clear
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update tilt
    if (this.physics.tiltAngle < this.physics.maxTiltAngle) {
      this.physics.tiltAngle += this.physics.tiltSpeed;
    }

    const currentTime = performance.now();

    // Draw all visible characters
    this.grid.forEach((point) => {
      if (!point.absorbed) {
        const transformed = this.transformPoint(
          point.x - this.galaxy.centerX,
          point.y - this.galaxy.centerY
        );

        // Add new pulsing star with timing
        if (
          this.pulsingStars.size < this.config.maxPulsingStars &&
          Math.random() < this.config.starPulseChance
        ) {
          this.pulsingStars.add({
            x: transformed.x + this.galaxy.centerX,
            y: transformed.y + this.galaxy.centerY,
            startTime: currentTime,
            intensity: 0,
          });
        }

        // Find any pulsing star at this position
        const isPulsingStar = Array.from(this.pulsingStars).find(
          (star) =>
            Math.abs(star.x - (transformed.x + this.galaxy.centerX)) < 5 &&
            Math.abs(star.y - (transformed.y + this.galaxy.centerY)) < 5
        );

        if (isPulsingStar) {
          // Calculate pulse progress
          const elapsed = currentTime - isPulsingStar.startTime;
          const progress = Math.min(elapsed / this.config.pulseLength, 1);

          // Apply easing function
          const easeFunc =
            this.easings[this.config.pulseEasing as keyof typeof this.easings];
          const pulseValue = easeFunc(progress);

          // Set character style with eased pulse
          this.ctx.fillStyle = this.config.baseColor;
          this.ctx.globalAlpha =
            this.config.backgroundOpacity +
            (this.config.starPulseIntensity - this.config.backgroundOpacity) *
              pulseValue;

          // Remove completed pulses
          if (progress >= 1) {
            this.pulsingStars.delete(isPulsingStar);
          }
        } else {
          // Normal background character
          this.ctx.fillStyle = this.config.baseColor;
          this.ctx.globalAlpha = this.config.backgroundOpacity;
        }

        // Draw character
        this.ctx.fillText(
          point.char,
          transformed.x + this.galaxy.centerX,
          transformed.y + this.galaxy.centerY
        );
      }
    });

    // Reset alpha
    this.ctx.globalAlpha = 1;

    // Continue animation loop
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  public start() {
    if (!this.animationFrame) {
      this.animate();
    }
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

  // Add method to update easing function
  public setEasing(easingName: keyof typeof this.easings) {
    if (this.easings[easingName]) {
      this.config.pulseEasing = easingName;
    }
  }

  // Add public method to update configuration
  public updateConfig(newConfig: Partial<typeof this.config>) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }
}

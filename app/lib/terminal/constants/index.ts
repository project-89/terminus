export const TERMINAL_COLORS = {
  primary: "#2fb7c3",
  secondary: "#1e9fb3",
  highlight: "#ffffff",
  error: "#ff0000",
  success: "#00ff00",
  warning: "#ffff00",
  system: "#2fb7c3",
  prompt: "#2fb7c3",
} as const;

export const DEFAULT_OPTIONS = {
  width: 800,
  height: 600,
  fontSize: 16,
  fontFamily: "'Berkeley Mono Variable', monospace",
  backgroundColor: "#000000",
  foregroundColor: "#00ff00",
  cursorColor: "#00ff00",
  blinkRate: 500,
  effects: {
    glow: {
      blur: 4,
      color: "#00ff00",
      strength: 0.5,
      passes: 3,
    },
    scanlines: {
      spacing: 2,
      opacity: 0.1,
      speed: 0.5,
      offset: 0,
      thickness: 1.5,
    },
    crt: {
      curvature: 0.15,
      vignetteStrength: 0.25,
      cornerBlur: 0.12,
      scanlineGlow: 0.15,
    },
  },
  colors: TERMINAL_COLORS,
  cursor: {
    centered: false,
    leftPadding: 10,
    mode: "dynamic" as const,
    fixedOffset: 20,
  },
  pixelation: {
    enabled: false,
    scale: 1,
  },
};

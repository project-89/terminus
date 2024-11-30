import { GlowEffect, ScanlineEffect, CRTEffect } from "../effects";
import { TERMINAL_COLORS } from "../constants";
import { TerminalContext } from "./index";

export interface CommandConfig {
  name: string;
  type: "system" | "adventure";
  description: string;
  handler: (ctx: TerminalContext) => Promise<void>;
  blockProcessing?: boolean;
  hidden?: boolean;
}

export interface TerminalOptions {
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  foregroundColor: string;
  cursorColor: string;
  blinkRate: number;
  effects: {
    glow: GlowEffect;
    scanlines: ScanlineEffect;
    crt: CRTEffect;
  };
  colors?: typeof TERMINAL_COLORS;
  cursor: {
    centered?: boolean;
    leftPadding?: number;
    mode: "fixed" | "dynamic";
    fixedOffset?: number;
  };
  pixelation: {
    enabled: boolean;
    scale: number;
  };
}

export interface PrintOptions {
  color?: string;
  effect?: "none" | "glitch" | "flicker";
  speed?: "instant" | "fast" | "normal" | "slow";
}

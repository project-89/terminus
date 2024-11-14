export interface TerminalTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any, terminal: any) => Promise<string>;
}

export interface ToolResult {
  tool: string;
  parameters: Record<string, any>;
  result: string;
}

export interface GlitchParameters {
  intensity: number;
  duration: number;
}

export interface MatrixRainParameters {
  intensity: number;
  duration: number;
}

export interface SoundParameters {
  type: "beep" | "alert" | "error" | "success";
  volume: number;
}

export type ToolParameters =
  | { tool: "glitch_screen"; parameters: GlitchParameters }
  | { tool: "matrix_rain"; parameters: MatrixRainParameters }
  | { tool: "play_sound"; parameters: SoundParameters };

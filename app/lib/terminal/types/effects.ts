export interface GlitchParameters {
  intensity: number;
  duration: number;
}

export interface LayoutConfig {
  padding: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  spacing: {
    line: number;
    item: number;
  };
  sizes: {
    header: number;
    text: number;
    small: number;
  };
  colors: {
    background: string;
    foreground: string;
    highlight: string;
    folder: string;
    file: string;
    selectedBackground: string;
    dim: string;
  };
  fontFamily: string;
}

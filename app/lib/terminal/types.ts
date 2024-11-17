export interface FileSystemItem {
  name: string;
  isDirectory: boolean;
  expanded?: boolean;
  children?: FileSystemItem[];
  level: number;
  parent: FileSystemItem | null;
  size?: string;
  pages?: number;
  metadata?: ArchiveMetadata;
  isGenerated?: boolean;
  content?: string;
}

export interface SpecialPaths {
  [key: string]: string;
}

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

export interface ArchiveMetadata {
  description: string;
  themes: string[];
  securityLevel?: string;
  containmentProcedures?: string[];
  relatedFiles?: string[];
  researchContext?: string;
  anomalies?: string[];
  timestamp?: string;
}

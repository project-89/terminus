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

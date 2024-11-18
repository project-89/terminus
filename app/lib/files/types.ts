export interface FileMetadata {
  name: string;
  isDirectory: boolean;
  size?: string;
  metadata?: Record<string, any>;
  lastModified?: Date;
}

export interface FileProvider {
  // Core file operations
  readFile(path: string, binary?: boolean): Promise<string | Buffer>;
  writeFile(path: string, content: string): Promise<void>;
  readDirectory(path: string): Promise<FileMetadata[]>;
  createDirectory(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;

  // Metadata operations
  writeMetadata(path: string, metadata: Record<string, any>): Promise<void>;
  readMetadata(path: string): Promise<Record<string, any>>;

  // Optional operations
  delete?(path: string): Promise<void>;
  move?(fromPath: string, toPath: string): Promise<void>;
  copy?(fromPath: string, toPath: string): Promise<void>;
}

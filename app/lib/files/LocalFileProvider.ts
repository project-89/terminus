import { FileProvider, FileMetadata } from "./types";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";

export class LocalFileProvider implements FileProvider {
  // Files to exclude from directory listings
  private excludedFiles = new Set([
    ".DS_Store",
    "Thumbs.db",
    ".git",
    ".gitignore",
    ".keep",
  ]);

  constructor(
    private basePath: string = join(process.cwd(), "public", "archive")
  ) {}

  private resolvePath(path: string) {
    return join(this.basePath, path);
  }

  private shouldIncludeFile(filename: string): boolean {
    // Exclude hidden files and system files
    return (
      !filename.startsWith(".") &&
      !this.excludedFiles.has(filename) &&
      !filename.endsWith(".meta.json")
    );
  }

  async readFile(path: string, binary?: boolean): Promise<string | Buffer> {
    const content = await readFile(this.resolvePath(path));
    return binary ? content : content.toString("utf-8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    await writeFile(this.resolvePath(path), content, "utf-8");
  }

  async readDirectory(path: string): Promise<FileMetadata[]> {
    const fullPath = this.resolvePath(path);
    const items = await readdir(fullPath, { withFileTypes: true });

    return items
      .filter((item) => this.shouldIncludeFile(item.name))
      .map((item) => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        size: item.isDirectory() ? undefined : "1.2KB",
      }));
  }

  async createDirectory(path: string): Promise<void> {
    await mkdir(this.resolvePath(path), { recursive: true });
  }

  async exists(path: string): Promise<boolean> {
    try {
      await readFile(this.resolvePath(path));
      return true;
    } catch {
      return false;
    }
  }

  async writeMetadata(
    path: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const metaPath = this.resolvePath(path) + ".meta.json";
    await writeFile(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
  }

  async readMetadata(path: string): Promise<Record<string, any>> {
    const metaPath = this.resolvePath(path) + ".meta.json";
    try {
      const content = await readFile(metaPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
}

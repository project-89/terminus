import { FileProvider, FileMetadata } from "./types";
import { Storage } from "@google-cloud/storage";

export class GCPFileProvider implements FileProvider {
  private storage: Storage;
  private bucket: string;
  private excludedFiles = new Set([
    ".DS_Store",
    "Thumbs.db",
    ".git",
    ".gitignore",
    ".keep",
  ]);

  constructor(bucketName: string, credentials?: any) {
    this.storage = new Storage(credentials);
    this.bucket = bucketName;
  }

  private shouldIncludeFile(filename: string): boolean {
    return (
      !filename.startsWith(".") &&
      !this.excludedFiles.has(filename) &&
      !filename.endsWith(".meta.json")
    );
  }

  async readFile(path: string): Promise<string> {
    const file = this.storage.bucket(this.bucket).file(path);
    const [content] = await file.download();
    return content.toString("utf-8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    const file = this.storage.bucket(this.bucket).file(path);
    await file.save(content);
  }

  async readDirectory(path: string): Promise<FileMetadata[]> {
    const [files] = await this.storage.bucket(this.bucket).getFiles({
      prefix: path,
      delimiter: "/",
    });

    return files
      .filter((file) => {
        const filename = file.name.split("/").pop()!;
        return this.shouldIncludeFile(filename);
      })
      .map((file) => ({
        name: file.name.split("/").pop()!,
        isDirectory: file.name.endsWith("/"),
        size: file.metadata.size,
        lastModified: new Date(file.metadata.updated),
      }));
  }

  async createDirectory(path: string): Promise<void> {
    // In GCS, directories are virtual and created implicitly
    // We create an empty .keep file to ensure the directory exists
    const file = this.storage.bucket(this.bucket).file(`${path}/.keep`);
    await file.save("");
  }

  async exists(path: string): Promise<boolean> {
    const file = this.storage.bucket(this.bucket).file(path);
    const [exists] = await file.exists();
    return exists;
  }

  async writeMetadata(
    path: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const metaFile = this.storage.bucket(this.bucket).file(`${path}.meta.json`);
    await metaFile.save(JSON.stringify(metadata, null, 2), {
      contentType: "application/json",
      metadata: {
        contentType: "application/json",
      },
    });
  }

  async readMetadata(path: string): Promise<Record<string, any>> {
    try {
      const metaFile = this.storage
        .bucket(this.bucket)
        .file(`${path}.meta.json`);
      const [content] = await metaFile.download();
      return JSON.parse(content.toString("utf-8"));
    } catch (error) {
      // If metadata file doesn't exist, return empty object
      return {};
    }
  }

  // Optional operations
  async delete(path: string): Promise<void> {
    const file = this.storage.bucket(this.bucket).file(path);
    await file.delete();
  }

  async move(fromPath: string, toPath: string): Promise<void> {
    const sourceFile = this.storage.bucket(this.bucket).file(fromPath);
    const destinationFile = this.storage.bucket(this.bucket).file(toPath);
    await sourceFile.move(destinationFile);
  }

  async copy(fromPath: string, toPath: string): Promise<void> {
    const sourceFile = this.storage.bucket(this.bucket).file(fromPath);
    const destinationFile = this.storage.bucket(this.bucket).file(toPath);
    await sourceFile.copy(destinationFile);
  }
}

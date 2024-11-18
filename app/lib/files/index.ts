import { FileProvider } from "./types";
import { LocalFileProvider } from "./LocalFileProvider";
import { GCPFileProvider } from "./GCPFileProvider";

let fileProvider: FileProvider;

export function initializeFileProvider(config: {
  type: "local" | "gcp";
  options?: any;
}) {
  switch (config.type) {
    case "local":
      fileProvider = new LocalFileProvider();
      break;
    case "gcp":
      fileProvider = new GCPFileProvider(
        config.options.bucketName,
        config.options.credentials
      );
      break;
    default:
      throw new Error(`Unsupported file provider type: ${config.type}`);
  }
}

export function getFileProvider(): FileProvider {
  if (!fileProvider) {
    initializeFileProvider({ type: "local" });
  }
  return fileProvider;
}

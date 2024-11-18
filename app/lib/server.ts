import { initializeFileProvider } from "./files";

// Initialize providers and services needed by the server
export function initializeServer() {
  if (process.env.NODE_ENV === "production") {
    initializeFileProvider({
      type: "gcp",
      options: {
        bucketName: process.env.GCP_BUCKET_NAME,
        credentials: JSON.parse(process.env.GCP_CREDENTIALS || "{}"),
      },
    });
  } else {
    initializeFileProvider({
      type: "local",
    });
  }
}

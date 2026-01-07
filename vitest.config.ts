import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    // Run test files sequentially to avoid database race conditions
    fileParallelism: false,
    // Use the same database as dev for now (ensures foreign keys work)
    env: {
      DATABASE_URL: "postgresql://parzival@localhost:5432/p89_db?schema=public",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

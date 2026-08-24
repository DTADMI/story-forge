import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    globals: true,
    pool: "forks",
    isolate: true,
    fileParallelism: false,
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});

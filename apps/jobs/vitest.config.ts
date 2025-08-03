import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./__tests__/global-setup.ts"],
    setupFiles: ["./__tests__/per-test-file-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

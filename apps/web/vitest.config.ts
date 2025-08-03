import type { ViteUserConfig } from "vitest/config";

import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()] as ViteUserConfig["plugins"],
  test: {
    environment: "happy-dom",
    setupFiles: ["./__tests__/per-test-file-setup.ts"],
    globalSetup: ["./__tests__/global-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

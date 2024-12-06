import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, ViteUserConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()] as ViteUserConfig["plugins"],
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

import { spawn } from "node:child_process";

import env from "@/env";

export function runTurboCommand(command: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("turbo", ["run", command], {
      stdio: env.CI === "true" ? "inherit" : "ignore",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      }
      else {
        reject(new Error(`turbo run ${command} failed with exit code ${code}`));
      }
    });
    child.on("error", (error) => {
      console.error(`Error running turbo run ${command}:`, error);
      reject(error);
    });
  });
}

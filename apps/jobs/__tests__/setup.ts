import { spawn } from "node:child_process";

import env from "@/env";

import { runTurboCommand } from "./utils";

export default async function setup() {
  if (env.NODE_ENV !== "test" || !env.BEARER_TOKEN) {
    throw new Error("NODE_ENV must be 'test' and bearer token too");
  }
  await new Promise<void>((resolve, reject) => {
    const child = spawn("ls", ["-a", "../../packages/drizzle/node_modules/@delivery/utils"], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      }
      else {
        reject(new Error(`ls command failed with code ${code}`));
      }
    });

    child.on("error", reject);
  });
  await runTurboCommand("db:push db:reset db:seed --filter=@delivery/drizzle");
}

import { Client } from "ssh2";

import type { Chunk, ISSH } from "../../routes/deployments/lib/tasks/deploy/jobs/build";

import { loadConfig } from "./utils";

export async function ssh(command: string, { onStdout, cwd }: ISSH) {
  const conn = new Client();
  const config = await loadConfig();
  const fullCommand = cwd ? `cd ${cwd} && ${command}` : command;
  return new Promise<Chunk[] | Error>((resolve, reject) => {
    const result: Chunk[] = [];

    const timeout = setTimeout(async () => {
      conn.end();
      const errorMessage = "SSH connection timed out after 30 minutes";
      result.push(errorMessage);
      await onStdout({ chunk: errorMessage, chunks: result, isCriticalError: true });
      reject(new Error(errorMessage));
    }, 1_800_000); // 30min

    conn
      .on("ready", () => {
        conn.exec(fullCommand, (err, stream) => {
          if (err) {
            clearTimeout(timeout);
            throw err;
          }
          stream
            .setEncoding("utf-8")
            .on("close", () => {
              clearTimeout(timeout);
              conn.end();
              resolve(result);
            })
            .on("data", async (data: string) => {
              result.push(data);
              await onStdout({ chunk: data, chunks: result });
            })
            .stderr
            .setEncoding("utf-8")
            .on("data", async (data: string) => {
              const errorMessage = data.toLowerCase();
              const isCriticalError = /fatal:|error:/i.test(errorMessage);
              result.push(data);
              await onStdout({ chunk: data, chunks: result, isCriticalError });
              if (/already exists/i.test(errorMessage)) {
                clearTimeout(timeout);
                resolve(result);
              }
              if (isCriticalError) {
                clearTimeout(timeout);
                reject(new Error(data));
              }
            });
        });
      })
      .connect(config);

    conn.on("error", (err) => {
      clearTimeout(timeout);
      conn.end();
      reject(err);
    });
  });
}

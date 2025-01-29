import { Client } from "ssh2";

import type { Chunk, ISSH } from "../tasks/deploy/jobs/build";

import { loadConfig } from "./utils";

export async function ssh(command: string, { onStdout, cwd }: ISSH) {
  const conn = new Client();
  const config = await loadConfig();
  const fullCommand = cwd ? `cd ${cwd} && ${command}` : command;
  return new Promise<Chunk[] | Error>((resolve, reject) => {
    conn
      .on("ready", () => {
        const result: Chunk[] = [];
        conn.exec(fullCommand, (err, stream) => {
          if (err) {
            throw err;
          }
          stream
            .setEncoding("utf-8")
            .on("close", () => {
              conn.end();
              resolve(result);
            })
            .on("data", (data: string) => {
              result.push(data);
              onStdout({ chunk: data, chunks: result });
            })
            .stderr
            .setEncoding("utf-8")
            .on("data", (data: string) => {
              const errorMessage = data.toLowerCase();
              const isCriticalError = /fatal:|error:/i.test(errorMessage);
              result.push(data);
              onStdout({ chunk: data, chunks: result, isCriticalError });
              if (/already exists/i.test(errorMessage)) {
                resolve(result);
              }
              if (isCriticalError) {
                reject(new Error(data));
              }
            });
        });
      })
      .connect(config);

    conn.on("error", (err) => {
      conn.end();
      reject(err);
    });
  });
}

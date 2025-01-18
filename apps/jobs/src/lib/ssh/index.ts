import { Client } from "ssh2";

import { loadConfig } from "./utils";

// TODO: persist resolved data (logs) into db
type Chunk = string;

interface Ssh {
  onStdout: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => void;
  cwd?: string;
}

export async function ssh(command: string, { onStdout, cwd }: Ssh) {
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

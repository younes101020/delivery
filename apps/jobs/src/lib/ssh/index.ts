import { Client } from "ssh2";

import { loadConfig } from "./utils";

// TODO: persist resolved data (logs) into db
type Chunk = string;

interface Ssh {
  onStdout: ({ chunks, chunk }: { chunks?: Chunk[]; chunk: Chunk }) => void;
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
              if (data.includes("already exists")) {
                resolve(result);
              }
              if (data.includes("fatal:") || data.includes("error:")) {
                reject(new Error(data));
              }
              result.push(data);
              onStdout({ chunk: data, chunks: result });
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

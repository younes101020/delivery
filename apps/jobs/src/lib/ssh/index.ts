import { Client } from "ssh2";

import { loadConfig } from "./utils";

interface Ssh {
  onStdout: (output: string) => void;
  cwd?: string;
}

// TODO: persist resolved data (logs) into db
interface Chunk {
  logs: string;
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
              console.log("o");
              onStdout(data);
              result.push({ logs: data });
            })
            .stderr
            .setEncoding("utf-8")
            .on("data", (data: string) => {
              if (data.includes("fatal:") || data.includes("error:")) {
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

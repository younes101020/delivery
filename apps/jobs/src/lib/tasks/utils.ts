import { Worker } from "bullmq";
import Redis, { type RedisOptions } from "ioredis";
import IORedis from "ioredis";

import type { RedisType } from "./types";

export const connection = new IORedis({ maxRetriesPerRequest: null });

export async function subscribeWorkerTo(queueName: string, processorFile: string) {
  const worker = new Worker(queueName, processorFile, {
    connection: getBullConnection(connection),
  });

  worker.on("error", (error) => {
    if (error instanceof Error) {
      console.error("Error: ", error);
    }
  });
  worker.on("failed", (_, error) => {
    if (error instanceof Error) {
      console.error("Job failed: ", error);
    }
  });

  return worker;
}

type Resources = "application" | "database";

const connectionMap = new Map<RedisOptions | Redis, Redis>();

export function getBullConnection(redis: RedisOptions | Redis): Redis {
  const optsRedis = redis;
  let connection = connectionMap.get(optsRedis);
  if (connection) {
    return connection;
  }

  if (optsRedis instanceof Redis || optsRedis?.constructor?.name === "Redis") {
    connection = optsRedis as Redis;
  }
  else if (optsRedis) {
    connection = new Redis(optsRedis);
  }
  else {
    connection = new Redis();
  }

  connectionMap.set(optsRedis, connection);

  return connection;
}

function normalizePrefixGlob(prefixGlob: string): string {
  let prefixGlobNorm = prefixGlob;
  const sectionsCount = prefixGlobNorm.split(":").length - 1;

  if (sectionsCount > 1) {
    prefixGlobNorm += prefixGlobNorm.endsWith(":") ? "" : ":";
  }
  else if (sectionsCount === 1) {
    prefixGlobNorm += prefixGlobNorm.endsWith(":") ? "*:" : ":";
  }
  else {
    prefixGlobNorm += prefixGlobNorm.trim().length > 0 ? ":*:" : "*:*:";
  }

  prefixGlobNorm += "meta";

  return prefixGlobNorm;
}

export async function fetchQueueTitles(redis: RedisType, prefix: Resources) {
  const connection = getBullConnection(redis);
  const keys = await connection.keys(normalizePrefixGlob(prefix));

  return keys.map((key) => {
    const parts = key.split(":");
    return {
      prefix: parts.slice(0, -2).join(":"),
      queueName: parts[parts.length - 2],
    };
  });
}

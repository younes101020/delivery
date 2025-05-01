import { Job, Queue, Worker } from "bullmq";
import Redis, { type RedisOptions } from "ioredis";
import IORedis from "ioredis";

import type { Resources } from "../constants";
import type { RedisType } from "./types";

export const connection = new IORedis({
  maxRetriesPerRequest: null,
});

let worker: Worker | null = null;

export function subscribeWorkerTo(queueName: string, prefix: string, processorFile: string) {
  worker = new Worker(queueName, processorFile, {
    connection: getBullConnection(connection),
    prefix,
  });

  return worker;
}

process.on("SIGTERM", async () => {
  if (worker) {
    await worker.close();
  }
});

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

export async function getJobAndQueueNameByJobId<T>(jobId: string, queueNames: Record<string, string>, prefix: string) {
  const queues = await getQueuesByName(queueNames, prefix);

  const jobsWithQueueName = await Promise.all(
    queues.map(async (queue) => {
      const job = await Job.fromId<T>(queue, jobId);
      return { queueName: queue.name, job };
    }),
  );

  const job = jobsWithQueueName.find(jwQueue => jwQueue.job !== null && jwQueue.job !== undefined) ?? null;

  return job;
}

export async function getQueuesByName(queueNames: Record<string, string>, prefix: string) {
  const bullConnection = getBullConnection(connection);

  return Object.values(queueNames).map((queueName) => {
    return new Queue(queueName, { connection: bullConnection, prefix });
  });
}

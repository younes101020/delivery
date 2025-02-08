import Redis, { type RedisOptions } from "ioredis";
import IORedis from "ioredis";

export const connection = new IORedis({ maxRetriesPerRequest: null });

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

/**
 * Creates a job cancellation manager to track and control job abort signals, allowing jobs to be cancelled and cleaned up gracefully.
 */
function createJobCanceler() {
  const controllers = new Map();

  return {
    createSignal(jobId: string) {
      const controller = new AbortController();
      controllers.set(jobId, controller);
      return controller.signal;
    },

    cancel(jobId: string) {
      const controller = controllers.get(jobId);
      if (controller) {
        controller.abort();
        controllers.delete(jobId);
      }
    },

    cleanup(jobId: string) {
      controllers.delete(jobId);
    },
  };
}

export const jobCanceler = createJobCanceler();

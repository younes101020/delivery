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

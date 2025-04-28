import type Redis from "ioredis";
import type { RedisOptions } from "ioredis";

export type RedisType = RedisOptions | Redis;

export type MergeSubJobs<T> = {
  [K in keyof T as keyof T[K] & string]: T[K][keyof T[K] & string];
};

import type { RedisType } from "../types";

import { getBullConnection } from "../utils";

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

export async function fetchQueueTitles(redis: RedisType, prefix: string = "bull") {
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

const cache = new Map<string, unknown>();

export function withCache<T>(fn: (identifier: string) => Promise<T>) {
  return async (identifier?: string) => {
    const cacheKey = identifier || "global";
    if (cache.has(cacheKey))
      return cache.get(cacheKey) as T;
    const data = await fn(cacheKey);
    cache.set(cacheKey, data);
    return data;
  };
}

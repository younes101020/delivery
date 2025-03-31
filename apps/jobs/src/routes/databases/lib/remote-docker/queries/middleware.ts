const cache = new Map<string, unknown>();

export function withCache<T>(fn: (identifier: string) => Promise<T>) {
  return async (identifier: string) => {
    if (cache.has(identifier))
      return cache.get(identifier) as T;
    const data = await fn(identifier);
    cache.set(identifier, data);
    return data;
  };
}

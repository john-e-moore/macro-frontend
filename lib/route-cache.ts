type CacheRecord<T> = {
  expiresAt: number;
  value: T;
};

const routeCacheStore = new Map<string, CacheRecord<unknown>>();

function getScopedKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of routeCacheStore.entries()) {
    if (entry.expiresAt <= now) {
      routeCacheStore.delete(key);
    }
  }
}

export async function getCachedRouteValue<T>({
  scope,
  key,
  ttlSeconds,
  loader,
}: {
  scope: string;
  key: string;
  ttlSeconds: number;
  loader: () => Promise<T> | T;
}): Promise<{ value: T; cacheStatus: "HIT" | "MISS" }> {
  const now = Date.now();
  pruneExpiredEntries(now);

  const scopedKey = getScopedKey(scope, key);
  const cached = routeCacheStore.get(scopedKey) as CacheRecord<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return {
      value: cached.value,
      cacheStatus: "HIT",
    };
  }

  const value = await loader();
  routeCacheStore.set(scopedKey, {
    value,
    expiresAt: now + ttlSeconds * 1000,
  });

  return {
    value,
    cacheStatus: "MISS",
  };
}

export function buildRouteCacheHeaders({
  ttlSeconds,
  cacheStatus,
}: {
  ttlSeconds: number;
  cacheStatus: "HIT" | "MISS";
}) {
  return {
    "Cache-Control": `private, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`,
    "X-Route-Cache": cacheStatus,
  };
}

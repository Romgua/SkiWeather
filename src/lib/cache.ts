// ============================================================
// Cache mémoire simple pour éviter de re-fetch Open-Meteo
// à chaque requête. TTL = 3h.
// Sera remplacé par Redis ou SQLite en Phase 5.
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 3 * 60 * 60 * 1000; // 3 heures

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  if (isExpired) {
    store.delete(key);
    return null;
  }

  return entry.data;
}

export function cacheSet<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): void {
  store.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

export function cacheHas(key: string): boolean {
  return cacheGet(key) !== null;
}

export function cacheClear(): void {
  store.clear();
}

export function cacheStats(): { keys: number; oldestMinutes: number } {
  let oldest = Date.now();
  for (const entry of store.values()) {
    if (entry.timestamp < oldest) oldest = entry.timestamp;
  }
  return {
    keys: store.size,
    oldestMinutes: Math.round((Date.now() - oldest) / 60000),
  };
}

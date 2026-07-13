import type { ContentCacheEntry } from './types';

export function getReadyCacheEntries(entries: ContentCacheEntry[], now: Date = new Date()): ContentCacheEntry[] {
  return entries.filter((entry) => entry.state === 'ready' && !isExpired(entry, now));
}

export function pruneExpiredCacheEntries(entries: ContentCacheEntry[], now: Date = new Date()): ContentCacheEntry[] {
  return entries.filter((entry) => !isExpired(entry, now) || Boolean(entry.fallbackId));
}

export function linkFallbackToCacheEntry(entry: ContentCacheEntry, fallbackId: string): ContentCacheEntry {
  return {
    ...entry,
    fallbackId,
  };
}

function isExpired(entry: ContentCacheEntry, now: Date): boolean {
  if (!entry.expiresAt) {
    return false;
  }

  const expiresAt = new Date(entry.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= now.getTime();
}
import { describe, expect, it } from 'vitest';
import { getReadyCacheEntries, linkFallbackToCacheEntry, pruneExpiredCacheEntries } from '../../../features/rest-space/content/cacheIndex';
import type { ContentCacheEntry, VisualMoment } from '../../../features/rest-space/content/types';

const cachedMoment: VisualMoment = {
  id: 'cached-lake-001',
  title: 'Cached lake',
  theme: 'lake',
  mood: 'calm',
  imageUrl: 'venus-cache://cached-lake.jpg',
  width: 1920,
  height: 1280,
  source: {
    sourceType: 'cache',
    provider: 'static-seed',
    providerAssetId: 'lake-001',
    licenseNote: 'CC0 development seed',
    attribution: 'Venus seed collection',
    cachedAt: '2026-07-13T00:00:00.000Z',
  },
};

function entry(overrides: Partial<ContentCacheEntry> = {}): ContentCacheEntry {
  return {
    id: 'cache-entry-001',
    moment: cachedMoment,
    cachedAt: '2026-07-13T00:00:00.000Z',
    expiresAt: '2026-07-20T00:00:00.000Z',
    state: 'ready',
    ...overrides,
  };
}

describe('content cache index', () => {
  it('只返回 ready 且未过期的缓存项', () => {
    const ready = entry({ id: 'ready' });
    const expired = entry({ id: 'expired', expiresAt: '2026-07-12T00:00:00.000Z' });
    const failed = entry({ id: 'failed', state: 'write_failed' });

    expect(getReadyCacheEntries([ready, expired, failed], new Date('2026-07-13T08:00:00.000Z'))).toEqual([ready]);
  });

  it('prune 时保留 bundled fallback 关联项，避免删除兜底线索', () => {
    const expiredWithFallback = entry({ id: 'expired-with-fallback', expiresAt: '2026-07-12T00:00:00.000Z', fallbackId: 'fallback-meadow-001' });
    const expiredWithoutFallback = entry({ id: 'expired-without-fallback', expiresAt: '2026-07-12T00:00:00.000Z' });

    expect(pruneExpiredCacheEntries([expiredWithFallback, expiredWithoutFallback], new Date('2026-07-13T08:00:00.000Z'))).toEqual([
      expiredWithFallback,
    ]);
  });

  it('可以把缓存项关联到不可删除的 bundled fallback', () => {
    expect(linkFallbackToCacheEntry(entry(), 'fallback-meadow-001')).toMatchObject({ fallbackId: 'fallback-meadow-001' });
  });
});
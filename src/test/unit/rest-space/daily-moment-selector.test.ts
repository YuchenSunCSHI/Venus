import { describe, expect, it } from 'vitest';
import { selectDailyMoment } from '../../../features/rest-space/content/dailyMomentSelector';
import type { ContentCacheEntry, ProviderCandidate, VisualMoment } from '../../../features/rest-space/content/types';

const onlineCandidate: ProviderCandidate = {
  id: 'online-lake-001',
  sourceProvider: 'static-seed',
  providerAssetId: 'lake-001',
  remoteUrl: 'https://example.test/lake.jpg',
  title: 'Quiet lake',
  mediaType: 'visual',
  width: 2400,
  height: 1600,
  licenseNote: 'CC0 development seed',
  attribution: 'Venus seed collection',
  theme: 'lake',
  mood: 'calm',
  quality: 'high',
  matchingTags: ['lake', 'still-water'],
};

const cachedMoment: VisualMoment = {
  id: 'cached-forest-001',
  title: 'Cached forest',
  theme: 'forest',
  mood: 'calm',
  imageUrl: 'venus-cache://cached-forest.jpg',
  width: 1920,
  height: 1280,
  source: {
    sourceType: 'cache',
    provider: 'static-seed',
    providerAssetId: 'forest-001',
    licenseNote: 'CC0 development seed',
    attribution: 'Venus seed collection',
    cachedAt: '2026-07-13T00:00:00.000Z',
  },
};

const cacheEntry: ContentCacheEntry = {
  id: 'cache-entry-001',
  moment: cachedMoment,
  cachedAt: '2026-07-13T00:00:00.000Z',
  expiresAt: '2026-07-20T00:00:00.000Z',
  state: 'ready',
};

const bundledFallback: VisualMoment = {
  id: 'fallback-meadow-001',
  title: 'Fallback meadow',
  theme: 'meadow',
  mood: 'calm',
  imageUrl: '/moments/images/fallback-meadow.svg',
  width: 1920,
  height: 1080,
  source: {
    sourceType: 'bundledFallback',
    provider: 'venus-bundled',
    licenseNote: 'Bundled Venus generated asset',
    attribution: 'Venus',
  },
};

describe('daily moment selector', () => {
  it('优先选择合格 online candidate', () => {
    const result = selectDailyMoment({
      dateKey: '2026-07-13',
      onlineCandidates: [onlineCandidate],
      cacheEntries: [cacheEntry],
      bundledFallbacks: [bundledFallback],
    });

    expect(result.sourceType).toBe('online');
    expect(result.moment.id).toBe('online-lake-001');
  });

  it('online 不合格时选择可用缓存', () => {
    const result = selectDailyMoment({
      dateKey: '2026-07-13',
      onlineCandidates: [{ ...onlineCandidate, licenseNote: '' }],
      cacheEntries: [cacheEntry],
      bundledFallbacks: [bundledFallback],
    });

    expect(result.sourceType).toBe('cache');
    expect(result.moment.id).toBe('cached-forest-001');
  });

  it('online 和 cache 都不可用时使用 bundled fallback', () => {
    const result = selectDailyMoment({
      dateKey: '2026-07-13',
      onlineCandidates: [],
      cacheEntries: [{ ...cacheEntry, state: 'expired' }],
      bundledFallbacks: [bundledFallback],
    });

    expect(result.sourceType).toBe('bundledFallback');
    expect(result.moment.id).toBe('fallback-meadow-001');
  });
});
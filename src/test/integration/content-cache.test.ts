import { describe, expect, it, vi } from 'vitest';
import { cacheContentAsset, type ContentCachePort } from '../../features/rest-space/content/cacheAsset';
import type { CacheAssetInput, CacheAssetResult } from '../../features/rest-space/desktop/ipc-schema';

const input: CacheAssetInput = {
  assetType: 'visual',
  sourceProvider: 'static-seed',
  providerAssetId: 'lake-001',
  remoteUrl: 'https://example.test/lake.jpg',
  licenseNote: 'CC0 development seed',
  attribution: 'Venus seed collection',
  expectedTheme: 'lake',
};

function createPort(result: CacheAssetResult): ContentCachePort {
  return {
    cacheAsset: vi.fn(async () => result),
  };
}

describe('content.cacheAsset integration', () => {
  it('成功缓存时返回 ready 缓存索引状态', async () => {
    const result = await cacheContentAsset(input, createPort({
      ok: true,
      localPath: 'venus-cache://visual/lake-001.jpg',
      cachedAt: '2026-07-13T08:00:00.000Z',
    }));

    expect(result).toEqual({
      ok: true,
      localPath: 'venus-cache://visual/lake-001.jpg',
      cachedAt: '2026-07-13T08:00:00.000Z',
      cacheState: 'ready',
    });
  });

  it('network_failed 映射为 unavailable，不破坏 fallback', async () => {
    const result = await cacheContentAsset(input, createPort({ ok: false, recoverableError: 'network_failed' }));

    expect(result).toEqual({ ok: false, recoverableError: 'network_failed', cacheState: 'unavailable' });
  });

  it('license_missing 映射为 unavailable 并拒绝缓存', async () => {
    const result = await cacheContentAsset({ ...input, licenseNote: '' }, createPort({ ok: false, recoverableError: 'license_missing' }));

    expect(result).toEqual({ ok: false, recoverableError: 'license_missing', cacheState: 'unavailable' });
  });

  it('write_failed 映射为 write_failed，供缓存索引记录失败状态', async () => {
    const result = await cacheContentAsset(input, createPort({ ok: false, recoverableError: 'write_failed' }));

    expect(result).toEqual({ ok: false, recoverableError: 'write_failed', cacheState: 'write_failed' });
  });
});
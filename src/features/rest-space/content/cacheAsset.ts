import { callTauriCommand } from '../desktop/ipc-client';
import type { CacheAssetInput, CacheAssetResult } from '../desktop/ipc-schema';

export type ContentCachePort = {
  cacheAsset: (input: CacheAssetInput) => Promise<CacheAssetResult>;
};

export type CacheContentAssetResult = CacheAssetResult & {
  cacheState: 'ready' | 'write_failed' | 'unavailable';
};

export const tauriContentCachePort: ContentCachePort = {
  cacheAsset: (input) => callTauriCommand('content.cacheAsset', input),
};

export async function cacheContentAsset(
  input: CacheAssetInput,
  port: ContentCachePort = tauriContentCachePort,
): Promise<CacheContentAssetResult> {
  try {
    const result = await port.cacheAsset(input);

    if (result.ok) {
      return {
        ...result,
        cacheState: 'ready',
      };
    }

    return {
      ...result,
      cacheState: result.recoverableError === 'write_failed' ? 'write_failed' : 'unavailable',
    };
  } catch {
    return {
      ok: false,
      recoverableError: 'network_failed',
      cacheState: 'unavailable',
    };
  }
}
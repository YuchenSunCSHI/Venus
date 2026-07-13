import { describe, expect, it } from 'vitest';
import { validateProviderCandidate } from '../../../features/rest-space/content/validation';
import type { ProviderCandidate } from '../../../features/rest-space/content/types';

const validCandidate: ProviderCandidate = {
  id: 'online-forest-001',
  sourceProvider: 'static-seed',
  providerAssetId: 'forest-001',
  remoteUrl: 'https://example.test/forest.jpg',
  title: 'Misty forest morning',
  mediaType: 'visual',
  width: 2400,
  height: 1600,
  licenseNote: 'CC0 development seed',
  attribution: 'Venus seed collection',
  theme: 'forest',
  mood: 'calm',
  quality: 'high',
  matchingTags: ['forest', 'mist', 'soft-light'],
};

describe('content provider candidate validation', () => {
  it('接受授权、分辨率、主题和质量都合格的候选', () => {
    expect(validateProviderCandidate(validCandidate).ok).toBe(true);
  });

  it('拒绝缺少授权说明的候选', () => {
    const result = validateProviderCandidate({ ...validCandidate, licenseNote: ' ' });

    expect(result).toEqual({ ok: false, reason: 'license_missing' });
  });

  it('拒绝分辨率不足的候选', () => {
    const result = validateProviderCandidate({ ...validCandidate, width: 1024, height: 768 });

    expect(result).toEqual({ ok: false, reason: 'resolution_too_low' });
  });

  it('拒绝不适合休息空间的主题', () => {
    const result = validateProviderCandidate({ ...validCandidate, theme: 'cityTraffic' });

    expect(result).toEqual({ ok: false, reason: 'theme_mismatch' });
  });

  it('拒绝 provider 限流或超时错误', () => {
    expect(validateProviderCandidate({ ...validCandidate, providerState: 'rate_limited' })).toEqual({
      ok: false,
      reason: 'rate_limited',
    });
    expect(validateProviderCandidate({ ...validCandidate, providerState: 'timeout' })).toEqual({
      ok: false,
      reason: 'provider_timeout',
    });
  });
});
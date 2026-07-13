import type { ContentMood, ContentTheme, ProviderCandidate } from './types';

export type ProviderCandidateRejectionReason =
  | 'license_missing'
  | 'source_missing'
  | 'resolution_too_low'
  | 'theme_mismatch'
  | 'quality_too_low'
  | 'rate_limited'
  | 'provider_timeout'
  | 'network_failed';

export type ProviderCandidateValidationResult =
  | { ok: true }
  | { ok: false; reason: ProviderCandidateRejectionReason };

const minimumVisualWidth = 1600;
const minimumVisualHeight = 900;

const allowedThemes = new Set<ContentTheme>(['forest', 'lake', 'meadow', 'mountain', 'ocean', 'rain', 'sky', 'stars']);
const allowedMoods = new Set<ContentMood>(['calm', 'soft', 'quiet', 'fresh']);

export function validateProviderCandidate(candidate: ProviderCandidate): ProviderCandidateValidationResult {
  if (candidate.providerState === 'rate_limited') {
    return { ok: false, reason: 'rate_limited' };
  }

  if (candidate.providerState === 'timeout') {
    return { ok: false, reason: 'provider_timeout' };
  }

  if (candidate.providerState === 'network_failed') {
    return { ok: false, reason: 'network_failed' };
  }

  if (!candidate.sourceProvider.trim() || !candidate.remoteUrl.trim()) {
    return { ok: false, reason: 'source_missing' };
  }

  if (!candidate.licenseNote.trim()) {
    return { ok: false, reason: 'license_missing' };
  }

  if (!allowedThemes.has(candidate.theme as ContentTheme) || !allowedMoods.has(candidate.mood as ContentMood)) {
    return { ok: false, reason: 'theme_mismatch' };
  }

  if (candidate.quality === 'low') {
    return { ok: false, reason: 'quality_too_low' };
  }

  if (candidate.mediaType === 'visual') {
    const width = candidate.width ?? 0;
    const height = candidate.height ?? 0;

    if (width < minimumVisualWidth || height < minimumVisualHeight) {
      return { ok: false, reason: 'resolution_too_low' };
    }
  }

  return { ok: true };
}

export function isContentTheme(theme: string): theme is ContentTheme {
  return allowedThemes.has(theme as ContentTheme);
}

export function isContentMood(mood: string): mood is ContentMood {
  return allowedMoods.has(mood as ContentMood);
}
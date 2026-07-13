import type { DateKey } from '../shared/types';
import type { ContentCacheEntry, DailyMomentSelection, ProviderCandidate, VisualMoment } from './types';
import { isContentMood, isContentTheme, validateProviderCandidate } from './validation';

export type SelectDailyMomentInput = {
  dateKey: DateKey;
  onlineCandidates: ProviderCandidate[];
  cacheEntries: ContentCacheEntry[];
  bundledFallbacks: VisualMoment[];
};

export function selectDailyMoment(input: SelectDailyMomentInput): DailyMomentSelection {
  const onlineMoment = firstValidOnlineMoment(input.onlineCandidates);
  if (onlineMoment) {
    return {
      dateKey: input.dateKey,
      sourceType: 'online',
      moment: onlineMoment,
    };
  }

  const cachedMoment = firstReadyCachedMoment(input.cacheEntries);
  if (cachedMoment) {
    return {
      dateKey: input.dateKey,
      sourceType: 'cache',
      moment: cachedMoment,
      recoverableReason: 'online_unavailable',
    };
  }

  const fallbackMoment = input.bundledFallbacks[0];
  if (!fallbackMoment) {
    throw new Error('At least one bundled fallback visual moment is required');
  }

  return {
    dateKey: input.dateKey,
    sourceType: 'bundledFallback',
    moment: fallbackMoment,
    recoverableReason: 'fallback_used',
  };
}

function firstValidOnlineMoment(candidates: ProviderCandidate[]): VisualMoment | undefined {
  const candidate = candidates.find((item) => item.mediaType === 'visual' && validateProviderCandidate(item).ok);

  if (!candidate || !isContentTheme(candidate.theme) || !isContentMood(candidate.mood)) {
    return undefined;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    theme: candidate.theme,
    mood: candidate.mood,
    imageUrl: candidate.remoteUrl,
    width: candidate.width ?? 0,
    height: candidate.height ?? 0,
    source: {
      sourceType: 'online',
      provider: candidate.sourceProvider,
      providerAssetId: candidate.providerAssetId,
      licenseNote: candidate.licenseNote,
      attribution: candidate.attribution,
    },
  };
}

function firstReadyCachedMoment(entries: ContentCacheEntry[]): VisualMoment | undefined {
  return entries.find((entry) => entry.state === 'ready')?.moment;
}
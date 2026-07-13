import type { DateKey, SourceMetadata } from '../shared/types';

export type ContentTheme = 'forest' | 'lake' | 'meadow' | 'mountain' | 'ocean' | 'rain' | 'sky' | 'stars';

export type ContentMood = 'calm' | 'soft' | 'quiet' | 'fresh';

export type ContentQuality = 'high' | 'medium' | 'low';

export type ProviderState = 'ready' | 'rate_limited' | 'timeout' | 'network_failed';

export type ProviderCandidate = {
  id: string;
  sourceProvider: string;
  providerAssetId?: string;
  remoteUrl: string;
  title: string;
  mediaType: 'visual' | 'audio';
  width?: number;
  height?: number;
  durationSeconds?: number;
  licenseNote: string;
  attribution?: string;
  theme: string;
  mood: string;
  quality: ContentQuality;
  matchingTags: string[];
  providerState?: ProviderState;
};

export type VisualMoment = {
  id: string;
  title: string;
  theme: ContentTheme;
  mood: ContentMood;
  imageUrl: string;
  width: number;
  height: number;
  source: SourceMetadata;
};

export type AudioMoment = {
  id: string;
  title: string;
  theme: ContentTheme;
  mood: ContentMood;
  audioUrl: string;
  durationSeconds: number;
  source: SourceMetadata;
};

export type ContentCacheEntry = {
  id: string;
  moment: VisualMoment;
  audioMoment?: AudioMoment;
  cachedAt: string;
  expiresAt?: string;
  state: 'ready' | 'expired' | 'write_failed' | 'unavailable';
  fallbackId?: string;
};

export type DailyMomentSelection = {
  dateKey: DateKey;
  sourceType: SourceMetadata['sourceType'];
  moment: VisualMoment;
  audioMoment?: AudioMoment;
  recoverableReason?: 'online_unavailable' | 'cache_unavailable' | 'fallback_used';
};
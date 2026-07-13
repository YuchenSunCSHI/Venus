import type { AudioMoment } from '../content/types';

export type Soundscape = 'forest' | 'water' | 'rain' | 'air' | 'night';

export type PlaybackState = 'off' | 'loading' | 'playing' | 'muted' | 'unavailable' | 'fadingOut';

export type AudioUnavailableReason = 'deviceUnavailable' | 'providerUnavailable' | 'playbackFailed' | 'unsupportedFormat';

export type VolumePreference = {
  volume: number;
  muted: boolean;
};

export type AudioProviderCandidate = {
  id: string;
  sourceProvider: string;
  remoteUrl: string;
  title: string;
  durationSeconds: number;
  mimeType: 'audio/mpeg' | 'audio/ogg' | 'audio/wav';
  licenseNote: string;
  attribution?: string;
  soundscape: Soundscape;
  quality: 'high' | 'medium' | 'low';
  matchingTags: string[];
};

export type AudioPlaybackSession = VolumePreference & {
  state: PlaybackState;
  audioId?: string;
  soundscape?: Soundscape;
  unavailableReason?: AudioUnavailableReason;
};

export type AudioMatch = {
  soundscape: Soundscape;
  audioMoment?: AudioMoment;
  fallbackReason?: 'silenceFallback';
};
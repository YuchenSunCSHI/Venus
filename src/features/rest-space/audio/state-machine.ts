import type { AudioPlaybackSession, AudioUnavailableReason } from './types';

export type AudioStateEvent =
  | { type: 'enable' }
  | { type: 'play'; audioId: string }
  | { type: 'mute' }
  | { type: 'unmute' }
  | { type: 'setVolume'; volume: number }
  | { type: 'fadeOut' }
  | { type: 'stop' }
  | { type: 'fail'; reason: AudioUnavailableReason };

export function transitionAudioState(session: AudioPlaybackSession, event: AudioStateEvent): AudioPlaybackSession {
  switch (event.type) {
    case 'enable':
      return { ...session, state: 'loading', unavailableReason: undefined };
    case 'play':
      return { ...session, state: session.muted ? 'muted' : 'playing', audioId: event.audioId, unavailableReason: undefined };
    case 'mute':
      return { ...session, state: session.audioId ? 'muted' : session.state, muted: true };
    case 'unmute':
      return { ...session, state: session.audioId ? 'playing' : session.state, muted: false };
    case 'setVolume':
      return { ...session, volume: clampVolume(event.volume) };
    case 'fadeOut':
      return { ...session, state: session.audioId ? 'fadingOut' : session.state };
    case 'stop':
      return { ...session, state: 'off', audioId: undefined, soundscape: undefined, unavailableReason: undefined };
    case 'fail':
      return { ...session, state: 'unavailable', unavailableReason: event.reason, audioId: undefined };
  }
}

function clampVolume(volume: number): number {
  if (volume < 0) {
    return 0;
  }

  if (volume > 100) {
    return 100;
  }

  return volume;
}
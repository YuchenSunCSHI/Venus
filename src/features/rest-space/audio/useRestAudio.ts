import { useEffect, useMemo, useRef, useState } from 'react';
import type { UserPreferences } from '../preferences/defaults';
import type { VisualMoment } from '../content/types';
import { matchAudioForVisualMoment, shouldCrossfadeSoundscape, soundscapeForVisualTheme } from './audioMatcher';
import { bundledSoundscapeProvider } from './provider';
import { transitionAudioState } from './state-machine';
import type { AudioController } from './audioController';
import { createAudioController } from './audioController';
import type { AudioPlaybackSession, Soundscape } from './types';

export type RestAudioController = {
  audioSession: AudioPlaybackSession;
  enableAudio: () => void;
  toggleMuted: () => void;
  setVolume: (volume: number) => void;
};

export type UseRestAudioInput = {
  enabled: boolean;
  visualMoment?: VisualMoment;
  preferences: UserPreferences;
  onPreferenceChange: (patch: Pick<UserPreferences, 'audioEnabledByDefault' | 'lastVolume'>) => void;
  audioController?: AudioController;
};

export function useRestAudio(input: UseRestAudioInput): RestAudioController {
  const controller = useMemo(() => input.audioController ?? createAudioController(), [input.audioController]);
  const [audioSession, setAudioSession] = useState<AudioPlaybackSession>(() => ({
    state: input.preferences.audioEnabledByDefault ? 'loading' : 'off',
    volume: input.preferences.lastVolume,
    muted: false,
  }));
  const currentSoundscapeRef = useRef<Soundscape>();
  const switchTimeoutRef = useRef<number>();

  useEffect(() => {
    if (!input.enabled) {
      window.clearTimeout(switchTimeoutRef.current);
      void controller.fadeOutAndStop().finally(() => {
        setAudioSession((current) => transitionAudioState(current, { type: 'stop' }));
        currentSoundscapeRef.current = undefined;
      });
    }
  }, [controller, input.enabled]);

  useEffect(() => {
    if (!input.enabled || !input.visualMoment || (audioSession.state !== 'loading' && audioSession.state !== 'playing' && audioSession.state !== 'muted')) {
      return undefined;
    }

    const nextSoundscape = soundscapeForVisualTheme(input.visualMoment.theme);
    const currentSoundscape = currentSoundscapeRef.current;
    const delayMs = currentSoundscape && shouldCrossfadeSoundscape(currentSoundscape, nextSoundscape) ? 1_000 : 0;

    window.clearTimeout(switchTimeoutRef.current);
    switchTimeoutRef.current = window.setTimeout(() => {
      void playSoundscape(nextSoundscape, Boolean(currentSoundscape));
    }, delayMs);

    return () => window.clearTimeout(switchTimeoutRef.current);
  }, [audioSession.state, audioSession.muted, audioSession.volume, controller, input.enabled, input.visualMoment]);

  const playSoundscape = async (soundscape: Soundscape, crossfade: boolean) => {
    const providerResult = await bundledSoundscapeProvider.searchSoundscape({ soundscape, timeoutMs: 500 });
    const audioMoments = providerResult.ok ? providerResult.audioMoments : [];
    const visualMoment = input.visualMoment;

    if (!visualMoment) {
      return;
    }

    const match = matchAudioForVisualMoment(visualMoment, audioMoments);

    if (!match.audioMoment) {
      setAudioSession((current) => transitionAudioState(current, { type: 'fail', reason: 'providerUnavailable' }));
      return;
    }

    const audioMoment = match.audioMoment;

    try {
      if (crossfade) {
        await controller.crossfadeTo(audioMoment, audioSession.volume, audioSession.muted);
      } else {
        await controller.play(audioMoment, audioSession.volume, audioSession.muted);
      }

      currentSoundscapeRef.current = match.soundscape;
      setAudioSession((current) => ({
        ...transitionAudioState(current, { type: 'play', audioId: audioMoment.id }),
        soundscape: match.soundscape,
      }));
    } catch {
      setAudioSession((current) => transitionAudioState(current, { type: 'fail', reason: 'playbackFailed' }));
    }
  };

  return {
    audioSession,
    enableAudio: () => {
      input.onPreferenceChange({ audioEnabledByDefault: true, lastVolume: audioSession.volume });
      setAudioSession((current) => transitionAudioState(current, { type: 'enable' }));
    },
    toggleMuted: () => {
      setAudioSession((current) => {
        const next = transitionAudioState(current, { type: current.muted ? 'unmute' : 'mute' });
        controller.setMuted(next.muted);
        if (!next.muted) {
          controller.setVolume(next.volume);
        }
        return next;
      });
    },
    setVolume: (volume) => {
      input.onPreferenceChange({ audioEnabledByDefault: true, lastVolume: volume });
      setAudioSession((current) => transitionAudioState(current, { type: 'setVolume', volume }));
      controller.setVolume(volume);
    },
  };
}
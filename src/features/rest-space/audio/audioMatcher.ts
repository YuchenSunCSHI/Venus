import type { AudioMoment, ContentTheme, VisualMoment } from '../content/types';
import type { AudioMatch, Soundscape } from './types';

const themeSoundscapes: Record<ContentTheme, Soundscape> = {
  forest: 'forest',
  meadow: 'forest',
  lake: 'water',
  ocean: 'water',
  rain: 'rain',
  mountain: 'air',
  sky: 'air',
  stars: 'night',
};

const soundscapeThemes: Record<Soundscape, ContentTheme[]> = {
  forest: ['forest', 'meadow'],
  water: ['lake', 'ocean'],
  rain: ['rain'],
  air: ['mountain', 'sky'],
  night: ['stars'],
};

export function soundscapeForVisualTheme(theme: ContentTheme): Soundscape {
  return themeSoundscapes[theme];
}

export function matchAudioForVisualMoment(visualMoment: VisualMoment, audioMoments: AudioMoment[]): AudioMatch {
  const soundscape = soundscapeForVisualTheme(visualMoment.theme);
  const audioMoment = audioMoments.find((item) => soundscapeThemes[soundscape].includes(item.theme));

  if (!audioMoment) {
    return {
      soundscape,
      fallbackReason: 'silenceFallback',
    };
  }

  return {
    soundscape,
    audioMoment,
  };
}

export function shouldCrossfadeSoundscape(currentSoundscape: Soundscape, nextSoundscape: Soundscape): boolean {
  return currentSoundscape !== nextSoundscape;
}
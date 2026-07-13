import type { AudioMoment, ContentTheme } from '../content/types';
import type { Soundscape } from './types';

export type AudioProviderQuery = {
  soundscape: Soundscape;
  timeoutMs: number;
};

export type AudioProviderResult =
  | { ok: true; audioMoments: AudioMoment[] }
  | { ok: false; recoverableError: 'providerUnavailable' | 'timeout' };

export type AudioProvider = {
  id: string;
  searchSoundscape: (query: AudioProviderQuery) => Promise<AudioProviderResult>;
};

const soundscapeThemes: Record<Soundscape, ContentTheme> = {
  forest: 'forest',
  water: 'lake',
  rain: 'rain',
  air: 'sky',
  night: 'stars',
};

const soundscapeTitles: Record<Soundscape, string> = {
  forest: '轻柔林间声',
  water: '缓慢水声',
  rain: '细雨声',
  air: '开阔风声',
  night: '夜间环境声',
};

export const bundledSoundscapeProvider: AudioProvider = {
  id: 'venus-bundled-soundscape',
  searchSoundscape: async ({ soundscape }) => ({
    ok: true,
    audioMoments: [createBundledAudioMoment(soundscape)],
  }),
};

export function createBundledAudioMoment(soundscape: Soundscape): AudioMoment {
  return {
    id: `bundled-${soundscape}-soft-loop`,
    title: soundscapeTitles[soundscape],
    theme: soundscapeThemes[soundscape],
    mood: soundscape === 'rain' || soundscape === 'night' ? 'quiet' : 'calm',
    audioUrl: createSoundscapeDataUrl(soundscape),
    durationSeconds: 2,
    source: {
      sourceType: 'silenceFallback',
      provider: 'venus-generated-bundled',
      providerAssetId: `generated-${soundscape}-loop`,
      licenseNote: 'Venus generated placeholder loop for local bundled soundscape validation',
      attribution: 'Venus',
    },
  };
}

function createSoundscapeDataUrl(soundscape: Soundscape): string {
  const sampleRate = 8_000;
  const durationSeconds = 2;
  const sampleCount = sampleRate * durationSeconds;
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  let offset = 0;

  const writeString = (value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset, value.charCodeAt(index));
      offset += 1;
    }
  };

  writeString('RIFF');
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * bytesPerSample, true);
  offset += 4;
  view.setUint16(offset, bytesPerSample, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString('data');
  view.setUint32(offset, dataSize, true);
  offset += 4;

  let seed = seedForSoundscape(soundscape);
  const baseFrequency = frequencyForSoundscape(soundscape);

  for (let index = 0; index < sampleCount; index += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const noise = (seed / 0xffffffff) * 2 - 1;
    const breath = Math.sin((2 * Math.PI * baseFrequency * index) / sampleRate);
    const envelope = 0.36 + 0.14 * Math.sin((2 * Math.PI * index) / sampleCount);
    const sample = Math.max(-1, Math.min(1, (noise * 0.16 + breath * 0.08) * envelope));
    view.setInt16(offset, sample * 32767, true);
    offset += 2;
  }

  return `data:audio/wav;base64,${arrayBufferToBase64(buffer)}`;
}

function frequencyForSoundscape(soundscape: Soundscape): number {
  const frequencies: Record<Soundscape, number> = {
    forest: 136,
    water: 110,
    rain: 92,
    air: 72,
    night: 64,
  };

  return frequencies[soundscape];
}

function seedForSoundscape(soundscape: Soundscape): number {
  return Array.from(soundscape).reduce((seed, char) => seed + char.charCodeAt(0), 13_071);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  return Buffer.from(binary, 'binary').toString('base64');
}
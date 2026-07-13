import type { AudioMoment } from '../content/types';

export type AudioElementLike = {
  src: string;
  loop: boolean;
  volume: number;
  muted: boolean;
  play: () => Promise<void>;
  pause: () => void;
  load: () => void;
};

export type AudioController = {
  play: (audioMoment: AudioMoment, volume: number, muted: boolean) => Promise<void>;
  crossfadeTo: (audioMoment: AudioMoment, volume: number, muted: boolean) => Promise<void>;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  fadeOutAndStop: (durationMs?: number) => Promise<void>;
  stop: () => void;
};

export type AudioControllerOptions = {
  createAudioElement?: () => AudioElementLike;
  fadeStepMs?: number;
};

export function createAudioController(options: AudioControllerOptions = {}): AudioController {
  const createAudioElement = options.createAudioElement ?? createDefaultAudioElement;
  const fadeStepMs = options.fadeStepMs ?? 80;
  let currentAudio: AudioElementLike | undefined;

  const playElement = async (audioMoment: AudioMoment, volume: number, muted: boolean) => {
    const audio = createAudioElement();
    audio.src = audioMoment.audioUrl;
    audio.loop = true;
    audio.volume = muted ? 0 : normalizeVolume(volume);
    audio.muted = muted;
    audio.load();
    await audio.play();
    return audio;
  };

  const controller: AudioController = {
    play: async (audioMoment, volume, muted) => {
      currentAudio?.pause();
      currentAudio = await playElement(audioMoment, volume, muted);
    },
    crossfadeTo: async (audioMoment, volume, muted) => {
      const previousAudio = currentAudio;
      const nextAudio = await playElement(audioMoment, 0, muted);
      currentAudio = nextAudio;

      await Promise.all([
        previousAudio ? fadeVolume(previousAudio, previousAudio.volume, 0, 2_000, fadeStepMs) : Promise.resolve(),
        fadeVolume(nextAudio, 0, muted ? 0 : normalizeVolume(volume), 2_000, fadeStepMs),
      ]);
      previousAudio?.pause();
    },
    setVolume: (volume) => {
      if (currentAudio && !currentAudio.muted) {
        currentAudio.volume = normalizeVolume(volume);
      }
    },
    setMuted: (muted) => {
      if (currentAudio) {
        currentAudio.muted = muted;
        currentAudio.volume = muted ? 0 : currentAudio.volume;
      }
    },
    fadeOutAndStop: async (durationMs = 800) => {
      if (!currentAudio) {
        return;
      }

      const audio = currentAudio;
      await fadeVolume(audio, audio.volume, 0, durationMs, fadeStepMs);
      audio.pause();
      currentAudio = undefined;
    },
    stop: () => {
      currentAudio?.pause();
      currentAudio = undefined;
    },
  };

  return controller;
}

function createDefaultAudioElement(): AudioElementLike {
  return new Audio();
}

function normalizeVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume / 100));
}

async function fadeVolume(audio: AudioElementLike, from: number, to: number, durationMs: number, stepMs: number): Promise<void> {
  const steps = Math.max(1, Math.ceil(durationMs / stepMs));

  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    audio.volume = from + (to - from) * progress;
    await wait(stepMs);
  }
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}
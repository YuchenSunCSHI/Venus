import { describe, expect, it, vi } from 'vitest';
import { createAudioController, type AudioElementLike } from '../../features/rest-space/audio/audioController';
import { createBundledAudioMoment } from '../../features/rest-space/audio/provider';

function createFakeAudioElement(overrides: Partial<AudioElementLike> = {}): AudioElementLike {
  return {
    src: '',
    loop: false,
    volume: 0,
    muted: false,
    play: vi.fn(async () => undefined),
    pause: vi.fn(),
    load: vi.fn(),
    ...overrides,
  };
}

describe('audio device controller', () => {
  it('播放本地 bundled soundscape 并可调整音量和静音', async () => {
    const audio = createFakeAudioElement();
    const controller = createAudioController({ createAudioElement: () => audio, fadeStepMs: 1 });

    await controller.play(createBundledAudioMoment('forest'), 45, false);
    controller.setVolume(70);
    controller.setMuted(true);

    expect(audio.src).toContain('data:audio/wav');
    expect(audio.loop).toBe(true);
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(audio.volume).toBe(0);
    expect(audio.muted).toBe(true);
  });

  it('结束休息时淡出并停止播放', async () => {
    const audio = createFakeAudioElement();
    const controller = createAudioController({ createAudioElement: () => audio, fadeStepMs: 1 });

    await controller.play(createBundledAudioMoment('water'), 60, false);
    await controller.fadeOutAndStop(2);

    expect(audio.volume).toBe(0);
    expect(audio.pause).toHaveBeenCalledTimes(1);
  });

  it('播放失败可由调用方识别为设备或播放不可用', async () => {
    const controller = createAudioController({
      createAudioElement: () => createFakeAudioElement({ play: vi.fn(async () => Promise.reject(new Error('blocked'))) }),
      fadeStepMs: 1,
    });

    await expect(controller.play(createBundledAudioMoment('rain'), 50, false)).rejects.toThrow('blocked');
  });
});
import { describe, expect, it } from 'vitest';
import { transitionAudioState } from '../../../features/rest-space/audio/state-machine';
import type { AudioPlaybackSession } from '../../../features/rest-space/audio/types';

const initialSession: AudioPlaybackSession = {
  state: 'off',
  volume: 45,
  muted: false,
};

describe('audio playback state machine', () => {
  it('覆盖 off、loading、playing、muted、fadingOut 状态流转', () => {
    const loading = transitionAudioState(initialSession, { type: 'enable' });
    const playing = transitionAudioState(loading, { type: 'play', audioId: 'forest-soft-loop' });
    const muted = transitionAudioState(playing, { type: 'mute' });
    const resumed = transitionAudioState(muted, { type: 'unmute' });
    const fadingOut = transitionAudioState(resumed, { type: 'fadeOut' });
    const off = transitionAudioState(fadingOut, { type: 'stop' });

    expect(loading.state).toBe('loading');
    expect(playing).toMatchObject({ state: 'playing', audioId: 'forest-soft-loop' });
    expect(muted).toMatchObject({ state: 'muted', muted: true });
    expect(resumed).toMatchObject({ state: 'playing', muted: false });
    expect(fadingOut.state).toBe('fadingOut');
    expect(off).toMatchObject({ state: 'off', audioId: undefined });
  });

  it('设备或播放失败时进入 unavailable 且可停止回到 off', () => {
    const unavailable = transitionAudioState(initialSession, { type: 'fail', reason: 'deviceUnavailable' });
    const stopped = transitionAudioState(unavailable, { type: 'stop' });

    expect(unavailable).toMatchObject({ state: 'unavailable', unavailableReason: 'deviceUnavailable' });
    expect(stopped.state).toBe('off');
  });

  it('音量限制在 0 到 100，静音保留原音量偏好', () => {
    const loud = transitionAudioState(initialSession, { type: 'setVolume', volume: 150 });
    const quiet = transitionAudioState(loud, { type: 'setVolume', volume: -10 });
    const muted = transitionAudioState(quiet, { type: 'mute' });

    expect(loud.volume).toBe(100);
    expect(quiet.volume).toBe(0);
    expect(muted.volume).toBe(0);
    expect(muted.muted).toBe(true);
  });
});
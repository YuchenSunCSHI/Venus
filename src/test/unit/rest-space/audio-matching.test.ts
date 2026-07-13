import { describe, expect, it } from 'vitest';
import { matchAudioForVisualMoment, shouldCrossfadeSoundscape, soundscapeForVisualTheme } from '../../../features/rest-space/audio/audioMatcher';
import type { AudioMoment, VisualMoment } from '../../../features/rest-space/content/types';
import type { Soundscape } from '../../../features/rest-space/audio/types';

function visualMoment(theme: VisualMoment['theme']): VisualMoment {
  return {
    id: `visual-${theme}`,
    title: theme,
    theme,
    mood: 'calm',
    imageUrl: `/moments/images/${theme}.svg`,
    width: 1920,
    height: 1080,
    source: {
      sourceType: 'bundledFallback',
      provider: 'test',
      licenseNote: 'test',
    },
  };
}

function audioMoment(soundscape: Soundscape): AudioMoment {
  return {
    id: `audio-${soundscape}`,
    title: soundscape,
    theme: soundscape === 'water' ? 'lake' : soundscape === 'air' ? 'sky' : soundscape === 'night' ? 'stars' : soundscape,
    mood: 'calm',
    audioUrl: `/moments/audio/${soundscape}.mp3`,
    durationSeconds: 90,
    source: {
      sourceType: 'bundledFallback',
      provider: 'venus-bundled',
      licenseNote: 'test',
    },
  };
}

describe('audio matching', () => {
  it('将视觉主题映射到稳定 soundscape 大类', () => {
    expect(soundscapeForVisualTheme('forest')).toBe('forest');
    expect(soundscapeForVisualTheme('meadow')).toBe('forest');
    expect(soundscapeForVisualTheme('lake')).toBe('water');
    expect(soundscapeForVisualTheme('ocean')).toBe('water');
    expect(soundscapeForVisualTheme('rain')).toBe('rain');
    expect(soundscapeForVisualTheme('mountain')).toBe('air');
    expect(soundscapeForVisualTheme('sky')).toBe('air');
    expect(soundscapeForVisualTheme('stars')).toBe('night');
  });

  it('选择匹配当前视觉 soundscape 的 bundled 音频', () => {
    const match = matchAudioForVisualMoment(visualMoment('lake'), [audioMoment('forest'), audioMoment('water')]);

    expect(match.soundscape).toBe('water');
    expect(match.audioMoment?.id).toBe('audio-water');
  });

  it('没有匹配音频时降级到 silenceFallback', () => {
    const match = matchAudioForVisualMoment(visualMoment('stars'), [audioMoment('forest')]);

    expect(match.soundscape).toBe('night');
    expect(match.audioMoment).toBeUndefined();
    expect(match.fallbackReason).toBe('silenceFallback');
  });

  it('同类视觉切换不 crossfade，跨类切换才 crossfade', () => {
    expect(shouldCrossfadeSoundscape('forest', 'forest')).toBe(false);
    expect(shouldCrossfadeSoundscape('forest', 'water')).toBe(true);
  });
});
import { describe, expect, it, vi } from 'vitest';
import { defaultPreferences } from '../../features/rest-space/preferences/defaults';
import { getDesktopQuietContext, type DesktopQuietContextPort } from '../../features/rest-space/desktop/quiet-context';

function createPort(result: Awaited<ReturnType<DesktopQuietContextPort['getQuietContext']>>): DesktopQuietContextPort {
  return {
    getQuietContext: vi.fn(async () => result),
  };
}

describe('桌面静默上下文', () => {
  it('透传 desktop.getQuietContext 的全屏静默结果且不包含敏感文本字段', async () => {
    const port = createPort({
      shouldSuppressPrompt: true,
      reason: 'fullscreenDetected',
      checkedAt: '2026-07-13T08:00:00.000Z',
    });

    const result = await getDesktopQuietContext(defaultPreferences, port, new Date('2026-07-13T08:00:00.000Z'));

    expect(result).toEqual({
      shouldSuppressPrompt: true,
      reason: 'fullscreenDetected',
      checkedAt: '2026-07-13T08:00:00.000Z',
    });
    expect(JSON.stringify(result)).not.toContain('windowTitle');
    expect(JSON.stringify(result)).not.toContain('meetingContent');
    expect(JSON.stringify(result)).not.toContain('workText');
  });

  it('promptsEnabled=false 时不调用桌面查询并返回 promptsDisabled', async () => {
    const port = createPort({ shouldSuppressPrompt: false, checkedAt: '2026-07-13T08:00:00.000Z' });
    const preferences = {
      ...defaultPreferences,
      cadence: {
        ...defaultPreferences.cadence,
        promptsEnabled: false,
      },
    };

    const result = await getDesktopQuietContext(preferences, port, new Date('2026-07-13T08:00:00.000Z'));

    expect(port.getQuietContext).not.toHaveBeenCalled();
    expect(result).toEqual({
      shouldSuppressPrompt: true,
      reason: 'promptsDisabled',
      checkedAt: '2026-07-13T08:00:00.000Z',
    });
  });

  it('temporaryQuietUntil 未过期时返回 temporaryQuiet', async () => {
    const port = createPort({ shouldSuppressPrompt: false, checkedAt: '2026-07-13T08:00:00.000Z' });
    const preferences = {
      ...defaultPreferences,
      cadence: {
        ...defaultPreferences.cadence,
        temporaryQuietUntil: '2026-07-13T08:10:00.000Z',
      },
    };

    const result = await getDesktopQuietContext(preferences, port, new Date('2026-07-13T08:00:00.000Z'));

    expect(port.getQuietContext).not.toHaveBeenCalled();
    expect(result.reason).toBe('temporaryQuiet');
    expect(result.shouldSuppressPrompt).toBe(true);
  });
});
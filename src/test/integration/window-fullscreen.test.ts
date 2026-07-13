import { describe, expect, it, vi } from 'vitest';
import { enterRestWindow, exitRestWindow, type RestWindowPort } from '../../features/rest-space/desktop/rest-window';

function createPort(overrides: Partial<RestWindowPort>): RestWindowPort {
  return {
    enterRestFullscreen: vi.fn(async () => ({ ok: true, enteredAt: '2026-07-13T08:00:00.000Z' })),
    exitRestFullscreen: vi.fn(async () => ({ ok: true, exitedAt: '2026-07-13T08:10:00.000Z' })),
    ...overrides,
  };
}

describe('rest window fullscreen integration', () => {
  it('全屏进入成功时返回 fullscreen 模式', async () => {
    const result = await enterRestWindow('session-001', createPort({}));

    expect(result).toEqual({ ok: true, displayMode: 'fullscreen', enteredAt: '2026-07-13T08:00:00.000Z' });
  });

  it('全屏失败时回落沉浸窗口且不空白', async () => {
    const result = await enterRestWindow(
      'session-001',
      createPort({ enterRestFullscreen: vi.fn(async () => ({ ok: false, recoverableError: 'window_unavailable' as const })) }),
    );

    expect(result).toEqual({ ok: true, displayMode: 'immersiveFallback', recoverableError: 'window_unavailable' });
  });

  it('退出休息窗口时透传成功结果', async () => {
    await expect(exitRestWindow('session-001', 'completed', createPort({}))).resolves.toEqual({
      ok: true,
      exitedAt: '2026-07-13T08:10:00.000Z',
    });
  });
});
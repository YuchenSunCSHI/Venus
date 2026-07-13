import { callTauriCommand } from './ipc-client';
import type { EnterRestFullscreenResult, ExitRestFullscreenInput, ExitRestFullscreenResult } from './ipc-schema';

export type RestWindowPort = {
  enterRestFullscreen: (sessionId: string) => Promise<EnterRestFullscreenResult>;
  exitRestFullscreen: (sessionId: string, reason: ExitRestFullscreenInput['reason']) => Promise<ExitRestFullscreenResult>;
};

export type EnterRestWindowResult = {
  ok: boolean;
  displayMode: 'fullscreen' | 'immersiveFallback';
  enteredAt?: string;
  recoverableError?: EnterRestFullscreenResult['recoverableError'];
};

export const tauriRestWindowPort: RestWindowPort = {
  enterRestFullscreen: (sessionId) => callTauriCommand('window.enterRestFullscreen', { sessionId, displayMode: 'primaryDisplay' }),
  exitRestFullscreen: (sessionId, reason) => callTauriCommand('window.exitRestFullscreen', { sessionId, reason }),
};

export async function enterRestWindow(
  sessionId: string,
  port: RestWindowPort = tauriRestWindowPort,
): Promise<EnterRestWindowResult> {
  try {
    const result = await port.enterRestFullscreen(sessionId);

    if (result.ok) {
      return {
        ok: true,
        displayMode: 'fullscreen',
        enteredAt: result.enteredAt,
      };
    }

    return {
      ok: true,
      displayMode: 'immersiveFallback',
      recoverableError: result.recoverableError,
    };
  } catch {
    return {
      ok: true,
      displayMode: 'immersiveFallback',
      recoverableError: 'window_unavailable',
    };
  }
}

export function exitRestWindow(
  sessionId: string,
  reason: ExitRestFullscreenInput['reason'],
  port: RestWindowPort = tauriRestWindowPort,
): Promise<ExitRestFullscreenResult> {
  return port.exitRestFullscreen(sessionId, reason);
}
import type { UserPreferences } from '../preferences/defaults';
import { callTauriCommand } from './ipc-client';
import type { QuietContext } from './ipc-schema';

export type DesktopQuietContextPort = {
  getQuietContext: () => Promise<QuietContext>;
};

export const tauriDesktopQuietContextPort: DesktopQuietContextPort = {
  getQuietContext: () => callTauriCommand('desktop.getQuietContext', undefined),
};

export async function getDesktopQuietContext(
  preferences: UserPreferences,
  port: DesktopQuietContextPort = tauriDesktopQuietContextPort,
  now: Date = new Date(),
): Promise<QuietContext> {
  const checkedAt = now.toISOString();

  if (!preferences.cadence.promptsEnabled) {
    return {
      shouldSuppressPrompt: true,
      reason: 'promptsDisabled',
      checkedAt,
    };
  }

  if (isTemporaryQuietActive(preferences.cadence.temporaryQuietUntil, now)) {
    return {
      shouldSuppressPrompt: true,
      reason: 'temporaryQuiet',
      checkedAt,
    };
  }

  try {
    return sanitizeQuietContext(await port.getQuietContext(), checkedAt);
  } catch {
    return {
      shouldSuppressPrompt: false,
      checkedAt,
    };
  }
}

function isTemporaryQuietActive(temporaryQuietUntil: string | undefined, now: Date): boolean {
  if (!temporaryQuietUntil) {
    return false;
  }

  const quietUntil = new Date(temporaryQuietUntil);
  return !Number.isNaN(quietUntil.getTime()) && quietUntil.getTime() > now.getTime();
}

function sanitizeQuietContext(context: QuietContext, fallbackCheckedAt: string): QuietContext {
  return {
    shouldSuppressPrompt: context.shouldSuppressPrompt,
    reason: context.reason,
    checkedAt: context.checkedAt || fallbackCheckedAt,
  };
}
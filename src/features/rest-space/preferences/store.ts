import { callTauriCommand } from '../desktop/ipc-client';
import {
  defaultCadence,
  defaultPreferences,
  PREFERENCES_SCHEMA_VERSION,
  type RestCadencePreference,
  type UserPreferences,
} from './defaults';
import type { SavePreferencesResult } from '../desktop/ipc-schema';

export type LoadPreferencesRecoverableError = 'load_failed' | 'schema_invalid' | 'migrated';

export type LoadPreferencesResult = {
  preferences: UserPreferences;
  recovered: boolean;
  recoverableError?: LoadPreferencesRecoverableError;
};

export type SaveUserPreferencesResult = SavePreferencesResult & {
  preferences: UserPreferences;
};

export type PreferencesPort = {
  load: () => Promise<unknown>;
  save: (preferences: UserPreferences) => Promise<SavePreferencesResult>;
};

export const tauriPreferencesPort: PreferencesPort = {
  load: () => callTauriCommand('preferences.load', undefined),
  save: (preferences) => callTauriCommand('preferences.save', preferences),
};

export async function loadUserPreferences(port: PreferencesPort = tauriPreferencesPort): Promise<LoadPreferencesResult> {
  try {
    return normalizePreferences(await port.load());
  } catch {
    return {
      preferences: defaultPreferences,
      recovered: true,
      recoverableError: 'load_failed',
    };
  }
}

export async function saveUserPreferences(
  preferences: UserPreferences,
  port: PreferencesPort = tauriPreferencesPort,
): Promise<SaveUserPreferencesResult> {
  try {
    const result = await port.save(preferences);
    return {
      ...result,
      preferences,
    };
  } catch {
    return {
      ok: false,
      recoverableError: 'write_failed',
      preferences,
    };
  }
}

export function normalizePreferences(rawPreferences: unknown): LoadPreferencesResult {
  if (!isRecord(rawPreferences)) {
    return fallbackPreferences('schema_invalid');
  }

  const hasSchemaVersion = Object.hasOwn(rawPreferences, 'schemaVersion');
  const schemaVersion = readNumber(rawPreferences.schemaVersion, PREFERENCES_SCHEMA_VERSION);

  if (hasSchemaVersion && schemaVersion !== PREFERENCES_SCHEMA_VERSION) {
    return fallbackPreferences('schema_invalid');
  }

  const cadence = normalizeCadence(rawPreferences.cadence);
  if (!cadence) {
    return fallbackPreferences('schema_invalid');
  }

  return {
    preferences: {
      ...defaultPreferences,
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      cadence,
      audioEnabledByDefault: readBoolean(rawPreferences.audioEnabledByDefault, defaultPreferences.audioEnabledByDefault),
      lastVolume: readVolume(rawPreferences.lastVolume, defaultPreferences.lastVolume),
      promptStyle: rawPreferences.promptStyle === 'gentle' ? 'gentle' : defaultPreferences.promptStyle,
      quietMode: readQuietMode(rawPreferences.quietMode),
      lastCompletedSessionAt: readOptionalString(rawPreferences.lastCompletedSessionAt),
    },
    recovered: !hasSchemaVersion,
    recoverableError: hasSchemaVersion ? undefined : 'migrated',
  };
}

function normalizeCadence(rawCadence: unknown): RestCadencePreference | undefined {
  if (!isRecord(rawCadence)) {
    return undefined;
  }

  const cadence: RestCadencePreference = {
    ...defaultCadence,
    id: 'default',
    workDurationMinutes: readNumber(rawCadence.workDurationMinutes, defaultCadence.workDurationMinutes),
    restDurationMinutes: readNumber(rawCadence.restDurationMinutes, defaultCadence.restDurationMinutes),
    postponeMinutes: readNumber(rawCadence.postponeMinutes, defaultCadence.postponeMinutes),
    promptsEnabled: readBoolean(rawCadence.promptsEnabled, defaultCadence.promptsEnabled),
    temporaryQuietUntil: readOptionalString(rawCadence.temporaryQuietUntil),
    suggestionMode: rawCadence.suggestionMode === 'suggested' ? 'suggested' : defaultCadence.suggestionMode,
  };

  if (cadence.workDurationMinutes < 15 || cadence.workDurationMinutes > 120) {
    return undefined;
  }

  if (cadence.restDurationMinutes < 1 || cadence.restDurationMinutes > 30) {
    return undefined;
  }

  if (cadence.postponeMinutes <= 0 || cadence.postponeMinutes >= cadence.workDurationMinutes) {
    return undefined;
  }

  return cadence;
}

function fallbackPreferences(recoverableError: LoadPreferencesRecoverableError): LoadPreferencesResult {
  return {
    preferences: defaultPreferences,
    recovered: true,
    recoverableError,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readVolume(value: unknown, fallback: number): number {
  const volume = readNumber(value, fallback);
  return volume >= 0 && volume <= 100 ? volume : fallback;
}

function readQuietMode(value: unknown): UserPreferences['quietMode'] {
  return value === 'untilNextInterval' || value === 'untilTime' ? value : defaultPreferences.quietMode;
}
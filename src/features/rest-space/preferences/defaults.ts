export const PREFERENCES_SCHEMA_VERSION = 1;

export type RestCadencePreference = {
  id: 'default';
  workDurationMinutes: number;
  restDurationMinutes: number;
  postponeMinutes: number;
  promptsEnabled: boolean;
  temporaryQuietUntil?: string;
  suggestionMode: 'fixed' | 'suggested';
};

export type UserPreferences = {
  schemaVersion: number;
  cadence: RestCadencePreference;
  audioEnabledByDefault: boolean;
  lastVolume: number;
  promptStyle: 'gentle';
  quietMode: 'off' | 'untilNextInterval' | 'untilTime';
  lastCompletedSessionAt?: string;
};

export const defaultCadence: RestCadencePreference = {
  id: 'default',
  workDurationMinutes: 50,
  restDurationMinutes: 10,
  postponeMinutes: 5,
  promptsEnabled: true,
  suggestionMode: 'fixed',
};

export const defaultPreferences: UserPreferences = {
  schemaVersion: PREFERENCES_SCHEMA_VERSION,
  cadence: defaultCadence,
  audioEnabledByDefault: false,
  lastVolume: 45,
  promptStyle: 'gentle',
  quietMode: 'off',
};
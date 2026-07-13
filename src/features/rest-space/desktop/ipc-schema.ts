import type { UserPreferences } from '../preferences/defaults';

export type SavePreferencesResult = {
  ok: boolean;
  persistedAt?: string;
  recoverableError?: 'write_failed' | 'schema_invalid';
};

export type EnterRestFullscreenInput = {
  sessionId: string;
  displayMode: 'primaryDisplay' | 'currentDisplay';
};

export type EnterRestFullscreenResult = {
  ok: boolean;
  enteredAt?: string;
  recoverableError?: 'window_unavailable' | 'permission_denied';
};

export type ExitRestFullscreenInput = {
  sessionId: string;
  reason: 'completed' | 'endedEarly' | 'skipped' | 'appClosing';
};

export type ExitRestFullscreenResult = {
  ok: boolean;
  exitedAt?: string;
};

export type QuietContext = {
  shouldSuppressPrompt: boolean;
  reason?: 'fullscreenDetected' | 'temporaryQuiet' | 'promptsDisabled';
  checkedAt: string;
};

export type CacheAssetInput = {
  assetType: 'visual' | 'audio';
  sourceProvider: string;
  providerAssetId?: string;
  remoteUrl: string;
  licenseNote: string;
  attribution?: string;
  expectedTheme: string;
};

export type CacheAssetResult = {
  ok: boolean;
  localPath?: string;
  cachedAt?: string;
  recoverableError?: 'network_failed' | 'download_failed' | 'license_missing' | 'unsupported_format' | 'write_failed';
};

export type IpcCommandMap = {
  'preferences.load': { input: void; output: UserPreferences };
  'preferences.save': { input: UserPreferences; output: SavePreferencesResult };
  'window.enterRestFullscreen': { input: EnterRestFullscreenInput; output: EnterRestFullscreenResult };
  'window.exitRestFullscreen': { input: ExitRestFullscreenInput; output: ExitRestFullscreenResult };
  'desktop.getQuietContext': { input: void; output: QuietContext };
  'content.cacheAsset': { input: CacheAssetInput; output: CacheAssetResult };
};

export const tauriCommandNames: Record<keyof IpcCommandMap, string> = {
  'preferences.load': 'preferences_load',
  'preferences.save': 'preferences_save',
  'window.enterRestFullscreen': 'window_enter_rest_fullscreen',
  'window.exitRestFullscreen': 'window_exit_rest_fullscreen',
  'desktop.getQuietContext': 'desktop_get_quiet_context',
  'content.cacheAsset': 'content_cache_asset',
};

export const ipcSchemaFieldNames = {
  preferences: ['schemaVersion', 'cadence', 'audioEnabledByDefault', 'lastVolume', 'promptStyle', 'quietMode'],
  cadence: ['id', 'workDurationMinutes', 'restDurationMinutes', 'postponeMinutes', 'promptsEnabled', 'temporaryQuietUntil', 'suggestionMode'],
  restWindow: ['sessionId', 'displayMode', 'reason'],
  quietContext: ['shouldSuppressPrompt', 'reason', 'checkedAt'],
  contentCache: ['assetType', 'sourceProvider', 'providerAssetId', 'remoteUrl', 'licenseNote', 'attribution', 'expectedTheme'],
} as const;
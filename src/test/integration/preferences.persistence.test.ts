import { describe, expect, it, vi } from 'vitest';
import { defaultPreferences, PREFERENCES_SCHEMA_VERSION, type UserPreferences } from '../../features/rest-space/preferences/defaults';
import { loadUserPreferences, saveUserPreferences, type PreferencesPort } from '../../features/rest-space/preferences/store';

function createPort(overrides: Partial<PreferencesPort>): PreferencesPort {
  return {
    load: vi.fn(async () => defaultPreferences),
    save: vi.fn(async () => ({ ok: true, persistedAt: '2026-07-13T00:00:00.000Z' })),
    ...overrides,
  };
}

describe('偏好持久化', () => {
  it('通过 preferences.load 读取并合并默认偏好', async () => {
    const storedPreferences: UserPreferences = {
      ...defaultPreferences,
      cadence: {
        ...defaultPreferences.cadence,
        workDurationMinutes: 45,
        restDurationMinutes: 8,
      },
      audioEnabledByDefault: true,
    };
    const port = createPort({ load: vi.fn(async () => storedPreferences) });

    const result = await loadUserPreferences(port);

    expect(result.preferences.cadence.workDurationMinutes).toBe(45);
    expect(result.preferences.cadence.restDurationMinutes).toBe(8);
    expect(result.preferences.audioEnabledByDefault).toBe(true);
    expect(result.preferences.promptStyle).toBe('gentle');
    expect(result.recovered).toBe(false);
  });

  it('读取损坏偏好时回退默认值且不抛出异常', async () => {
    const port = createPort({ load: vi.fn(async () => ({ schemaVersion: 1, cadence: null })) });

    const result = await loadUserPreferences(port);

    expect(result.preferences).toEqual(defaultPreferences);
    expect(result.recovered).toBe(true);
    expect(result.recoverableError).toBe('schema_invalid');
  });

  it('迁移没有 schemaVersion 的旧偏好并保留可用字段', async () => {
    const port = createPort({
      load: vi.fn(async () => ({
        cadence: {
          workDurationMinutes: 55,
          restDurationMinutes: 7,
          postponeMinutes: 3,
          promptsEnabled: false,
        },
        lastVolume: 30,
      })),
    });

    const result = await loadUserPreferences(port);

    expect(result.preferences.schemaVersion).toBe(PREFERENCES_SCHEMA_VERSION);
    expect(result.preferences.cadence.workDurationMinutes).toBe(55);
    expect(result.preferences.cadence.restDurationMinutes).toBe(7);
    expect(result.preferences.cadence.promptsEnabled).toBe(false);
    expect(result.preferences.lastVolume).toBe(30);
    expect(result.recovered).toBe(true);
    expect(result.recoverableError).toBe('migrated');
  });

  it('保存失败返回可恢复错误，不阻塞当前会话继续使用内存偏好', async () => {
    const port = createPort({ save: vi.fn(async () => ({ ok: false, recoverableError: 'write_failed' as const })) });

    const result = await saveUserPreferences(defaultPreferences, port);

    expect(result.ok).toBe(false);
    expect(result.recoverableError).toBe('write_failed');
    expect(result.preferences).toEqual(defaultPreferences);
  });
});
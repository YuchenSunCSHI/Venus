import { describe, expect, it } from 'vitest';
import { defaultCadence } from '../../../features/rest-space/preferences/defaults';
import { calculateNextPromptDue, shouldPromptNow } from '../../../features/rest-space/cadence/scheduler';
import { createRestCadence } from '../../../features/rest-space/cadence/types';

describe('cadence scheduler', () => {
  it('使用默认 50+10 节奏计算下一次提醒时间', () => {
    const workStartedAt = new Date('2026-07-13T09:00:00.000Z');

    const dueAt = calculateNextPromptDue({ cadence: defaultCadence, workStartedAt });

    expect(dueAt.toISOString()).toBe('2026-07-13T09:50:00.000Z');
  });

  it('稍后提醒使用 postponeMinutes 重新计算', () => {
    const postponedAt = new Date('2026-07-13T09:50:00.000Z');

    const dueAt = calculateNextPromptDue({ cadence: defaultCadence, postponedAt });

    expect(dueAt.toISOString()).toBe('2026-07-13T09:55:00.000Z');
  });

  it('promptsEnabled=false 时不会触发提醒', () => {
    const cadence = createRestCadence({ promptsEnabled: false });
    const now = new Date('2026-07-13T09:51:00.000Z');
    const dueAt = new Date('2026-07-13T09:50:00.000Z');

    expect(shouldPromptNow({ cadence, now, dueAt })).toBe(false);
  });
});
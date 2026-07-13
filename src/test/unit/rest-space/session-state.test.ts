import { describe, expect, it } from 'vitest';
import { createRestSession } from '../../../features/rest-space/session/types';
import { transitionRestSession } from '../../../features/rest-space/session/state-machine';

describe('rest session state machine', () => {
  it('覆盖 working、promptPending、postponed、skipped 状态流转', () => {
    const started = createRestSession({ now: new Date('2026-07-13T09:00:00.000Z') });
    const prompted = transitionRestSession(started, { type: 'promptDue', at: new Date('2026-07-13T09:50:00.000Z') });
    const postponed = transitionRestSession(prompted, { type: 'postpone', at: new Date('2026-07-13T09:50:10.000Z') });
    const promptedAgain = transitionRestSession(postponed, { type: 'promptDue', at: new Date('2026-07-13T09:55:10.000Z') });
    const skipped = transitionRestSession(promptedAgain, { type: 'skip', at: new Date('2026-07-13T09:55:20.000Z') });

    expect(started.state).toBe('working');
    expect(prompted.state).toBe('promptPending');
    expect(postponed.state).toBe('postponed');
    expect(promptedAgain.state).toBe('promptPending');
    expect(skipped).toMatchObject({ state: 'skipped', selectedAction: 'skip' });
  });

  it('覆盖 quietSuppressed、completed、endedEarly 状态流转', () => {
    const started = createRestSession({ now: new Date('2026-07-13T09:00:00.000Z') });
    const quiet = transitionRestSession(started, {
      type: 'suppressQuietly',
      reason: 'fullscreenDetected',
      at: new Date('2026-07-13T09:50:00.000Z'),
    });

    const prompted = transitionRestSession(started, { type: 'promptDue', at: new Date('2026-07-13T09:50:00.000Z') });
    const loading = transitionRestSession(prompted, { type: 'accept', at: new Date('2026-07-13T09:50:05.000Z') });
    const active = transitionRestSession(loading, {
      type: 'contentReady',
      contentId: 'fallback-forest',
      at: new Date('2026-07-13T09:50:06.000Z'),
    });
    const completed = transitionRestSession(active, { type: 'complete', at: new Date('2026-07-13T10:00:00.000Z') });
    const endedEarly = transitionRestSession(active, { type: 'endEarly', at: new Date('2026-07-13T09:51:00.000Z') });

    expect(quiet).toMatchObject({ state: 'quietSuppressed', quietReason: 'fullscreenDetected' });
    expect(completed.state).toBe('completed');
    expect(endedEarly.state).toBe('endedEarly');
  });
});
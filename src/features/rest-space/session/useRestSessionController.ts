import { useEffect, useMemo, useState } from 'react';
import { calculateNextPromptDue, shouldPromptNow } from '../cadence/scheduler';
import { createRestCadence } from '../cadence/types';
import { getDesktopQuietContext } from '../desktop/quiet-context';
import { listenToDomainEvent } from '../desktop/ipc-client';
import { enterRestWindow, exitRestWindow } from '../desktop/rest-window';
import { useDailyMoment, type DailyMomentState } from '../content/useDailyMoment';
import { defaultPreferences, type UserPreferences } from '../preferences/defaults';
import { loadUserPreferences, saveUserPreferences } from '../preferences/store';
import { domainEventNames } from '../../../shared/events/domain-events';
import { createRestSession, type RestSession } from './types';
import { transitionRestSession } from './state-machine';

export type RestSessionController = {
  preferences: UserPreferences;
  session: RestSession;
  dailyMoment: DailyMomentState;
  showNextMoment: () => void;
  updateAudioPreferences: (patch: Pick<UserPreferences, 'audioEnabledByDefault' | 'lastVolume'>) => void;
  nextPromptAt: Date;
  acceptRest: () => void;
  postponeRest: () => void;
  skipRest: () => void;
  endRest: () => void;
  completeRest: () => void;
};

export function useRestSessionController(nowFactory: () => Date = () => new Date()): RestSessionController {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [session, setSession] = useState<RestSession>(() => createInitialSession(nowFactory()));
  const [workStartedAt] = useState(() => nowFactory());
  const [postponedAt, setPostponedAt] = useState<Date>();
  const { dailyMoment, showNextMoment } = useDailyMoment(session.state === 'restLoading' || session.state === 'restActive');

  const cadence = useMemo(() => createRestCadence(preferences.cadence), [preferences.cadence]);
  const nextPromptAt = useMemo(
    () => calculateNextPromptDue({ cadence, workStartedAt, postponedAt }),
    [cadence, postponedAt, workStartedAt],
  );

  useEffect(() => {
    let mounted = true;

    void loadUserPreferences().then((result) => {
      if (mounted) {
        setPreferences(result.preferences);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!['working', 'postponed', 'quietSuppressed'].includes(session.state)) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const now = nowFactory();

      if (!shouldPromptNow({ cadence, now, dueAt: nextPromptAt })) {
        return;
      }

      void getDesktopQuietContext(preferences, undefined, now).then((quietContext) => {
        setSession((current) => {
          if (!['working', 'postponed', 'quietSuppressed'].includes(current.state)) {
            return current;
          }

          if (quietContext.shouldSuppressPrompt && quietContext.reason) {
            return transitionRestSession(current, { type: 'suppressQuietly', reason: quietContext.reason, at: now });
          }

          return transitionRestSession(current, { type: 'promptDue', at: now });
        });
      });
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [cadence, nextPromptAt, nowFactory, preferences, session.state]);

  useEffect(() => {
    if (session.state !== 'restLoading') {
      return;
    }

    void enterRestWindow(session.id);

    if (dailyMoment.state === 'ready' || dailyMoment.state === 'fallback') {
      setSession((current) => {
        if (current.state !== 'restLoading') {
          return current;
        }

        return transitionRestSession(current, { type: 'contentReady', contentId: dailyMoment.selection.moment.id, at: nowFactory() });
      });
    }
  }, [dailyMoment, nowFactory, session.id, session.state]);

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listenToDomainEvent(domainEventNames.desktopTrayAction, (event) => {
      if (event.payload.action === 'startRest') {
        setSession((current) => startRestImmediately(current, nowFactory()));
      }

      if (event.payload.action === 'pausePrompts') {
        updatePromptEnabled(false);
      }

      if (event.payload.action === 'resumePrompts') {
        updatePromptEnabled(true);
      }
    })
      .then((cleanup) => {
        if (disposed) {
          cleanup();
          return;
        }

        unlisten = cleanup;
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [nowFactory]);

  const updatePromptEnabled = (promptsEnabled: boolean) => {
    if (!promptsEnabled) {
      setSession((current) => {
        if (current.state !== 'promptPending') {
          return current;
        }

        return transitionRestSession(current, { type: 'suppressQuietly', reason: 'promptsDisabled', at: nowFactory() });
      });
    }

    setPreferences((current) => {
      if (current.cadence.promptsEnabled === promptsEnabled) {
        return current;
      }

      const nextPreferences: UserPreferences = {
        ...current,
        cadence: {
          ...current.cadence,
          promptsEnabled,
        },
      };

      void saveUserPreferences(nextPreferences);

      return nextPreferences;
    });
  };

  const updateAudioPreferences = (patch: Pick<UserPreferences, 'audioEnabledByDefault' | 'lastVolume'>) => {
    setPreferences((current) => {
      const nextPreferences: UserPreferences = {
        ...current,
        ...patch,
      };

      void saveUserPreferences(nextPreferences);

      return nextPreferences;
    });
  };

  return {
    preferences,
    session,
    dailyMoment,
    showNextMoment,
    updateAudioPreferences,
    nextPromptAt,
    acceptRest: () => {
      setSession((current) => startRestFromPrompt(current, nowFactory()));
    },
    postponeRest: () => {
      const now = nowFactory();
      setPostponedAt(now);
      setSession((current) => transitionRestSession(current, { type: 'postpone', at: now }));
    },
    skipRest: () => {
      setSession((current) => transitionRestSession(current, { type: 'skip', at: nowFactory() }));
    },
    endRest: () => {
      void exitRestWindow(session.id, 'endedEarly');
      setSession((current) => transitionRestSession(current, { type: 'endEarly', at: nowFactory() }));
    },
    completeRest: () => {
      void exitRestWindow(session.id, 'completed');
      setSession((current) => transitionRestSession(current, { type: 'complete', at: nowFactory() }));
    },
  };
}

function createInitialSession(now: Date): RestSession {
  const session = createRestSession({ now });

  if (getE2EMode() === 'rest') {
    return startRestImmediately(session, now);
  }

  if (getE2EMode() === 'prompt') {
    return transitionRestSession(session, { type: 'promptDue', at: now });
  }

  return session;
}

function startRestFromPrompt(session: RestSession, at: Date): RestSession {
  return transitionRestSession(session, { type: 'accept', at });
}

function startRestImmediately(session: RestSession, at: Date): RestSession {
  if (session.state === 'restLoading' || session.state === 'restActive' || session.state === 'restCompleting') {
    return session;
  }

  if (session.state === 'promptPending') {
    return startRestFromPrompt(session, at);
  }

  const startableSession = ['working', 'postponed', 'quietSuppressed'].includes(session.state)
    ? session
    : createRestSession({ now: at });
  const prompted = transitionRestSession(startableSession, { type: 'promptDue', at });

  return startRestFromPrompt(prompted, at);
}

function getE2EMode(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get('venusE2E');
}
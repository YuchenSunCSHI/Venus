import { useEffect, useMemo, useState } from 'react';
import { calculateNextPromptDue, shouldPromptNow } from '../cadence/scheduler';
import { createRestCadence } from '../cadence/types';
import { getDesktopQuietContext } from '../desktop/quiet-context';
import { defaultPreferences, type UserPreferences } from '../preferences/defaults';
import { loadUserPreferences } from '../preferences/store';
import { createRestSession, type RestSession } from './types';
import { transitionRestSession } from './state-machine';

export type RestSessionController = {
  preferences: UserPreferences;
  session: RestSession;
  nextPromptAt: Date;
  acceptRest: () => void;
  postponeRest: () => void;
  skipRest: () => void;
  endRest: () => void;
};

export function useRestSessionController(nowFactory: () => Date = () => new Date()): RestSessionController {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [session, setSession] = useState<RestSession>(() => createInitialSession(nowFactory()));
  const [workStartedAt] = useState(() => nowFactory());
  const [postponedAt, setPostponedAt] = useState<Date>();

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

  return {
    preferences,
    session,
    nextPromptAt,
    acceptRest: () => {
      setSession((current) => transitionRestSession(current, { type: 'accept', at: nowFactory() }));
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
      setSession((current) => transitionRestSession(current, { type: 'endEarly', at: nowFactory() }));
    },
  };
}

function createInitialSession(now: Date): RestSession {
  const session = createRestSession({ now });

  if (shouldOpenPromptForE2E()) {
    return transitionRestSession(session, { type: 'promptDue', at: now });
  }

  return session;
}

function shouldOpenPromptForE2E(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('venusE2E') === 'prompt';
}
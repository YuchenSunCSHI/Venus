import type { QuietReason, RestSession } from './types';

export type RestSessionEvent =
  | { type: 'promptDue'; at: Date }
  | { type: 'postpone'; at: Date }
  | { type: 'skip'; at: Date }
  | { type: 'suppressQuietly'; reason: QuietReason; at: Date }
  | { type: 'accept'; at: Date }
  | { type: 'contentReady'; contentId: string; audioId?: string; at: Date }
  | { type: 'complete'; at: Date }
  | { type: 'endEarly'; at: Date };

export function transitionRestSession(session: RestSession, event: RestSessionEvent): RestSession {
  switch (event.type) {
    case 'promptDue':
      return transitionFrom(session, ['working', 'postponed', 'quietSuppressed'], {
        state: 'promptPending',
        promptedAt: event.at.toISOString(),
        selectedAction: undefined,
        quietReason: undefined,
      });
    case 'postpone':
      return transitionFrom(session, ['promptPending'], {
        state: 'postponed',
        selectedAction: 'postpone',
      });
    case 'skip':
      return transitionFrom(session, ['promptPending'], {
        state: 'skipped',
        selectedAction: 'skip',
        endedAt: event.at.toISOString(),
      });
    case 'suppressQuietly':
      return transitionFrom(session, ['working', 'postponed', 'promptPending'], {
        state: 'quietSuppressed',
        selectedAction: 'autoSuppress',
        quietReason: event.reason,
      });
    case 'accept':
      return transitionFrom(session, ['promptPending'], {
        state: 'restLoading',
        stage: 'enteringRest',
        selectedAction: 'accept',
        startedAt: event.at.toISOString(),
      });
    case 'contentReady':
      return transitionFrom(session, ['restLoading'], {
        state: 'restActive',
        stage: 'settling',
        contentId: event.contentId,
        audioId: event.audioId,
      });
    case 'complete':
      return transitionFrom(session, ['restActive', 'restCompleting'], {
        state: 'completed',
        stage: 'returningToWork',
        endedAt: event.at.toISOString(),
      });
    case 'endEarly':
      return transitionFrom(session, ['restLoading', 'restActive'], {
        state: 'endedEarly',
        stage: 'returningToWork',
        selectedAction: 'end',
        endedAt: event.at.toISOString(),
      });
  }
}

function transitionFrom(
  session: RestSession,
  allowedStates: RestSession['state'][],
  patch: Partial<RestSession>,
): RestSession {
  if (!allowedStates.includes(session.state)) {
    throw new Error(`Illegal rest session transition from ${session.state}`);
  }

  return {
    ...session,
    ...patch,
  };
}
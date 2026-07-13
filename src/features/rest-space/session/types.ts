export type RestSessionState =
  | 'idle'
  | 'working'
  | 'promptPending'
  | 'postponed'
  | 'skipped'
  | 'restLoading'
  | 'restActive'
  | 'restCompleting'
  | 'completed'
  | 'endedEarly'
  | 'quietSuppressed';

export type RestStage = 'enteringRest' | 'settling' | 'returningToWork';

export type RestSelectedAction = 'accept' | 'postpone' | 'skip' | 'end' | 'autoSuppress';

export type QuietReason = 'fullscreenDetected' | 'temporaryQuiet' | 'promptsDisabled';

export type RestSession = {
  id: string;
  createdAt: string;
  promptedAt?: string;
  startedAt?: string;
  endedAt?: string;
  state: RestSessionState;
  stage?: RestStage;
  selectedAction?: RestSelectedAction;
  quietReason?: QuietReason;
  contentId?: string;
  audioId?: string;
};

export type CreateRestSessionInput = {
  id?: string;
  now: Date;
};

export function createRestSession({ id, now }: CreateRestSessionInput): RestSession {
  return {
    id: id ?? `rest-${now.getTime()}`,
    createdAt: now.toISOString(),
    state: 'working',
  };
}
export const domainEventNames = {
  restPromptDue: 'rest.promptDue',
  restSessionStateChanged: 'rest.sessionStateChanged',
  audioPlaybackStateChanged: 'audio.playbackStateChanged',
  desktopQuietContextChanged: 'desktop://quiet-context-changed',
  desktopTrayAction: 'desktop://tray-action',
} as const;

export type RestPromptDueEvent = {
  sessionId: string;
  cadenceSnapshot: {
    workDurationMinutes: number;
    restDurationMinutes: number;
  };
  dueAt: string;
};

export type RestSessionStateChangedEvent = {
  sessionId: string;
  from: string;
  to: string;
  reason?: string;
  changedAt: string;
};

export type AudioPlaybackStateChangedEvent = {
  sessionId: string;
  audioId?: string;
  from: string;
  to: string;
  changedAt: string;
};

export type QuietContextChangedEvent = {
  shouldSuppressPrompt: boolean;
  reason?: 'fullscreenDetected' | 'temporaryQuiet' | 'promptsDisabled';
  emittedAt: string;
};

export type TrayActionEvent = {
  action: 'openApp' | 'startRest' | 'pausePrompts' | 'resumePrompts' | 'quit';
  emittedAt: string;
};

export type DomainEventPayloads = {
  [domainEventNames.restPromptDue]: RestPromptDueEvent;
  [domainEventNames.restSessionStateChanged]: RestSessionStateChangedEvent;
  [domainEventNames.audioPlaybackStateChanged]: AudioPlaybackStateChangedEvent;
  [domainEventNames.desktopQuietContextChanged]: QuietContextChangedEvent;
  [domainEventNames.desktopTrayAction]: TrayActionEvent;
};
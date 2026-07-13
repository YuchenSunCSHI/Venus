import type { RestCadence } from './types';

const minuteMs = 60_000;

export type CalculateNextPromptDueInput = {
  cadence: RestCadence;
  workStartedAt?: Date;
  postponedAt?: Date;
};

export function calculateNextPromptDue(input: CalculateNextPromptDueInput): Date {
  const { cadence, workStartedAt, postponedAt } = input;
  const baseTime = postponedAt ?? workStartedAt;

  if (!baseTime) {
    throw new Error('workStartedAt or postponedAt is required');
  }

  const minutesUntilPrompt = postponedAt ? cadence.postponeMinutes : cadence.workDurationMinutes;
  return new Date(baseTime.getTime() + minutesUntilPrompt * minuteMs);
}

export type ShouldPromptNowInput = {
  cadence: RestCadence;
  now: Date;
  dueAt: Date;
};

export function shouldPromptNow({ cadence, now, dueAt }: ShouldPromptNowInput): boolean {
  if (!cadence.promptsEnabled) {
    return false;
  }

  if (cadence.temporaryQuietUntil && new Date(cadence.temporaryQuietUntil).getTime() > now.getTime()) {
    return false;
  }

  return now.getTime() >= dueAt.getTime();
}
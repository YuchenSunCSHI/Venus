export const performanceMarkNames = {
  promptShown: 'venus.prompt.shown',
  promptActionFeedback: 'venus.prompt.action-feedback',
  restSpaceRequested: 'venus.rest-space.requested',
  restSpaceVisible: 'venus.rest-space.visible',
  audioActionRequested: 'venus.audio.action-requested',
  audioFeedback: 'venus.audio.feedback',
  quietCheckStarted: 'venus.quiet-check.started',
  quietCheckCompleted: 'venus.quiet-check.completed',
} as const;

export type PerformanceMarkName = (typeof performanceMarkNames)[keyof typeof performanceMarkNames];

export function markVenusPerformance(name: PerformanceMarkName, detail?: Record<string, unknown>): void {
  if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
    return;
  }

  performance.mark(name, detail ? { detail } : undefined);
}

export function measureVenusPerformance(name: string, startMark: PerformanceMarkName, endMark: PerformanceMarkName): PerformanceMeasure | undefined {
  if (typeof performance === 'undefined' || typeof performance.measure !== 'function') {
    return undefined;
  }

  performance.measure(name, startMark, endMark);
  const measures = performance.getEntriesByName(name, 'measure');
  return measures.at(-1) as PerformanceMeasure | undefined;
}
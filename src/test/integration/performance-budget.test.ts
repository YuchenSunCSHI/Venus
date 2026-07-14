import { describe, expect, it } from 'vitest';
import { markVenusPerformance, measureVenusPerformance, performanceMarkNames } from '../../shared/performance/marks';

const budgets = {
  promptFeedbackMs: 1_000,
  restSpaceVisibleMs: 2_000,
  audioFeedbackMs: 1_000,
} as const;

describe('performance budget marks', () => {
  it('汇总 prompt、rest space 和 audio 的 MVP 性能预算', () => {
    expect(budgets).toEqual({
      promptFeedbackMs: 1_000,
      restSpaceVisibleMs: 2_000,
      audioFeedbackMs: 1_000,
    });
  });

  it('记录并测量 prompt 反馈预算', () => {
    const duration = measureBudgetedInteraction(
      performanceMarkNames.promptShown,
      performanceMarkNames.promptActionFeedback,
      'venus.prompt.feedback.measure',
    );

    expect(duration).toBeLessThanOrEqual(budgets.promptFeedbackMs);
  });

  it('记录并测量 rest space 可见预算', () => {
    const duration = measureBudgetedInteraction(
      performanceMarkNames.restSpaceRequested,
      performanceMarkNames.restSpaceVisible,
      'venus.rest-space.visible.measure',
    );

    expect(duration).toBeLessThanOrEqual(budgets.restSpaceVisibleMs);
  });

  it('记录并测量 audio 反馈预算', () => {
    const duration = measureBudgetedInteraction(
      performanceMarkNames.audioActionRequested,
      performanceMarkNames.audioFeedback,
      'venus.audio.feedback.measure',
    );

    expect(duration).toBeLessThanOrEqual(budgets.audioFeedbackMs);
  });
});

function measureBudgetedInteraction(startMark: Parameters<typeof markVenusPerformance>[0], endMark: Parameters<typeof markVenusPerformance>[0], measureName: string): number {
  performance.clearMarks();
  performance.clearMeasures();

  markVenusPerformance(startMark);
  markVenusPerformance(endMark);

  const measure = measureVenusPerformance(measureName, startMark, endMark);

  expect(measure).toBeDefined();
  return measure?.duration ?? Number.POSITIVE_INFINITY;
}
export type Clock = {
  now(): Date;
  setTimeout(callback: () => void, delayMs: number): ReturnType<typeof setTimeout>;
  clearTimeout(timerId: ReturnType<typeof setTimeout>): void;
};

export const systemClock: Clock = {
  now: () => new Date(),
  setTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimeout: (timerId) => clearTimeout(timerId),
};

export function createFixedClock(initialNow: Date): Clock & { advanceTo(nextNow: Date): void } {
  let currentNow = initialNow;

  return {
    now: () => currentNow,
    setTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
    clearTimeout: (timerId) => clearTimeout(timerId),
    advanceTo(nextNow) {
      currentNow = nextNow;
    },
  };
}
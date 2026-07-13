import { useEffect, useState } from 'react';
import { selectDailyMoment } from './dailyMomentSelector';
import type { DailyMomentSelection, VisualMoment } from './types';
import { wikimediaCommonsProvider } from './wikimediaProvider';
import type { DateKey } from '../shared/types';

export type DailyMomentState =
  | { state: 'loading' }
  | { state: 'ready'; selection: DailyMomentSelection; selections: DailyMomentSelection[]; activeIndex: number }
  | { state: 'fallback'; selection: DailyMomentSelection; selections: DailyMomentSelection[]; activeIndex: number }
  | { state: 'unavailable'; message: string };

export type DailyMomentController = {
  dailyMoment: DailyMomentState;
  showNextMoment: () => void;
};

const preferredThemes = ['forest', 'lake', 'meadow', 'mountain', 'ocean', 'rain', 'sky', 'stars'] as const;

export function useDailyMoment(enabled: boolean): DailyMomentController {
  const [state, setState] = useState<DailyMomentState>({ state: 'loading' });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let mounted = true;

    void Promise.all([loadOnlineCandidates(dateKey(new Date())), loadFallbackMoments()])
      .then(([onlineCandidates, fallbacks]) => {
        if (!mounted) {
          return;
        }

        const currentDateKey = dateKey(new Date());
        const selection = selectDailyMoment({
          dateKey: currentDateKey,
          onlineCandidates,
          cacheEntries: [],
          bundledFallbacks: fallbacks,
        });
        const onlineSelections = onlineCandidates.map((candidate) =>
          selectDailyMoment({
            dateKey: currentDateKey,
            onlineCandidates: [candidate],
            cacheEntries: [],
            bundledFallbacks: fallbacks,
          }),
        );
        const selections = onlineSelections.filter((item) => item.sourceType === 'online');

        if (!selections.some((item) => item.moment.id === selection.moment.id)) {
          selections.push(selection);
        }

        setState({
          state: selection.sourceType === 'online' ? 'ready' : 'fallback',
          selection,
          selections,
          activeIndex: 0,
        });
      })
      .catch(() => {
        if (mounted) {
          setState({ state: 'unavailable', message: '暂时无法准备今日画面' });
        }
      });

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return {
    dailyMoment: state,
    showNextMoment: () => {
      setState((current) => {
        if ((current.state !== 'ready' && current.state !== 'fallback') || current.selections.length <= 1) {
          return current;
        }

        const activeIndex = (current.activeIndex + 1) % current.selections.length;

        return {
          ...current,
          activeIndex,
          selection: current.selections[activeIndex],
        };
      });
    },
  };
}

async function loadOnlineCandidates(currentDateKey: DateKey) {
  if (getProviderMode() === 'fallback') {
    return [];
  }

  const result = await wikimediaCommonsProvider.searchDailyMoment({
    dateKey: currentDateKey,
    preferredThemes: [...preferredThemes],
    locale: 'zh-CN',
    timeoutMs: 2_500,
  });

  return result.ok ? result.candidates : [];
}

async function loadFallbackMoments(): Promise<VisualMoment[]> {
  const response = await fetch('/moments/fallback.json');
  if (!response.ok) {
    throw new Error('Unable to load bundled fallback moments');
  }

  const manifest = (await response.json()) as { visualMoments?: VisualMoment[] };
  return manifest.visualMoments ?? [];
}

function dateKey(date: Date): DateKey {
  return date.toISOString().slice(0, 10) as DateKey;
}

function getProviderMode(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get('venusProvider');
}
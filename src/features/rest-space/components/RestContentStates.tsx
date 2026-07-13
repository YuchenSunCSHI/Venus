import type { DailyMomentState } from '../content/useDailyMoment';

export type RestContentStatesProps = {
  dailyMoment: DailyMomentState;
};

export function RestContentStates({ dailyMoment }: RestContentStatesProps) {
  if (dailyMoment.state === 'loading') {
    return <p className="rest-space-status">正在准备今日画面</p>;
  }

  if (dailyMoment.state === 'unavailable') {
    return <p className="rest-space-status">{dailyMoment.message}</p>;
  }

  if (dailyMoment.state === 'fallback') {
    return <p className="rest-space-status">已使用本地离线画面</p>;
  }

  return <p className="rest-space-status">今日画面已准备好</p>;
}
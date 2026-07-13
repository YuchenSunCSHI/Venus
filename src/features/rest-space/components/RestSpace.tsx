import { useEffect, useRef, useState } from 'react';
import type { RestSession } from '../session/types';
import type { DailyMomentState } from '../content/useDailyMoment';
import type { VisualMoment } from '../content/types';
import { RestContentStates } from './RestContentStates';

export type RestSpaceProps = {
  session: RestSession;
  dailyMoment: DailyMomentState;
  onEndRest: () => void;
  onCompleteRest: () => void;
  onNextMoment: () => void;
};

export function RestSpace({ session, dailyMoment, onEndRest, onCompleteRest, onNextMoment }: RestSpaceProps) {
  const moment = dailyMoment.state === 'ready' || dailyMoment.state === 'fallback' ? dailyMoment.selection.moment : undefined;
  const latestMomentRef = useRef<VisualMoment>();
  const [previousMoment, setPreviousMoment] = useState<VisualMoment>();

  useEffect(() => {
    if (session.state !== 'restActive') {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || isInteractiveElement(event.target)) {
        return;
      }

      event.preventDefault();
      onNextMoment();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextMoment, session.state]);

  useEffect(() => {
    if (!moment) {
      latestMomentRef.current = undefined;
      setPreviousMoment(undefined);
      return undefined;
    }

    const latestMoment = latestMomentRef.current;

    if (latestMoment && latestMoment.id !== moment.id) {
      setPreviousMoment(latestMoment);
      latestMomentRef.current = moment;

      const timeoutId = window.setTimeout(() => setPreviousMoment(undefined), 900);

      return () => window.clearTimeout(timeoutId);
    }

    latestMomentRef.current = moment;
    return undefined;
  }, [moment]);

  if (!['restLoading', 'restActive', 'restCompleting'].includes(session.state)) {
    return null;
  }

  return (
    <section className="rest-space" aria-label="全屏美感休息空间" data-state={session.state}>
      {previousMoment ? <RestSpaceImageLayer moment={previousMoment} layer="previous" /> : null}
      {moment ? <RestSpaceImageLayer moment={moment} layer="current" /> : <div className="rest-space-fallback" />}
      <div className="rest-space-scrim" />
      <div className="rest-space-copy">
        <p className="eyebrow">每日一景</p>
        <h1>{moment?.title ?? '正在进入休息'}</h1>
        <RestContentStates dailyMoment={dailyMoment} />
      </div>
      <div className="rest-space-controls" aria-label="休息空间控制">
        {session.state === 'restActive' ? (
          <button type="button" onClick={onCompleteRest}>
            完成休息
          </button>
        ) : null}
        {session.state === 'restLoading' || session.state === 'restActive' ? (
          <button type="button" onClick={onEndRest}>
            返回工作
          </button>
        ) : null}
      </div>
    </section>
  );
}

function RestSpaceImageLayer({ moment, layer }: { moment: VisualMoment; layer: 'current' | 'previous' }) {
  return (
    <div className={`rest-space-image-layer rest-space-image-layer-${layer}`} aria-hidden={layer === 'previous'}>
      <img className="rest-space-image" src={moment.imageUrl} alt={layer === 'current' ? moment.title : ''} />
    </div>
  );
}

function isInteractiveElement(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('button, a, input, textarea, select'));
}
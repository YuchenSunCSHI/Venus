import type { RestSession } from '../session/types';

export type RestPromptProps = {
  session: RestSession;
  onAccept: () => void;
  onPostpone: () => void;
  onSkip: () => void;
};

export function RestPrompt({ session, onAccept, onPostpone, onSkip }: RestPromptProps) {
  if (session.state !== 'promptPending') {
    return null;
  }

  return (
    <section className="rest-prompt" aria-labelledby="rest-prompt-title" aria-live="polite">
      <div>
        <p className="eyebrow">短暂离开屏幕</p>
        <h2 id="rest-prompt-title">休息一下</h2>
        <p>给眼睛和注意力一点缓冲，十分钟后再回来。</p>
      </div>
      <div className="prompt-actions" aria-label="休息提醒操作">
        <button className="primary-action" type="button" onClick={onAccept}>
          开始休息
        </button>
        <button type="button" onClick={onPostpone}>
          稍后提醒
        </button>
        <button type="button" onClick={onSkip}>
          跳过本次
        </button>
      </div>
    </section>
  );
}
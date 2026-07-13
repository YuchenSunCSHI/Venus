import type { RestSession } from '../session/types';

export type CadenceStatusProps = {
  session: RestSession;
  nextPromptAt?: Date;
};

const statusCopy: Record<RestSession['state'], string> = {
  idle: '准备开始',
  working: '工作间隔进行中',
  promptPending: '可以进入休息',
  postponed: '已稍后提醒',
  skipped: '本轮已跳过',
  quietSuppressed: '当前保持静默',
  restLoading: '正在进入休息',
  restActive: '休息中',
  restCompleting: '准备回到工作',
  completed: '休息完成',
  endedEarly: '已提前结束',
};

export function CadenceStatus({ session, nextPromptAt }: CadenceStatusProps) {
  return (
    <section className="cadence-status" aria-label="当前休息节奏状态">
      <p className="eyebrow">Venus</p>
      <h1>{statusCopy[session.state]}</h1>
      {nextPromptAt ? <p>下一次提醒约在 {formatTime(nextPromptAt)}。</p> : <p>保持轻一点，需要时再提醒。</p>}
    </section>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
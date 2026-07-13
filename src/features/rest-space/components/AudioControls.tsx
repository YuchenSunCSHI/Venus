import type { AudioPlaybackSession } from '../audio/types';

export type AudioControlsProps = {
  audioSession: AudioPlaybackSession;
  onEnableAudio: () => void;
  onToggleMuted: () => void;
  onVolumeChange: (volume: number) => void;
};

export function AudioControls({ audioSession, onEnableAudio, onToggleMuted, onVolumeChange }: AudioControlsProps) {
  if (audioSession.state === 'unavailable') {
    return <p className="audio-status">声音暂时不可用，可继续无声休息</p>;
  }

  if (audioSession.state === 'off') {
    return (
      <button type="button" onClick={onEnableAudio}>
        开启声音
      </button>
    );
  }

  return (
    <div className="audio-controls" aria-label="声音控制">
      <button type="button" onClick={onToggleMuted}>
        {audioSession.muted ? '恢复声音' : '静音'}
      </button>
      <label>
        <span>音量</span>
        <input
          type="range"
          min="0"
          max="100"
          value={audioSession.volume}
          aria-label="音量"
          onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
        />
      </label>
      <p className="audio-status">{statusCopy[audioSession.state]}</p>
    </div>
  );
}

const statusCopy: Record<AudioPlaybackSession['state'], string> = {
  off: '声音未开启',
  loading: '正在准备声音',
  playing: '声音播放中',
  muted: '已静音',
  unavailable: '声音暂时不可用',
  fadingOut: '声音正在淡出',
};
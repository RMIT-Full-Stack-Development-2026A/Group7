import {
  ChevronsLeft, ChevronsRight, Pause, Play, SkipBack, SkipForward,
} from 'lucide-react';
import { SPEED_OPTIONS } from '../../logic/matchReplay.utils.js';

export function ReplayControls({
  step, totalMoves, isActivelyPlaying, speedMs,
  onJumpStart, onBackward, onPlayPause, onForward, onJumpEnd, onSpeedChange,
}) {
  const noMoves = totalMoves === 0;
  return (
    <div className="match-replay-controls mt-4 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={onJumpStart} className="match-replay-control-button" aria-label="Jump to start" disabled={step === 0}>
        <ChevronsLeft className="h-5 w-5" />
      </button>
      <button type="button" onClick={onBackward} className="match-replay-control-button" aria-label="Step backward" disabled={step === 0}>
        <SkipBack className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onPlayPause}
        className="match-replay-control-button match-replay-control-primary"
        aria-label={isActivelyPlaying ? 'Pause replay' : 'Resume replay'}
        disabled={noMoves}
        title={noMoves ? 'No moves were recorded for this match' : undefined}
      >
        {isActivelyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </button>
      <button type="button" onClick={onForward} className="match-replay-control-button" aria-label="Step forward" disabled={step >= totalMoves}>
        <SkipForward className="h-5 w-5" />
      </button>
      <button type="button" onClick={onJumpEnd} className="match-replay-control-button" aria-label="Jump to end" disabled={step >= totalMoves}>
        <ChevronsRight className="h-5 w-5" />
      </button>

      <div className="match-replay-speed ml-3 inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-1 py-1 text-xs">
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onSpeedChange(option.valueMs)}
            className={`match-replay-speed-button ${speedMs === option.valueMs ? 'match-replay-speed-active' : ''}`}
            aria-pressed={speedMs === option.valueMs}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ReplayControls;

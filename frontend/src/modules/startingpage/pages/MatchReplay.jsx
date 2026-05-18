import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';
import {
  columnLetter,
  formatDateTime,
  formatDuration,
  resolveSymbolColor,
} from '../logic/matchReplay.utils.js';
import { useMatchReplay } from '../hooks/useMatchReplay.js';
import ReplayBoard from '../components/MatchReplay/ReplayBoard.jsx';
import ReplayControls from '../components/MatchReplay/ReplayControls.jsx';
import '../../../shared/styles/MatchReplay.css';

const BackToMatches = () => (
  <NavLink
    to={ROUTES.MATCH_HISTORY}
    className="neon-outline-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition"
  >
    <ArrowLeft size={16} />
    Back to Matches
  </NavLink>
);

const ReplayShell = ({ children, narrow = false }) => (
  <div className="neon-page min-h-screen px-4 py-8">
    <div className={`neon-shell mx-auto ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <BackToMatches />
      </div>
      {children}
    </div>
  </div>
);

const LoadingPanel = () => (
  <div className="match-replay-placeholder rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
    Loading match replay…
  </div>
);

const ParticipantCard = ({ player, color, isCurrentTurn }) => (
  <div
    className={`match-replay-player rounded-2xl border px-3 py-3 ${
      isCurrentTurn ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/[0.04]'
    }`}
  >
    <div className="flex items-center gap-3">
      <img
        src={resolveAvatarUrl(player.avatar, { isAI: player.isAI })}
        alt={player.name}
        className="h-12 w-12 rounded-full border border-white/10 object-cover"
      />
      <div className="min-w-0">
        <div className="truncate text-base font-bold text-white">{player.name}</div>
        <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color }}>
          {player.symbol}
        </div>
      </div>
    </div>
  </div>
);

const CurrentMoveReadout = ({ currentMove, totalMoves, boardSize, participants }) => {
  if (!currentMove) {
    return (
      <span>
        {totalMoves === 0 ? 'No moves were recorded for this match.' : 'Empty board · press Play to begin'}
      </span>
    );
  }
  return (
    <>
      <span className="font-semibold text-white">Move #{currentMove.moveNumber}</span>
      <span>
        Player{' '}
        <span style={{ color: resolveSymbolColor(currentMove.player, participants) }}>
          {currentMove.player}
        </span>
      </span>
      <span>
        Position{' '}
        <span className="font-semibold text-white">
          {columnLetter(currentMove.col)}{boardSize - currentMove.row}
        </span>
      </span>
    </>
  );
};

export function MatchReplay() {
  const navigate = useNavigate();
  const {
    isPremiumKnown, userIsPremium, loading, effectiveError, replay,
    totalMoves, boardSize, participants, board, currentMove,
    winningTiles, showWinningHighlight,
    step, isActivelyPlaying, speedMs, setSpeedMs,
    handlePlayPause, handleForward, handleBackward, handleJumpStart, handleJumpEnd, handleScrub,
  } = useMatchReplay();

  useEffect(() => {
    if (isPremiumKnown && !userIsPremium) {
      navigate(ROUTES.MATCH_HISTORY, { replace: true });
    }
  }, [isPremiumKnown, navigate, userIsPremium]);

  if (!isPremiumKnown || !userIsPremium) return <ReplayShell><LoadingPanel /></ReplayShell>;
  if (loading) return <ReplayShell><LoadingPanel /></ReplayShell>;
  if (effectiveError) {
    return (
      <ReplayShell narrow>
        <div className="rounded-[24px] border border-rose-400/30 bg-rose-500/10 px-5 py-6 text-sm text-rose-100">
          {effectiveError}
        </div>
      </ReplayShell>
    );
  }
  if (!replay) {
    return (
      <ReplayShell narrow>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-6 text-center text-sm text-slate-300">
          Replay not available.
        </div>
      </ReplayShell>
    );
  }

  const winner = replay?.result?.winner ?? replay?.gameInfo?.result?.winner ?? null;
  const winnerLabel = winner === 'draw' ? 'Draw' : winner ? `Winner: ${winner}` : 'Result —';

  return (
    <div className="neon-page min-h-screen px-4 py-8">
      <div className="neon-shell mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <BackToMatches />
          <div className="match-replay-session-badge rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Session No.</div>
            <div className="mt-1 text-sm font-semibold text-white">{replay.gameInfo.gameId}</div>
          </div>
        </div>

        <div className="neon-card neon-card-strong rounded-[28px] p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="match-replay-kicker mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Trophy className="h-3.5 w-3.5" />
                Match Replay
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {totalMoves === 0 ? 'No moves recorded' : `Step ${step} of ${totalMoves}`}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {boardSize}x{boardSize} board · {formatDateTime(replay.gameInfo.completedAt || replay.gameInfo.startedAt)} ·{' '}
                {formatDuration(replay.gameInfo.duration)}
              </p>
              {totalMoves === 0 ? (
                <p className="mt-2 max-w-xl text-xs text-amber-200/80">
                  This match was completed before move-by-move recording was enabled, so there's no playback to show.
                  New matches will replay normally.
                </p>
              ) : null}
            </div>
            <div className="match-replay-result rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              {winnerLabel}
            </div>
          </div>

          <div className="match-replay-players mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {participants.map((player) => (
              <ParticipantCard
                key={`replay-player-${player.id}-${player.symbol}`}
                player={player}
                color={resolveSymbolColor(player.symbol, replay.participants)}
                isCurrentTurn={Boolean(currentMove && currentMove.player === player.symbol)}
              />
            ))}
          </div>

          <ReplayBoard
            boardSize={boardSize}
            board={board}
            currentMove={currentMove}
            winningTiles={winningTiles}
            showWinningHighlight={showWinningHighlight}
            participants={replay.participants}
          />

          <div className="match-replay-current-move mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
            <CurrentMoveReadout
              currentMove={currentMove}
              totalMoves={totalMoves}
              boardSize={boardSize}
              participants={replay.participants}
            />
          </div>

          <div className="match-replay-scrubber mt-5">
            <input
              type="range"
              min={0}
              max={Math.max(totalMoves, 1)}
              value={step}
              onChange={handleScrub}
              aria-label="Replay step"
              disabled={totalMoves === 0}
            />
          </div>

          <ReplayControls
            step={step}
            totalMoves={totalMoves}
            isActivelyPlaying={isActivelyPlaying}
            speedMs={speedMs}
            onJumpStart={handleJumpStart}
            onBackward={handleBackward}
            onPlayPause={handlePlayPause}
            onForward={handleForward}
            onJumpEnd={handleJumpEnd}
            onSpeedChange={setSpeedMs}
          />
        </div>
      </div>
    </div>
  );
}

export default MatchReplay;

import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, Crown, Play, Swords } from 'lucide-react';
import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';
import ROUTES from '../../../../router/routes.config.js';
import {
  formatDateTime,
  formatDuration,
  getMatchParticipants,
  getResultClasses,
} from '../../logic/gameSessionHistory.utils.js';

const ParticipantTile = ({ match, participant, index }) => (
  <div
    key={`${match.gameId}-${participant.id || participant.name || index}`}
    className="match-history-participant flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
  >
    <img
      src={resolveAvatarUrl(participant.avatar, { isAI: participant.isAI })}
      alt={participant.name || `Player ${index + 1}`}
      className="h-12 w-12 rounded-full border border-white/10 object-cover"
    />
    <div className="min-w-0">
      <div className="truncate text-base font-bold text-white">
        {participant.name || `Player ${index + 1}`}
      </div>
      <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {participant.marker || participant.symbol || `P${index + 1}`}
      </div>
    </div>
  </div>
);

const ReplayLink = ({ match, isPremium }) => {
  if (isPremium) {
    return (
      <Link
        to={ROUTES.MATCH_REPLAY.replace(':gameId', encodeURIComponent(match.gameId))}
        className="match-history-play-button"
        aria-label={`Watch replay of session ${match.gameId}`}
        title="Watch replay"
      >
        <span className="match-history-play-icon">
          <Play size={12} fill="currentColor" />
        </span>
        Watch replay
      </Link>
    );
  }
  return (
    <span
      className="match-history-play-button match-history-play-button-disabled"
      title="Match replay is a Premium feature"
      aria-label="Match replay is a Premium feature"
    >
      <span className="match-history-play-icon">
        <Crown size={12} />
      </span>
      Premium replay
    </span>
  );
};

export function MatchCard({ match, isPremium }) {
  const participants = getMatchParticipants(match);
  const playerNames = participants
    .slice(0, 4)
    .map((participant, index) => participant.name || `Player ${index + 1}`)
    .join(', ') || 'Unknown';

  return (
    <div className="match-history-card rounded-[28px] border border-white/8 bg-slate-950/40 p-5 transition hover:border-blue-400/20 hover:bg-slate-950/55">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getResultClasses(match.resultLabel)}`}>
                {match.resultLabel}
              </span>
              <span className="match-history-type rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                {match.gameType || 'Game Session'}
              </span>
              <span className="match-history-size rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {match.boardSize}x{match.boardSize}
              </span>
              {match.playerCount ? (
                <span className="rounded-full border border-purple-400/15 bg-purple-400/10 px-3 py-1 text-xs text-purple-100">
                  {match.playerCount} Players
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {participants.map((participant, index) => (
                <ParticipantTile
                  key={`${match.gameId}-${participant.id || participant.name || index}`}
                  match={match}
                  participant={participant}
                  index={index}
                />
              ))}
            </div>

            <div className="match-history-meta mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={14} />
                {formatDateTime(match.completedAt || match.startedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Swords size={14} />
                {match.totalMoves} moves
              </span>
              <span>{formatDuration(match.duration)}</span>
              <span>Players: {playerNames}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 lg:items-end lg:justify-end">
          <div className="match-history-id rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Session No.</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
              {match.sessionNumber || match.gameId}
              <ArrowUpRight size={14} className="text-slate-400" />
            </div>
          </div>
          <ReplayLink match={match} isPremium={isPremium} />
        </div>
      </div>
    </div>
  );
}

export default MatchCard;

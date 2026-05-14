import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Clock3, Swords, Trophy } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { httpHelper } from '../../../services/httpHelper.js';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import { resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';

const HISTORY_LIMIT = 50;

const getResultClasses = (resultLabel) => {
  if (resultLabel === 'Victory') {
    return 'match-history-result-victory border-emerald-400/20 bg-emerald-500/10 text-emerald-300';
  }

  if (resultLabel === 'Defeat') {
    return 'match-history-result-defeat border-rose-400/20 bg-rose-500/10 text-rose-300';
  }

  return 'match-history-result-draw border-amber-400/20 bg-amber-500/10 text-amber-200';
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Unknown time';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'Duration unavailable';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

const getMatchParticipants = (match) => {
  if (Array.isArray(match.participants) && match.participants.length > 0) {
    return match.participants;
  }

  return [match.player, match.opponent].filter(Boolean).map((participant, index) => ({
    ...participant,
    userId: participant.userId || participant.id,
    order: index + 1,
    marker: participant.symbol,
  }));
};

export function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const storedIdentity = getStoredAuthIdentity();

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!storedIdentity.userId) {
        if (isMounted) {
          setMatches([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await httpHelper.get(
          `${getApiBaseUrl()}/games/user/history?userId=${encodeURIComponent(storedIdentity.userId)}&limit=${HISTORY_LIMIT}`
        );
        const historyGames = response?.data?.data?.games || [];

        if (!isMounted) {
          return;
        }

        setMatches(historyGames);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error?.message || 'Failed to load match history.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [storedIdentity.userId]);

  return (
    <div className="neon-page min-h-screen px-4 py-8">
      <div className="neon-shell mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <NavLink
            to={ROUTES.MAIN_MENU}
            className="neon-outline-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </NavLink>

          <div className="match-history-count rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {matches.length} match{matches.length === 1 ? '' : 'es'}
          </div>
        </div>

        <div className="neon-card neon-card-strong overflow-hidden rounded-[32px]">
          <div className="match-history-hero border-b border-white/8 bg-gradient-to-r from-white/6 via-blue-400/6 to-purple-400/8 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="match-history-kicker mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  <Trophy className="h-3.5 w-3.5" />
                  Match Archive
                </div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">All Matches</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                  Browse your previous battles, results, and opponents in one place.
                </p>
              </div>

              <div className="match-history-refresh rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
                Latest refresh: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {isLoading ? (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
                Loading match history...
              </div>
            ) : errorMessage ? (
              <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
                {errorMessage}
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
                No completed matches yet. Start a game and your history will show up here.
              </div>
            ) : (
              <div className="grid gap-4">
                {matches.map((match) => (
                  <div
                    key={match.gameId}
                    className="match-history-card rounded-[28px] border border-white/8 bg-slate-950/40 p-5 transition hover:border-blue-400/20 hover:bg-slate-950/55"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getResultClasses(match.resultLabel)}`}>
                              {match.resultLabel}
                            </span>
                            <span className="match-history-size rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                              {match.boardSize}x{match.boardSize}
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {getMatchParticipants(match).map((participant, index) => (
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
                                  <div className="truncate text-base font-bold text-white">{participant.name || `Player ${index + 1}`}</div>
                                  <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    {participant.marker || participant.symbol || `P${index + 1}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="match-history-meta mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={14} />
                              {formatDateTime(match.completedAt)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Swords size={14} />
                              {match.totalMoves} moves
                            </span>
                            <span>{formatDuration(match.duration)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 lg:justify-end">
                        <div className="match-history-id rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Match ID</div>
                          <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
                            {match.gameId}
                            <ArrowUpRight size={14} className="text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchHistory;

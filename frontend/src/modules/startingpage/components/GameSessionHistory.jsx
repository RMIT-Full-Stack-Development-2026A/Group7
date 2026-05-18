import { Trophy } from 'lucide-react';
import { useGameSessionHistory } from '../hooks/useGameSessionHistory.js';
import MatchCard from './SessionHistory/MatchCard.jsx';
import MatchFilters from './SessionHistory/MatchFilters.jsx';
import '../../../shared/styles/MatchReplay.css';

export function GameSessionHistory({
  title = 'All Matches',
  description = 'Browse your previous battles, results, and opponents in one place.',
  compact = false,
}) {
  const {
    matches, filters, pagination, lastRefresh, isLoading, errorMessage, isPremium,
    activeFilterCount, updateFilter, resetFilters,
  } = useGameSessionHistory();

  const totalLabel = pagination.total ?? matches.length;

  return (
    <div className="neon-card neon-card-strong overflow-hidden rounded-[32px]">
      <div className="match-history-hero border-b border-white/8 bg-gradient-to-r from-white/6 via-blue-400/6 to-purple-400/8 px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="match-history-kicker mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <Trophy className="h-3.5 w-3.5" />
              Game Sessions
            </div>
            <h1 className={compact ? 'text-2xl font-bold text-white sm:text-3xl' : 'text-3xl font-bold text-white sm:text-4xl'}>
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
          </div>

          <div className="match-history-refresh rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
            Latest refresh: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Loading'}
          </div>
        </div>
      </div>

      <MatchFilters
        filters={filters}
        activeFilterCount={activeFilterCount}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <div className="p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span>{totalLabel} matching session{totalLabel === 1 ? '' : 's'}</span>
          <span>Search is case-insensitive and matches partial text.</span>
        </div>

        {isLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
            Loading game sessions...
          </div>
        ) : errorMessage ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {errorMessage}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
            No game sessions match those filters.
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <MatchCard key={match.gameId} match={match} isPremium={isPremium} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameSessionHistory;

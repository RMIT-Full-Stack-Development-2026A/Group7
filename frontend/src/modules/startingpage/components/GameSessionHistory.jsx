import { useMemo, useState } from 'react';
import { CheckCircle2, OctagonX, Trophy } from 'lucide-react';
import { useGameSessionHistory } from '../hooks/useGameSessionHistory.js';
import MatchCard from './SessionHistory/MatchCard.jsx';
import MatchFilters from './SessionHistory/MatchFilters.jsx';
import '../../../shared/styles/MatchReplay.css';

const TABS = [
  { id: 'all', label: 'All Matches', description: 'Every saved session, won or lost.' },
  { id: 'completed', label: 'Completed Battles', description: 'Matches that reached an outcome — victory, defeat, or draw.' },
  { id: 'aborted', label: 'Aborted Battles', description: 'Matches the player abandoned before completion.' },
];

const isAbortedMatch = (match) => (
  match?.status === 'abandoned' || String(match?.resultLabel || '').toLowerCase() === 'aborted'
);

const filterMatchesByTab = (matches, tab) => {
  if (tab === 'completed') return matches.filter((match) => !isAbortedMatch(match));
  if (tab === 'aborted') return matches.filter((match) => isAbortedMatch(match));
  return matches;
};

export function GameSessionHistory({
  title = 'All Matches',
  description = 'Browse your previous battles, results, and opponents in one place.',
  compact = false,
}) {
  const {
    matches, filters, pagination, lastRefresh, isLoading, errorMessage, isPremium,
    activeFilterCount, updateFilter, resetFilters,
  } = useGameSessionHistory();
  const [activeTab, setActiveTab] = useState('all');

  const counts = useMemo(() => {
    const all = matches.length;
    const aborted = matches.filter(isAbortedMatch).length;
    return { all, completed: all - aborted, aborted };
  }, [matches]);

  const visibleMatches = useMemo(() => filterMatchesByTab(matches, activeTab), [activeTab, matches]);
  const totalLabel = activeTab === 'all'
    ? (pagination.total ?? matches.length)
    : visibleMatches.length;
  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) || TABS[0];

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

      <div className="match-history-tabs flex flex-wrap gap-3 border-b border-white/8 bg-slate-950/30 px-6 py-4 sm:px-8">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.id === 'aborted' ? OctagonX : tab.id === 'completed' ? CheckCircle2 : Trophy;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`match-history-tab inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                isActive
                  ? 'match-history-tab-active border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_8px_22px_rgba(34,211,238,0.18)]'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:text-cyan-100'
              }`}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`ml-1 inline-flex min-w-[22px] items-center justify-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                isActive ? 'bg-cyan-400/30 text-cyan-50' : 'bg-white/10 text-slate-200'
              }`}>
                {counts[tab.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <MatchFilters
        filters={filters}
        activeFilterCount={activeFilterCount}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <div className="p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span>
            {totalLabel} {activeTab === 'aborted' ? 'aborted' : activeTab === 'completed' ? 'completed' : 'matching'} session{totalLabel === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-slate-400">{activeTabMeta.description}</span>
        </div>

        {isLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
            Loading game sessions...
          </div>
        ) : errorMessage ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {errorMessage}
          </div>
        ) : visibleMatches.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center text-sm text-slate-300">
            {activeTab === 'aborted'
              ? 'No aborted battles yet. Matches you abandon will appear here.'
              : activeTab === 'completed'
                ? 'No completed battles match those filters.'
                : 'No game sessions match those filters.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleMatches.map((match) => (
              <MatchCard key={match.gameId} match={match} isPremium={isPremium} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameSessionHistory;

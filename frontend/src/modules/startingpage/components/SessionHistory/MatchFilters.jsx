import { CalendarDays, Filter, RotateCcw, Search } from 'lucide-react';
import {
  GAME_TYPE_OPTIONS,
  PLAYER_COUNT_OPTIONS,
  RESULT_OPTIONS,
  SORT_OPTIONS,
} from '../../logic/gameSessionHistory.utils.js';

const Field = ({ label, icon: Icon, children }) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
      {Icon ? <Icon size={13} /> : null}
      {label}
    </span>
    {children}
  </label>
);

const Select = ({ value, onChange, options }) => (
  <select className="neon-input px-4 py-3 outline-none transition" value={value} onChange={onChange}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

export function MatchFilters({ filters, activeFilterCount, updateFilter, resetFilters }) {
  return (
    <div className="border-b border-white/8 p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
          <Filter size={16} className="text-[var(--neon-accent)]" />
          Search and filter
          {activeFilterCount > 0 ? (
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-100">
              {activeFilterCount} active
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="neon-outline-button inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 transition"
          onClick={resetFilters}
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.75fr_0.7fr_0.7fr_0.75fr]">
        <Field label="Session or Player" icon={Search}>
          <input
            type="search"
            className="neon-input px-4 py-3 outline-none transition"
            value={filters.search}
            placeholder="Search game ID or player name (incl. AI)"
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </Field>

        <Field label="Result">
          <Select
            value={filters.result}
            onChange={(event) => updateFilter('result', event.target.value)}
            options={RESULT_OPTIONS}
          />
        </Field>

        <Field label="Game type">
          <Select
            value={filters.gameType}
            onChange={(event) => updateFilter('gameType', event.target.value)}
            options={GAME_TYPE_OPTIONS}
          />
        </Field>

        <Field label="Players">
          <Select
            value={filters.playerCount}
            onChange={(event) => updateFilter('playerCount', event.target.value)}
            options={PLAYER_COUNT_OPTIONS}
          />
        </Field>

        <Field label="From" icon={CalendarDays}>
          <input
            type="date"
            className="neon-input px-4 py-3 outline-none transition"
            value={filters.dateFrom}
            onChange={(event) => updateFilter('dateFrom', event.target.value)}
          />
        </Field>

        <Field label="To" icon={CalendarDays}>
          <input
            type="date"
            className="neon-input px-4 py-3 outline-none transition"
            value={filters.dateTo}
            onChange={(event) => updateFilter('dateTo', event.target.value)}
          />
        </Field>

        <Field label="Sort date">
          <Select
            value={filters.sort}
            onChange={(event) => updateFilter('sort', event.target.value)}
            options={SORT_OPTIONS}
          />
        </Field>
      </div>
    </div>
  );
}

export default MatchFilters;

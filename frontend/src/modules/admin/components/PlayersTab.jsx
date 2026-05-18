import { Ban, Clock4, Save, Mail, AtSign, Search } from 'lucide-react';
import { getPlayerId, getPlayerName } from '../adminPanel.utils';

const renderPlayerCardSubtitle = (player, remaining) => {
  if (player.accountStatus === 'inactive') return 'Account: Deactivated';
  if (remaining) return `Timeout: ${remaining}s remaining`;
  return player.isPremium ? 'Premium · Active' : 'Standard · Active';
};

const renderPlayerCardBadge = (player, remaining) => {
  if (player.accountStatus === 'inactive') return 'DEACTIVATED';
  if (remaining) return `TIMEOUT ${remaining}s`;
  return player.isPremium ? 'PREMIUM' : 'STANDARD';
};

const PlayerListItem = ({ player, isSelected, onSelect, timeoutRemaining }) => {
  const remaining = timeoutRemaining(player);
  return (
    <button
      onClick={() => onSelect(getPlayerId(player))}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isSelected
          ? 'border-sky-400 bg-slate-800/90 admin-player-card-active'
          : 'border-slate-700 bg-slate-900/80 admin-player-card hover:border-slate-500'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{player.username || getPlayerName(player)}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400">
            <Mail className="h-3 w-3 shrink-0" />
            {player.email || 'no email'}
          </p>
          <p className="mt-1 text-xs neon-helper-text">{renderPlayerCardSubtitle(player, remaining)}</p>
        </div>
        <div className="admin-player-meta shrink-0 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {renderPlayerCardBadge(player, remaining)}
        </div>
      </div>
    </button>
  );
};

const SelectedPlayerSummary = ({ player, selectedIsDeactivated, selectedHasActiveTimeout, selectedRemaining }) => (
  <div className="mb-6 grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 sm:grid-cols-2">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Username</p>
      <p className="mt-1 inline-flex items-center gap-2 text-sm text-white">
        <AtSign className="h-3.5 w-3.5 text-slate-400" />
        {player.username || '—'}
      </p>
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Email</p>
      <p className="mt-1 inline-flex items-center gap-2 text-sm text-white">
        <Mail className="h-3.5 w-3.5 text-slate-400" />
        {player.email || '—'}
      </p>
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Premium status</p>
      <p className={`mt-1 text-sm font-semibold ${player.isPremium ? 'text-amber-300' : 'text-slate-300'}`}>
        {player.isPremium ? 'Premium' : 'Standard'}
      </p>
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Account status</p>
      <p className={`mt-1 text-sm font-semibold ${selectedIsDeactivated ? 'text-red-300' : 'text-emerald-300'}`}>
        {selectedIsDeactivated ? 'Deactivated' : 'Active'}
        {selectedHasActiveTimeout && !selectedIsDeactivated ? ` · Timeout ${selectedRemaining}s` : ''}
      </p>
    </div>
  </div>
);

export function PlayersTab({
  playerError, filteredPlayers, players, playerSearch, setPlayerSearch,
  isLoadingPlayers, hasPlayers, selectedPlayerId, setSelectedPlayerId, timeoutRemaining,
  selectedPlayer, draftName, setDraftName, savingAction, saveName,
  togglePremium, toggleDeactivation, handleTimeout, clearPlayerTimeout,
  selectedIsDeactivated, selectedHasActiveTimeout, selectedRemaining,
}) {
  return (
    <>
      {playerError && (
        <div className="mb-5 rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {playerError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,32rem)_1fr]">
        <section className="neon-card neon-card-strong space-y-4 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Player accounts</h2>
            <span className="text-xs text-slate-400">{filteredPlayers.length} / {players.length}</span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={playerSearch}
              onChange={(event) => setPlayerSearch(event.target.value)}
              placeholder="Search by username or email"
              className="neon-input w-full rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-sky-400"
            />
          </div>

          <div className="grid gap-3">
            {isLoadingPlayers && <p className="neon-helper-text text-sm">Loading users...</p>}
            {!isLoadingPlayers && !hasPlayers && (
              <p className="neon-helper-text text-sm">No users match the current filter.</p>
            )}
            {filteredPlayers.map((player) => (
              <PlayerListItem
                key={getPlayerId(player)}
                player={player}
                isSelected={selectedPlayerId === getPlayerId(player)}
                onSelect={setSelectedPlayerId}
                timeoutRemaining={timeoutRemaining}
              />
            ))}
          </div>
        </section>

        <section className="neon-card neon-card-strong rounded-3xl p-6 shadow-xl">
          {!selectedPlayer && <p className="neon-helper-text text-sm">Select a player account to edit.</p>}

          {selectedPlayer && (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Edit player</h2>
                  <p className="neon-helper-text mt-2">Review and update the selected account.</p>
                </div>
                <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 admin-id-pill">
                  ID: {getPlayerId(selectedPlayer)}
                </div>
              </div>

              <SelectedPlayerSummary
                player={selectedPlayer}
                selectedIsDeactivated={selectedIsDeactivated}
                selectedHasActiveTimeout={selectedHasActiveTimeout}
                selectedRemaining={selectedRemaining}
              />

              <div className="grid gap-4">
                <label className="block text-sm text-slate-300">
                  Display name
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="neon-input min-w-0 flex-1 rounded-2xl px-4 py-3 outline-none focus:border-sky-400"
                    />
                    <button
                      onClick={saveName}
                      disabled={savingAction === 'name' || draftName.trim() === getPlayerName(selectedPlayer)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" /> {savingAction === 'name' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedPlayer.isPremium)}
                    onChange={(event) => togglePremium(event.target.checked)}
                    disabled={savingAction === 'premium'}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500"
                  />
                  Premium member
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={toggleDeactivation}
                    disabled={savingAction === 'ban'}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedIsDeactivated
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-red-500 text-slate-950 hover:bg-red-400'
                    }`}
                    title={selectedIsDeactivated ? 'Reactivate this account so the user can log in again' : 'Deactivate this account — user cannot log in'}
                  >
                    <Ban className="w-4 h-4" /> {selectedIsDeactivated ? 'Reactivate account' : 'Deactivate account'}
                  </button>
                  <button
                    onClick={() => (selectedHasActiveTimeout ? clearPlayerTimeout() : handleTimeout())}
                    disabled={savingAction === 'timeout' || selectedIsDeactivated}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Clock4 className="w-4 h-4" /> {selectedHasActiveTimeout ? 'Clear timeout' : 'Timeout 2 min'}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default PlayersTab;

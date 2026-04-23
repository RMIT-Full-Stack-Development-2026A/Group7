import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Ban, Clock4, Sparkles, Save } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { fetchAllUsers, updateUser } from '../../admin/services/adminService';

const getPlayerId = (player) => player?._id || player?.id;

const getPlayerName = (player) =>
  player?.name || player?.username || player?.email || 'Unnamed player';

const getTimeoutTime = (player) => {
  if (!player?.timeoutUntil) return 0;
  const time = new Date(player.timeoutUntil).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export function AdminPanel() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [draftName, setDraftName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingAction, setSavingAction] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setIsLoading(true);
      setError('');

      const response = await fetchAllUsers();
      if (cancelled) return;

      if (!response.ok || !response.data?.ok) {
        setPlayers([]);
        setSelectedPlayerId('');
        setError(response.data?.error || response.data?.message || 'Could not load users.');
        setIsLoading(false);
        return;
      }

      const loadedPlayers = response.data.data || [];
      setPlayers(loadedPlayers);
      setSelectedPlayerId((current) => current || getPlayerId(loadedPlayers[0]) || '');
      setIsLoading(false);
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlayer = useMemo(
    () => players.find((player) => getPlayerId(player) === selectedPlayerId) || players[0],
    [players, selectedPlayerId],
  );

  useEffect(() => {
    setDraftName(getPlayerName(selectedPlayer));
  }, [selectedPlayer]);

  const timeoutRemaining = (player) => {
    const timeoutTime = getTimeoutTime(player);
    if (!timeoutTime || !now) return 0;
    return Math.max(0, Math.ceil((timeoutTime - now) / 1000));
  };

  const applyUpdatedPlayer = (updatedPlayer) => {
    setPlayers((current) =>
      current.map((player) =>
        getPlayerId(player) === getPlayerId(updatedPlayer) ? updatedPlayer : player,
      ),
    );
  };

  const patchSelectedPlayer = async (changes, actionName) => {
    if (!selectedPlayer) return false;

    const id = getPlayerId(selectedPlayer);
    setSavingAction(actionName);
    setError('');

    const response = await updateUser(id, changes);
    setSavingAction('');

    if (!response.ok || !response.data?.ok) {
      const message = [401, 403].includes(response.status)
        ? 'Admin session expired. Log in again as admin to update users.'
        : response.data?.error || response.data?.message || 'Update failed.';
      setError(message);
      return false;
    }

    applyUpdatedPlayer(response.data.data);
    return true;
  };

  const saveName = async () => {
    const name = draftName.trim();
    if (name.length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }

    await patchSelectedPlayer({ name }, 'name');
  };

  const handleTimeout = () => {
    const timeoutUntil = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    patchSelectedPlayer({ timeoutUntil }, 'timeout');
  };

  const clearPlayerTimeout = () => {
    patchSelectedPlayer({ timeoutUntil: null }, 'timeout');
  };

  const banToggle = () => {
    const isBanned = selectedPlayer?.accountStatus === 'inactive';
    patchSelectedPlayer(
      {
        accountStatus: isBanned ? 'active' : 'inactive',
        timeoutUntil: null,
      },
      'ban',
    );
  };

  const togglePremium = (checked) => {
    patchSelectedPlayer({ isPremium: checked }, 'premium');
  };

  const hasPlayers = players.length > 0;
  const selectedRemaining = timeoutRemaining(selectedPlayer);
  const selectedIsBanned = selectedPlayer?.accountStatus === 'inactive';
  const selectedHasActiveTimeout = selectedRemaining > 0;

  return (
    <div className="full-bleed-page neon-page px-4 py-6 sm:px-6 lg:px-10">
      <div className="neon-shell w-full">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm font-semibold text-sky-300 admin-panel-kicker">
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </div>
            <h1 className="mt-4 text-4xl font-bold">Manage player accounts</h1>
            <p className="neon-helper-text mt-2">Configure player data, ban or timeout accounts, and review premium status.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:justify-end">
            <button
              onClick={() => navigate(ROUTES.MAIN_MENU)}
              className="neon-outline-button neon-back-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to menu
            </button>
            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTION)}
              className="neon-back-button inline-flex w-full items-center justify-center gap-2 bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 sm:w-auto"
            >
              <Sparkles className="w-4 h-4" /> Subscription page
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(18rem,28rem)_1fr]">
          <section className="neon-card neon-card-strong space-y-4 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Player accounts</h2>
            <div className="grid gap-3">
              {isLoading && <p className="neon-helper-text text-sm">Loading users...</p>}
              {!isLoading && !hasPlayers && <p className="neon-helper-text text-sm">No users found in the database.</p>}
              {players.map((player) => {
                const playerId = getPlayerId(player);
                const remaining = timeoutRemaining(player);
                const isBanned = player.accountStatus === 'inactive';
                return (
                  <button
                    key={playerId}
                    onClick={() => setSelectedPlayerId(playerId)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedPlayerId === playerId
                        ? 'border-sky-400 bg-slate-800/90 admin-player-card-active'
                        : 'border-slate-700 bg-slate-900/80 admin-player-card hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{getPlayerName(player)}</p>
                        <p className="text-sm neon-helper-text">{player.isPremium ? 'Premium member' : 'Standard member'}</p>
                      </div>
                      <div className="admin-player-meta text-right text-xs uppercase tracking-[0.2em] text-slate-500">
                        {isBanned ? 'BANNED' : remaining ? `TIMEOUT ${remaining}s` : player.isPremium ? 'PREMIUM' : 'STANDARD'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="neon-card neon-card-strong rounded-3xl p-6 shadow-xl">
            {!selectedPlayer && (
              <p className="neon-helper-text text-sm">Select a player account to edit.</p>
            )}

            {selectedPlayer && (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Edit player</h2>
                    <p className="neon-helper-text mt-2">Make changes to the selected account.</p>
                  </div>
                  <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 admin-id-pill">ID: {getPlayerId(selectedPlayer)}</div>
                </div>

                <div className="grid gap-4">
                  <label className="block text-sm text-slate-300">
                    Name
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
                      onClick={banToggle}
                      disabled={savingAction === 'ban'}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        selectedIsBanned
                          ? 'bg-red-500 text-slate-950 hover:bg-red-400'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <Ban className="w-4 h-4" /> {selectedIsBanned ? 'Unban' : 'Ban'} account
                    </button>
                    <button
                      onClick={() => (selectedHasActiveTimeout ? clearPlayerTimeout() : handleTimeout())}
                      disabled={savingAction === 'timeout' || selectedIsBanned}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Clock4 className="w-4 h-4" /> {selectedHasActiveTimeout ? 'Clear timeout' : 'Timeout 2 min'}
                    </button>
                  </div>
                </div>

                <div className="neon-secondary-panel mt-8 rounded-3xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="neon-helper-text text-sm">Current status</p>
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 admin-id-pill">
                      {selectedIsBanned ? 'Banned' : selectedHasActiveTimeout ? 'Timeout' : selectedPlayer.isPremium ? 'Premium' : 'Standard'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <p>Membership: {selectedPlayer.isPremium ? 'Premium' : 'Standard'}</p>
                    <p>Account: {selectedIsBanned ? 'Restricted' : 'Available'}</p>
                    {selectedHasActiveTimeout && (
                      <p>Timeout expires in {selectedRemaining} seconds</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

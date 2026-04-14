import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, ArrowLeft, Ban, Clock4, Sparkles } from 'lucide-react';

const initialPlayers = [
  {
    id: 'p1',
    name: 'TheOneWhoAsked',
    rank: 'Gold III',
    elo: 1847,
    isPremium: true,
    isBanned: false,
    timeoutUntil: null,
  },
  {
    id: 'p2',
    name: 'RivalKnight',
    rank: 'Silver I',
    elo: 1490,
    isPremium: false,
    isBanned: false,
    timeoutUntil: null,
  },
  {
    id: 'p3',
    name: 'ShadowQueen',
    rank: 'Platinum V',
    elo: 2023,
    isPremium: true,
    isBanned: false,
    timeoutUntil: null,
  },
];

export function AdminPanel() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayers[0].id);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) || players[0],
    [players, selectedPlayerId],
  );

  const updatePlayer = (id, changes) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === id ? { ...player, ...changes } : player,
      ),
    );
  };

  const handleTimeout = (id) => {
    const timeoutUntil = Date.now() + 2 * 60 * 1000;
    updatePlayer(id, { timeoutUntil });
  };

  const clearTimeout = (id) => {
    updatePlayer(id, { timeoutUntil: null });
  };

  const banToggle = (id) => {
    const player = players.find((item) => item.id === id);
    if (!player) return;
    updatePlayer(id, { isBanned: !player.isBanned, timeoutUntil: null });
  };

  const timeoutRemaining = (player) => {
    if (!player.timeoutUntil) return 0;
    return Math.max(0, Math.ceil((player.timeoutUntil - Date.now()) / 1000));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm font-semibold text-sky-300">
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </div>
            <h1 className="text-4xl font-bold mt-4">Manage player accounts</h1>
            <p className="text-slate-400 mt-2">Configure player data, ban or timeout accounts, and review premium status.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to menu
            </button>
            <button
              onClick={() => navigate('/subscription')}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              <Sparkles className="w-4 h-4" /> Subscription page
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(18rem,28rem)_1fr]">
          <section className="space-y-4 rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/10">
            <h2 className="text-xl font-semibold">Player accounts</h2>
            <div className="grid gap-3">
              {players.map((player) => {
                const remaining = timeoutRemaining(player);
                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedPlayerId === player.id
                        ? 'border-sky-400 bg-slate-800/90'
                        : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-sm text-slate-400">{player.rank} • ELO {player.elo}</p>
                      </div>
                      <div className="text-right text-xs uppercase tracking-[0.2em] text-slate-500">
                        {player.isBanned ? 'BANNED' : remaining ? `TIMEOUT ${remaining}s` : player.isPremium ? 'PREMIUM' : 'STANDARD'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Edit player</h2>
                <p className="text-slate-400 mt-2">Make changes to the selected account.</p>
              </div>
              <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">ID: {selectedPlayer.id}</div>
            </div>

            <div className="grid gap-4">
              <label className="block text-sm text-slate-300">
                Name
                <input
                  value={selectedPlayer.name}
                  onChange={(event) => updatePlayer(selectedPlayer.id, { name: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Rank
                <input
                  value={selectedPlayer.rank}
                  onChange={(event) => updatePlayer(selectedPlayer.id, { rank: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                />
              </label>

              <label className="block text-sm text-slate-300">
                ELO
                <input
                  type="number"
                  value={selectedPlayer.elo}
                  onChange={(event) => updatePlayer(selectedPlayer.id, { elo: Number(event.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                />
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={selectedPlayer.isPremium}
                  onChange={(event) => updatePlayer(selectedPlayer.id, { isPremium: event.target.checked })}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500"
                />
                Premium member
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => banToggle(selectedPlayer.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    selectedPlayer.isBanned
                      ? 'bg-red-500 text-slate-950 hover:bg-red-400'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Ban className="w-4 h-4" /> {selectedPlayer.isBanned ? 'Unban' : 'Ban'} account
                </button>
                <button
                  onClick={() => (selectedPlayer.timeoutUntil ? clearTimeout(selectedPlayer.id) : handleTimeout(selectedPlayer.id))}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400"
                >
                  <Clock4 className="w-4 h-4" /> {selectedPlayer.timeoutUntil ? 'Clear timeout' : 'Timeout 2 min'}
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-950/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-400">Current status</p>
                <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {selectedPlayer.isBanned ? 'Banned' : selectedPlayer.isPremium ? 'Premium' : 'Standard'}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Rank: {selectedPlayer.rank}</p>
                <p>ELO: {selectedPlayer.elo}</p>
                {selectedPlayer.timeoutUntil && (
                  <p>Timeout expires in {timeoutRemaining(selectedPlayer)} seconds</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

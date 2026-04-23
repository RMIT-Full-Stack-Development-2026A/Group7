// ─── AdminPanel ───────────────────────────────────────────────────────────────
// Wired to real backend admin endpoints.
// Preserves the original neon UI design from app-test exactly.
// All mock data replaced with live API calls via adminService.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Ban, CheckCircle2,
  Sparkles, RefreshCw, XCircle, Search, MonitorPlay,
} from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import {
  fetchUsers,
  updateUserStatus,
  fetchGames,
  abortGameRoom,
} from '../../admin/services/adminService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

// ─── Players Tab ──────────────────────────────────────────────────────────────

function PlayersTab() {
  const [players, setPlayers]         = useState([]);
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [actionBusy, setActionBusy]   = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const searchRef                     = useRef(null);

  const load = useCallback(async (q = '') => {
    setLoading(true); setError('');
    try {
      const { data, ok } = await fetchUsers({ q });
      if (ok) {
        const list = data.data || data || [];
        setPlayers(list);
        // Keep selection in sync
        setSelected((prev) => {
          if (!prev) return list[0] || null;
          return list.find((u) => u._id === prev._id) || list[0] || null;
        });
      } else {
        setError(data?.message || 'Failed to load users.');
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); load(search.trim()); };

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleBan = async () => {
    if (!selected || actionBusy) return;
    const nextStatus = selected.accountStatus === 'active' ? 'inactive' : 'active';
    setActionBusy(true); setError('');
    try {
      const { ok, data } = await updateUserStatus(selected._id, nextStatus);
      if (ok) {
        flash(`${selected.username} is now ${nextStatus === 'active' ? 'reactivated' : 'banned'}.`);
        load(search.trim());
      } else {
        setError(data?.message || data?.error || 'Update failed.');
      }
    } catch { setError('Network error.'); }
    finally { setActionBusy(false); }
  };

  const isBanned = selected?.accountStatus === 'inactive';

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(18rem,28rem)_1fr]">

      {/* Left — player list */}
      <section className="neon-card neon-card-strong space-y-4 rounded-3xl p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or email…"
              className="neon-input w-full rounded-2xl py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <button type="submit" className="neon-primary-button rounded-2xl px-4 py-2 text-xs font-semibold">
            Search
          </button>
          <button
            type="button"
            onClick={() => { setSearch(''); load(''); }}
            className="neon-outline-button rounded-2xl px-3 py-2"
            title="Clear"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </form>

        <h2 className="text-xl font-semibold">Player accounts</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : players.length === 0 ? (
          <p className="py-6 text-center text-slate-500 text-sm">No players found.</p>
        ) : (
          <div className="grid gap-3 overflow-y-auto" style={{ maxHeight: '55vh' }}>
            {players.map((player) => {
              const banned = player.accountStatus === 'inactive';
              return (
                <button
                  key={player._id}
                  onClick={() => setSelected(player)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?._id === player._id
                      ? 'border-sky-400 bg-slate-800/90 admin-player-card-active'
                      : 'border-slate-700 bg-slate-900/80 admin-player-card hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{player.username}</p>
                      <p className="truncate text-sm neon-helper-text">{player.email}</p>
                    </div>
                    <div className="admin-player-meta shrink-0 text-right text-xs uppercase tracking-[0.2em] text-slate-500">
                      {banned ? 'BANNED' : player.isPremium ? 'PREMIUM' : 'STANDARD'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-right text-xs text-slate-600">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </p>
      </section>

      {/* Right — player detail */}
      <section className="neon-card neon-card-strong rounded-3xl p-6 shadow-xl">
        {!selected ? (
          <p className="py-12 text-center neon-helper-text">Select a player to manage.</p>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Edit player</h2>
                <p className="neon-helper-text mt-1">Make changes to the selected account.</p>
              </div>
              <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 admin-id-pill shrink-0">
                ID: {selected._id.slice(-8)}
              </div>
            </div>

            {error      && <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-900/20 px-4 py-2.5 text-sm text-red-300">{error}</p>}
            {successMsg && <p className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-300">{successMsg}</p>}

            <div className="grid gap-4">
              <div className="grid gap-1">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Username</p>
                <p className="font-semibold text-white">{selected.username}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Email</p>
                <p className="text-slate-300">{selected.email}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Country</p>
                <p className="text-slate-300">{selected.country || '—'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <button
                  onClick={toggleBan}
                  disabled={actionBusy}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                    isBanned
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-red-600/80 text-white hover:bg-red-500'
                  }`}
                >
                  {actionBusy
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : isBanned
                      ? <><CheckCircle2 className="w-4 h-4" /> Reactivate account</>
                      : <><Ban className="w-4 h-4" /> Ban account</>
                  }
                </button>
              </div>
            </div>

            <div className="neon-secondary-panel mt-8 rounded-3xl p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="neon-helper-text text-sm">Current status</p>
                <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 admin-id-pill">
                  {isBanned ? 'Banned' : selected.isPremium ? 'Premium' : 'Standard'}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Membership: {selected.isPremium ? 'Premium' : 'Standard'}</p>
                <p>Account: {isBanned ? 'Restricted' : 'Active'}</p>
                <p>Role: {selected.role}</p>
                <p>Member since: {fmt(selected.createdAt)}</p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ─── Game Rooms Tab ───────────────────────────────────────────────────────────

function GameRoomsTab() {
  const [rooms, setRooms]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(null);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');

  const load = useCallback(async (q = '') => {
    setLoading(true); setError('');
    try {
      const { data, ok } = await fetchGames({ q });
      if (ok) setRooms(data.data || data || []);
      else setError(data?.message || data?.error || 'Failed to load rooms.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); load(search.trim()); };

  const handleAbort = async (room) => {
    if (busy) return;
    setBusy(room._id);
    try {
      const { ok, data } = await abortGameRoom(room._id);
      if (ok) {
        setToast(`Room #${room.roomId} closed.`);
        setTimeout(() => setToast(''), 3000);
        load(search.trim());
      } else {
        setError(data?.message || data?.error || 'Failed to close room.');
      }
    } catch { setError('Network error.'); }
    finally { setBusy(null); }
  };

  const STATUS_COLOURS = {
    available:   'text-emerald-400',
    full:        'text-amber-400',
    'in-battle': 'text-sky-400',
    completed:   'text-slate-500',
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room ID or player name…"
            className="neon-input w-full rounded-2xl py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <button type="submit" className="neon-primary-button rounded-2xl px-4 py-2 text-xs font-semibold">
          Search
        </button>
        <button type="button" onClick={() => { setSearch(''); load(''); }}
          className="neon-outline-button rounded-2xl px-3 py-2" title="Clear">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </form>

      {error && <p className="rounded-2xl border border-red-500/20 bg-red-900/20 px-4 py-2.5 text-sm text-red-300">{error}</p>}
      {toast && <p className="rounded-2xl border border-emerald-500/20 bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-300">{toast}</p>}

      <div className="neon-card neon-card-strong rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading rooms…
          </div>
        ) : rooms.length === 0 ? (
          <p className="py-12 text-center text-slate-500 text-sm">No game rooms found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Room #', 'Name', 'Players', 'Status', 'Created', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-mono font-semibold text-sky-400">#{room.roomId}</td>
                    <td className="px-5 py-3 font-medium text-white">{room.roomName}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {(room.players || []).map((p) => p.name).join(', ') || '—'}
                    </td>
                    <td className={`px-5 py-3 font-semibold capitalize ${STATUS_COLOURS[room.status] || 'text-slate-500'}`}>
                      {room.status}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{fmt(room.createdAt)}</td>
                    <td className="px-5 py-3">
                      {['available', 'full', 'in-battle'].includes(room.status) ? (
                        <button
                          onClick={() => handleAbort(room)}
                          disabled={busy === room._id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-red-900/50 border border-red-500/25 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/80 transition disabled:opacity-50"
                        >
                          {busy === room._id
                            ? <RefreshCw className="h-3 w-3 animate-spin" />
                            : <><XCircle className="h-3 w-3" /> Close</>
                          }
                        </button>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-right text-xs text-slate-600">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'players', label: 'Player accounts', icon: ShieldCheck },
  { id: 'rooms',   label: 'Game rooms',      icon: MonitorPlay },
];

export function AdminPanel() {
  const navigate      = useNavigate();
  const [tab, setTab] = useState('players');

  return (
    <div className="full-bleed-page neon-page px-4 py-6 sm:px-6 lg:px-10">
      <div className="neon-shell w-full">

        {/* Header — kept identical to original design */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm font-semibold text-sky-300 admin-panel-kicker">
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </div>
            <h1 className="mt-4 text-4xl font-bold">Manage player accounts</h1>
            <p className="neon-helper-text mt-2">
              Configure player data, ban accounts, and manage active game rooms.
            </p>
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

        {/* Tab bar */}
        <div className="mb-6 flex gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? 'border-sky-400/40 bg-slate-800/90 text-sky-300'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'players' && <PlayersTab />}
        {tab === 'rooms'   && <GameRoomsTab />}

      </div>
    </div>
  );
}

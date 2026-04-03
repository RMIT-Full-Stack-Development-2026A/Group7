import { useEffect, useState } from 'react';
import { listUsers, updateUserStatus, listGames, adminAbortGame, listSubscriptions } from '../../services/admin.service';

export default function AdminPage() {
  const [tab, setTab]           = useState('users');
  const [users, setUsers]       = useState([]);
  const [games, setGames]       = useState([]);
  const [subs, setSubs]         = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');

  async function loadUsers() {
    setLoading(true);
    try { setUsers(await listUsers(search)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadGames() {
    setLoading(true);
    try { setGames(await listGames()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadSubs() {
    setLoading(true);
    try { setSubs(await listSubscriptions()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    setMsg(''); setError('');
    if (tab === 'users')         loadUsers();
    else if (tab === 'games')    loadGames();
    else if (tab === 'subs')     loadSubs();
  }, [tab]);

  async function toggleBan(u) {
    const next = u.accountStatus === 'active' ? 'banned' : 'active';
    try {
      await updateUserStatus(u._id, next);
      setMsg(`${u.username} is now ${next}`);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, accountStatus: next } : x));
    } catch (e) { setError(e.message); }
  }

  async function handleAbort(roomId) {
    try {
      await adminAbortGame(roomId);
      setMsg(`Room ${roomId.slice(0, 8)}… aborted`);
      setGames((prev) => prev.map((g) => g.roomId === roomId ? { ...g, status: 'aborted' } : g));
    } catch (e) { setError(e.message); }
  }

  const tabs = [
    { key: 'users', label: '👥 Users' },
    { key: 'games', label: '🎮 Games' },
    { key: 'subs',  label: '⭐ Subscriptions' },
  ];

  return (
    <div className="page">
      <h2 style={{ color: '#f59e0b', marginBottom: '1.5rem' }}>🛡 Admin Panel</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn-primary' : 'btn-ghost'}
            style={{ fontSize: '0.85rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      {msg   && <p className="success-msg" style={{ marginBottom: '0.75rem' }}>{msg}</p>}
      {error && <p className="error-msg"   style={{ marginBottom: '0.75rem' }}>{error}</p>}

      {/* ── USERS ─────────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email…"
              style={{ maxWidth: 300 }}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            />
            <button className="btn-ghost" onClick={loadUsers}>Search</button>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="card" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Avatar</th><th>Username</th><th>Email</th>
                    <th>Country</th><th>Premium</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=6c63ff&color=fff&size=32`}
                          alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{u.email}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{u.country}</td>
                      <td>{u.premiumStatus ? <span className="badge-premium">YES</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                      <td>
                        {u.accountStatus === 'banned'
                          ? <span className="badge-banned">BANNED</span>
                          : <span style={{ color: 'var(--success)', fontSize: '0.82rem' }}>Active</span>}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleBan(u)}
                          className={u.accountStatus === 'active' ? 'btn-danger' : 'btn-success'}
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                          {u.accountStatus === 'active' ? 'Ban' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── GAMES ─────────────────────────────────────────────────────────── */}
      {tab === 'games' && (
        loading ? <div className="spinner" /> : (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Room ID</th><th>Type</th><th>Player 1</th><th>Player 2</th>
                  <th>Status</th><th>Started</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => (
                  <tr key={g.roomId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{g.roomId.slice(0, 8)}…</td>
                    <td style={{ textTransform: 'capitalize' }}>{g.gameType}</td>
                    <td>{g.player1?.username || '—'}</td>
                    <td>{g.player2?.username || g.player2Name || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>
                      <span style={{
                        color: g.status === 'active' ? 'var(--success)'
                          : g.status === 'aborted' ? 'var(--danger)'
                          : 'var(--muted)',
                        fontSize: '0.82rem', textTransform: 'capitalize',
                      }}>
                        {g.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {new Date(g.startTime).toLocaleString()}
                    </td>
                    <td>
                      {['active', 'waiting'].includes(g.status) && (
                        <button className="btn-danger" onClick={() => handleAbort(g.roomId)}
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                          Abort
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {games.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No games found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── SUBSCRIPTIONS ─────────────────────────────────────────────────── */}
      {tab === 'subs' && (
        loading ? <div className="spinner" /> : (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>User</th><th>Plan</th><th>Status</th><th>Start</th><th>End</th></tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>
                    <td>{s.userId?.username || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.planId}</td>
                    <td>
                      <span style={{
                        color: s.status === 'active' ? 'var(--success)' : 'var(--muted)',
                        fontSize: '0.82rem', textTransform: 'capitalize',
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(s.startDate).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(s.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No subscriptions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

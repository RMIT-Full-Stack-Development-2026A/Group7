import { useEffect, useState } from 'react';
import http from '../../services/http';
import { API } from '../../config/api.config';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [games, setGames]       = useState([]);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('info');

  const COUNTRIES = ['Vietnam','Australia','United States','United Kingdom','Canada','Singapore','Japan','South Korea','Germany','France','India','Brazil','Other'];

  useEffect(() => {
    if (!user) return;
    http.get(API.users.profile(user._id))
      .then(({ data }) => { setProfile(data); setForm({ username: data.username, email: data.email, country: data.country }); });
    http.get(API.users.games(user._id))
      .then(({ data }) => setGames(data));
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true); setMsg(''); setError('');
    try {
      const { data } = await http.patch(API.users.profile(user._id), form);
      setProfile(data);
      setUser((u) => ({ ...u, ...data }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      setMsg('Profile updated!');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const { data } = await http.post(API.users.avatar(user._id), fd, { isFormData: true });
      setProfile((p) => ({ ...p, avatar: data.avatar }));
      setUser((u) => ({ ...u, avatar: data.avatar }));
      localStorage.setItem('user', JSON.stringify({ ...user, avatar: data.avatar }));
    } catch (err) { setError(err.message); }
  }

  function resultLabel(g) {
    if (g.status === 'aborted') return <span style={{ color: 'var(--danger)' }}>Aborted</span>;
    if (g.status === 'draw')    return <span style={{ color: 'var(--muted)' }}>Draw</span>;
    if (!g.winner) return '—';
    return g.winner === user._id
      ? <span style={{ color: 'var(--success)' }}>Win</span>
      : <span style={{ color: 'var(--danger)' }}>Loss</span>;
  }

  if (!profile) return <div className="spinner" />;

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=6c63ff&color=fff`}
            alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
          <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem' }}
            title="Upload avatar">
            ✏️
            <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
          </label>
        </div>
        <div>
          <h2 style={{ color: 'var(--primary2)' }}>{profile.username}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{profile.email} · {profile.country}</p>
          {profile.premiumStatus && <span className="badge-premium">PREMIUM</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['info', 'games'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={tab === t ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            {t === 'info' ? '👤 Edit Info' : '🎮 Game History'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card" style={{ maxWidth: 440 }}>
          <form onSubmit={saveProfile}>
            {[{ name: 'username', label: 'Username' }, { name: 'email', label: 'Email', type: 'email' }].map(({ name, label, type = 'text' }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input type={type} value={form[name] || ''} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label>Country</label>
              <select value={form.country || ''} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep)</label>
              <input type="password" value={form.password || ''} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            {msg   && <p className="success-msg">{msg}</p>}
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'games' && (
        <div className="card" style={{ padding: 0 }}>
          {games.length === 0
            ? <p style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>No games played yet.</p>
            : (
              <table>
                <thead>
                  <tr><th>Type</th><th>Opponent</th><th>Result</th><th>Board</th><th>Started</th></tr>
                </thead>
                <tbody>
                  {games.map((g) => {
                    const opp = g.player1?._id === user._id
                      ? (g.player2?.username || g.player2Name || 'Guest')
                      : g.player1?.username;
                    return (
                      <tr key={g.roomId}>
                        <td style={{ textTransform: 'capitalize' }}>{g.gameType}</td>
                        <td>{opp}</td>
                        <td>{resultLabel(g)}</td>
                        <td>{g.boardSize}×{g.boardSize}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(g.startTime).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
        </div>
      )}
    </div>
  );
}

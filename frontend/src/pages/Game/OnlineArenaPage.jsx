import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listRooms, createGame, joinRoom } from '../../services/game.service';
import { useAuth } from '../../hooks/useAuth';

export default function OnlineArenaPage() {
  const { user }       = useAuth();
  const nav            = useNavigate();
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    try { setRooms(await listRooms()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setCreating(true); setError('');
    try {
      const session = await createGame({ gameType: 'online' });
      nav(`/game/online/${session.roomId}`);
    } catch (e) { setError(e.message); setCreating(false); }
  }

  async function handleJoin(roomId) {
    try {
      await joinRoom(roomId);
      nav(`/game/online/${roomId}`);
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--primary2)' }}>Online Arena</h2>
        <button className="btn-ghost" onClick={load} style={{ fontSize: '0.82rem' }}>↻ Refresh</button>
        <button className="btn-primary" onClick={handleCreate} disabled={creating} style={{ marginLeft: 'auto' }}>
          {creating ? 'Creating…' : '+ Create Room'}
        </button>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

      {loading ? <div className="spinner" /> : rooms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem' }}>
          No waiting rooms right now. Create one!
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Created by</th>
                <th>Board</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.roomId}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.roomId.slice(0, 8)}…</td>
                  <td>
                    {r.player1?.avatar && <img src={r.player1.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', marginRight: 6 }} />}
                    {r.player1?.username}
                  </td>
                  <td>{r.boardSize}×{r.boardSize}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(r.startTime).toLocaleTimeString()}</td>
                  <td>
                    {r.player1?._id === user._id
                      ? <button className="btn-ghost" onClick={() => nav(`/game/online/${r.roomId}`)}>Rejoin</button>
                      : <button className="btn-primary" onClick={() => handleJoin(r.roomId)}>Join</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

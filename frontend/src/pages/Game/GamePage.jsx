import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createGame, makeLocalMove, abortGame } from '../../services/game.service';
import GameBoard from '../../components/GameBoard';

export default function GamePage() {
  const { user } = useAuth();
  const [player2Name, setPlayer2Name] = useState('');
  const [session, setSession]         = useState(null);
  const [winLine, setWinLine]         = useState([]);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  async function startGame(e) {
    e.preventDefault();
    if (!player2Name.trim()) return;
    setLoading(true); setError('');
    try {
      const s = await createGame({ gameType: 'local', player2Name: player2Name.trim() });
      setSession(s); setResult(null); setWinLine([]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function onCellClick(row, col) {
    if (!session || result) return;

    // Local game: always send as player1 (the logged-in user)
    // The backend uses localTurn to decide which mark to place
    try {
      const res = await makeLocalMove(session.roomId, row, col);
      setSession((s) => ({ ...s, board: res.board, localTurn: res.localTurn, status: res.status }));
      if (res.status === 'completed') {
        setWinLine(res.winLine || []);
        const winnerLabel = res.winnerName === 'player1' ? user.username : player2Name;
        setResult({ winnerLabel });
      }
      if (res.status === 'draw') { setResult({ draw: true }); }
    } catch (err) { setError(err.message); }
  }

  async function handleAbort() {
    if (!session) return;
    try {
      await abortGame(session.roomId);
      setResult({ aborted: true });
      setSession((s) => ({ ...s, status: 'aborted' }));
    } catch (err) { setError(err.message); }
  }

  function reset() {
    setSession(null); setResult(null); setWinLine([]);
    setPlayer2Name(''); setError('');
  }

  const localTurn = session?.localTurn || 'player1';
  const isP1Turn  = localTurn === 'player1';
  const turnName  = isP1Turn ? user.username : player2Name;
  const turnMark  = isP1Turn ? session?.mark1 : session?.mark2;

  if (!session) {
    return (
      <div className="page" style={{ maxWidth: 460 }}>
        <div className="card">
          <h2 style={{ marginBottom: '1.2rem', color: 'var(--primary2)' }}>Local 2-Player Game</h2>
          <form onSubmit={startGame}>
            <div className="form-group">
              <label>Player 1 (You)</label>
              <input value={user.username} disabled />
            </div>
            <div className="form-group">
              <label>Player 2 Name</label>
              <input value={player2Name} onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Enter name…" required autoFocus />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Starting…' : 'Start Game'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--primary2)' }}>Local Game</h2>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Room: {session.roomId.slice(0,8)}…</span>
        {!result && (
          <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--primary2)', fontSize: '1rem' }}>
            {turnName}'s turn
            <span style={{ color: isP1Turn ? '#6c63ff' : '#f59e0b', marginLeft: 6 }}>({turnMark})</span>
          </span>
        )}
        {!result && <button className="btn-danger" onClick={handleAbort}>Abort</button>}
        {result  && <button className="btn-ghost"  onClick={reset} style={{ marginLeft: 'auto' }}>New Game</button>}
      </div>

      {error && <p className="error-msg" style={{ marginBottom: '0.5rem' }}>{error}</p>}

      {result && (
        <div className="card" style={{
          marginBottom: '1rem', textAlign: 'center',
          borderColor: result.draw ? 'var(--muted)' : result.aborted ? 'var(--danger)' : 'var(--primary)',
        }}>
          {result.aborted     && <p style={{ color: 'var(--danger)',  fontWeight: 700 }}>Game aborted – no winner recorded.</p>}
          {result.draw        && <p style={{ color: 'var(--muted)',   fontWeight: 700 }}>It's a draw!</p>}
          {result.winnerLabel && <p style={{ color: 'var(--primary2)', fontWeight: 700, fontSize: '1.1rem' }}>🎉 {result.winnerLabel} wins!</p>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '1rem', overflow: 'auto' }}>
          <GameBoard
            board={session.board}
            size={session.boardSize}
            winLine={winLine}
            onCellClick={onCellClick}
            disabled={!!result}
          />
        </div>

        <div style={{ minWidth: 160 }}>
          <div className="card" style={{ marginBottom: '0.75rem', borderColor: !result && isP1Turn ? 'var(--primary)' : 'var(--border)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 4 }}>Player 1</p>
            <p style={{ fontWeight: 700 }}>{user.username} <span style={{ color: '#6c63ff' }}>({session.mark1})</span></p>
            {!result && isP1Turn && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4 }}>← your turn</p>}
          </div>
          <div className="card" style={{ borderColor: !result && !isP1Turn ? 'var(--primary)' : 'var(--border)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 4 }}>Player 2</p>
            <p style={{ fontWeight: 700 }}>{player2Name} <span style={{ color: '#f59e0b' }}>({session.mark2})</span></p>
            {!result && !isP1Turn && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4 }}>← your turn</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

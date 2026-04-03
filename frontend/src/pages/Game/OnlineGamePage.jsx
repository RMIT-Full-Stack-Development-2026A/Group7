import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { getToken } from '../../services/auth.service';
import GameBoard from '../../components/GameBoard';

export default function OnlineGamePage() {
  const { roomId }     = useParams();
  const { user }       = useAuth();
  const nav            = useNavigate();
  const socketRef      = useRef(null);

  const [session, setSession]   = useState(null);
  const [winLine, setWinLine]   = useState([]);
  const [result, setResult]     = useState(null);
  const [chat, setChat]         = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [status, setStatus]     = useState('Connecting…');
  const [markChoice, setMarkChoice] = useState(null);
  const [error, setError]       = useState('');
  const chatEndRef              = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:5001', { auth: { token: getToken() } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('Connected');
      socket.emit('join_room', { roomId });
    });

    socket.on('connect_error', (e) => setStatus(`Connection error: ${e.message}`));

    socket.on('room_state', (s) => {
      setSession(s);
      if (s.status === 'waiting') setStatus('Waiting for opponent…');
      if (s.status === 'active')  setStatus('Game in progress');
    });

    socket.on('player_joined', ({ username }) => {
      setStatus(`${username} joined! Choose your mark to start.`);
      setSession((s) => s ? { ...s, opponentJoined: true } : s);
    });

    socket.on('game_started', ({ mark1, mark2, currentTurn }) => {
      setStatus('Game started!');
      setSession((s) => s ? { ...s, mark1, mark2, currentTurn, status: 'active' } : s);
    });

    socket.on('move_made', ({ board, currentTurn }) => {
      setSession((s) => s ? { ...s, board, currentTurn } : s);
    });

    socket.on('game_over', ({ winner, winLine: wl, board }) => {
      if (board) setSession((s) => s ? { ...s, board } : s);
      setWinLine(wl || []);
      setResult({ winner });
      setStatus(winner ? (winner === user._id ? '🎉 You win!' : 'You lose!') : "It's a draw!");
    });

    socket.on('game_aborted', () => {
      setResult({ aborted: true });
      setStatus('Game was aborted');
    });

    socket.on('chat_message', (msg) => setChat((c) => [...c, msg]));
    socket.on('error', ({ message }) => setError(message));

    return () => socket.disconnect();
  }, [roomId, user._id]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  const makeMove = useCallback((row, col) => {
    if (!session || result) return;
    if (session.currentTurn !== user._id && session.currentTurn?._id !== user._id) return;
    socketRef.current?.emit('make_move', { roomId, row, col });
  }, [session, result, roomId, user._id]);

  function chooseMark(mark) {
    setMarkChoice(mark);
    socketRef.current?.emit('choose_mark', { roomId, mark });
  }

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit('chat_message', { roomId, message: chatInput.trim() });
    setChatInput('');
  }

  // Am I player1 or player2?
  const amPlayer1 = session?.player1?._id === user._id || session?.player1 === user._id;
  const myMark    = amPlayer1 ? session?.mark1 : session?.mark2;
  const myTurn    = session?.status === 'active' &&
    (session?.currentTurn === user._id || session?.currentTurn?._id === user._id);

  // Player2 needs to choose mark first
  const needsMarkChoice = !amPlayer1 && session?.status === 'waiting' && session?.player2 && !markChoice;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--primary2)' }}>Online Game</h2>
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--muted)' }}>{roomId.slice(0,8)}…</span>
        <span style={{ marginLeft: 'auto', color: myTurn ? 'var(--success)' : 'var(--muted)', fontWeight: 600 }}>
          {result ? status : myTurn ? '⚡ Your turn' : status}
        </span>
        <button className="btn-ghost" onClick={() => nav('/game/arena')} style={{ fontSize: '0.82rem' }}>← Arena</button>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: '0.5rem' }}>{error}</p>}

      {/* Mark picker for player 2 */}
      {needsMarkChoice && (
        <div className="card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Choose your mark to start the game:</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {['X', 'O', '★', '♦'].map((m) => (
              <button key={m} className="btn-primary" onClick={() => chooseMark(m)}
                style={{ fontSize: '1.4rem', padding: '0.5rem 1.5rem' }}>{m}</button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: result.aborted ? 'var(--danger)' : result.winner === user._id ? 'var(--success)' : 'var(--muted)' }}>
            {status}
          </p>
          <button className="btn-ghost" onClick={() => nav('/game/arena')} style={{ marginTop: '0.75rem' }}>
            Back to Arena
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Board */}
        {session?.board && (
          <div className="card" style={{ padding: '1rem', overflow: 'auto' }}>
            <GameBoard
              board={session.board}
              size={session.boardSize || 10}
              winLine={winLine}
              onCellClick={makeMove}
              disabled={!myTurn || !!result || needsMarkChoice}
            />
          </div>
        )}

        {/* Right panel: info + chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 220, flex: 1 }}>
          {/* Players */}
          {session && (
            <div className="card">
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6 }}>Players</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'P1', id: session.player1?._id || session.player1, name: session.player1?.username, mark: session.mark1 },
                  { label: 'P2', id: session.player2?._id || session.player2, name: session.player2?.username || '⏳ Waiting…', mark: session.mark2 },
                ].map((p) => (
                  <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem', width: 20 }}>{p.label}</span>
                    <span style={{ fontWeight: p.id === user._id ? 700 : 400 }}>{p.name}</span>
                    {p.mark && <span style={{ marginLeft: 'auto', color: '#6c63ff', fontWeight: 700 }}>{p.mark}</span>}
                    {p.id === user._id && <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>(you)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 280 }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6 }}>Chat</p>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem' }}>
              {chat.length === 0 && <span style={{ color: 'var(--muted)' }}>No messages yet…</span>}
              {chat.map((m, i) => (
                <div key={i}>
                  <span style={{ color: m.userId === user._id ? 'var(--primary2)' : 'var(--muted)', fontWeight: 600 }}>
                    {m.username}:
                  </span>{' '}
                  {m.message}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChat} style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Say something…" style={{ flex: 1 }} />
              <button className="btn-primary" type="submit" style={{ padding: '0.4rem 0.8rem' }}>Send</button>
            </form>
          </div>
        </div>
      </div>

      {myMark && (
        <p style={{ marginTop: '0.75rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
          Your mark: <strong style={{ color: 'var(--primary2)' }}>{myMark}</strong>
        </p>
      )}
    </div>
  );
}

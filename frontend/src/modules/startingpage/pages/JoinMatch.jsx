import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Hash, X, Zap } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { useJoinMatch } from '../hooks/useJoinMatch.js';

export function JoinMatch() {
  const navigate = useNavigate();
  const {
    rooms, roomCode, setRoomCode, isLoading, errorMessage, joiningRoomId,
    liveRoomCountLabel, openRoom, handleJoinByCode, handleDeleteRoom,
    isCurrentUserRoomHost, getRoomStatusLabel, getRoomStatusClasses,
  } = useJoinMatch();

  return (
    <div className="join-match-page neon-page flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="neon-shell w-full max-w-6xl">
        <button
          onClick={() => navigate(ROUTES.MAIN_MENU)}
          className="neon-back-button mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-md transition-all duration-300 hover:border-blue-400/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(122,162,255,0.18)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </button>

        <div className="neon-card overflow-hidden">
          <div className="border-b border-white/8 bg-gradient-to-r from-white/6 via-blue-400/6 to-purple-400/8 px-6 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="join-match-kicker mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Zap className="h-3.5 w-3.5" />
                Multiplayer Lobby
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Join a Match</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Enter a room code directly or choose an active lobby below to jump into the game.
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div className="neon-card neon-card-strong rounded-[24px] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">Active Rooms</h2>
                  <p className="mt-1 text-sm text-slate-400">Choose a lobby with available slots.</p>
                </div>
                <div className="join-match-live-count hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 sm:block">
                  {liveRoomCountLabel}
                </div>
              </div>

              {errorMessage ? (
                <div className="join-match-error mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
                  {errorMessage}
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-8 text-center text-sm text-slate-300">
                  Loading active rooms...
                </div>
              ) : rooms.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      className="join-match-room-card group relative rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-gradient-to-br hover:from-blue-500/12 hover:to-purple-500/12 hover:shadow-[0_18px_40px_rgba(13,18,40,0.45)]"
                    >
                      {isCurrentUserRoomHost(room) ? (
                        <button
                          type="button"
                          onClick={(event) => handleDeleteRoom(event, room)}
                          className="join-match-delete-btn absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
                          style={{ borderRadius: '9999px' }}
                          aria-label={`Delete ${room.roomName}`}
                          title="Delete room"
                          disabled={joiningRoomId === room._id}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => openRoom(room)}
                        className="block w-full text-left"
                        disabled={joiningRoomId === room._id}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-cyan-200">
                              {room.roomName}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{room.roomId}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getRoomStatusClasses(room)}`}>
                            {getRoomStatusLabel(room)}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-300" />
                            <span>{room.players.length}/{room.size} players</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-8 text-center text-sm text-slate-300">
                  No active rooms yet. Create a room first, then it will appear here.
                </div>
              )}
            </div>

            <div className="neon-card neon-card-strong rounded-[24px] p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-white">Join with Room Code</h2>
              <p className="mt-1 text-sm text-slate-400">
                Use the code shared by your friend to join a private room instantly.
              </p>

              <div className="join-match-code-card mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                <label className="join-match-code-label mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Hash className="h-4 w-4 text-blue-300" />
                  Room Code
                </label>
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleJoinByCode();
                    }
                  }}
                  className="join-match-input w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-blue-400/50 focus:bg-slate-900/70 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                />
                <button
                  onClick={handleJoinByCode}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(124,58,237,0.34)] active:translate-y-0"
                  disabled={Boolean(joiningRoomId)}
                >
                  {joiningRoomId === roomCode.trim() && roomCode.trim() ? 'Joining...' : 'Join Room'}
                </button>
              </div>

              <div className="join-match-tip mt-5 rounded-[22px] border border-cyan-400/10 bg-cyan-400/[0.05] p-4 text-sm text-slate-300">
                <p className="font-medium text-cyan-200">Tip</p>
                <p className="mt-1 leading-6 text-slate-400">
                  Public rooms are listed on the left. Private matches usually require a room code from the host.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinMatch;

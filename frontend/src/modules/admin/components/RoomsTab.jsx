import { RefreshCcw, Search, X } from 'lucide-react';
import {
  STATUS_BADGE_STYLES,
  STATUS_LABELS,
  formatDateTime,
  getRoomPlayerLabel,
} from '../adminPanel.utils';

const RoomRow = ({ room, closingRoomId, onClose }) => {
  const status = room.status || 'available';
  const isClosable = status !== 'completed';
  const startTime = room.startedAt || room.createdAt;
  const endTime = room.endedAt || (status === 'completed' ? room.updatedAt : null);
  const isClosing = closingRoomId === String(room._id);

  return (
    <tr className="text-slate-200">
      <td className="px-4 py-3 font-semibold text-white">{room.roomId}</td>
      <td className="px-4 py-3">{getRoomPlayerLabel(room, 0)}</td>
      <td className="px-4 py-3">{getRoomPlayerLabel(room, 1)}</td>
      <td className="px-4 py-3 text-slate-300">{formatDateTime(startTime)}</td>
      <td className="px-4 py-3 text-slate-300">{formatDateTime(endTime)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.available}`}>
          {STATUS_LABELS[status] || status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onClose(room)}
          disabled={!isClosable || isClosing}
          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          title={isClosable ? 'Close this game room' : 'Room already completed'}
        >
          <X className="h-3.5 w-3.5" />
          {isClosing ? 'Closing...' : 'Close'}
        </button>
      </td>
    </tr>
  );
};

export function RoomsTab({
  rooms, roomSearch, setRoomSearch, isLoadingRooms, roomError, closingRoomId,
  loadRooms, handleCloseRoom,
}) {
  return (
    <section className="neon-card neon-card-strong rounded-3xl p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Online game rooms</h2>
          <p className="neon-helper-text mt-1 text-sm">
            Live lobby + in-battle rooms. Auto-refreshes every 5 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadRooms(roomSearch)}
          disabled={isLoadingRooms}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400 disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoadingRooms ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={roomSearch}
          onChange={(event) => setRoomSearch(event.target.value)}
          placeholder="Search by room number or player name"
          className="neon-input w-full rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-sky-400"
        />
      </div>

      {roomError && (
        <div className="mb-5 rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {roomError}
        </div>
      )}

      {isLoadingRooms && rooms.length === 0 ? (
        <p className="neon-helper-text text-sm">Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <p className="neon-helper-text text-sm">No online rooms match the current filter.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-700/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Room #</th>
                <th className="px-4 py-3">Player 1</th>
                <th className="px-4 py-3">Player 2</th>
                <th className="px-4 py-3">Start time</th>
                <th className="px-4 py-3">End time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {rooms.map((room) => (
                <RoomRow
                  key={String(room._id)}
                  room={room}
                  closingRoomId={closingRoomId}
                  onClose={handleCloseRoom}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RoomsTab;

import { Send, X } from 'lucide-react';
import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';
import {
  canSendFriendRequest,
  getPlayerButtonLabel,
  getPresenceMeta,
} from '../../logic/mainMenu.utils.js';

const handleAvatarLoadError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = resolveAvatarUrl('');
};

const StatusBanner = ({ socialStatus }) => {
  if (!socialStatus.message) return null;
  const cls = socialStatus.type === 'error'
    ? 'border-red-400/40 bg-red-500/10 text-red-100'
    : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100';
  return <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${cls}`}>{socialStatus.message}</div>;
};

const PlayerCard = ({ player, onSendFriendRequest }) => (
  <div className="player-directory-card main-menu-info-card p-5">
    <div className="flex items-center gap-4">
      <img
        src={resolveAvatarUrl(player.avatar)}
        alt={player.name}
        className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
        onError={handleAvatarLoadError}
      />
      <div className="min-w-0">
        <p className="main-menu-card-title truncate text-base font-bold text-white">{player.name}</p>
        <p className="main-menu-muted text-xs text-slate-400">{getPresenceMeta(player)}</p>
      </div>
      <span className={`ml-auto h-3 w-3 shrink-0 rounded-full ${player.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
    </div>
    <button
      type="button"
      onClick={() => onSendFriendRequest(player)}
      disabled={!canSendFriendRequest(player)}
      className="player-add-button mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold"
    >
      <Send size={16} />
      {canSendFriendRequest(player) ? 'Send Request' : getPlayerButtonLabel(player)}
    </button>
  </div>
);

export function PlayerDirectoryModal({ otherPlayers, socialStatus, onClose, onSendFriendRequest }) {
  return (
    <div className="player-directory-overlay fixed inset-0 z-50 overflow-y-auto px-4 py-6 backdrop-blur-xl sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="player-directory-kicker main-menu-subtle text-xs font-semibold uppercase tracking-[0.22em]">
              Player Directory
            </p>
            <h2 className="player-directory-title mt-2 text-3xl font-bold">Other Players</h2>
            <p className="player-directory-copy mt-2 text-sm">Send friend requests to players from the database.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="player-directory-close inline-flex h-11 w-11 items-center justify-center"
            aria-label="Close player directory"
          >
            <X size={18} />
          </button>
        </div>

        <StatusBanner socialStatus={socialStatus} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherPlayers.map((player) => (
            <PlayerCard
              key={player.userId}
              player={player}
              onSendFriendRequest={onSendFriendRequest}
            />
          ))}
        </div>

        {!otherPlayers.length ? (
          <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-8 text-center text-sm text-slate-400">
            No other users found in the database.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PlayerDirectoryModal;

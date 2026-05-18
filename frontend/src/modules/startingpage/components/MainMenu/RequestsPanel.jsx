import { Check, X, Send, Maximize2 } from 'lucide-react';
import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';
import {
  canSendFriendRequest,
  formatRelativeTime,
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
  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${cls}`}>
      {socialStatus.message}
    </div>
  );
};

const IncomingRequest = ({ request, onAccept, onDecline }) => (
  <div className="main-menu-info-card rounded-2xl bg-slate-900/50 p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={resolveAvatarUrl(request.from?.avatar)}
          alt={request.from?.name || 'Player'}
          className="h-11 w-11 shrink-0 rounded-full border border-white/10 object-cover"
          onError={handleAvatarLoadError}
        />
        <div className="min-w-0">
          <p className="main-menu-card-title truncate font-semibold text-white">{request.from?.name || 'Player'}</p>
          <p className="main-menu-muted text-xs text-slate-400">{formatRelativeTime(request.createdAt)}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          type="button"
          aria-label="Accept friend request"
          onClick={() => onAccept(request.id)}
        >
          <Check size={16} />
        </button>
        <button
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          type="button"
          aria-label="Decline friend request"
          onClick={() => onDecline(request.id)}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  </div>
);

const OtherPlayerRow = ({ player, onSendFriendRequest }) => (
  <div className="main-menu-friend-card flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-slate-950/35 p-3">
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={resolveAvatarUrl(player.avatar)}
        alt={player.name}
        className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
        onError={handleAvatarLoadError}
      />
      <div className="min-w-0">
        <p className="main-menu-friend-name truncate font-semibold text-white">{player.name}</p>
        <p className="main-menu-friend-meta text-xs text-slate-400">{getPresenceMeta(player)}</p>
      </div>
    </div>
    <span className={`h-3 w-3 shrink-0 rounded-full ${player.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
    <button
      type="button"
      onClick={() => onSendFriendRequest(player)}
      disabled={!canSendFriendRequest(player)}
      className="player-add-icon-button inline-flex h-9 w-9 shrink-0 items-center justify-center"
      aria-label={`Send friend request to ${player.name}`}
      title={getPlayerButtonLabel(player)}
    >
      <Send size={16} />
    </button>
  </div>
);

export function RequestsPanel({
  incomingFriendRequests,
  outgoingFriendRequests,
  requestCount,
  otherPlayerPreview,
  socialStatus,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onSendFriendRequest,
  onExpandOtherPlayers,
}) {
  return (
    <div className="space-y-6">
      <div className="neon-sidebar-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Friend Requests</h2>
          <span className="text-slate-400 text-sm">{requestCount}</span>
        </div>

        <StatusBanner socialStatus={socialStatus} />

        <div className="space-y-3">
          {incomingFriendRequests.length ? incomingFriendRequests.map((request) => (
            <IncomingRequest
              key={request.id}
              request={request}
              onAccept={onAcceptFriendRequest}
              onDecline={onDeclineFriendRequest}
            />
          )) : (
            <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5 text-sm text-slate-400">
              No incoming friend requests.
            </div>
          )}

          {outgoingFriendRequests.length ? (
            <div className="main-menu-info-card rounded-2xl bg-slate-950/35 border border-white/8 p-4">
              <p className="main-menu-subtle text-xs uppercase tracking-[0.18em] text-slate-500">Sent requests</p>
              <div className="mt-3 space-y-2">
                {outgoingFriendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="main-menu-card-title truncate font-semibold text-white">
                      {request.to?.name || 'Player'}
                    </span>
                    <span className="main-menu-muted text-xs text-slate-400">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="neon-sidebar-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Other Players</h2>
            <p className="text-xs text-slate-400">Discover players from the database.</p>
          </div>
          <button
            type="button"
            onClick={onExpandOtherPlayers}
            aria-label="View all players"
            title="View all players"
            className="player-directory-icon-button inline-flex h-10 w-10 items-center justify-center"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        <div className="space-y-3">
          {otherPlayerPreview.length ? otherPlayerPreview.map((player) => (
            <OtherPlayerRow
              key={player.userId}
              player={player}
              onSendFriendRequest={onSendFriendRequest}
            />
          )) : (
            <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5 text-sm text-slate-400">
              No other players found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestsPanel;

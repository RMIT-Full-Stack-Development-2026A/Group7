import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';
import { getPresenceMeta } from '../../logic/mainMenu.utils.js';

const handleAvatarLoadError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = resolveAvatarUrl('');
};

export function FriendsPanel({ friends, onlineFriends }) {
  return (
    <div className="neon-sidebar-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Friends</h2>
        <span className="text-slate-400 text-sm">{onlineFriends} of {friends.length} online</span>
      </div>
      <div className="space-y-3">
        {friends.length ? friends.map((friend) => (
          <div
            key={friend.userId}
            className="main-menu-friend-card flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/35 border border-white/6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={resolveAvatarUrl(friend.avatar)}
                alt={friend.name}
                className="h-11 w-11 shrink-0 rounded-full border border-white/10 object-cover"
                onError={handleAvatarLoadError}
              />
              <div className="min-w-0">
                <p className="main-menu-friend-name truncate font-semibold text-white">{friend.name}</p>
                <p className="main-menu-friend-meta text-xs text-slate-400">{getPresenceMeta(friend)}</p>
              </div>
            </div>
            <span className={`h-3.5 w-3.5 rounded-full ${friend.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </div>
        )) : (
          <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5 text-sm text-slate-400">
            No friends yet. Send a request from Other Players.
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsPanel;

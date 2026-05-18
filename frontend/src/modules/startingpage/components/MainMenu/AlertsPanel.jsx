import { Check, X } from 'lucide-react';
import { formatRelativeTime } from '../../logic/mainMenu.utils.js';

export function AlertsPanel({ roomInvites, onAccept, onDecline }) {
  return (
    <div className="neon-sidebar-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Alerts</h2>
        <span className="text-slate-400 text-sm">{roomInvites.length}</span>
      </div>
      <div className="space-y-3">
        {roomInvites.length ? roomInvites.map((invite) => (
          <div key={invite.id} className="main-menu-info-card rounded-2xl bg-slate-900/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="main-menu-card-title truncate font-semibold text-white">
                  {invite.from?.name || 'Friend'} invited you
                </p>
                <p className="main-menu-muted text-sm text-slate-400">
                  Room {invite.roomId} · {invite.roomName}
                </p>
                <p className="main-menu-subtle text-xs text-slate-500 mt-2">
                  {formatRelativeTime(invite.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  type="button"
                  aria-label="Accept room invite"
                  onClick={() => onAccept(invite.id)}
                >
                  <Check size={16} />
                </button>
                <button
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  type="button"
                  aria-label="Decline room invite"
                  onClick={() => onDecline(invite.id)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5 text-sm text-slate-400">
            No room invites yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;

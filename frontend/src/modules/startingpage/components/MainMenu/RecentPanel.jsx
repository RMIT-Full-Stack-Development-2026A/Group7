import { NavLink } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
import ROUTES from '../../../../router/routes.config';
import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';
import { getRecentMatchParticipants } from '../../logic/mainMenu.utils.js';

const handleAvatarLoadError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = resolveAvatarUrl('');
};

const resolveMatchAvatar = (participant, storedIdentity, playerProfile) => {
  const isCurrentUser = Boolean(
    participant?.userId
    && storedIdentity?.userId
    && String(participant.userId) === String(storedIdentity.userId)
  );
  if (isCurrentUser) {
    return resolveAvatarUrl(playerProfile?.avatarUrl || storedIdentity.avatar);
  }
  return resolveAvatarUrl(participant?.avatar, { isAI: participant?.isAI });
};

const resultColor = (label) => {
  if (label === 'Victory') return 'text-emerald-400';
  if (label === 'Defeat') return 'text-rose-400';
  return 'text-amber-300';
};

export function RecentPanel({ recentMatch, storedIdentity, playerProfile }) {
  return (
    <div className="neon-sidebar-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Match</h2>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">
            {recentMatch?.completedAt ? new Date(recentMatch.completedAt).toLocaleString() : 'No matches yet'}
          </span>
          <NavLink
            to={ROUTES.MATCH_HISTORY}
            aria-label="View all matches"
            title="View all matches"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
          >
            <Maximize2 size={15} />
          </NavLink>
        </div>
      </div>

      {recentMatch ? (
        <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5">
          <div className="grid grid-cols-2 gap-3">
            {getRecentMatchParticipants(recentMatch).map((participant, index) => (
              <div
                key={`${recentMatch.gameId}-${participant.id || participant.name || index}`}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3"
              >
                <img
                  src={resolveMatchAvatar(participant, storedIdentity, playerProfile)}
                  alt={participant.name || `Player ${index + 1}`}
                  className="h-11 w-11 rounded-full object-cover border border-white/10"
                  onError={handleAvatarLoadError}
                />
                <div className="min-w-0">
                  <p className="main-menu-card-title truncate text-sm font-bold text-white">
                    {participant.name || `Player ${index + 1}`}
                  </p>
                  <p className="main-menu-subtle text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    {participant.marker || participant.symbol || `P${index + 1}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="main-menu-subtle text-xs uppercase tracking-[0.18em] text-slate-500">Result</p>
            <p className={`text-lg font-semibold ${resultColor(recentMatch.resultLabel)}`}>
              {recentMatch.resultLabel}
            </p>
          </div>
        </div>
      ) : (
        <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5 text-sm text-slate-400">
          No finished matches in the database yet.
        </div>
      )}
    </div>
  );
}

export default RecentPanel;

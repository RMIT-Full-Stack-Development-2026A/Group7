import { createElement } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings as SettingsIcon, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import ROUTES from '../../../../router/routes.config';
import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';

const defaultProfileAvatar = resolveAvatarUrl('');

const handleAvatarLoadError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = defaultProfileAvatar;
};

const buildQuickLinks = (isAdmin) => [
  { to: ROUTES.SUBSCRIPTION, icon: Sparkles, label: 'Subscription', show: true },
  { to: ROUTES.SETTINGS, icon: SettingsIcon, label: 'Settings', show: true },
  { to: ROUTES.ADMIN, icon: ShieldCheck, label: 'Admin', show: isAdmin },
];

export function MainMenuHeader({ playerData }) {
  const quickLinks = buildQuickLinks(playerData.isAdmin);

  return (
    <>
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4 flex-col lg:flex-row">
          <NavLink
            to={ROUTES.PROFILE}
            className="neon-profile-link flex items-center gap-4 p-4 flex-1 min-w-0 text-left transition-colors focus:outline-none overflow-hidden w-full"
          >
            <div className="neon-avatar-frame shrink-0">
              <span className="neon-avatar-inner">
                <img
                  src={playerData.profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={handleAvatarLoadError}
                />
              </span>
            </div>
            <div>
              <h3 className="main-menu-profile-name text-xl font-bold text-white">{playerData.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="neon-badge whitespace-nowrap">
                  {playerData.isPremium ? 'Premium member' : 'Standard member'}
                </span>
                {playerData.isAdmin ? <span className="neon-badge whitespace-nowrap">Admin access</span> : null}
              </div>
            </div>
          </NavLink>

          <div className="flex items-center gap-3">
            {quickLinks.filter((link) => link.show).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className="neon-icon-button relative p-4 transition-colors group"
                aria-label={label}
              >
                {createElement(Icon, { className: 'w-6 h-6 text-slate-300 group-hover:text-white transition-colors' })}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {playerData.isSuspended ? (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <div>
              <p className="font-semibold">Your account is suspended by an administrator.</p>
              <p className="mt-1 text-red-200/80">
                Only the profile header, Subscription, and Settings remain available. Contact support to reactivate your account.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MainMenuHeader;

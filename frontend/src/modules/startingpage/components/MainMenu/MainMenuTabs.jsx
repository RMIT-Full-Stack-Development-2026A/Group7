import {
  SUSPENDED_ALLOWED_TABS,
  SUSPENSION_MESSAGE,
  formatTabBadgeCount,
} from '../../logic/mainMenu.utils.js';

const TABS = [
  { id: 'friends', label: 'Friends' },
  { id: 'recent', label: 'Recent' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'requests', label: 'Requests' },
];

export function MainMenuTabs({ activeTab, isSuspended, tabBadgeCounts, onTabClick }) {
  return (
    <div className="neon-sidebar-panel p-4">
      <div className="grid grid-cols-4 gap-2">
        {TABS.map((tab) => {
          const isLocked = isSuspended && !SUSPENDED_ALLOWED_TABS.has(tab.id);
          const badgeCount = tabBadgeCounts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              aria-disabled={isLocked}
              title={isLocked ? SUSPENSION_MESSAGE : undefined}
              className={`neon-tab main-menu-social-tab px-3 py-3 text-sm font-semibold transition-all ${activeTab === tab.id ? 'neon-tab-active' : 'text-slate-400'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ borderRadius: '10px' }}
            >
              {tab.label}
              {!isLocked && badgeCount > 0 ? (
                <span
                  className="main-menu-tab-badge"
                  aria-label={`${badgeCount} ${tab.label.toLowerCase()} update${badgeCount === 1 ? '' : 's'}`}
                >
                  {formatTabBadgeCount(badgeCount)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MainMenuTabs;

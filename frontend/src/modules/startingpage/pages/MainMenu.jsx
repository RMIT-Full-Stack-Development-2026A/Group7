import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Settings as SettingsIcon, Users, BookOpen, Swords, Sparkles, ShieldCheck, Check, X } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import MamboAvatar from '../../../shared/assets/images/Mambo.png';
import { useApi } from '../hooks/useApi';
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js';

export function MainMenu() {
  const { call } = useApi();
  const [sidebarTab, setSidebarTab] = useState('friends');
  const [playerProfile, setPlayerProfile] = useState(null);
  const storedIdentity = getStoredAuthIdentity();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!storedIdentity.userId) {
        return;
      }

      const data = await call(`/api/profile?userId=${encodeURIComponent(storedIdentity.userId)}`);
      if (!isMounted || !data) {
        return;
      }

      setPlayerProfile(data);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [call, storedIdentity.userId]);

  const playerData = useMemo(() => ({
    name: playerProfile?.name || storedIdentity.name || storedIdentity.username || 'Player',
    isAdmin: (playerProfile?.role || '').toLowerCase() === 'admin',
    isPremium: Boolean(playerProfile?.premiumStatus),
    profilePic: playerProfile?.avatarUrl && playerProfile.avatarUrl !== 'Mambo.png'
      ? playerProfile.avatarUrl
      : MamboAvatar,
  }), [playerProfile, storedIdentity.name, storedIdentity.username]);

  const mainButtons = [
    {
      title: 'Create Room',
      description: 'Custom game vs AI or Friend',
      icon: Users,
      path: ROUTES.CREATE_MATCH,
      color: 'neon',
    },
    {
      title: 'Join Room',
      description: 'Join your friend and play now',
      icon: Users,
      path: ROUTES.JOIN_MATCH,
      color: 'neon',
    },
    {
      title: 'Casual Game',
      description: 'Play against random opponents',
      icon: Swords,
      path: ROUTES.CASUAL_GAME,
      color: 'neon',
    },
    {
      title: 'How to Play',
      description: 'Confused? Learn the basics!',
      icon: BookOpen,
      path: ROUTES.HOW_TO_PLAY,
      color: 'neon',
    },
  ];

  const quickLinks = [
    { to: ROUTES.SUBSCRIPTION, icon: Sparkles, label: 'Subscription', show: true },
    { to: ROUTES.MAILBOX, icon: Mail, label: 'Mailbox', show: true, badge: true },
    { to: ROUTES.SETTINGS, icon: SettingsIcon, label: 'Settings', show: true },
    { to: ROUTES.ADMIN, icon: ShieldCheck, label: 'Admin', show: playerData.isAdmin },
  ];

  const friends = [
    { name: 'NeoNinja', status: 'Online', statusColor: 'bg-emerald-400', lastSeen: 'Playing now' },
    { name: 'PixelPirate', status: 'Away', statusColor: 'bg-amber-400', lastSeen: '10m ago' },
    { name: 'RogueRey', status: 'Online', statusColor: 'bg-emerald-400', lastSeen: 'Ready to play' },
  ];

  const recentMatch = {
    opponent: 'ClankrMaster',
    result: 'Victory',
    score: '3 - 1',
    date: 'Today, 11:24 AM',
  };

  const notifications = [
    { id: 1, title: 'Challenge Request', description: 'RandomAhhOpponent wants a rematch.', time: '5 minutes ago', badge: 'NEW' },
    { id: 2, title: 'Profile Update', description: 'Your account details were updated successfully.', time: '1 hour ago' },
    { id: 3, title: 'Tournament Live', description: 'Weekly tournament starts in 2 days.', time: '2 hours ago' },
  ];

  const request = [
    { opponent: 'RandomAhhOpponent', time: '5 mins ago' },
    { opponent: 'AnotherRandomOpponent', time: '1 hour ago' },
    { opponent: 'YetAnotherOpponentCuzWhyNot', time: '2 hours ago' },
  ];

  return (
    <div className="neon-page p-4 pt-8">
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
            {quickLinks.filter((link) => link.show).map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className="neon-icon-button relative p-4 transition-colors group"
                aria-label={label}
              >
                <Icon className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                {badge ? <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span> : null}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="neon-shell max-w-7xl mx-auto lg:flex lg:items-start lg:gap-8">
        <div className="flex-1">
          <div className="text-center mb-12">
            <div className="inline-block relative">
              <h1 className="neon-game-title text-7xl font-black mb-2 tracking-tight">TicTacToang</h1>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            </div>
            <p className="text-slate-400 text-lg mt-2">The classic game reimagined</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="neon-board-preview neon-board-preview--hero">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="neon-board-preview-cell">
                  {i === 0 && <span className="text-3xl text-blue-400 font-bold">X</span>}
                  {i === 4 && <span className="text-3xl text-purple-400 font-bold">O</span>}
                  {i === 8 && <span className="text-3xl text-blue-400 font-bold">X</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainButtons.map((button) => {
              const Icon = button.icon;
              return (
                <NavLink
                  key={button.path}
                  to={button.path}
                  className="neon-main-button group transition-all duration-300 active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="neon-main-button-icon">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="neon-main-button-title text-xl font-bold mb-1">{button.title}</h3>
                      <p className="neon-main-button-copy text-sm">{button.description}</p>
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>

          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>Select a game mode to begin</p>
          </div>
        </div>

        <aside className="mt-10 lg:mt-0 w-full lg:w-110 shrink-0 space-y-6">
          <div className="neon-sidebar-panel p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'friends', label: 'Friends' },
                { id: 'recent', label: 'Recent' },
                { id: 'alerts', label: 'Alerts' },
                { id: 'requests', label: 'Requests' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSidebarTab(tab.id)}
                  className={`neon-tab px-3 py-3 text-sm font-semibold transition-all ${sidebarTab === tab.id ? 'neon-tab-active' : 'text-slate-400'}`}
                  style={{ borderRadius: '10px' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {sidebarTab === 'friends' && (
            <div className="neon-sidebar-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Friends</h2>
                <span className="text-slate-400 text-sm">{friends.length} online</span>
              </div>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.name} className="main-menu-friend-card flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/35 border border-white/6">
                    <div>
                      <p className="main-menu-friend-name font-semibold text-white">{friend.name}</p>
                      <p className="main-menu-friend-meta text-xs text-slate-400">{friend.lastSeen}</p>
                    </div>
                    <span className={`h-3.5 w-3.5 rounded-full ${friend.statusColor}`}></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'recent' && (
            <div className="neon-sidebar-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Match</h2>
                <span className="text-slate-400 text-sm">{recentMatch.date}</span>
              </div>
              <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5">
                <p className="main-menu-muted text-sm text-slate-400 mb-2">Opponent</p>
                <p className="main-menu-card-title text-xl font-bold text-white mb-4">{recentMatch.opponent}</p>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="main-menu-subtle text-xs uppercase tracking-[0.18em] text-slate-500">Result</p>
                    <p className="text-lg font-semibold text-emerald-400">{recentMatch.result}</p>
                  </div>
                  <div>
                    <p className="main-menu-subtle text-xs uppercase tracking-[0.18em] text-slate-500">Score</p>
                    <p className="main-menu-card-title text-lg font-semibold text-white">{recentMatch.score}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'alerts' && (
            <div className="neon-sidebar-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Alerts</h2>
                <span className="text-slate-400 text-sm">{notifications.length}</span>
              </div>
              <div className="space-y-3">
                {notifications.map((note) => (
                  <div key={note.id} className="main-menu-info-card rounded-2xl bg-slate-900/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="main-menu-card-title font-semibold text-white">{note.title}</p>
                        <p className="main-menu-muted text-sm text-slate-400">{note.description}</p>
                      </div>
                      {note.badge ? <span className="text-[10px] font-semibold uppercase tracking-[0.25em] bg-rose-500 text-white px-2 py-1 rounded-full">{note.badge}</span> : null}
                    </div>
                    <p className="main-menu-subtle text-xs text-slate-500 mt-3">{note.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'requests' && (
            <div className="neon-sidebar-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Friend Request</h2>
                <span className="text-slate-400 text-sm">{request.length}</span>
              </div>
              <div className="space-y-3">
                {request.map((req) => (
                  <div key={`${req.opponent}-${req.time}`} className="main-menu-info-card rounded-2xl bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="main-menu-card-title font-semibold text-white">{req.opponent}</p>
                        <p className="main-menu-muted text-xs text-slate-400">{req.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors" type="button">
                          <Check size={16} />
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" type="button">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

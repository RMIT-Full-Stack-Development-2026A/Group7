import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Settings as SettingsIcon, Users, BookOpen, Swords, Sparkles, ShieldCheck, Check, X, Maximize2 } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { useApi } from '../hooks/useApi';
import { httpHelper } from '../../../services/httpHelper.js';
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import { resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';

export function MainMenu() {
  const { call } = useApi();
  const [sidebarTab, setSidebarTab] = useState('friends');
  const [playerProfile, setPlayerProfile] = useState(null);
  const [recentMatch, setRecentMatch] = useState(null);
  const storedIdentity = getStoredAuthIdentity();
  const defaultProfileAvatar = resolveAvatarUrl('');

  const handleAvatarLoadError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultProfileAvatar;
  };

  const resolveMatchAvatar = (participant) => {
    const isCurrentUserParticipant = Boolean(
      participant?.userId
      && storedIdentity.userId
      && String(participant.userId) === String(storedIdentity.userId)
    );

    if (isCurrentUserParticipant) {
      return resolveAvatarUrl(playerProfile?.avatarUrl || storedIdentity.avatar);
    }

    return resolveAvatarUrl(participant?.avatar, { isAI: participant?.isAI });
  };

  const getRecentMatchParticipants = (match) => {
    if (Array.isArray(match?.participants) && match.participants.length > 0) {
      return match.participants;
    }

    return [match?.player, match?.opponent].filter(Boolean).map((participant, index) => ({
      ...participant,
      userId: participant.userId || participant.id,
      order: index + 1,
      marker: participant.symbol,
    }));
  };

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

  useEffect(() => {
    let isMounted = true;

    const fetchRecentMatch = async () => {
      if (!storedIdentity.userId) {
        return;
      }

      const response = await httpHelper.get(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api')}/games/user/history?userId=${encodeURIComponent(storedIdentity.userId)}&limit=1`);
      const historyGames = response?.data?.data?.games || [];

      if (!isMounted) {
        return;
      }

      setRecentMatch(historyGames[0] || null);
    };

    fetchRecentMatch();

    return () => {
      isMounted = false;
    };
  }, [storedIdentity.userId]);

  const playerData = useMemo(() => ({
    name: playerProfile?.name || storedIdentity.name || storedIdentity.username || 'Player',
    isAdmin: (playerProfile?.role || '').toLowerCase() === 'admin',
    isPremium: Boolean(playerProfile?.premiumStatus),
    profilePic: resolveAvatarUrl(playerProfile?.avatarUrl || storedIdentity.avatar),
  }), [
    playerProfile?.avatarUrl,
    playerProfile?.name,
    playerProfile?.premiumStatus,
    playerProfile?.role,
    storedIdentity.avatar,
    storedIdentity.name,
    storedIdentity.username,
  ]);

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
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">{recentMatch?.completedAt ? new Date(recentMatch.completedAt).toLocaleString() : 'No matches yet'}</span>
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
                          src={resolveMatchAvatar(participant)}
                          alt={participant.name || `Player ${index + 1}`}
                          className="h-11 w-11 rounded-full object-cover border border-white/10"
                          onError={handleAvatarLoadError}
                        />
                        <div className="min-w-0">
                          <p className="main-menu-card-title truncate text-sm font-bold text-white">{participant.name || `Player ${index + 1}`}</p>
                          <p className="main-menu-subtle text-[10px] uppercase tracking-[0.18em] text-slate-500">{participant.marker || participant.symbol || `P${index + 1}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <p className="main-menu-subtle text-xs uppercase tracking-[0.18em] text-slate-500">Result</p>
                    <p className={`text-lg font-semibold ${recentMatch.resultLabel === 'Victory' ? 'text-emerald-400' : recentMatch.resultLabel === 'Defeat' ? 'text-rose-400' : 'text-amber-300'}`}>{recentMatch.resultLabel}</p>
                  </div>
                </div>
              ) : (
                <div className="main-menu-info-card rounded-3xl bg-slate-950/45 border border-white/8 p-5 text-sm text-slate-400">
                  No finished matches in the database yet.
                </div>
              )}
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
